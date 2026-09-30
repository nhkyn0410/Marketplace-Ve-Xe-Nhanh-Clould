import { Inject, Injectable, Logger } from "@nestjs/common";
import { AuditService, AuditWriteError } from "../audit/audit.service";
import { PrismaService, transactionDeadline, type DbTransaction } from "../database/prisma.service";
import {
  CatalogStatus,
  FareStatus,
  RouteStatus,
  StopPointStatus,
  TripSeatStatus,
  TripStatus,
  type RouteStopRole,
  type SeatType,
} from "../database/prisma.types";
import { resolveSeatPrice, vndToJson } from "../fare/fare-pricing";
import type { Authorization } from "../iam/role/authorization";
import { requireTenant } from "../iam/role/require-tenant";
import type {
  TripInput,
  TripListResponse,
  TripResponse,
  TripSeatStatusInput,
  TripStatusInput,
} from "./dto/trip.dto";
import { canTransition, saleReadinessProblems, SEAT_EDITABLE_STATUSES } from "./trip-sale";
import {
  isDeadlock,
  isTransactionExpired,
  isVehicleOverlapViolation,
  routeUnavailable,
  tripBlockedSeatsMissing,
  tripBusy,
  tripHistoryUnavailable,
  tripNotEditable,
  tripNotFound,
  tripNotReadyForSale,
  tripSeatNotAvailable,
  tripSeatUnknown,
  tripStatusTransitionInvalid,
  tripStopTimesInvalid,
  vehicleScheduleConflict,
  vehicleUnavailable,
} from "./trip.errors";

/** Người thực hiện thao tác (từ access token) — ghi vào audit. */
export type TripActor = { sub: string; role: string };

type ListQuery = {
  routeId?: string;
  vehicleId?: string;
  status?: TripStatus;
  departureFrom?: Date;
  departureTo?: Date;
  cursor?: string;
  limit: number;
};

type RouteStopRow = {
  sequence: number;
  role: RouteStopRole;
  catalogStopPointId: string | null;
  stopPointId: string | null;
  note: string | null;
  durationSecondsFromPrevious: number | null;
};

const POINT_SELECT = { name: true, address: true, status: true } as const;
const MINUTE = 60_000;
const SEAT_ORDER = [{ deck: "asc" }, { row: "asc" }, { column: "asc" }] as const;
const AUDIT_TARGET = "trip";
// Ghi audit đổi trạng thái nằm trong transaction Postgres (≤ 5s) — giới hạn 2s như bảng giá (TRN-005 review).
const AUDIT_TIMEOUT_MS = 2_000;
const SOLD_SEAT_STATUSES: readonly TripSeatStatus[] = [TripSeatStatus.BOOKED, TripSeatStatus.CHECKED_IN];

/**
 * Chuyến của nhà xe (TASK-TRN-003, FR-OPS-06, UC-14). Chỉ tạo/sửa chuyến `DRAFT`. Điểm dừng chép từ route
 * lúc tạo/sửa; ghế chép từ SeatMap của xe lúc gắn xe. BR-14 (một xe không chạy hai chuyến chồng giờ) do
 * ràng buộc EXCLUDE ở DB giữ — kể cả khi hai request chạy đồng thời. Vòng đời bán khi chưa có vé + khóa ghế thủ
 * công: TASK-TRN-006.
 */
