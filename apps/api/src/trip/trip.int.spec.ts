import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseAppConfig } from "../config/env.config";
import { tenantScope } from "../database/db-scope";
import { PrismaService } from "../database/prisma.service";
import type { Coordinates, RouteLeg, RoutingProvider } from "../external/routing/routing-provider";
import type { Authorization } from "../iam/role/authorization";
import { RouteInputSchema } from "../route/dto/route.dto";
import { RouteService } from "../route/route.service";
import { SeatMapInputSchema } from "../vehicle/dto/seat-map.dto";
import { VehicleInputSchema } from "../vehicle/dto/vehicle.dto";
import { SeatMapService } from "../vehicle/seat-map.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { TripInputSchema } from "./dto/trip.dto";
import { TripService } from "./trip.service";

/**
 * TASK-TRN-003 — Postgres THẬT bằng role APP (RLS chỉ có hiệu lực với role không superuser/BYPASSRLS).
 * Route tạo qua RouteService với provider giả: chặng thứ i = 60·(i+1) giây (không gọi Goong).
 */
const url = process.env.DATABASE_URL;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";
const HOUR = 3_600_000;

async function rejectionOf(promise: Promise<unknown>): Promise<{ status?: number; code?: string; text: string }> {
  try {
    await promise;
    return { text: "" };
  } catch (error) {
    const response = (error as { getResponse?: () => { code?: string } }).getResponse?.();
    return {
      status: (error as { getStatus?: () => number }).getStatus?.(),
      code: response?.code,
      text: JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error),
    };
  }
}

class FakeRouting implements RoutingProvider {
  readonly source = "GOONG" as const;
  async measureLegs(points: Coordinates[]): Promise<RouteLeg[]> {
    return points.slice(1).map((_point, index) => ({ distanceMeters: 1000 * (index + 1), durationSeconds: 60 * (index + 1) }));
  }
}

