import { Inject, Injectable } from "@nestjs/common";
import { AuditService, AuditWriteError } from "../audit/audit.service";
import { catalogItemUnavailable } from "../catalog/catalog.errors";
import { PrismaService, type DbTransaction } from "../database/prisma.service";
import { CatalogStatus, RouteStatus, type FareStatus, type SeatType } from "../database/prisma.types";
import type { Authorization } from "../iam/role/authorization";
import { requireTenant } from "../iam/role/require-tenant";
import { isPrismaUniqueConflict } from "../iam/user/account.errors";
import { routeUnavailable } from "../trip/trip.errors";
import type {
  FareCreateInput,
  FareListResponse,
  FareResponse,
  FareRevisionListResponse,
  FareRuleInput,
  FareRuleResponse,
  FareSnapshot,
  FareUpdateInput,
} from "./dto/fare.dto";
import { vndToJson } from "./fare-pricing";
import {
  fareHistoryUnavailable,
  fareNotFound,
  fareRouteConflict,
  fareRulesOverlap,
  isFareRuleOverlapViolation,
  isTransactionExpired,
} from "./fare.errors";

/** Người thực hiện thao tác (từ access token) — ghi vào audit. */
export type FareActor = { sub: string; role: string };

const AUDIT_TARGET = "fare";
const AUDIT_ACTIONS = ["fare.create", "fare.update"] as const;
// Ghi lịch sử giá nằm trong transaction Postgres (Prisma: chạy ≤ 5s). Giới hạn Mongo ở 2s để Mongo chậm / failover
// trả 503 sớm thay vì giữ kết nối pool + khoá dòng bảng giá tới khi transaction hết hạn.
const AUDIT_TIMEOUT_MS = 2_000;
const RULE_SELECT = {
  vehicleTypeId: true,
  seatType: true,
  validFrom: true,
  validTo: true,
  price: true,
} as const;

type RuleRow = {
  vehicleTypeId: string | null;
  seatType: SeatType | null;
  validFrom: Date | null;
  validTo: Date | null;
  price: bigint;
};

/**
 * Bảng giá của nhà xe (TASK-TRN-005, FR-OPS-08, Q1 = PA1): mỗi tuyến một bảng giá; rule = giá tuyệt đối theo loại xe
 * × loại chỗ × khung giờ khởi hành. Mọi lần tạo/sửa ghi `audit_event` (Mongo) **trong** transaction Postgres, trước
 * commit — đó cũng là lịch sử giá (BR-40, Q4): Mongo lỗi thì không đổi giá.
 */
