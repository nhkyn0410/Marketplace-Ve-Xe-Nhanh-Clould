import assert from "node:assert/strict";
import { test } from "node:test";
import { docFor, extractSymbols, isExemptPath, symbolChanges } from "../lib/symbols.mjs";

const TS = `import { Injectable } from "@nestjs/common";

/** Quản lý session theo thiết bị. */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Thu hồi mọi session của 1 thiết bị. */
  @ApiOperation({
    summary: "revoke",
  })
  async revokeDevice(deviceId: string): Promise<void> {
    await this.helper(deviceId);
  }

  private async helper(id: string) {
    return id;
  }

  onModuleInit() {}
}

export function listSessions() {
  return [];
}

export const SessionSchema = z.object({});
const toKey = (id: string) => id.trim();
export interface SessionDto {
  id: string;
}
`;

const DART = `import 'package:flutter/material.dart';

/// Màn hình danh sách vé.
class TicketListScreen extends StatelessWidget {
  const TicketListScreen({super.key});

  final Map<String, int> counts = const {};

  @override
  Widget build(BuildContext context) {
    return const SizedBox();
  }

  /// Tải lại danh sách.
  Future<void> reload() async {}

  void _onTap() {}
}

Future<Map<String, int>> fetchCounts(String id) async => {};
`;

test("TS: lấy class, method, hàm export, const, interface — bỏ constructor/field", () => {
  const syms = extractSymbols(TS, "ts");
  const byName = Object.fromEntries(syms.map((s) => [s.name, s]));
  assert.deepEqual(
    syms.map((s) => s.name),
    [
      "SessionService",
      "SessionService.revokeDevice",
      "SessionService.helper",
      "SessionService.onModuleInit",
      "listSessions",
      "SessionSchema",
      "toKey",
      "SessionDto",
    ],
  );
  assert.equal(byName.SessionService.need, true);
  assert.equal(byName["SessionService.revokeDevice"].need, true);
  assert.equal(byName["SessionService.helper"].need, false, "private không bắt buộc");
  assert.equal(byName["SessionService.onModuleInit"].need, false, "vòng đời không bắt buộc");
  assert.equal(byName.listSessions.need, true);
  assert.equal(byName.toKey.need, false, "hàm không export không bắt buộc");
  assert.equal(byName.SessionSchema.need, false);
});

test("TS: đọc doc comment phía trên, bỏ qua decorator nhiều dòng", () => {
  const syms = extractSymbols(TS, "ts");
  const get = (n) => syms.find((s) => s.name === n);
  assert.equal(docFor(TS, get("SessionService")), "Quản lý session theo thiết bị.");
  assert.equal(docFor(TS, get("SessionService.revokeDevice")), "Thu hồi mọi session của 1 thiết bị.");
  assert.equal(docFor(TS, get("listSessions")), null);
  assert.equal(docFor(TS, get("SessionService.helper")), null, "không lấy nhầm doc của method trước");
});

test("Dart: class, method public/private, @override, hàm top-level có kiểu generic", () => {
  const syms = extractSymbols(DART, "dart");
  const byName = Object.fromEntries(syms.map((s) => [s.name, s]));
  assert.deepEqual(Object.keys(byName), [
    "TicketListScreen",
    "TicketListScreen.build",
    "TicketListScreen.reload",
    "TicketListScreen._onTap",
    "fetchCounts",
  ]);
  assert.equal(byName["TicketListScreen.build"].need, false);
  assert.equal(byName["TicketListScreen.reload"].need, true);
  assert.equal(byName["TicketListScreen._onTap"].need, false);
  assert.equal(docFor(DART, byName.TicketListScreen), "Màn hình danh sách vé.");
  assert.equal(docFor(DART, byName["TicketListScreen.reload"]), "Tải lại danh sách.");
});