@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  /** Liệt kê chuyến của nhà xe theo giờ đi tăng dần, lọc route/xe/trạng thái/khoảng giờ đi. */
  async list(authz: Authorization, query: ListQuery): Promise<TripListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, async (tx) => {
      let after = {};
      if (query.cursor) {
        const cursor = await tx.trip.findFirst({
          where: { id: query.cursor, operatorId },
          select: { id: true, departureAt: true },
        });
        if (!cursor) {
          return [];
        }
        // Sắp theo (giờ đi, id): trang sau bắt đầu ngay sau dòng cursor, không lặp/sót khi trùng giờ đi.
        after = {
          OR: [
            { departureAt: { gt: cursor.departureAt } },
            { departureAt: cursor.departureAt, id: { gt: cursor.id } },
          ],
        };
      }
      return tx.trip.findMany({
        where: {
          operatorId,
          routeId: query.routeId,
          vehicleId: query.vehicleId,
          status: query.status,
          departureAt: { gte: query.departureFrom, lt: query.departureTo },
          ...after,
        },
        orderBy: [{ departureAt: "asc" }, { id: "asc" }],
        take: query.limit + 1,
        select: {
          id: true,
          routeId: true,
          vehicleId: true,
          departureAt: true,
          arrivalAt: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          route: { select: { name: true } },
          vehicle: { select: { plateNumber: true } },
          _count: { select: { seats: true } },
        },
      });
    });
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(({ route, vehicle, _count, ...trip }) => ({
        ...trip,
        routeName: route.name,
        vehiclePlateNumber: vehicle?.plateNumber ?? null,
        seatCount: _count.seats,
        departureAt: trip.departureAt.toISOString(),
        arrivalAt: trip.arrivalAt.toISOString(),
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString(),
      })),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Chi tiết chuyến kèm điểm dừng và ghế; khác tenant trả 404 như không tồn tại. */
  async get(authz: Authorization, tripId: string): Promise<TripResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, (tx) => findDetail(tx, operatorId, tripId));
    if (!row) {
      throw tripNotFound();
    }
    return toResponse(row);
  }

  /** Tạo chuyến `DRAFT`: chép điểm dừng từ route, ghế từ SeatMap của xe (nếu gắn xe) trong một transaction. */
  async create(authz: Authorization, input: TripInput): Promise<TripResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withOverlapConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const routeStops = await loadRouteStops(tx, operatorId, input.routeId, false);
        const stopTimes = planStopTimes(input, routeStops);
        const seats = input.vehicleId ? await lockVehicleSeats(tx, operatorId, input.vehicleId) : [];
        const trip = await tx.trip.create({
          data: {
            operatorId,
            routeId: input.routeId,
            vehicleId: input.vehicleId,
            departureAt: input.departureAt,
            arrivalAt: input.arrivalAt,
            onlineSaleCutoffMinutes: input.onlineSaleCutoffMinutes,
            note: input.note,
          },
          select: { id: true },
        });
        await tx.tripStop.createMany({ data: stopRows(operatorId, trip.id, routeStops, stopTimes) });
        await tx.tripSeat.createMany({ data: seatRows(operatorId, trip.id, seats) });
        return findDetail(tx, operatorId, trip.id);
      }),
    );
    return toResponse(row!);
  }

  /**
   * Thay toàn bộ chuyến `DRAFT`. Route/xe ĐANG gắn được giữ dù đã ngừng dùng (mẫu TRN-001/002); chỉ route/xe
   * MỚI chọn phải hợp lệ. Điểm dừng luôn chép lại từ route; ghế chỉ sinh lại khi đổi xe — hoặc khi nháp đã
   * quá giờ đến: lúc đó nó thôi giữ sơ đồ ghế (UC-12 A3) nên sơ đồ có thể đã bị sửa, ghế cũ không còn tin được;
   * dời nháp quá hạn sang lịch mới = chọn lại xe (xe phải hợp lệ như mới chọn). Khoá dòng chuyến NGAY KHI ĐỌC:
   * "đổi xe hay không" và "route/xe đang gắn" phải tính trên giá trị mới nhất, nếu không hai PUT đồng thời
   * (đổi xe ↔ giữ xe) để lại ghế của xe này trên chuyến của xe kia.
   */
  async update(authz: Authorization, tripId: string, input: TripInput): Promise<TripResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withOverlapConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const [current] = await tx.$queryRaw<
          { routeId: string; vehicleId: string | null; status: TripStatus; arrivalAt: Date }[]
        >`
          SELECT route_id AS "routeId", vehicle_id AS "vehicleId", status::text AS "status", arrival_at AS "arrivalAt"
          FROM trips
          WHERE id = ${tripId} AND operator_id = ${operatorId}
          FOR NO KEY UPDATE`;
        if (!current) {
          throw tripNotFound();
        }
        if (current.status !== TripStatus.DRAFT) {
          throw tripNotEditable();
        }
        const routeStops = await loadRouteStops(tx, operatorId, input.routeId, input.routeId === current.routeId);
        const stopTimes = planStopTimes(input, routeStops);
        const expired = new Date(current.arrivalAt).getTime() <= Date.now();
        const rebuildSeats = expired || input.vehicleId !== current.vehicleId;
        const seats = rebuildSeats && input.vehicleId ? await lockVehicleSeats(tx, operatorId, input.vehicleId) : [];
        // Ghế đã khóa thủ công (bán ngoài Platform — BR-42) giữ theo `seat_code` khi sinh lại ghế; sơ đồ mới thiếu ghế
        // đã khóa → từ chối, không âm thầm làm mất ghế đã bán quầy (overbooking) — TRN-006 Q5. Ghế đang giữ / đã bán
        // (không phải AVAILABLE / BLOCKED) thì không sinh lại được.
        const blocked = rebuildSeats ? await blockedSeatCodes(tx, operatorId, tripId) : new Set<string>();
        const missing = [...blocked].filter((code) => !seats.some((seat) => seat.code === code));
        if (missing.length > 0) {
          throw tripBlockedSeatsMissing(missing);
        }
        const updated = await tx.trip.updateMany({
          where: { id: tripId, operatorId, status: TripStatus.DRAFT },
          data: {
            routeId: input.routeId,
            vehicleId: input.vehicleId,
            departureAt: input.departureAt,
            arrivalAt: input.arrivalAt,
            onlineSaleCutoffMinutes: input.onlineSaleCutoffMinutes,
            note: input.note,
          },
        });
        if (updated.count === 0) {
          // Chốt phòng thủ: dòng đã khoá từ lúc đọc nên không đổi trạng thái giữa chừng được.
          throw tripNotEditable();
        }
        await tx.tripStop.deleteMany({ where: { tripId, operatorId } });
        await tx.tripStop.createMany({ data: stopRows(operatorId, tripId, routeStops, stopTimes) });
        if (rebuildSeats) {
          await tx.tripSeat.deleteMany({ where: { tripId, operatorId } });
          await tx.tripSeat.createMany({ data: seatRows(operatorId, tripId, seats, blocked) });
        }
        return findDetail(tx, operatorId, tripId);
      }),
    );
    return toResponse(row!);
  }

  /**
   * Đổi trạng thái bán của chuyến chưa có vé (TASK-TRN-006, FR-OPS-10, LLD §8): mở bán / khóa (= tạm dừng) / mở lại /
   * thu hồi về nháp / hủy. Khoá dòng chuyến khi đọc nên các request đồng thời XẾP HÀNG: bên sau chạy trên trạng thái
   * mới — chuyển không còn hợp lệ (vd hai lần mở bán) thì 409, còn hợp lệ (mở bán rồi hủy) thì vẫn chạy. Mở bán / mở lại
   * kiểm BR-39, trả MỌI lý do chưa đạt. Audit là lệnh cuối trong transaction.
   */
  async changeStatus(actor: TripActor, authz: Authorization, tripId: string, input: TripStatusInput): Promise<TripResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withRetryable(() =>
      this.prisma.withScope(db, async (tx) => {
        const deadline = transactionDeadline(Date.now());
        const [current] = await tx.$queryRaw<{ status: TripStatus }[]>`
          SELECT status::text AS "status" FROM trips
          WHERE id = ${tripId} AND operator_id = ${operatorId}
          FOR NO KEY UPDATE`;
        if (!current) {
          throw tripNotFound();
        }
        if (!canTransition(current.status, input.status)) {
          throw tripStatusTransitionInvalid(`Không chuyển được chuyến từ ${current.status} sang ${input.status}.`);
        }
        if (input.status === TripStatus.DRAFT || input.status === TripStatus.CANCELLED) {
          // Khoá TOÀN BỘ ghế của chuyến (không lọc trạng thái — Postgres chỉ kiểm lại dòng khớp điều kiện): ghế đang được
          // một transaction khác đổi sang HOLDING / BOOKED thì chờ nó commit rồi đọc trạng thái mới. Không thay được việc
          // luồng bán vé (BTP) phải khoá chuyến `FOR SHARE` + kiểm `OPEN_FOR_SALE` — ghi ở bàn giao TRN-006.
          const seats = await tx.$queryRaw<{ status: TripSeatStatus }[]>`
            SELECT status::text AS "status" FROM trip_seats
            WHERE trip_id = ${tripId} AND operator_id = ${operatorId}
            FOR SHARE`;
          if (seats.some((seat) => SOLD_SEAT_STATUSES.includes(seat.status))) {
            throw tripStatusTransitionInvalid("Chuyến đã có vé — đổi / hủy chuyến đã bán vé theo luồng riêng.");
          }
        }
        if (input.status === TripStatus.OPEN_FOR_SALE) {
          await assertReadyForSale(tx, operatorId, tripId);
        }
        const updated = await tx.trip.updateMany({
          where: { id: tripId, operatorId, status: current.status },
          data: { status: input.status, statusReason: input.reason },
        });
        if (updated.count === 0) {
          // Chốt phòng thủ: dòng đã khoá từ lúc đọc nên trạng thái không đổi giữa chừng được.
          throw tripStatusTransitionInvalid("Trạng thái chuyến vừa thay đổi. Tải lại rồi thử lại.");
        }
        const after = await findDetail(tx, operatorId, tripId);
        // Lệnh cuối trước COMMIT, giới hạn theo hạn còn lại của transaction: không còn bước nào lỗi được SAU khi Mongo đã
        // ghi (ngoài COMMIT) → thu hẹp khả năng dòng lịch sử "ma".
        await this.audit.recordAuditEvent(
          {
            actorId: actor.sub,
            actorRole: actor.role,
            action: "trip.status.change",
            targetType: AUDIT_TARGET,
            targetId: tripId,
            operatorId,
            before: { status: current.status },
            after: { status: input.status },
            reason: input.reason ?? undefined,
          },
          { timeoutMs: AUDIT_TIMEOUT_MS, deadline },
        );
        return after;
      }),
    );
    return toResponse(row!);
  }

  /**
   * Khóa / mở ghế thủ công theo lô (FR-OPS-13, BR-42, UC-14 A6): được cả lô hoặc không; chỉ `AVAILABLE ↔ BLOCKED`,
   * ghế đã ở trạng thái đích bỏ qua. Audit ghi SAU commit và không chờ: khóa ghế là để chống bán trùng, Mongo sập
   * không được chặn việc khóa ghế đã bán quầy (Q6).
   */
  async setSeatStatus(
    actor: TripActor,
    authz: Authorization,
    tripId: string,
    input: TripSeatStatusInput,
  ): Promise<TripResponse> {
    const { db, operatorId } = requireTenant(authz);
    const from = input.status === TripSeatStatus.BLOCKED ? TripSeatStatus.AVAILABLE : TripSeatStatus.BLOCKED;
    const { row, changed } = await this.withRetryable(() => this.prisma.withScope(db, async (tx) => {
      // Khoá dòng chuyến: xếp hàng với PUT chuyến (đổi xe sinh lại ghế) và đổi trạng thái.
      const [current] = await tx.$queryRaw<{ status: TripStatus }[]>`
        SELECT status::text AS "status" FROM trips
        WHERE id = ${tripId} AND operator_id = ${operatorId}
        FOR NO KEY UPDATE`;
      if (!current) {
        throw tripNotFound();
      }
      if (!SEAT_EDITABLE_STATUSES.includes(current.status)) {
        throw tripNotEditable("Chỉ khóa / mở ghế khi chuyến đang nháp, đang mở bán hoặc đang khóa bán.");
      }
      const seats = await tx.tripSeat.findMany({
        where: { tripId, operatorId, seatCode: { in: input.seatCodes } },
        select: { seatCode: true, status: true },
      });
      if (seats.length !== input.seatCodes.length) {
        throw tripSeatUnknown();
      }
      if (seats.some((seat) => seat.status !== TripSeatStatus.AVAILABLE && seat.status !== TripSeatStatus.BLOCKED)) {
        throw tripSeatNotAvailable();
      }
      const changed = seats.filter((seat) => seat.status === from).map((seat) => seat.seatCode).sort();
      if (changed.length > 0) {
        const updated = await tx.tripSeat.updateMany({
          where: { tripId, operatorId, seatCode: { in: changed }, status: from },
          data: { status: input.status },
        });
        if (updated.count !== changed.length) {
          // Ghế vừa bị giữ / bán giữa lúc đọc và ghi (luồng giữ ghế BTP-001) — không đổi nửa lô.
          throw tripSeatNotAvailable();
        }
      }
      return { row: (await findDetail(tx, operatorId, tripId))!, changed };
    }));
    if (changed.length > 0) {
      this.audit
        .recordAuditEvent({
          actorId: actor.sub,
          actorRole: actor.role,
          action: input.status === TripSeatStatus.BLOCKED ? "trip.seats.block" : "trip.seats.unblock",
          targetType: AUDIT_TARGET,
          targetId: tripId,
          operatorId,
          after: { seatCodes: changed, status: input.status },
          reason: input.note ?? undefined,
        })
        .catch((error: unknown) => {
          this.logger.error({ event: "audit.write_failed", action: "trip.seats", tripId, error });
        });
    }
    return toResponse(row);
  }

  // Audit Mongo lỗi / chậm (AuditWriteError) hoặc transaction hết hạn (P2028, vd chờ khoá dòng quá lâu) → 503 thử lại
  // được: Postgres đã rollback, không đổi gì.
  private async withRetryable<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof AuditWriteError) {
        throw tripHistoryUnavailable();
      }
      if (isTransactionExpired(error)) {
        throw tripBusy();
      }
      throw error;
    }
  }

  private async withOverlapConflict<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      // Deadlock chỉ xảy ra khi hai request đổi chéo xe giữa hai chuyến chồng giờ (mỗi bên chờ dòng của bên
      // kia ở ràng buộc EXCLUDE) — bản chất vẫn là tranh chấp lịch xe, trả 409 để client tải lại rồi thử lại.
      if (isVehicleOverlapViolation(error) || isDeadlock(error)) {
        throw vehicleScheduleConflict();
      }
      throw error;
    }
  }
}

