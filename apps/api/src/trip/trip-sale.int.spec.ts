import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AuditWriteError, type AuditService } from "../audit/audit.service";
import { connectAuditForTest } from "../audit/audit.testing";
import { parseAppConfig } from "../config/env.config";
import { tenantScope } from "../database/db-scope";
import { PrismaService } from "../database/prisma.service";
import type { Coordinates, RouteLeg, RoutingProvider } from "../external/routing/routing-provider";
import { FareCreateInputSchema, FareUpdateInputSchema } from "../fare/dto/fare.dto";
import { FareService } from "../fare/fare.service";
import type { Authorization } from "../iam/role/authorization";
import { RouteInputSchema } from "../route/dto/route.dto";
import { RouteService } from "../route/route.service";
import { SeatMapInputSchema } from "../vehicle/dto/seat-map.dto";
import { VehicleInputSchema } from "../vehicle/dto/vehicle.dto";
import { SeatMapService } from "../vehicle/seat-map.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { TripInputSchema, TripSeatStatusInputSchema, TripStatusInputSchema } from "./dto/trip.dto";
import { TripService } from "./trip.service";

/**
 * TASK-TRN-006 — vòng đời bán chuyến chưa có vé + khóa ghế thủ công. Postgres THẬT bằng role APP (RLS có hiệu lực) +
 * Mongo THẬT (audit đổi trạng thái ghi trong transaction; khóa ghế ghi sau commit).
 */
const url = process.env.DATABASE_URL;
const mongoUrl = process.env.MONGODB_AUDIT_URI;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";
const HOUR = 3_600_000;

async function rejectionOf(
  promise: Promise<unknown>,
): Promise<{ status?: number; code?: string; detail?: string; reasons?: string[]; text: string }> {
  try {
    await promise;
    return { text: "" };
  } catch (error) {
    const response = (
      error as { getResponse?: () => { code?: string; detail?: string; reasons?: string[] } }
    ).getResponse?.();
    return {
      status: (error as { getStatus?: () => number }).getStatus?.(),
      code: response?.code,
      detail: response?.detail,
      reasons: response?.reasons,
      text: JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error),
    };
  }
}

class FakeRouting implements RoutingProvider {
  readonly source = "GOONG" as const;
  async measureLegs(points: Coordinates[]): Promise<RouteLeg[]> {
    return points.slice(1).map(() => ({ distanceMeters: 1000, durationSeconds: 3600 }));
  }
}

async function eventually<T>(read: () => Promise<T>, done: (value: T) => boolean): Promise<T> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const value = await read();
    if (done(value)) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return read();
}