test("symbolChanges: file mới → tên thêm, danh sách bắt buộc mô tả, mô tả có sẵn", () => {
  const r = symbolChanges("apps/api/src/session.service.ts", "", TS);
  assert.ok(r.sym.includes("+SessionService.revokeDevice"));
  assert.deepEqual(r.need, ["SessionService", "SessionService.revokeDevice", "listSessions"]);
  assert.equal(r.docs.SessionService, "Quản lý session theo thiết bị.");
  assert.equal(r.docs.listSessions, undefined);
});

test("symbolChanges: sửa thân method → ~ tên method bao quanh", () => {
  const after = TS.replace("return id;", "return id.toUpperCase();");
  assert.deepEqual(symbolChanges("a.ts", TS, after).sym, ["~SessionService.helper"]);
});

test("symbolChanges: sửa ngoài mọi khai báo → không gán nhầm cho hàm phía trên; chữ ký nhiều dòng", () => {
  const src = 'function setup() {\n  return 1;\n}\n\ntest("a", () => {\n  const x = 1;\n});\n';
  assert.deepEqual(symbolChanges("t.mjs", src, src.replace("const x = 1", "const x = 2")).sym, []);
  const cls =
    "export class A {\n  async run(\n    id: string,\n  ): Promise<void> {\n    await go(id);\n    done();\n  }\n}\n";
  assert.deepEqual(symbolChanges("a.ts", cls, cls.replace("done();", "finish();")).sym, ["~A.run"]);
});

test("symbolChanges: xoá hàm → -tên; file test không bắt buộc mô tả", () => {
  const after = TS.replace(/export function listSessions\(\) \{\n {2}return \[\];\n\}\n/, "");
  assert.deepEqual(symbolChanges("a.ts", TS, after).sym, ["-listSessions"]);
  assert.equal(isExemptPath("apps/api/src/session.service.spec.ts"), true);
  assert.deepEqual(symbolChanges("apps/api/test/x.ts", "", TS).need, []);
});

test("Dart enum nâng cao: giá trị enum không bị coi là method", () => {
  const src =
    "enum BookingStatus {\n  pending('PENDING'),\n  paid('PAID');\n\n  const BookingStatus(this.code);\n\n  final String code;\n\n  /// Có phải trạng thái cuối.\n  bool isFinal() => this == paid;\n}\n";
  const r = symbolChanges("lib/status.dart", "", src);
  assert.deepEqual(r.sym, ["+BookingStatus", "+BookingStatus.isFinal"]);
  assert.deepEqual(r.need, ["BookingStatus.isFinal"]);
});

test("Prisma + SQL migration", () => {
  const prisma = "model OperatorAccount {\n  id String @id\n}\n\nenum Role {\n  OWNER\n}\n";
  assert.deepEqual(
    symbolChanges("apps/api/prisma/schema.prisma", "", prisma).sym,
    ["+OperatorAccount", "+Role"],
  );
  const sql =
    'CREATE TABLE "auth_session" (id uuid);\nCREATE POLICY tenant_iso ON auth_session;\nALTER TABLE "users" ADD COLUMN "epoch" int;\n';
  assert.deepEqual(symbolChanges("m/migration.sql", "", sql).sym, [
    "+TABLE auth_session",
    "+POLICY tenant_iso",
    "+COLUMN users.epoch",
  ]);
});

test("Manifest: package.json và pubspec.yaml → dependency thêm/đổi/bỏ", () => {
  const before = JSON.stringify({ dependencies: { zod: "^3.0.0", lodash: "^4" } });
  const after = JSON.stringify({ dependencies: { zod: "^3.23.8", ioredis: "^5.4.0" } });
  assert.deepEqual(symbolChanges("apps/api/package.json", before, after).sym, [
    "~zod@^3.23.8",
    "+ioredis@^5.4.0",
    "-lodash",
  ]);
  const pubBefore = "name: app\ndependencies:\n  flutter:\n    sdk: flutter\n";
  const pubAfter = "name: app\ndependencies:\n  flutter:\n    sdk: flutter\n  dio: ^5.7.0\n";
  assert.deepEqual(symbolChanges("apps/passenger_mobile/pubspec.yaml", pubBefore, pubAfter).sym, ["+dio@^5.7.0"]);
});