/**
 * Điểm dừng của route theo thứ tự. Route MỚI chọn phải `ACTIVE`; route đang gắn (`keep`) được giữ dù đã
 * ngừng dùng. Không phân biệt "không có" / "tenant khác" / "ngừng dùng" để không lộ dữ liệu tenant khác.
 */
async function loadRouteStops(
  tx: DbTransaction,
  operatorId: string,
  routeId: string,
  keep: boolean,
): Promise<RouteStopRow[]> {
  const route = await tx.route.findFirst({
    where: { id: routeId, operatorId, ...(keep ? {} : { status: RouteStatus.ACTIVE }) },
    select: {
      stops: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          role: true,
          catalogStopPointId: true,
          stopPointId: true,
          note: true,
          durationSecondsFromPrevious: true,
        },
      },
    },
  });
  if (!route) {
    throw routeUnavailable();
  }
  return route.stops;
}

/**
 * Giờ dự kiến tại từng điểm. Operator gửi `stopTimes` thì dùng nguyên (Zod đã kiểm đầu/cuối và thứ tự);
 * không gửi thì chia khoảng [giờ đi, giờ đến] theo tỉ lệ thời gian chặng đã lưu của route (ADR-027: không
 * gọi Goong lại) — giữ đúng giờ đi/đến Operator chọn dù xe khách chạy chậm hơn số liệu định tuyến.
 */
