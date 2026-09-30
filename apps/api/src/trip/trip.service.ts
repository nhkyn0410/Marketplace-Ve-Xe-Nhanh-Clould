import { Inject, Injectable } from "@nestjs/common";
import { PrismaService, type DbTransaction } from "../database/prisma.service";
import { FareStatus, RouteStatus, TripStatus, type RouteStopRole, type SeatType } from "../database/prisma.types";
import { resolveSeatPrice, vndToJson } from "../fare/fare-pricing";
import type { Authorization } from "../iam/role/authorization";
import { requireTenant } from "../iam/role/require-tenant";
import type { TripInput, TripListResponse, TripResponse } from "./dto/trip.dto";
import {
  isDeadlock,
  isVehicleOverlapViolation,
  routeUnavailable,
  tripNotEditable,
  tripNotFound,
  tripStopTimesInvalid,
  vehicleScheduleConflict,
  vehicleUnavailable,
} from "./trip.errors";

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

const POINT_SELECT = { name: true, address: true } as const;
const MINUTE = 60_000;
const SEAT_ORDER = [{ deck: "asc" }, { row: "asc" }, { column: "asc" }] as const;

/**
 * Chuyến của nhà xe (TASK-TRN-003, FR-OPS-06, UC-14). Chỉ tạo/sửa chuyến `DRAFT`. Điểm dừng chép từ route
 * lúc tạo/sửa; ghế chép từ SeatMap của xe lúc gắn xe. BR-14 (một xe không chạy hai chuyến chồng giờ) do
 * ràng buộc EXCLUDE ở DB giữ — kể cả khi hai request chạy đồng thời.
 */
@Injectable()
export class TripService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
        const updated = await tx.trip.updateMany({
          where: { id: tripId, operatorId, status: TripStatus.DRAFT },
          data: {
            routeId: input.routeId,
            vehicleId: input.vehicleId,
            departureAt: input.departureAt,
            arrivalAt: input.arrivalAt,
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
          await tx.tripSeat.createMany({ data: seatRows(operatorId, tripId, seats) });
        }
        return findDetail(tx, operatorId, tripId);
      }),
    );
    return toResponse(row!);
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

// Liệt kê từng field: không phụ thuộc shape của Seat để khỏi chép nhầm `id`/`seatMapId`.
function seatRows(
  operatorId: string,
  tripId: string,
  seats: { code: string; deck: number; row: number; column: number; type: SeatType }[],
) {
  return seats.map(({ code, deck, row, column, type }) => ({
    operatorId,
    tripId,
    seatCode: code,
    deck,
    row,
    column,
    type,
  }));
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
      note: true,
      createdAt: true,
      updatedAt: true,
      route: {
        select: {
          name: true,
          // Bảng giá của tuyến (TRN-005): giá ghế tính khi đọc theo loại xe đang gắn + giờ khởi hành.
          fare: {
            select: {
              status: true,
              rules: { select: { vehicleTypeId: true, seatType: true, validFrom: true, validTo: true, price: true } },
            },
          },
        },
      },
      vehicle: { select: { plateNumber: true, vehicleTypeId: true } },
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
