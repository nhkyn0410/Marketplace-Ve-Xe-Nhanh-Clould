import { randomUUID } from "node:crypto";
import { createConnection, type Connection, type Model } from "mongoose";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AUDIT_EVENT_MODEL, type AuditEventDocument, AuditEventSchema } from "./audit-event.schema";
import { AuditService, AuditWriteError, type AuditEventInput } from "./audit.service";
import { SYSTEM_LOG_MODEL, type SystemLogDocument, SystemLogSchema } from "./system-log.schema";

/**
 * Ghi audit có giới hạn thời gian (dùng TRONG transaction Postgres — lịch sử giá TRN-005) trên Mongo THẬT.
 * Trường hợp Mongo chậm khi lệnh đã gửi (failover) cần failpoint `failCommand` — chỉ bật được khi mongod chạy
 * `enableTestCommands`, nên kiểm tay (evidence ở `TRN-005-todo.md`); ở đây kiểm đường ghi, schema và Mongo chưa kết nối.
 */
const mongoUrl = process.env.MONGODB_AUDIT_URI;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

function auditOn(connection: Connection): { audit: AuditService; events: Model<AuditEventDocument> } {
  const events = connection.model(AUDIT_EVENT_MODEL, AuditEventSchema) as unknown as Model<AuditEventDocument>;
  const logs = connection.model(SYSTEM_LOG_MODEL, SystemLogSchema) as unknown as Model<SystemLogDocument>;
  return { audit: new AuditService(events, logs), events };
}

function event(targetId: string, operatorId: string, action: string): AuditEventInput {
  return {
    actorId: "owner-1",
    actorRole: "OPERATOR_OWNER",
    action,
    targetType: "fare",
    targetId,
    operatorId,
    before: null,
    after: { status: "ACTIVE" },
    reason: "không trả ra màn lịch sử",
  };
}

describe.skipIf(!mongoUrl && !requireDb)("AuditService — ghi có giới hạn thời gian (Mongo thật)", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection(mongoUrl!).asPromise();
  });

  afterAll(async () => {
    await connection?.close();
  });

  it("ghi thẳng driver kèm timeoutMS; đọc lịch sử chỉ trả action được liệt kê và các trường của màn lịch sử", async () => {
    const { audit, events } = auditOn(connection);
    const insertOne = vi.spyOn(events.collection, "insertOne");
    const targetId = randomUUID();
    const operatorId = randomUUID();

    await audit.recordAuditEvent(event(targetId, operatorId, "fare.update"), { timeoutMs: 1_500 });
    await audit.recordAuditEvent(event(targetId, operatorId, "fare.other"), { timeoutMs: 1_500 });

    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ action: "fare.update", schemaVersion: 1, targetId }),
      { timeoutMS: 1_500 },
    );
    const items = await audit.listAuditEvents({ targetType: "fare", targetId, operatorId, actions: ["fare.update"], limit: 10 });
    expect(items).toHaveLength(1);
    expect(Object.keys(items[0]!).sort()).toEqual(["action", "actorId", "after", "before", "createdAt"]);
    insertOne.mockRestore();
  });

  it("hạn chót transaction: rút ngắn timeoutMS theo phần còn lại; không còn đủ thì từ chối TRƯỚC khi ghi", async () => {
    const { audit, events } = auditOn(connection);
    const insertOne = vi.spyOn(events.collection, "insertOne");
    const targetId = randomUUID();
    const operatorId = randomUUID();
    await audit.recordAuditEvent(event(targetId, operatorId, "fare.update"), { timeoutMs: 2_000, deadline: Date.now() + 800 });
    const [, options] = insertOne.mock.calls[0] as unknown as [unknown, { timeoutMS: number }];
    expect(options.timeoutMS).toBeGreaterThan(200);
    expect(options.timeoutMS).toBeLessThanOrEqual(800);
    insertOne.mockClear();
    await expect(
      audit.recordAuditEvent(event(targetId, operatorId, "fare.update"), { timeoutMs: 2_000, deadline: Date.now() + 100 }),
    ).rejects.toBeInstanceOf(AuditWriteError);
    expect(insertOne).not.toHaveBeenCalled();
    expect(await audit.listAuditEvents({ targetType: "fare", targetId, operatorId, actions: ["fare.update"], limit: 10 })).toHaveLength(1);
    insertOne.mockRestore();
  });

  it("sai schema là lỗi lập trình → ném nguyên, không đổi thành AuditWriteError (503)", async () => {
    const { audit } = auditOn(connection);
    const wrong = { ...event(randomUUID(), randomUUID(), "fare.update"), unexpected: true } as AuditEventInput;
    const error = await audit.recordAuditEvent(wrong, { timeoutMs: 1_500 }).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(AuditWriteError);
  });

  it("Mongo chưa kết nối → AuditWriteError ngay, không xếp hàng chờ để ghi 'về sau'", async () => {
    const pending = createConnection("mongodb://127.0.0.1:1/audit_unreachable", { serverSelectionTimeoutMS: 1_500 });
    const opened = pending.asPromise().catch(() => undefined);
    const { audit } = auditOn(pending);
    const startedAt = Date.now();
    await expect(
      audit.recordAuditEvent(event(randomUUID(), randomUUID(), "fare.update"), { timeoutMs: 1_500 }),
    ).rejects.toBeInstanceOf(AuditWriteError);
    expect(Date.now() - startedAt).toBeLessThan(1_000);
    // `destroy()` treo khi kết nối còn đang mở dở — chờ lần kết nối đầu tự thất bại để không để lại handle.
    await opened;
  });
});