function planStopTimes(input: TripInput, stops: RouteStopRow[]): Date[] {
  if (input.stopTimes) {
    if (input.stopTimes.length !== stops.length) {
      throw tripStopTimesInvalid();
    }
    return input.stopTimes;
  }
  const departure = input.departureAt.getTime();
  const span = input.arrivalAt.getTime() - departure;
  let elapsed = 0;
  const cumulative = stops.map((stop) => (elapsed += stop.durationSecondsFromPrevious ?? 0));
  const total = cumulative[cumulative.length - 1]!;
  const last = stops.length - 1;
  // Làm tròn XUỐNG theo phút tính từ giờ đi: giờ hiển thị gọn, vẫn không giảm dần và không vượt giờ đến.
  return cumulative.map((seconds, index) =>
    index === last
      ? input.arrivalAt
      : new Date(departure + (total === 0 ? 0 : Math.floor(((seconds / total) * span) / MINUTE) * MINUTE)),
  );
}

/**
 * Ghế của SeatMap gắn với xe, sau khi khoá dòng xe + sơ đồ ghế (`FOR SHARE`). Khoá này xếp hàng với PUT
 * sơ đồ ghế / đổi sơ đồ của xe (UC-12 A3): bên nào ghi sau sẽ thấy chuyến vừa tạo và bị từ chối, nên ghế của
 * chuyến không bao giờ lấy từ bố cục đang bị sửa dở. Xe phải `ACTIVE` và có sơ đồ ghế (UC-14 A2).
 */