describe.skipIf(!url && !requireDb)("Trip — Postgres thật, role app", () => {
  let prisma: PrismaService;
  let trips: TripService;
  let routes: RouteService;
  let seatMaps: SeatMapService;
  let vehicles: VehicleService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const province = randomUUID();
  const ward = randomUUID();
  const points = [randomUUID(), randomUUID(), randomUUID()];
  const vehicleType = randomUUID();
  const authzA = authz(tenantA);
  const authzB = authz(tenantB);
  let route3: string; // 3 điểm, chặng 60 s + 120 s
  let route2: string; // 2 điểm
  let routeInactive: string;
  let routeB: string;
  // Mỗi test dùng một khung giờ riêng (ngày khác nhau) để không đụng xe của test khác.
  let day = 0;
  const nextDay = () => Date.UTC(2031, 2, 1) + day++ * 24 * HOUR;
  let plateSeq = 0;

  function authz(operatorId: string): Authorization {
    return { permission: "trip:manage", scope: "tenant", db: tenantScope(operatorId) };
  }

  const tripInput = (overrides: Record<string, unknown>) =>
    TripInputSchema.parse({ vehicleId: null, stopTimes: null, note: null, ...overrides });
  const at = (start: number, hours: number) => new Date(start + hours * HOUR).toISOString();

  /** Tạo sơ đồ `seats` ghế + xe gắn sơ đồ đó cho tenant. */
  async function vehicleWithSeats(auth: Authorization, seats = 4, status = "ACTIVE") {
    const map = await seatMaps.create(
      auth,
      SeatMapInputSchema.parse({
        name: `Sơ đồ ${tag} ${plateSeq}`,
        layout: { decks: [{ deck: 1, rows: 10, columns: 2 }] },
        seats: Array.from({ length: seats }, (_, index) => ({
          code: `A${index + 1}`,
          deck: 1,
          row: Math.floor(index / 2) + 1,
          column: (index % 2) + 1,
          type: "SEAT",
        })),
      }),
    );
    const vehicle = await vehicles.create(
      auth,
      VehicleInputSchema.parse({
        plateNumber: `51B${String(10000 + plateSeq++)}`,
        vehicleTypeId: vehicleType,
        seatMapId: map.id,
        amenityIds: [],
        status,
        description: null,
      }),
    );
    return { vehicle, map };
  }

  async function setTripStatus(tripId: string, status: "OPEN_FOR_SALE" | "CANCELLED" | "COMPLETED") {
    await prisma.withSystem((tx) => tx.trip.update({ where: { id: tripId }, data: { status } }));
  }

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    trips = new TripService(prisma);
    routes = new RouteService(prisma, new FakeRouting());
    seatMaps = new SeatMapService(prisma);
    vehicles = new VehicleService(prisma);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (TRN-003-guide.md §0).");
    }
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `trip-a-${tag}`, displayName: "Trip A" },
          { id: tenantB, operatorSlug: `trip-b-${tag}`, displayName: "Trip B" },
        ],
      });
      await tx.province.create({ data: { id: province, code: `tp-${tag}`, name: "Tỉnh trip" } });
      await tx.ward.create({ data: { id: ward, provinceId: province, code: `tw-${tag}`, name: "Phường trip" } });
      await tx.stopPointCatalog.createMany({
        data: points.map((id, index) => ({
          id,
          name: `Bến ${index + 1} ${tag}`,
          type: "BUS_STATION" as const,
          address: `Địa chỉ ${index + 1}`,
          provinceId: province,
          wardId: ward,
          latitude: 10 + index,
          longitude: 106 + index,
        })),
      });
      await tx.vehicleType.create({ data: { id: vehicleType, code: `TV-${tag}`, name: "Ghế" } });
    });
    const stops = (ids: string[]) => ids.map((id) => ({ catalogStopPointId: id, stopPointId: null, note: null }));
    const routeInput = (name: string, ids: string[], status = "ACTIVE") =>
      RouteInputSchema.parse({ name, status, note: null, stops: stops(ids) });
    route3 = (await routes.create(authzA, routeInput(`R3 ${tag}`, points))).id;
    route2 = (await routes.create(authzA, routeInput(`R2 ${tag}`, points.slice(0, 2)))).id;
    routeInactive = (await routes.create(authzA, routeInput(`Ngừng ${tag}`, points.slice(1), "INACTIVE"))).id;
    routeB = (await routes.create(authzB, routeInput(`RB ${tag}`, points.slice(0, 2)))).id;
  }, 30_000);

  afterAll(async () => {
    if (!prisma) {
      return;
    }
    await prisma.withSystem(async (tx) => {
      const operatorId = { in: [tenantA, tenantB] };
      await tx.tripSeat.deleteMany({ where: { operatorId } });
      await tx.tripStop.deleteMany({ where: { operatorId } });
      await tx.trip.deleteMany({ where: { operatorId } });
      await tx.routeStop.deleteMany({ where: { operatorId } });
      await tx.route.deleteMany({ where: { operatorId } });
      await tx.vehicle.deleteMany({ where: { operatorId } });
      await tx.seat.deleteMany({ where: { operatorId } });
      await tx.seatMap.deleteMany({ where: { operatorId } });
      await tx.stopPointCatalog.deleteMany({ where: { provinceId: province } });
      await tx.ward.deleteMany({ where: { provinceId: province } });
      await tx.province.deleteMany({ where: { id: province } });
      await tx.vehicleType.deleteMany({ where: { id: vehicleType } });
      await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
    });
    await prisma.$disconnect();
  });

  describe("RLS và ràng buộc DB", () => {
    it("3 bảng ENABLE + FORCE RLS với tenant_isolation; có EXCLUDE chống chồng giờ; rlsProblems() rỗng", async () => {
      const rows = await prisma.$queryRaw<{ relname: string }[]>`
        SELECT c.relname FROM pg_class c JOIN pg_policies p ON p.tablename = c.relname
        WHERE c.relname IN ('trips','trip_stops','trip_seats')
          AND c.relrowsecurity AND c.relforcerowsecurity AND p.policyname = 'tenant_isolation'
          AND p.cmd = 'ALL' AND p.qual LIKE '%app_rls_allows%' AND p.with_check LIKE '%app_rls_allows%'`;
      expect(rows.map((row) => row.relname).sort()).toEqual(["trip_seats", "trip_stops", "trips"]);
      const exclusion = await prisma.$queryRaw<{ conname: string }[]>`
        SELECT conname FROM pg_constraint WHERE conname = 'trips_vehicle_no_overlap' AND contype = 'x'`;
      expect(exclusion).toHaveLength(1);
      expect(await prisma.rlsProblems()).toEqual([]);
    });

    it("query CỐ Ý quên lọc operator_id: tenant B không đọc/sửa/xoá được chuyến, điểm, ghế của A", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      const start = nextDay();
      const trip = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 1), arrivalAt: at(start, 4) }),
      );
      await prisma.withTenant(tenantB, async (tx) => {
        expect(await tx.trip.findMany({ where: { id: trip.id } })).toEqual([]);
        expect(await tx.tripStop.findMany({ where: { tripId: trip.id } })).toEqual([]);
        expect(await tx.tripSeat.findMany({ where: { tripId: trip.id } })).toEqual([]);
        expect((await tx.trip.updateMany({ where: { id: trip.id }, data: { note: "hack" } })).count).toBe(0);
        expect((await tx.tripSeat.updateMany({ where: { tripId: trip.id }, data: { status: "BLOCKED" } })).count).toBe(0);
        expect((await tx.tripSeat.deleteMany({ where: { tripId: trip.id } })).count).toBe(0);
      });
      // Không ngữ cảnh → 0 dòng (fail-closed).
      expect(await prisma.trip.findMany({ where: { id: trip.id } })).toEqual([]);
      expect((await trips.get(authzA, trip.id)).seats).toHaveLength(4);
    });

    it("FK ghép: DB từ chối chuyến của A gắn route/xe của B, dù đi đường system", async () => {
      const { vehicle: vehicleB } = await vehicleWithSeats(authzB);
      const start = nextDay();
      const base = { operatorId: tenantA, departureAt: new Date(start + HOUR), arrivalAt: new Date(start + 2 * HOUR) };
      const routeCross = await rejectionOf(prisma.withSystem((tx) => tx.trip.create({ data: { ...base, routeId: routeB } })));
      expect(routeCross.text).toMatch(/trips_route_id_operator_id_fkey|Foreign key/i);
      const vehicleCross = await rejectionOf(
        prisma.withSystem((tx) => tx.trip.create({ data: { ...base, routeId: route3, vehicleId: vehicleB.id } })),
      );
      expect(vehicleCross.text).toMatch(/trips_vehicle_id_operator_id_fkey|Foreign key/i);
    });

    it("CHECK: giờ đến phải sau giờ đi (kể cả ghi thẳng DB)", async () => {
      const start = nextDay();
      const invalid = await rejectionOf(
        prisma.withTenant(tenantA, (tx) =>
          tx.trip.create({
            data: { operatorId: tenantA, routeId: route3, departureAt: new Date(start + HOUR), arrivalAt: new Date(start + HOUR) },
          }),
        ),
      );
      expect(invalid.text).toMatch(/trips_arrival_after_departure/);
    });
  });

  describe("IDOR — id của tenant khác trong body/path", () => {
    it("route/xe của B → 422 như không tồn tại; chuyến của A với B → 404", async () => {
      const { vehicle: vehicleB } = await vehicleWithSeats(authzB);
      const start = nextDay();
      const times = { departureAt: at(start, 1), arrivalAt: at(start, 3) };
      expect((await rejectionOf(trips.create(authzA, tripInput({ routeId: routeB, ...times })))).code).toBe("ROUTE_UNAVAILABLE");
      expect((await rejectionOf(trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicleB.id, ...times })))).code).toBe(
        "VEHICLE_UNAVAILABLE",
      );
      const tripA = await trips.create(authzA, tripInput({ routeId: route3, ...times }));
      expect((await rejectionOf(trips.get(authzB, tripA.id))).code).toBe("TRIP_NOT_FOUND");
      expect((await rejectionOf(trips.update(authzB, tripA.id, tripInput({ routeId: routeB, ...times })))).code).toBe(
        "TRIP_NOT_FOUND",
      );
      expect((await trips.list(authzB, { limit: 100 })).items.map((trip) => trip.id)).not.toContain(tripA.id);
    });
  });

  describe("Tạo chuyến (FR-OPS-06)", () => {
    it("chép điểm từ route, chia giờ theo tỉ lệ chặng; sinh đủ ghế AVAILABLE từ sơ đồ của xe", async () => {
      const { vehicle } = await vehicleWithSeats(authzA, 6);
      const start = nextDay();
      const trip = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 0), arrivalAt: at(start, 3), note: " Ghi chú " }),
      );
      expect(trip.status).toBe("DRAFT");
      expect(trip.routeName).toBe(`R3 ${tag}`);
      expect(trip.vehiclePlateNumber).toBe(vehicle.plateNumber);
      expect(trip.note).toBe("Ghi chú");
      // Chặng 60 s + 120 s → điểm giữa ở 1/3 quãng thời gian 3 giờ.
      expect(trip.stops.map((stop) => [stop.sequence, stop.role, stop.plannedAt])).toEqual([
        [1, "ORIGIN", at(start, 0)],
        [2, "INTERMEDIATE", at(start, 1)],
        [3, "DESTINATION", at(start, 3)],
      ]);
      expect(trip.stops.map((stop) => stop.catalogStopPointId)).toEqual(points);
      expect(trip.stops[0]!.name).toBe(`Bến 1 ${tag}`);
      expect(trip.seatCount).toBe(6);
      expect(trip.seats.map((seat) => seat.code)).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"]);
      expect(new Set(trip.seats.map((seat) => seat.status))).toEqual(new Set(["AVAILABLE"]));
    });

    it("giờ từng điểm do Operator gửi được giữ nguyên; sai số điểm → 422", async () => {
      const start = nextDay();
      const times = [at(start, 0), at(start, 2), at(start, 3)];
      const trip = await trips.create(
        authzA,
        tripInput({ routeId: route3, departureAt: times[0], arrivalAt: times[2], stopTimes: times }),
      );
      expect(trip.stops.map((stop) => stop.plannedAt)).toEqual(times);
      expect(trip.seats).toEqual([]);
      const wrong = await rejectionOf(
        trips.create(authzA, tripInput({ routeId: route2, departureAt: times[0], arrivalAt: times[2], stopTimes: times })),
      );
      expect(wrong.code).toBe("TRIP_STOP_TIMES_INVALID");
    });

    it("route ngừng dùng → ROUTE_UNAVAILABLE; xe bảo dưỡng hoặc chưa có sơ đồ → VEHICLE_UNAVAILABLE", async () => {
      const start = nextDay();
      const times = { departureAt: at(start, 1), arrivalAt: at(start, 3) };
      expect((await rejectionOf(trips.create(authzA, tripInput({ routeId: routeInactive, ...times })))).code).toBe(
        "ROUTE_UNAVAILABLE",
      );
      const { vehicle: maintenance } = await vehicleWithSeats(authzA, 2, "MAINTENANCE");
      expect((await rejectionOf(trips.create(authzA, tripInput({ routeId: route3, vehicleId: maintenance.id, ...times })))).code).toBe(
        "VEHICLE_UNAVAILABLE",
      );
      const noMap = await vehicles.create(
        authzA,
        VehicleInputSchema.parse({
          plateNumber: `51B${String(10000 + plateSeq++)}`,
          vehicleTypeId: vehicleType,
          seatMapId: null,
          amenityIds: [],
          status: "ACTIVE",
          description: null,
        }),
      );
      expect((await rejectionOf(trips.create(authzA, tripInput({ routeId: route3, vehicleId: noMap.id, ...times })))).code).toBe(
        "VEHICLE_UNAVAILABLE",
      );
    });
  });

  describe("BR-14 — một xe không chạy hai chuyến chồng giờ", () => {
    it("chồng giờ → 409; nối tiếp đúng giờ đến được; xe khác / không xe không ảnh hưởng; chuyến huỷ không giữ xe", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      const { vehicle: other } = await vehicleWithSeats(authzA);
      const start = nextDay();
      const first = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 2), arrivalAt: at(start, 6) }),
      );
      for (const [from, to] of [
        [1, 3],
        [3, 5],
        [5, 8],
        [1, 8],
      ] as const) {
        const overlap = await rejectionOf(
          trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, from), arrivalAt: at(start, to) })),
        );
        expect(overlap.code, `${from}-${to}`).toBe("VEHICLE_SCHEDULE_CONFLICT");
        expect(overlap.status).toBe(409);
      }
      // Không có thời gian đệm quay đầu (Khanh chốt 30/09/2026): khởi hành đúng lúc chuyến trước đến.
      await trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 6), arrivalAt: at(start, 9) }));
      await trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 0), arrivalAt: at(start, 2) }));
      await trips.create(authzA, tripInput({ routeId: route3, vehicleId: other.id, departureAt: at(start, 3), arrivalAt: at(start, 5) }));
      await trips.create(authzA, tripInput({ routeId: route3, departureAt: at(start, 3), arrivalAt: at(start, 5) }));
      await setTripStatus(first.id, "CANCELLED");
      await trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 3), arrivalAt: at(start, 5) }));
    });

    it("hai request đồng thời gắn cùng xe trùng giờ → đúng một thành công (ràng buộc ở DB)", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      for (let round = 0; round < 5; round++) {
        const start = nextDay();
        const results = await Promise.allSettled(
          [0, 1].map((offset) =>
            trips.create(
              authzA,
              tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, offset), arrivalAt: at(start, offset + 3) }),
            ),
          ),
        );
        expect(results.filter((result) => result.status === "fulfilled"), `vòng ${round}`).toHaveLength(1);
        const rejected = results.find((result) => result.status === "rejected") as PromiseRejectedResult;
        expect((await rejectionOf(Promise.reject(rejected.reason))).code).toBe("VEHICLE_SCHEDULE_CONFLICT");
      }
    });
  });

  describe("Sửa chuyến (PUT, chỉ DRAFT)", () => {
    it("đổi xe sinh lại ghế; giữ xe thì ghế giữ nguyên; bỏ xe thì hết ghế; điểm dừng chép lại theo route mới", async () => {
      const { vehicle } = await vehicleWithSeats(authzA, 4);
      const { vehicle: bigger } = await vehicleWithSeats(authzA, 6);
      const start = nextDay();
      const base = { departureAt: at(start, 1), arrivalAt: at(start, 4) };
      const trip = await trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, ...base }));
      // Ghế bị khoá (TRN-006 sẽ làm qua API) phải còn nguyên khi PUT không đổi xe.
      await prisma.withTenant(tenantA, (tx) =>
        tx.tripSeat.updateMany({ where: { tripId: trip.id, seatCode: "A1" }, data: { status: "BLOCKED" } }),
      );
      const sameVehicle = await trips.update(authzA, trip.id, tripInput({ routeId: route2, vehicleId: vehicle.id, ...base }));
      expect(sameVehicle.stops.map((stop) => stop.role)).toEqual(["ORIGIN", "DESTINATION"]);
      expect(sameVehicle.seats.find((seat) => seat.code === "A1")?.status).toBe("BLOCKED");
      const swapped = await trips.update(authzA, trip.id, tripInput({ routeId: route2, vehicleId: bigger.id, ...base }));
      expect(swapped.seatCount).toBe(6);
      expect(new Set(swapped.seats.map((seat) => seat.status))).toEqual(new Set(["AVAILABLE"]));
      const detached = await trips.update(authzA, trip.id, tripInput({ routeId: route2, vehicleId: null, ...base }));
      expect(detached.seats).toEqual([]);
      expect(detached.vehicleId).toBeNull();
    });

    it("route/xe ĐANG gắn đã ngừng dùng vẫn sửa được chuyến; route/xe MỚI thì phải hợp lệ", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      const start = nextDay();
      const base = { vehicleId: vehicle.id, departureAt: at(start, 1), arrivalAt: at(start, 4) };
      const trip = await trips.create(authzA, tripInput({ routeId: route2, ...base }));
      await prisma.withTenant(tenantA, async (tx) => {
        await tx.route.update({ where: { id: route2 }, data: { status: "INACTIVE" } });
        await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: "MAINTENANCE" } });
      });
      try {
        const kept = await trips.update(authzA, trip.id, tripInput({ routeId: route2, ...base, note: "đổi giờ" }));
        expect(kept.note).toBe("đổi giờ");
        expect(kept.seatCount).toBe(4);
        expect((await rejectionOf(trips.update(authzA, trip.id, tripInput({ ...base, routeId: routeInactive })))).code).toBe(
          "ROUTE_UNAVAILABLE",
        );
      } finally {
        await prisma.withTenant(tenantA, async (tx) => {
          await tx.route.update({ where: { id: route2 }, data: { status: "ACTIVE" } });
          await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: "ACTIVE" } });
        });
      }
    });

    it("chuyến đã rời DRAFT → TRIP_NOT_EDITABLE; dời giờ chồng chuyến khác của xe → 409; dời trong chính nó được", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      const start = nextDay();
      const trip = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 1), arrivalAt: at(start, 3) }),
      );
      await trips.create(authzA, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 5), arrivalAt: at(start, 7) }));
      const moved = await trips.update(
        authzA,
        trip.id,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 2), arrivalAt: at(start, 5) }),
      );
      expect(moved.departureAt).toBe(at(start, 2));
      const overlap = await rejectionOf(
        trips.update(authzA, trip.id, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 2), arrivalAt: at(start, 6) })),
      );
      expect(overlap.code).toBe("VEHICLE_SCHEDULE_CONFLICT");
      await setTripStatus(trip.id, "OPEN_FOR_SALE");
      const locked = await rejectionOf(
        trips.update(authzA, trip.id, tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 2), arrivalAt: at(start, 4) })),
      );
      expect(locked.code).toBe("TRIP_NOT_EDITABLE");
      expect((await trips.get(authzA, trip.id)).arrivalAt).toBe(at(start, 5));
    });
  });

  describe("UC-12 A3 — sơ đồ ghế đang được chuyến dùng", () => {
    it("chặn PUT sơ đồ và đổi sơ đồ của xe khi có chuyến chưa kết thúc; chuyến huỷ thì mở khoá", async () => {
      const { vehicle, map } = await vehicleWithSeats(authzA, 2);
      const { map: otherMap } = await vehicleWithSeats(authzA, 2);
      const start = nextDay();
      const trip = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 1), arrivalAt: at(start, 3) }),
      );
      const layout = SeatMapInputSchema.parse({
        name: map.name,
        layout: map.layout,
        seats: [{ code: "B1", deck: 1, row: 1, column: 1, type: "BED" }],
      });
      expect((await rejectionOf(seatMaps.update(authzA, map.id, layout))).code).toBe("SEAT_MAP_IN_USE");
      const vehicleInput = (seatMapId: string, description: string | null = null) =>
        VehicleInputSchema.parse({
          plateNumber: vehicle.plateNumber,
          vehicleTypeId: vehicleType,
          seatMapId,
          amenityIds: [],
          status: "ACTIVE",
          description,
        });
      expect((await rejectionOf(vehicles.update(authzA, vehicle.id, vehicleInput(otherMap.id)))).code).toBe("SEAT_MAP_IN_USE");
      // Sửa trường khác của xe vẫn được.
      expect((await vehicles.update(authzA, vehicle.id, vehicleInput(map.id, "Xe mới sơn"))).description).toBe("Xe mới sơn");
      // Ghế của chuyến là bản chụp — không đổi.
      expect((await trips.get(authzA, trip.id)).seats.map((seat) => seat.code)).toEqual(["A1", "A2"]);
      await setTripStatus(trip.id, "CANCELLED");
      expect((await seatMaps.update(authzA, map.id, layout)).seatCount).toBe(1);
      expect((await vehicles.update(authzA, vehicle.id, vehicleInput(otherMap.id))).seatMapId).toBe(otherMap.id);
    });
  });

  describe("List", () => {
    it("sắp theo giờ đi; cursor không lặp/sót kể cả trùng giờ đi; lọc route/xe/trạng thái/khoảng giờ", async () => {
      const { vehicle } = await vehicleWithSeats(authzA);
      const start = nextDay();
      const created: string[] = [];
      for (const hour of [5, 1, 3, 3, 3]) {
        const trip = await trips.create(authzA, tripInput({ routeId: route2, departureAt: at(start, hour), arrivalAt: at(start, hour + 1) }));
        created.push(trip.id);
      }
      const withVehicle = await trips.create(
        authzA,
        tripInput({ routeId: route3, vehicleId: vehicle.id, departureAt: at(start, 2), arrivalAt: at(start, 4) }),
      );
      const window = { departureFrom: new Date(start), departureTo: new Date(start + 24 * HOUR) };
      const seen: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await trips.list(authzA, { ...window, limit: 2, cursor });
        seen.push(...page.items.map((trip) => trip.id));
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
      expect(new Set(seen).size).toBe(seen.length);
      expect(seen.sort()).toEqual([...created, withVehicle.id].sort());
      const ordered = (await trips.list(authzA, { ...window, limit: 100 })).items;
      const departures = ordered.map((trip) => trip.departureAt);
      expect(departures).toEqual([...departures].sort());
      expect((await trips.list(authzA, { ...window, routeId: route3, limit: 100 })).items.map((trip) => trip.id)).toEqual([
        withVehicle.id,
      ]);
      const byVehicle = (await trips.list(authzA, { ...window, vehicleId: vehicle.id, limit: 100 })).items;
      expect(byVehicle.map((trip) => [trip.id, trip.seatCount, trip.vehiclePlateNumber])).toEqual([
        [withVehicle.id, 4, vehicle.plateNumber],
      ]);
      await setTripStatus(created[0]!, "CANCELLED");
      expect((await trips.list(authzA, { ...window, status: "CANCELLED", limit: 100 })).items.map((trip) => trip.id)).toEqual([
        created[0],
      ]);
      expect((await trips.list(authzA, { ...window, cursor: randomUUID(), limit: 100 })).items).toEqual([]);
    });
  });
});