describe.skipIf(!(url && mongoUrl) && !requireDb)("Trip sale lifecycle — Postgres + Mongo thật, role app", () => {
  let prisma: PrismaService;
  let audit: AuditService;
  let closeAudit: () => Promise<void>;
  let trips: TripService;
  let fares: FareService;
  let routes: RouteService;
  let seatMaps: SeatMapService;
  let vehicles: VehicleService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const province = randomUUID();
  const ward = randomUUID();
  const points = [randomUUID(), randomUUID(), randomUUID()];
  const typeSleeper = randomUUID();
  const authzA = authz(tenantA);
  const authzB = authz(tenantB);
  const actor = { sub: randomUUID(), role: "OPERATOR_OWNER" };
  let seq = 0;
  let day = 0;
  const nextDay = () => Date.UTC(2031, 7, 1) + day++ * 24 * HOUR;

  function authz(operatorId: string): Authorization {
    return { permission: "trip:manage", scope: "tenant", db: tenantScope(operatorId) };
  }

  const status = (value: string, reason: string | null = null) => TripStatusInputSchema.parse({ status: value, reason });
  const seats = (seatCodes: string[], value: string, note: string | null = null) =>
    TripSeatStatusInputSchema.parse({ seatCodes, status: value, note });
  const rule = (seatType: "SEAT" | "BED" | null, price: number) => ({
    vehicleTypeId: typeSleeper,
    seatType,
    validFrom: null,
    validTo: null,
    price,
  });

  /** Chuyến đủ điều kiện mở bán: tuyến + bảng giá (ghế 300k, giường 320k) + xe giường nằm A1 ghế / A2 giường. */
  async function readyTrip(
    options: {
      rules?: object[];
      stops?: string[];
      privateStopId?: string;
      departureAt?: Date;
      cutoffMinutes?: number;
      withFare?: boolean;
    } = {},
  ) {
    const stops = (options.stops ?? points.slice(0, 2)).map((id) => ({
      catalogStopPointId: id as string | null,
      stopPointId: null as string | null,
      note: null,
    }));
    if (options.privateStopId) {
      // Điểm cuối là điểm riêng của nhà xe (không thuộc catalog).
      stops[stops.length - 1] = { catalogStopPointId: null, stopPointId: options.privateStopId, note: null };
    }
    const route = await routes.create(
      authzA,
      RouteInputSchema.parse({ name: `R${seq++} ${tag}`, status: "ACTIVE", note: null, stops }),
    );
    const fare =
      options.withFare === false
        ? null
        : await fares.create(
            actor,
            authzA,
            FareCreateInputSchema.parse({
              routeId: route.id,
              status: "ACTIVE",
              note: null,
              rules: options.rules ?? [rule("SEAT", 300_000), rule("BED", 320_000)],
            }),
          );
    const map = await seatMaps.create(
      authzA,
      SeatMapInputSchema.parse({
        name: `Sơ đồ ${tag} ${seq++}`,
        layout: { decks: [{ deck: 1, rows: 1, columns: 2 }] },
        seats: [
          { code: "A1", deck: 1, row: 1, column: 1, type: "SEAT" },
          { code: "A2", deck: 1, row: 1, column: 2, type: "BED" },
        ],
      }),
    );
    const vehicle = await vehicles.create(
      authzA,
      VehicleInputSchema.parse({
        plateNumber: `51G${String(10000 + seq++)}`,
        vehicleTypeId: typeSleeper,
        seatMapId: map.id,
        amenityIds: [],
        status: "ACTIVE",
        description: null,
      }),
    );
    const departureAt = options.departureAt ?? new Date(nextDay() + HOUR);
    const trip = await trips.create(
      authzA,
      TripInputSchema.parse({
        routeId: route.id,
        vehicleId: vehicle.id,
        departureAt: departureAt.toISOString(),
        arrivalAt: new Date(departureAt.getTime() + 4 * HOUR).toISOString(),
        stopTimes: null,
        onlineSaleCutoffMinutes: options.cutoffMinutes ?? 60,
        note: null,
      }),
    );
    return { trip, routeId: route.id, fare, vehicleId: vehicle.id };
  }

  const statusEvents = (tripId: string) =>
    audit.listAuditEvents({ targetType: "trip", targetId: tripId, operatorId: tenantA, actions: ["trip.status.change"], limit: 20 });
  const seatEvents = (tripId: string) =>
    audit.listAuditEvents({
      targetType: "trip",
      targetId: tripId,
      operatorId: tenantA,
      actions: ["trip.seats.block", "trip.seats.unblock"],
      limit: 20,
    });
  const setSeat = (tripId: string, seatCode: string, value: "BOOKED" | "AVAILABLE") =>
    prisma.withTenant(tenantA, (tx) => tx.tripSeat.updateMany({ where: { tripId, seatCode }, data: { status: value } }));

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    ({ audit, close: closeAudit } = await connectAuditForTest(mongoUrl!));
    trips = new TripService(prisma, audit);
    fares = new FareService(prisma, audit);
    routes = new RouteService(prisma, new FakeRouting());
    seatMaps = new SeatMapService(prisma);
    vehicles = new VehicleService(prisma);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (TRN-006-guide.md §0).");
    }
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `sale-a-${tag}`, displayName: "Sale A" },
          { id: tenantB, operatorSlug: `sale-b-${tag}`, displayName: "Sale B" },
        ],
      });
      await tx.province.create({ data: { id: province, code: `sp-${tag}`, name: "Tỉnh sale" } });
      await tx.ward.create({ data: { id: ward, provinceId: province, code: `sw-${tag}`, name: "Phường sale" } });
      await tx.stopPointCatalog.createMany({
        data: points.map((id, index) => ({
          id,
          name: `Bến ${index + 1} ${tag}`,
          type: "BUS_STATION" as const,
          address: "x",
          provinceId: province,
          wardId: ward,
          latitude: 10 + index,
          longitude: 106 + index,
        })),
      });
      await tx.vehicleType.create({ data: { id: typeSleeper, code: `SS-${tag}`, name: "Giường nằm" } });
    });
  }, 30_000);

  afterAll(async () => {
    if (!prisma) {
      return;
    }
    // Audit Mongo là append-only (không xoá được) — dữ liệu test dùng id ngẫu nhiên nên không đụng nhau.
    await prisma.withSystem(async (tx) => {
      const operatorId = { in: [tenantA, tenantB] };
      await tx.tripSeat.deleteMany({ where: { operatorId } });
      await tx.tripStop.deleteMany({ where: { operatorId } });
      await tx.trip.deleteMany({ where: { operatorId } });
      await tx.fareRule.deleteMany({ where: { operatorId } });
      await tx.fare.deleteMany({ where: { operatorId } });
      await tx.routeStop.deleteMany({ where: { operatorId } });
      await tx.route.deleteMany({ where: { operatorId } });
      await tx.stopPoint.deleteMany({ where: { operatorId } });
      await tx.vehicle.deleteMany({ where: { operatorId } });
      await tx.seat.deleteMany({ where: { operatorId } });
      await tx.seatMap.deleteMany({ where: { operatorId } });
      await tx.stopPointCatalog.deleteMany({ where: { provinceId: province } });
      await tx.ward.deleteMany({ where: { provinceId: province } });
      await tx.province.deleteMany({ where: { id: province } });
      await tx.vehicleType.deleteMany({ where: { id: typeSleeper } });
      await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
    });
    await prisma.$disconnect();
    await closeAudit?.();
  });

  describe("Mở bán — điều kiện BR-39 (Q3)", () => {
    it("chuyến thiếu nhiều điều kiện → 422 kèm MỌI lý do; trạng thái và audit không đổi", async () => {
      const route = await routes.create(
        authzA,
        RouteInputSchema.parse({
          name: `R${seq++} ${tag}`,
          status: "ACTIVE",
          note: null,
          stops: points.slice(0, 2).map((id) => ({ catalogStopPointId: id, stopPointId: null, note: null })),
        }),
      );
      const soon = new Date(Date.now() + 30 * 60_000);
      const trip = await trips.create(
        authzA,
        TripInputSchema.parse({
          routeId: route.id,
          vehicleId: null,
          departureAt: soon.toISOString(),
          arrivalAt: new Date(soon.getTime() + 4 * HOUR).toISOString(),
          stopTimes: null,
          onlineSaleCutoffMinutes: 60,
          note: null,
        }),
      );
      const result = await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE")));
      expect(result).toMatchObject({ status: 422, code: "TRIP_NOT_READY_FOR_SALE" });
      expect(result.reasons).toEqual(["VEHICLE_MISSING", "FARE_MISSING", "SALE_WINDOW_CLOSED"]);
      expect((await trips.get(authzA, trip.id)).status).toBe("DRAFT");
      expect(await statusEvents(trip.id)).toEqual([]);
    });

    it("đủ điều kiện → OPEN_FOR_SALE, ghi đúng một audit (trước / sau, người sửa)", async () => {
      const { trip } = await readyTrip();
      const opened = await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      expect(opened).toMatchObject({ status: "OPEN_FOR_SALE", statusReason: null, onlineSaleCutoffMinutes: 60 });
      expect(opened.seats.map((seat) => [seat.code, seat.price])).toEqual([
        ["A1", 300_000],
        ["A2", 320_000],
      ]);
      const events = await statusEvents(trip.id);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        actorId: actor.sub,
        before: { status: "DRAFT" },
        after: { status: "OPEN_FOR_SALE" },
      });
    });

    it("từng lý do: thiếu giá một loại chỗ, giá 0, xe bảo dưỡng, điểm dừng / tuyến ngừng dùng, nhà xe bị đình chỉ", async () => {
      const reasonsOf = async (tripId: string) =>
        (await rejectionOf(trips.changeStatus(actor, authzA, tripId, status("OPEN_FOR_SALE")))).reasons;

      expect(await reasonsOf((await readyTrip({ rules: [rule("BED", 320_000)] })).trip.id)).toEqual(["SEAT_PRICE_MISSING"]);
      expect(await reasonsOf((await readyTrip({ rules: [rule("SEAT", 0), rule("BED", 320_000)] })).trip.id)).toEqual([
        "SEAT_PRICE_ZERO",
      ]);

      const maintenance = await readyTrip();
      await prisma.withTenant(tenantA, (tx) =>
        tx.vehicle.update({ where: { id: maintenance.vehicleId }, data: { status: "MAINTENANCE" } }),
      );
      expect(await reasonsOf(maintenance.trip.id)).toEqual(["VEHICLE_INACTIVE"]);

      const stopGone = await readyTrip({ stops: [points[0]!, points[2]!] });
      await prisma.withSystem((tx) => tx.stopPointCatalog.update({ where: { id: points[2]! }, data: { status: "INACTIVE" } }));
      expect(await reasonsOf(stopGone.trip.id)).toEqual(["STOP_POINT_INACTIVE"]);

      const privateStop = randomUUID();
      await prisma.withTenant(tenantA, (tx) =>
        tx.stopPoint.create({
          data: {
            id: privateStop,
            operatorId: tenantA,
            name: `Điểm riêng ${tag}`,
            type: "BUS_STATION",
            address: "x",
            provinceId: province,
            wardId: ward,
            latitude: 11,
            longitude: 107,
          },
        }),
      );
      const privateGone = await readyTrip({ privateStopId: privateStop });
      await prisma.withTenant(tenantA, (tx) => tx.stopPoint.update({ where: { id: privateStop }, data: { status: "INACTIVE" } }));
      expect(await reasonsOf(privateGone.trip.id)).toEqual(["STOP_POINT_INACTIVE"]);

      const routeGone = await readyTrip();
      await prisma.withTenant(tenantA, (tx) => tx.route.update({ where: { id: routeGone.routeId }, data: { status: "INACTIVE" } }));
      expect(await reasonsOf(routeGone.trip.id)).toEqual(["ROUTE_INACTIVE"]);

      const suspended = await readyTrip();
      await prisma.withSystem((tx) => tx.operatorProfile.update({ where: { id: tenantA }, data: { status: "SUSPENDED" } }));
      try {
        expect(await reasonsOf(suspended.trip.id)).toEqual(["OPERATOR_INACTIVE"]);
      } finally {
        await prisma.withSystem((tx) => tx.operatorProfile.update({ where: { id: tenantA }, data: { status: "ACTIVE" } }));
      }
    });

    it("khóa (= tạm dừng) ↔ mở lại; mở lại kiểm lại điều kiện (bảng giá tắt trong lúc khóa → 422)", async () => {
      const { trip, fare } = await readyTrip();
      await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      const record = vi.spyOn(audit, "recordAuditEvent");
      const locked = await trips.changeStatus(actor, authzA, trip.id, status("LOCKED", " Kiểm tra xe "));
      expect(locked).toMatchObject({ status: "LOCKED", statusReason: "Kiểm tra xe" });
      // Lý do vào audit; ghi trong transaction có giới hạn + hạn chót theo transaction.
      expect(record).toHaveBeenCalledWith(expect.objectContaining({ action: "trip.status.change", reason: "Kiểm tra xe" }), {
        timeoutMs: 2_000,
        deadline: expect.any(Number),
      });
      record.mockRestore();
      const rules = [rule("SEAT", 300_000), rule("BED", 320_000)];
      await fares.update(actor, authzA, fare!.id, FareUpdateInputSchema.parse({ status: "INACTIVE", note: null, rules }));
      expect((await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE")))).reasons).toEqual([
        "FARE_MISSING",
      ]);
      await fares.update(actor, authzA, fare!.id, FareUpdateInputSchema.parse({ status: "ACTIVE", note: null, rules }));
      const reopened = await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      expect(reopened).toMatchObject({ status: "OPEN_FOR_SALE", statusReason: null });
      expect((await statusEvents(trip.id)).map((event) => event.after)).toEqual([
        { status: "OPEN_FOR_SALE" },
        { status: "LOCKED" },
        { status: "OPEN_FOR_SALE" },
      ]);
    });
  });

  describe("Bảng chuyển trạng thái (Q2)", () => {
    it("sai bảng / chuyển sang chính nó → 409; thu hồi nháp để sửa; hủy có lý do, xe rảnh ngay, không mở lại được", async () => {
      const { trip, routeId, vehicleId } = await readyTrip();
      await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      expect((await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE")))).code).toBe(
        "TRIP_STATUS_TRANSITION_INVALID",
      );
      const draft = await trips.changeStatus(actor, authzA, trip.id, status("DRAFT", "Sửa giờ đi"));
      expect(draft).toMatchObject({ status: "DRAFT", statusReason: "Sửa giờ đi" });
      const input = TripInputSchema.parse({
        routeId,
        vehicleId,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        stopTimes: null,
        onlineSaleCutoffMinutes: 120,
        note: "Đã sửa",
      });
      expect(await trips.update(authzA, trip.id, input)).toMatchObject({ onlineSaleCutoffMinutes: 120, note: "Đã sửa" });
      expect((await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status("LOCKED")))).status).toBe(409);

      const cancelled = await trips.changeStatus(actor, authzA, trip.id, status("CANCELLED", "Xe hỏng"));
      expect(cancelled).toMatchObject({ status: "CANCELLED", statusReason: "Xe hỏng" });
      // Chuyến hủy không giữ xe (EXCLUDE bỏ qua chuyến CANCELLED): gắn lại đúng xe, đúng giờ được.
      await trips.create(authzA, input);
      for (const target of ["OPEN_FOR_SALE", "DRAFT", "LOCKED"]) {
        expect((await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status(target)))).code, target).toBe(
          "TRIP_STATUS_TRANSITION_INVALID",
        );
      }
    });

    it("chuyến đã có vé: không thu hồi nháp / hủy (luồng TRN-008); khóa bán vẫn được", async () => {
      const { trip } = await readyTrip();
      await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      await setSeat(trip.id, "A1", "BOOKED");
      for (const [target, reason] of [
        ["DRAFT", null],
        ["CANCELLED", "Hủy"],
      ] as const) {
        expect((await rejectionOf(trips.changeStatus(actor, authzA, trip.id, status(target, reason)))).code, target).toBe(
          "TRIP_STATUS_TRANSITION_INVALID",
        );
      }
      expect((await trips.changeStatus(actor, authzA, trip.id, status("LOCKED"))).status).toBe("LOCKED");
    });

    it("hủy trong lúc một transaction khác đang bán ghế (chưa commit) → chờ rồi thấy BOOKED → 409, chuyến không hủy", async () => {
      const { trip } = await readyTrip();
      await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      let release!: () => void;
      let sold!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      const selling = new Promise<void>((resolve) => (sold = resolve));
      // Mô phỏng luồng xác nhận vé (BTP-002) đổi A1 sang BOOKED nhưng chưa commit.
      const seller = prisma.withTenant(tenantA, async (tx) => {
        await tx.tripSeat.updateMany({ where: { tripId: trip.id, seatCode: "A1" }, data: { status: "BOOKED" } });
        sold();
        await gate;
      });
      await selling;
      const cancelling = rejectionOf(trips.changeStatus(actor, authzA, trip.id, status("CANCELLED", "Xe hỏng")));
      await new Promise((resolve) => setTimeout(resolve, 300));
      release();
      await seller;
      expect((await cancelling).code).toBe("TRIP_STATUS_TRANSITION_INVALID");
      expect((await trips.get(authzA, trip.id)).status).toBe("OPEN_FOR_SALE");
    });

    it("hai request mở bán đồng thời → đúng một thành công, một 409, đúng một audit", async () => {
      const { trip } = await readyTrip();
      const results = await Promise.allSettled([
        trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE")),
        trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE")),
      ]);
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find((result) => result.status === "rejected") as PromiseRejectedResult;
      expect((rejected.reason as { getResponse: () => { code: string } }).getResponse().code).toBe(
        "TRIP_STATUS_TRANSITION_INVALID",
      );
      expect(await statusEvents(trip.id)).toHaveLength(1);
    });

    it("ghi audit lỗi (Mongo) → 503, trạng thái không đổi", async () => {
      const { trip } = await readyTrip();
      const broken = {
        recordAuditEvent: async () => {
          throw new AuditWriteError(new Error("Mongo down"));
        },
      } as unknown as AuditService;
      expect(
        await rejectionOf(new TripService(prisma, broken).changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"))),
      ).toMatchObject({ status: 503, code: "SERVICE_UNAVAILABLE" });
      expect((await trips.get(authzA, trip.id)).status).toBe("DRAFT");
    });

    it(
      "transaction hết hạn (audit chậm hơn 5s, bỏ qua hạn chót) → 503 thử lại được, trạng thái không đổi",
      async () => {
        const { trip } = await readyTrip();
        const slow = {
          recordAuditEvent: () => new Promise<void>((resolve) => setTimeout(resolve, 6_000)),
        } as unknown as AuditService;
        expect(
          await rejectionOf(new TripService(prisma, slow).changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"))),
        ).toMatchObject({ status: 503, code: "SERVICE_UNAVAILABLE" });
        expect((await trips.get(authzA, trip.id)).status).toBe("DRAFT");
      },
      20_000,
    );

    it("DB: chuyến hủy phải có lý do khác rỗng; thời điểm ngừng bán ngoài 0–1440 bị chặn (kể cả đường system)", async () => {
      const { trip } = await readyTrip();
      const write = (data: Record<string, unknown>) =>
        rejectionOf(prisma.withSystem((tx) => tx.trip.update({ where: { id: trip.id }, data })));
      expect((await write({ status: "CANCELLED" })).text).toMatch(/trips_cancel_requires_reason/);
      expect((await write({ status: "CANCELLED", statusReason: "   " })).text).toMatch(/trips_cancel_requires_reason/);
      expect((await write({ onlineSaleCutoffMinutes: -1 })).text).toMatch(/trips_online_sale_cutoff_range/);
      expect((await write({ onlineSaleCutoffMinutes: 1441 })).text).toMatch(/trips_online_sale_cutoff_range/);
    });
  });

  describe("Khóa ghế thủ công (Q5, BR-42)", () => {
    it("khóa / mở theo lô; ghế đã ở trạng thái đích bỏ qua; audit sau commit chỉ ghi ghế thực sự đổi", async () => {
      const { trip } = await readyTrip();
      await trips.changeStatus(actor, authzA, trip.id, status("OPEN_FOR_SALE"));
      await trips.setSeatStatus(actor, authzA, trip.id, seats(["A1"], "BLOCKED"));
      const blocked = await trips.setSeatStatus(actor, authzA, trip.id, seats(["a1", "A2"], "BLOCKED", "Bán tại quầy"));
      expect(blocked.seats.map((seat) => seat.status)).toEqual(["BLOCKED", "BLOCKED"]);
      const unblocked = await trips.setSeatStatus(actor, authzA, trip.id, seats(["A2"], "AVAILABLE"));
      expect(unblocked.seats.map((seat) => [seat.code, seat.status])).toEqual([
        ["A1", "BLOCKED"],
        ["A2", "AVAILABLE"],
      ]);
      const events = await eventually(
        () => seatEvents(trip.id),
        (items) => items.length === 3,
      );
      expect(events.map((event) => [event.action, event.after])).toEqual([
        ["trip.seats.unblock", { seatCodes: ["A2"], status: "AVAILABLE" }],
        ["trip.seats.block", { seatCodes: ["A2"], status: "BLOCKED" }],
        ["trip.seats.block", { seatCodes: ["A1"], status: "BLOCKED" }],
      ]);
    });

    it("được cả lô hoặc không: mã ghế lạ → 422, ghế đã bán → 409 — không ghế nào đổi", async () => {
      const { trip } = await readyTrip();
      expect((await rejectionOf(trips.setSeatStatus(actor, authzA, trip.id, seats(["A1", "ZZ"], "BLOCKED")))).code).toBe(
        "TRIP_SEAT_UNKNOWN",
      );
      await setSeat(trip.id, "A2", "BOOKED");
      expect((await rejectionOf(trips.setSeatStatus(actor, authzA, trip.id, seats(["A1", "A2"], "BLOCKED")))).code).toBe(
        "TRIP_SEAT_NOT_AVAILABLE",
      );
      expect((await trips.get(authzA, trip.id)).seats.map((seat) => seat.status)).toEqual(["AVAILABLE", "BOOKED"]);
    });

    it("tranh chấp: ghế đang được transaction khác giữ (chưa commit) → cả lô 409, ghế còn lại không đổi", async () => {
      const { trip } = await readyTrip();
      let release!: () => void;
      let held!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      const holding = new Promise<void>((resolve) => (held = resolve));
      // Mô phỏng luồng giữ ghế (BTP-001) đổi A1 sang HOLDING nhưng chưa commit.
      const holder = prisma.withTenant(tenantA, async (tx) => {
        await tx.tripSeat.updateMany({ where: { tripId: trip.id, seatCode: "A1" }, data: { status: "HOLDING" } });
        held();
        await gate;
      });
      await holding;
      const blocking = rejectionOf(trips.setSeatStatus(actor, authzA, trip.id, seats(["A1", "A2"], "BLOCKED")));
      await new Promise((resolve) => setTimeout(resolve, 300));
      release();
      await holder;
      expect((await blocking).code).toBe("TRIP_SEAT_NOT_AVAILABLE");
      expect((await trips.get(authzA, trip.id)).seats.map((seat) => [seat.code, seat.status])).toEqual([
        ["A1", "HOLDING"],
        ["A2", "AVAILABLE"],
      ]);
    });

    it("đổi xe: sơ đồ mới thiếu ghế đang khóa → 409 nêu mã ghế; còn ghế đang giữ / đã bán thì không sinh lại ghế", async () => {
      const { trip, routeId } = await readyTrip();
      await trips.setSeatStatus(actor, authzA, trip.id, seats(["A2"], "BLOCKED"));
      const map = await seatMaps.create(
        authzA,
        SeatMapInputSchema.parse({
          name: `Sơ đồ nhỏ ${tag} ${seq++}`,
          layout: { decks: [{ deck: 1, rows: 1, columns: 1 }] },
          seats: [{ code: "A1", deck: 1, row: 1, column: 1, type: "SEAT" }],
        }),
      );
      const small = await vehicles.create(
        authzA,
        VehicleInputSchema.parse({
          plateNumber: `51G${String(10000 + seq++)}`,
          vehicleTypeId: typeSleeper,
          seatMapId: map.id,
          amenityIds: [],
          status: "ACTIVE",
          description: null,
        }),
      );
      const input = (vehicleId: string) =>
        TripInputSchema.parse({
          routeId,
          vehicleId,
          departureAt: trip.departureAt,
          arrivalAt: trip.arrivalAt,
          stopTimes: null,
          onlineSaleCutoffMinutes: 60,
          note: null,
        });
      const missing = await rejectionOf(trips.update(authzA, trip.id, input(small.id)));
      expect(missing).toMatchObject({ status: 409, code: "TRIP_BLOCKED_SEATS_MISSING" });
      expect(missing.detail).toMatch(/: A2\./);
      await trips.setSeatStatus(actor, authzA, trip.id, seats(["A2"], "AVAILABLE"));
      await setSeat(trip.id, "A1", "BOOKED");
      expect((await rejectionOf(trips.update(authzA, trip.id, input(small.id)))).code).toBe("TRIP_SEAT_NOT_AVAILABLE");
      expect((await trips.get(authzA, trip.id)).vehicleId).not.toBe(small.id);
    });

    it("chuyến hủy → 409 TRIP_NOT_EDITABLE; Mongo lỗi vẫn khóa được ghế (chống overbooking)", async () => {
      const cancelled = await readyTrip();
      await trips.changeStatus(actor, authzA, cancelled.trip.id, status("CANCELLED", "Hủy"));
      expect((await rejectionOf(trips.setSeatStatus(actor, authzA, cancelled.trip.id, seats(["A1"], "BLOCKED")))).code).toBe(
        "TRIP_NOT_EDITABLE",
      );
      const { trip } = await readyTrip();
      const broken = {
        recordAuditEvent: async () => {
          throw new Error("Mongo down");
        },
      } as unknown as AuditService;
      const result = await new TripService(prisma, broken).setSeatStatus(actor, authzA, trip.id, seats(["A1"], "BLOCKED"));
      expect(result.seats.find((seat) => seat.code === "A1")?.status).toBe("BLOCKED");
    });
  });

  describe("Tenant (RLS / IDOR)", () => {
    it("nhà xe B không đổi trạng thái, không khóa ghế chuyến của A (404); query quên lọc vẫn bị RLS chặn", async () => {
      const { trip } = await readyTrip();
      expect((await rejectionOf(trips.changeStatus(actor, authzB, trip.id, status("OPEN_FOR_SALE")))).code).toBe(
        "TRIP_NOT_FOUND",
      );
      expect((await rejectionOf(trips.setSeatStatus(actor, authzB, trip.id, seats(["A1"], "BLOCKED")))).code).toBe(
        "TRIP_NOT_FOUND",
      );
      await prisma.withTenant(tenantB, async (tx) => {
        expect((await tx.trip.updateMany({ where: { id: trip.id }, data: { status: "OPEN_FOR_SALE" } })).count).toBe(0);
        expect((await tx.tripSeat.updateMany({ where: { tripId: trip.id }, data: { status: "BLOCKED" } })).count).toBe(0);
      });
      const detail = await trips.get(authzA, trip.id);
      expect(detail.status).toBe("DRAFT");
      expect(detail.seats.every((seat) => seat.status === "AVAILABLE")).toBe(true);
    });
  });
});