async function lockVehicleSeats(tx: DbTransaction, operatorId: string, vehicleId: string) {
  // Hai câu riêng, KHÔNG `FOR SHARE` trên JOIN: nếu phải chờ một PUT xe vừa đổi sơ đồ, Postgres kiểm lại dòng
  // xe mới nhưng giữ dòng sơ đồ CŨ của phép JOIN → điều kiện nối sai → báo nhầm "xe không dùng được".
  const [vehicle] = await tx.$queryRaw<{ seatMapId: string }[]>`
    SELECT seat_map_id AS "seatMapId" FROM vehicles
    WHERE id = ${vehicleId} AND operator_id = ${operatorId} AND status = 'ACTIVE' AND seat_map_id IS NOT NULL
    FOR SHARE`;
  if (!vehicle) {
    throw vehicleUnavailable();
  }
  // Sơ đồ không xoá được (không có DELETE, FK RESTRICT) nên dòng luôn còn; câu này chỉ để khoá.
  await tx.$queryRaw`SELECT 1 FROM seat_maps WHERE id = ${vehicle.seatMapId} AND operator_id = ${operatorId} FOR SHARE`;
  return tx.seat.findMany({
    where: { seatMapId: vehicle.seatMapId, operatorId },
    orderBy: [...SEAT_ORDER],
    select: { code: true, deck: true, row: true, column: true, type: true },
  });
}