@Injectable()
export class FareService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  /** Liệt kê bảng giá của nhà xe (không kèm rule), lọc tuyến/trạng thái, phân trang theo `id`. */
  async list(
    authz: Authorization,
    query: { routeId?: string; status?: FareStatus; cursor?: string; limit: number },
  ): Promise<FareListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.fare.findMany({
        where: {
          operatorId,
          routeId: query.routeId,
          status: query.status,
          ...(query.cursor ? { id: { gt: query.cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        select: {
          id: true,
          routeId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          route: { select: { name: true } },
          _count: { select: { rules: true } },
        },
      }),
    );
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(({ route, _count, ...fare }) => ({
        ...fare,
        routeName: route.name,
        ruleCount: _count.rules,
        createdAt: fare.createdAt.toISOString(),
        updatedAt: fare.updatedAt.toISOString(),
      })),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Chi tiết bảng giá kèm rule; khác tenant trả 404 như không tồn tại. */
  async get(authz: Authorization, fareId: string): Promise<FareResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, (tx) => findDetail(tx, operatorId, fareId));
    if (!row) {
      throw fareNotFound();
    }
    return toResponse(row);
  }

  /** Tạo bảng giá cho một tuyến `ACTIVE` của tenant (mỗi tuyến một bảng giá) + ghi lịch sử. */
  async create(actor: FareActor, authz: Authorization, input: FareCreateInput): Promise<FareResponse> {
    const { db, operatorId } = requireTenant(authz);
    assertRulesDisjoint(input.rules);
    const row = await this.withDbConflicts(() =>
      this.prisma.withScope(db, async (tx) => {
        const route = await tx.route.findFirst({
          where: { id: input.routeId, operatorId, status: RouteStatus.ACTIVE },
          select: { id: true },
        });
        if (!route) {
          throw routeUnavailable();
        }
        const existing = await tx.fare.findFirst({ where: { routeId: input.routeId, operatorId }, select: { id: true } });
        if (existing) {
          throw fareRouteConflict();
        }
        await assertVehicleTypes(tx, input.rules, []);
        const fare = await tx.fare.create({
          data: { operatorId, routeId: input.routeId, status: input.status, note: input.note },
          select: { id: true },
        });
        await tx.fareRule.createMany({ data: ruleRows(operatorId, fare.id, input.rules) });
        const created = (await findDetail(tx, operatorId, fare.id))!;
        await this.recordRevision(actor, operatorId, fare.id, "fare.create", null, created);
        return created;
      }),
      // Chỉ còn unique `(route_id, operator_id)`: hai request tạo bảng giá cho một tuyến cùng lúc.
      fareRouteConflict,
    );
    return toResponse(row);
  }

  /**
   * Thay toàn bộ trạng thái, ghi chú và rule của bảng giá (không đổi tuyến) + ghi lịch sử. Khoá dòng bảng giá khi đọc
   * để bản chụp "trước" trong lịch sử đúng với bản bị thay. Loại xe ĐANG có trong rule được giữ dù đã ngừng dùng
   * (mẫu TRN-001); loại xe MỚI thêm phải `ACTIVE`. Vé đã bán không đổi giá (booking snapshot — BTP-002).
   */
  async update(actor: FareActor, authz: Authorization, fareId: string, input: FareUpdateInput): Promise<FareResponse> {
    const { db, operatorId } = requireTenant(authz);
    assertRulesDisjoint(input.rules);
    const row = await this.withDbConflicts(() =>
      this.prisma.withScope(db, async (tx) => {
        const [locked] = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM fares WHERE id = ${fareId} AND operator_id = ${operatorId} FOR NO KEY UPDATE`;
        if (!locked) {
          throw fareNotFound();
        }
        const before = (await findDetail(tx, operatorId, fareId))!;
        if (sameContent(before, input)) {
          // Không đổi gì → không ghi DB, không thêm dòng lịch sử trùng (before = after).
          return before;
        }
        await assertVehicleTypes(
          tx,
          input.rules,
          before.rules.flatMap((rule) => (rule.vehicleTypeId ? [rule.vehicleTypeId] : [])),
        );
        await tx.fare.update({
          where: { id_operatorId: { id: fareId, operatorId } },
          data: { status: input.status, note: input.note },
        });
        await tx.fareRule.deleteMany({ where: { fareId, operatorId } });
        await tx.fareRule.createMany({ data: ruleRows(operatorId, fareId, input.rules) });
        const after = (await findDetail(tx, operatorId, fareId))!;
        await this.recordRevision(actor, operatorId, fareId, "fare.update", before, after);
        return after;
      }),
    );
    return toResponse(row);
  }

  /** Lịch sử thay đổi bảng giá (mới nhất trước) — đọc từ audit Mongo sau khi kiểm bảng giá thuộc tenant. */
  async revisions(
    authz: Authorization,
    fareId: string,
    query: { cursor?: Date; limit: number },
  ): Promise<FareRevisionListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const fare = await this.prisma.withScope(db, (tx) =>
      tx.fare.findFirst({ where: { id: fareId, operatorId }, select: { id: true } }),
    );
    if (!fare) {
      throw fareNotFound();
    }
    const events = await this.audit.listAuditEvents({
      targetType: AUDIT_TARGET,
      targetId: fareId,
      operatorId,
      actions: AUDIT_ACTIONS,
      before: query.cursor,
      limit: query.limit + 1,
    });
    const page = events.slice(0, query.limit);
    return {
      items: page.map((event) => ({
        action: event.action as (typeof AUDIT_ACTIONS)[number],
        actorId: event.actorId ?? null,
        createdAt: event.createdAt.toISOString(),
        before: (event.before as FareSnapshot | null | undefined) ?? null,
        after: event.after as FareSnapshot,
      })),
      // Cursor = `createdAt`: các lần ghi của MỘT bảng giá tuần tự qua khoá dòng nên không trùng mili-giây.
      nextCursor: events.length > query.limit ? page[page.length - 1]!.createdAt.toISOString() : null,
    };
  }

  // Ghi TRONG transaction Postgres (trước commit), giới hạn thời gian ở driver: Mongo lỗi / chậm → throw → Postgres
  // rollback và server Mongo huỷ lệnh, không có thay đổi giá nào thiếu lịch sử hay dòng lịch sử "ma". Chỉ lệch khi commit
  // Postgres lỗi sau khi Mongo đã ghi (rất hiếm) — chấp nhận ở Q4 vì lịch sử giá không dùng để tính tiền (giá thu tiền
  // đã chụp vào booking).
  private async recordRevision(
    actor: FareActor,
    operatorId: string,
    fareId: string,
    action: "fare.create" | "fare.update",
    before: FareDetailRow | null,
    after: FareDetailRow,
  ): Promise<void> {
    await this.audit.recordAuditEvent({
      actorId: actor.sub,
      actorRole: actor.role,
      action,
      targetType: AUDIT_TARGET,
      targetId: fareId,
      operatorId,
      before: before ? toSnapshot(before) : null,
      after: toSnapshot(after),
    }, { timeoutMs: AUDIT_TIMEOUT_MS });
  }

  private async withDbConflicts<T>(work: () => Promise<T>, onUniqueConflict?: () => Error): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (onUniqueConflict && isPrismaUniqueConflict(error)) {
        throw onUniqueConflict();
      }
      if (isFareRuleOverlapViolation(error)) {
        throw fareRulesOverlap();
      }
      if (error instanceof AuditWriteError || isTransactionExpired(error)) {
        throw fareHistoryUnavailable();
      }
      throw error;
    }
  }
}

/** Nội dung gửi lên trùng hệt bản đang lưu (trạng thái, ghi chú, tập rule — không kể thứ tự rule). */
function sameContent(current: FareDetailRow, input: FareUpdateInput): boolean {
  if (current.status !== input.status || current.note !== input.note || current.rules.length !== input.rules.length) {
    return false;
  }
  const keys = (rules: (FareRuleInput | RuleRow)[]) =>
    rules
      .map((rule) =>
        [rule.vehicleTypeId, rule.seatType, rule.validFrom?.getTime(), rule.validTo?.getTime(), String(rule.price)].join("|"),
      )
      .sort()
      .join("\n");
  return keys(current.rules) === keys(input.rules);
}

/**
 * Hai rule cùng loại xe × loại chỗ (`null` = "mọi loại" là một giá trị riêng) không được cùng là giá thường hoặc
 * chồng khung giờ khởi hành — nếu không giá của một ghế không xác định. Kiểm trước khi chạm DB để trả lỗi rõ.
 */
function assertRulesDisjoint(rules: FareRuleInput[]): void {
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i]!;
      const b = rules[j]!;
      if (a.vehicleTypeId !== b.vehicleTypeId || a.seatType !== b.seatType) continue;
      const bothBase = a.validFrom === null && b.validFrom === null;
      const overlap =
        a.validFrom !== null && a.validTo !== null && b.validFrom !== null && b.validTo !== null &&
        a.validFrom < b.validTo && b.validFrom < a.validTo;
      if (bothBase || overlap) {
        throw fareRulesOverlap();
      }
    }
  }
}

/** Loại xe MỚI thêm vào bảng giá phải là catalog `ACTIVE`; loại xe đang có (`kept`) được giữ dù đã ngừng dùng. */
async function assertVehicleTypes(tx: DbTransaction, rules: FareRuleInput[], kept: string[]): Promise<void> {
  const added = [
    ...new Set(rules.flatMap((rule) => (rule.vehicleTypeId && !kept.includes(rule.vehicleTypeId) ? [rule.vehicleTypeId] : []))),
  ];
  if (added.length === 0) {
    return;
  }
  const active = await tx.vehicleType.count({ where: { id: { in: added }, status: CatalogStatus.ACTIVE } });
  if (active !== added.length) {
    throw catalogItemUnavailable();
  }
}

// Liệt kê từng field; tiền đổi sang `bigint` ngay tại đây (Zod đã giới hạn số nguyên 0..100.000.000).
function ruleRows(operatorId: string, fareId: string, rules: FareRuleInput[]) {
  return rules.map((rule) => ({
    operatorId,
    fareId,
    vehicleTypeId: rule.vehicleTypeId,
    seatType: rule.seatType,
    validFrom: rule.validFrom,
    validTo: rule.validTo,
    price: BigInt(rule.price),
  }));
}

function findDetail(tx: DbTransaction, operatorId: string, fareId: string) {
  return tx.fare.findFirst({
    where: { id: fareId, operatorId },
    select: {
      id: true,
      routeId: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      route: { select: { name: true } },
      rules: {
        select: RULE_SELECT,
        // Giá thường trước, rồi theo khung giờ; loại xe / loại chỗ để thứ tự ổn định.
        orderBy: [
          { validFrom: { sort: "asc", nulls: "first" } },
          { vehicleTypeId: { sort: "asc", nulls: "first" } },
          { seatType: { sort: "asc", nulls: "first" } },
        ],
      },
    },
  });
}

type FareDetailRow = NonNullable<Awaited<ReturnType<typeof findDetail>>>;

function toRuleResponse(rule: RuleRow): FareRuleResponse {
  return {
    vehicleTypeId: rule.vehicleTypeId,
    seatType: rule.seatType,
    validFrom: rule.validFrom?.toISOString() ?? null,
    validTo: rule.validTo?.toISOString() ?? null,
    price: vndToJson(rule.price),
  };
}

function toSnapshot(row: FareDetailRow): FareSnapshot {
  return { routeId: row.routeId, status: row.status, note: row.note, rules: row.rules.map(toRuleResponse) };
}

function toResponse(row: FareDetailRow): FareResponse {
  const { route, rules, ...fare } = row;
  return {
    ...fare,
    routeName: route.name,
    createdAt: fare.createdAt.toISOString(),
    updatedAt: fare.updatedAt.toISOString(),
    rules: rules.map(toRuleResponse),
  };
}