function stopRows(operatorId: string, tripId: string, stops: RouteStopRow[], times: Date[]) {
  return stops.map((stop, index) => ({
    operatorId,
    tripId,
    sequence: stop.sequence,
    role: stop.role,
    catalogStopPointId: stop.catalogStopPointId,
    stopPointId: stop.stopPointId,
    note: stop.note,
    plannedAt: times[index]!,
  }));
}

// Liệt kê từng field: không phụ thuộc shape của Seat để khỏi chép nhầm `id`/`seatMapId`. Ghế có mã trong `blocked`
// giữ trạng thái khóa thủ công (TRN-006).
function seatRows(
  operatorId: string,
  tripId: string,
  seats: { code: string; deck: number; row: number; column: number; type: SeatType }[],
  blocked: ReadonlySet<string> = new Set(),
) {
  return seats.map(({ code, deck, row, column, type }) => ({
    operatorId,
    tripId,
    seatCode: code,
    deck,
    row,
    column,
    type,
    status: blocked.has(code) ? TripSeatStatus.BLOCKED : TripSeatStatus.AVAILABLE,
  }));
}

// Mã ghế đang khóa thủ công trước khi sinh lại ghế. Ghế đang giữ / đã bán (khác AVAILABLE / BLOCKED) → 409: sinh lại
// sẽ âm thầm xoá chúng.
async function blockedSeatCodes(tx: DbTransaction, operatorId: string, tripId: string): Promise<Set<string>> {
  const rows = await tx.tripSeat.findMany({ where: { tripId, operatorId }, select: { seatCode: true, status: true } });
  if (rows.some((row) => row.status !== TripSeatStatus.AVAILABLE && row.status !== TripSeatStatus.BLOCKED)) {
    throw tripSeatNotAvailable();
  }
  return new Set(rows.filter((row) => row.status === TripSeatStatus.BLOCKED).map((row) => row.seatCode));
}

/**
 * BR-39 (Q3): đọc lại chuyến + nhà xe trong transaction đang khoá dòng chuyến, chưa đạt → 422 kèm mọi lý do. Khoá
 * `FOR SHARE` tuyến, bảng giá, xe trước khi đọc: sửa bảng giá / xe / tuyến đồng thời (khoá ghi cùng dòng) phải chờ lần
 * mở bán này commit, nên điều kiện kiểm được không đổi ngay giữa lúc kiểm và lúc commit. Các luồng đó không khoá `trips`
 * nên không có vòng chờ.
 */
async function assertReadyForSale(tx: DbTransaction, operatorId: string, tripId: string): Promise<void> {
  await tx.$queryRaw`
    SELECT 1 FROM routes r JOIN trips t ON t.route_id = r.id AND t.operator_id = r.operator_id
    WHERE t.id = ${tripId} AND t.operator_id = ${operatorId}
    FOR SHARE OF r`;
  await tx.$queryRaw`
    SELECT 1 FROM fares f JOIN trips t ON t.route_id = f.route_id AND t.operator_id = f.operator_id
    WHERE t.id = ${tripId} AND t.operator_id = ${operatorId}
    FOR SHARE OF f`;
  await tx.$queryRaw`
    SELECT 1 FROM vehicles v JOIN trips t ON t.vehicle_id = v.id AND t.operator_id = v.operator_id
    WHERE t.id = ${tripId} AND t.operator_id = ${operatorId}
    FOR SHARE OF v`;
  const trip = (await findDetail(tx, operatorId, tripId))!;
  // `operator_profiles` có policy `public_read` nên đọc được trong scope tenant.
  const operator = await tx.operatorProfile.findUnique({ where: { id: operatorId }, select: { status: true } });
  const reasons = saleReadinessProblems({
    operatorStatus: operator!.status,
    routeStatus: trip.route.status,
    stopsActive: trip.stops.map((stop) =>
      stop.catalogStopPoint
        ? stop.catalogStopPoint.status === CatalogStatus.ACTIVE
        : stop.stopPoint!.status === StopPointStatus.ACTIVE,
    ),
    vehicle: trip.vehicle ? { status: trip.vehicle.status, vehicleTypeId: trip.vehicle.vehicleTypeId } : null,
    seatTypes: trip.seats.map((seat) => seat.type),
    fare: trip.route.fare,
    departureAt: trip.departureAt,
    onlineSaleCutoffMinutes: trip.onlineSaleCutoffMinutes,
    now: new Date(),
  });
  if (reasons.length > 0) {
    throw tripNotReadyForSale(reasons);
  }
}

function findDetail(tx: DbTransaction, operatorId: string, tripId: string) {
  return tx.trip.findFirst({
    where: { id: tripId, operatorId },
    select: {
      id: true,
      routeId: true,
      vehicleId: true,
      departureAt: true,
      arrivalAt: true,
      status: true,
      onlineSaleCutoffMinutes: true,
      statusReason: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      route: {
        select: {
          name: true,
          status: true,
          // Bảng giá của tuyến (TRN-005): giá ghế tính khi đọc theo loại xe đang gắn + giờ khởi hành.
          fare: {
            select: {
              status: true,
              rules: { select: { vehicleTypeId: true, seatType: true, validFrom: true, validTo: true, price: true } },
            },
          },
        },
      },
      vehicle: { select: { plateNumber: true, vehicleTypeId: true, status: true } },
      stops: {
        orderBy: { sequence: "asc" },
        select: {
          sequence: true,
          role: true,
          catalogStopPointId: true,
          stopPointId: true,
          note: true,
          plannedAt: true,
          catalogStopPoint: { select: POINT_SELECT },
          stopPoint: { select: POINT_SELECT },
        },
      },
      seats: {
        orderBy: [...SEAT_ORDER],
        select: { seatCode: true, deck: true, row: true, column: true, type: true, status: true },
      },
    },
  });
}

function toResponse(row: NonNullable<Awaited<ReturnType<typeof findDetail>>>): TripResponse {
  const { route, vehicle, stops, seats, ...trip } = row;
  // Không gắn xe / tuyến chưa có bảng giá / bảng giá INACTIVE / không có rule khớp → giá `null` (TRN-006 chặn mở bán).
  const rules = route.fare?.status === FareStatus.ACTIVE ? route.fare.rules : [];
  const priceOf = (seatType: SeatType): number | null => {
    if (!vehicle) {
      return null;
    }
    const price = resolveSeatPrice(rules, vehicle.vehicleTypeId, seatType, trip.departureAt);
    return price === null ? null : vndToJson(price);
  };
  return {
    ...trip,
    routeName: route.name,
    vehiclePlateNumber: vehicle?.plateNumber ?? null,
    seatCount: seats.length,
    departureAt: trip.departureAt.toISOString(),
    arrivalAt: trip.arrivalAt.toISOString(),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    stops: stops.map(({ catalogStopPoint, stopPoint, plannedAt, ...stop }) => {
      const point = catalogStopPoint ?? stopPoint!;
      return { ...stop, name: point.name, address: point.address, plannedAt: plannedAt.toISOString() };
    }),
    seats: seats.map(({ seatCode, ...seat }) => ({ code: seatCode, ...seat, price: priceOf(seat.type) })),
  };
}
