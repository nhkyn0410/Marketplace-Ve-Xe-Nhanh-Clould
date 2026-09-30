import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AuditWriteError, type AuditService } from "../audit/audit.service";
import { connectAuditForTest } from "../audit/audit.testing";
import { parseAppConfig } from "../config/env.config";
import { tenantScope } from "../database/db-scope";
import { PrismaService } from "../database/prisma.service";
import type { Coordinates, RouteLeg, RoutingProvider } from "../external/routing/routing-provider";
import type { Authorization } from "../iam/role/authorization";
import { RouteInputSchema } from "../route/dto/route.dto";
import { RouteService } from "../route/route.service";
import { TripInputSchema } from "../trip/dto/trip.dto";
import { TripService } from "../trip/trip.service";
import { SeatMapInputSchema } from "../vehicle/dto/seat-map.dto";
import { VehicleInputSchema } from "../vehicle/dto/vehicle.dto";
import { SeatMapService } from "../vehicle/seat-map.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { FareCreateInputSchema, FareUpdateInputSchema } from "./dto/fare.dto";
import { FareService } from "./fare.service";

/**
 * TASK-TRN-005 — Postgres THẬT bằng role APP (RLS có hiệu lực) + Mongo THẬT (lịch sử giá = `audit_event`).
 * Test money bắt buộc: giá `BIGINT` qua DB, rule nào thắng khi tính giá ghế của chuyến.
 */
const url = process.env.DATABASE_URL;
const mongoUrl = process.env.MONGODB_AUDIT_URI;
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
    return points.slice(1).map(() => ({ distanceMeters: 1000, durationSeconds: 60 }));
  }
}

describe.skipIf(!(url && mongoUrl) && !requireDb)("Fare — Postgres + Mongo thật, role app", () => {
  let prisma: PrismaService;
  let audit: AuditService;
  let closeAudit: () => Promise<void>;
  let fares: FareService;
  let trips: TripService;
  let routes: RouteService;
  let seatMaps: SeatMapService;
  let vehicles: VehicleService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const province = randomUUID();
  const ward = randomUUID();
  const points = [randomUUID(), randomUUID()];
  const typeSleeper = randomUUID();
  const typeLimo = randomUUID();
  const typeInactive = randomUUID();
  const authzA = authz(tenantA);
  const authzB = authz(tenantB);
  const actor = { sub: randomUUID(), role: "OPERATOR_OWNER" };
  let routeSeq = 0;
  let plateSeq = 0;
  let day = 0;
  const nextDay = () => Date.UTC(2031, 5, 1) + day++ * 24 * HOUR;
  const at = (start: number, hours: number) => new Date(start + hours * HOUR).toISOString();

  function authz(operatorId: string): Authorization {
    return { permission: "trip:manage", scope: "tenant", db: tenantScope(operatorId) };
  }

  const rule = (overrides: Record<string, unknown> = {}) => ({
    vehicleTypeId: null,
    seatType: null,
    validFrom: null,
    validTo: null,
    price: 300_000,
    ...overrides,
  });
  const createInput = (routeId: string, rules: object[], overrides: Record<string, unknown> = {}) =>
    FareCreateInputSchema.parse({ routeId, status: "ACTIVE", note: null, rules, ...overrides });
  const updateInput = (rules: object[], overrides: Record<string, unknown> = {}) =>
    FareUpdateInputSchema.parse({ status: "ACTIVE", note: null, rules, ...overrides });

  async function newRoute(auth: Authorization, status = "ACTIVE") {
    const stops = points.map((id) => ({ catalogStopPointId: id, stopPointId: null, note: null }));
    return (await routes.create(auth, RouteInputSchema.parse({ name: `R${routeSeq++} ${tag}`, status, note: null, stops }))).id;
  }

  /** Xe loại `vehicleTypeId` với sơ đồ: A1 ghế ngồi, A2 giường. */
  async function vehicleOfType(vehicleTypeId: string) {
    const map = await seatMaps.create(
      authzA,
      SeatMapInputSchema.parse({
        name: `Sơ đồ ${tag} ${plateSeq}`,
        layout: { decks: [{ deck: 1, rows: 2, columns: 2 }] },
        seats: [
          { code: "A1", deck: 1, row: 1, column: 1, type: "SEAT" },
          { code: "A2", deck: 1, row: 1, column: 2, type: "BED" },
        ],
      }),
    );
    return vehicles.create(
      authzA,
      VehicleInputSchema.parse({
        plateNumber: `51F${String(10000 + plateSeq++)}`,
        vehicleTypeId,
        seatMapId: map.id,
        amenityIds: [],
        status: "ACTIVE",
        description: null,
      }),
    );
  }

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    ({ audit, close: closeAudit } = await connectAuditForTest(mongoUrl!));
    fares = new FareService(prisma, audit);
    trips = new TripService(prisma);
    routes = new RouteService(prisma, new FakeRouting());
    seatMaps = new SeatMapService(prisma);
    vehicles = new VehicleService(prisma);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (TRN-005-guide.md §0).");
    }
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `fare-a-${tag}`, displayName: "Fare A" },
          { id: tenantB, operatorSlug: `fare-b-${tag}`, displayName: "Fare B" },
        ],
      });
      await tx.province.create({ data: { id: province, code: `fp-${tag}`, name: "Tỉnh fare" } });
      await tx.ward.create({ data: { id: ward, provinceId: province, code: `fw-${tag}`, name: "Phường fare" } });
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
      await tx.vehicleType.createMany({
        data: [
          { id: typeSleeper, code: `FS-${tag}`, name: "Giường nằm" },
          { id: typeLimo, code: `FL-${tag}`, name: "Limousine" },
          { id: typeInactive, code: `FI-${tag}`, name: "Ngừng", status: "INACTIVE" },
        ],
      });
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
      await tx.vehicle.deleteMany({ where: { operatorId } });
      await tx.seat.deleteMany({ where: { operatorId } });
      await tx.seatMap.deleteMany({ where: { operatorId } });
      await tx.stopPointCatalog.deleteMany({ where: { provinceId: province } });
      await tx.ward.deleteMany({ where: { provinceId: province } });
      await tx.province.deleteMany({ where: { id: province } });
      await tx.vehicleType.deleteMany({ where: { id: { in: [typeSleeper, typeLimo, typeInactive] } } });
      await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
    });
    await prisma.$disconnect();
    await closeAudit?.();
  });

  describe("RLS và ràng buộc DB", () => {
    it("2 bảng ENABLE + FORCE RLS với tenant_isolation; có 2 EXCLUDE chống trùng rule; rlsProblems() rỗng", async () => {
      const rows = await prisma.$queryRaw<{ relname: string }[]>`
        SELECT c.relname FROM pg_class c JOIN pg_policies p ON p.tablename = c.relname
        WHERE c.relname IN ('fares','fare_rules')
          AND c.relrowsecurity AND c.relforcerowsecurity AND p.policyname = 'tenant_isolation'
          AND p.cmd = 'ALL' AND p.qual LIKE '%app_rls_allows%' AND p.with_check LIKE '%app_rls_allows%'`;
      expect(rows.map((row) => row.relname).sort()).toEqual(["fare_rules", "fares"]);
      const exclusions = await prisma.$queryRaw<{ conname: string }[]>`
        SELECT conname FROM pg_constraint WHERE conrelid = 'fare_rules'::regclass AND contype = 'x' ORDER BY conname`;
      expect(exclusions.map((row) => row.conname)).toEqual(["fare_rules_base_unique", "fare_rules_window_no_overlap"]);
      expect(await prisma.rlsProblems()).toEqual([]);
    });

    it("query CỐ Ý quên lọc operator_id: tenant B không đọc/sửa/xoá bảng giá, rule của A", async () => {
      const fare = await fares.create(actor, authzA, createInput(await newRoute(authzA), [rule()]));
      await prisma.withTenant(tenantB, async (tx) => {
        expect(await tx.fare.findMany({ where: { id: fare.id } })).toEqual([]);
        expect(await tx.fareRule.findMany({ where: { fareId: fare.id } })).toEqual([]);
        expect((await tx.fareRule.updateMany({ where: { fareId: fare.id }, data: { price: 1n } })).count).toBe(0);
        expect((await tx.fareRule.deleteMany({ where: { fareId: fare.id } })).count).toBe(0);
      });
      expect((await fares.get(authzA, fare.id)).rules[0]!.price).toBe(300_000);
    });

    it("ghi thẳng DB: giá âm / vượt trần, khung giờ thiếu một đầu, trùng giá thường, chồng khung giờ đều bị chặn; khung giờ nối tiếp được", async () => {
      const fare = await fares.create(actor, authzA, createInput(await newRoute(authzA), []));
      const insert = (data: Record<string, unknown>) =>
        rejectionOf(
          prisma.withTenant(tenantA, (tx) =>
            tx.fareRule.create({ data: { operatorId: tenantA, fareId: fare.id, price: 100n, ...data } }),
          ),
        );
      const jan = (d: number) => new Date(Date.UTC(2031, 0, d));
      expect((await insert({ price: -1n })).text).toMatch(/fare_rules_price_non_negative/);
      expect((await insert({ price: 100_000_001n })).text).toMatch(/fare_rules_price_max/);
      expect((await insert({ seatType: "SEAT", price: 100_000_000n })).text).toBe(""); // đúng trần
      expect((await insert({ validFrom: jan(1) })).text).toMatch(/fare_rules_window_consistent/);
      expect((await insert({ validFrom: jan(5), validTo: jan(1) })).text).toMatch(/fare_rules_window_consistent/);
      expect((await insert({})).text).toBe("");
      expect((await insert({})).text).toMatch(/fare_rules_base_unique/); // "mọi loại" × "mọi loại" lần hai
      expect((await insert({ seatType: "BED" })).text).toBe("");
      expect((await insert({ validFrom: jan(1), validTo: jan(5) })).text).toBe("");
      expect((await insert({ validFrom: jan(4), validTo: jan(6) })).text).toMatch(/fare_rules_window_no_overlap/);
      expect((await insert({ validFrom: jan(5), validTo: jan(6) })).text).toBe(""); // nối tiếp [1,5) → [5,6)
      expect((await insert({ vehicleTypeId: typeLimo, validFrom: jan(2), validTo: jan(3) })).text).toBe(""); // phạm vi khác
    });

    it("FK ghép: DB từ chối bảng giá của A gắn tuyến của B, dù đi đường system", async () => {
      const routeB = await newRoute(authzB);
      const cross = await rejectionOf(
        prisma.withSystem((tx) => tx.fare.create({ data: { operatorId: tenantA, routeId: routeB } })),
      );
      expect(cross.text).toMatch(/fares_route_id_operator_id_fkey|Foreign key/i);
    });
  });

  describe("Tạo / sửa bảng giá", () => {
    it("tạo: rule sắp giá thường trước; giá BIGINT giữ đúng; tuyến B / tuyến ngừng dùng → 422; tuyến đã có bảng giá → 409", async () => {
      const route = await newRoute(authzA);
      const fare = await fares.create(
        actor,
        authzA,
        createInput(route, [
          rule({ vehicleTypeId: typeLimo, validFrom: "2031-01-20T00:00:00Z", validTo: "2031-01-27T00:00:00Z", price: 99_999_999 }),
          rule({ price: 250_000 }),
        ]),
      );
      expect(fare.rules.map((item) => [item.validFrom, item.price])).toEqual([
        [null, 250_000],
        ["2031-01-20T00:00:00.000Z", 99_999_999],
      ]);
      const [stored] = await prisma.withTenant(tenantA, (tx) =>
        tx.fareRule.findMany({ where: { fareId: fare.id, vehicleTypeId: typeLimo }, select: { price: true } }),
      );
      expect(stored!.price).toBe(99_999_999n);
      expect((await rejectionOf(fares.create(actor, authzA, createInput(route, [rule()])))).code).toBe("FARE_ROUTE_CONFLICT");
      expect((await rejectionOf(fares.create(actor, authzA, createInput(await newRoute(authzB), [rule()])))).code).toBe(
        "ROUTE_UNAVAILABLE",
      );
      expect((await rejectionOf(fares.create(actor, authzA, createInput(await newRoute(authzA, "INACTIVE"), [rule()])))).code).toBe(
        "ROUTE_UNAVAILABLE",
      );
    });

    it("hai request tạo bảng giá cho cùng tuyến đồng thời → đúng một thành công", async () => {
      const route = await newRoute(authzA);
      const results = await Promise.allSettled([
        fares.create(actor, authzA, createInput(route, [rule({ price: 1 })])),
        fares.create(actor, authzA, createInput(route, [rule({ price: 2 })])),
      ]);
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find((result) => result.status === "rejected") as PromiseRejectedResult;
      expect((await rejectionOf(Promise.reject(rejected.reason))).code).toBe("FARE_ROUTE_CONFLICT");
    });

    it("rule trùng phạm vi trong body → 400 FARE_RULES_OVERLAP, không ghi gì", async () => {
      const route = await newRoute(authzA);
      const tet = { validFrom: "2031-01-20T00:00:00Z", validTo: "2031-01-27T00:00:00Z" };
      for (const rules of [
        [rule(), rule({ price: 1 })],
        [rule(tet), rule({ validFrom: "2031-01-26T00:00:00Z", validTo: "2031-01-28T00:00:00Z" })],
        [rule({ vehicleTypeId: typeLimo, seatType: "BED" }), rule({ vehicleTypeId: typeLimo, seatType: "BED", price: 9 })],
      ]) {
        const result = await rejectionOf(fares.create(actor, authzA, createInput(route, rules)));
        expect(result.code).toBe("FARE_RULES_OVERLAP");
        expect(result.status).toBe(400);
      }
      expect((await fares.list(authzA, { routeId: route, limit: 10 })).items).toEqual([]);
      // Khác phạm vi hoặc nối tiếp thì hợp lệ.
      await fares.create(
        actor,
        authzA,
        createInput(route, [rule(), rule({ seatType: "BED" }), rule(tet), rule({ validFrom: tet.validTo, validTo: "2031-02-01T00:00:00Z" })]),
      );
    });

    it("loại xe MỚI phải ACTIVE; loại xe ĐANG có trong bảng giá được giữ dù đã ngừng dùng; B không sửa được", async () => {
      const route = await newRoute(authzA);
      expect((await rejectionOf(fares.create(actor, authzA, createInput(route, [rule({ vehicleTypeId: typeInactive })])))).code).toBe(
        "CATALOG_ITEM_UNAVAILABLE",
      );
      const fare = await fares.create(actor, authzA, createInput(route, [rule({ vehicleTypeId: typeSleeper })]));
      await prisma.withSystem((tx) => tx.vehicleType.update({ where: { id: typeSleeper }, data: { status: "INACTIVE" } }));
      try {
        const kept = await fares.update(actor, authzA, fare.id, updateInput([rule({ vehicleTypeId: typeSleeper, price: 310_000 })]));
        expect(kept.rules[0]!.price).toBe(310_000);
      } finally {
        await prisma.withSystem((tx) => tx.vehicleType.update({ where: { id: typeSleeper }, data: { status: "ACTIVE" } }));
      }
      expect((await rejectionOf(fares.update(actor, authzA, fare.id, updateInput([rule({ vehicleTypeId: typeInactive })])))).code).toBe(
        "CATALOG_ITEM_UNAVAILABLE",
      );
      expect((await rejectionOf(fares.update(actor, authzB, fare.id, updateInput([rule()])))).code).toBe("FARE_NOT_FOUND");
      expect((await rejectionOf(fares.get(authzB, fare.id))).code).toBe("FARE_NOT_FOUND");
    });
  });

  describe("Lịch sử giá (BR-40) = audit Mongo", () => {
    it("mỗi lần tạo/sửa đúng một bản ghi; mới nhất trước; before = after của lần trước; phân trang; B không đọc được", async () => {
      const record = vi.spyOn(audit, "recordAuditEvent");
      const fare = await fares.create(actor, authzA, createInput(await newRoute(authzA), [rule({ price: 100_000 })]));
      // Ghi trong transaction PHẢI có giới hạn thời gian (Mongo chậm → 503, không giữ kết nối pool / khoá dòng).
      expect(record).toHaveBeenCalledWith(expect.objectContaining({ action: "fare.create" }), {
        timeoutMs: 2_000,
        deadline: expect.any(Number),
      });
      record.mockRestore();
      await fares.update(actor, authzA, fare.id, updateInput([rule({ price: 200_000 })]));
      await fares.update(actor, authzA, fare.id, updateInput([rule({ price: 300_000 })], { status: "INACTIVE" }));
      const all = await fares.revisions(authzA, fare.id, { limit: 10 });
      expect(all.items.map((item) => [item.action, item.after.rules[0]!.price, item.after.status])).toEqual([
        ["fare.update", 300_000, "INACTIVE"],
        ["fare.update", 200_000, "ACTIVE"],
        ["fare.create", 100_000, "ACTIVE"],
      ]);
      expect(all.items[0]!.before).toEqual(all.items[1]!.after);
      expect(all.items[2]!.before).toBeNull();
      expect(all.items.every((item) => item.actorId === actor.sub)).toBe(true);
      expect(all.nextCursor).toBeNull();
      const page1 = await fares.revisions(authzA, fare.id, { limit: 2 });
      const page2 = await fares.revisions(authzA, fare.id, { limit: 2, cursor: new Date(page1.nextCursor!) });
      expect([...page1.items, ...page2.items].map((item) => item.after.rules[0]!.price)).toEqual([300_000, 200_000, 100_000]);
      expect(page2.nextCursor).toBeNull();
      expect((await fares.revisions(authzA, fare.id, { limit: 3 })).nextCursor).toBeNull(); // trang vừa đủ: không còn trang rỗng
      expect((await rejectionOf(fares.revisions(authzB, fare.id, { limit: 10 })))).toMatchObject({ code: "FARE_NOT_FOUND" });
    });

    it("PUT không đổi gì (kể cả đảo thứ tự rule) → không ghi DB, không thêm dòng lịch sử", async () => {
      const rules = [rule({ price: 100_000 }), rule({ seatType: "BED", price: 150_000 })];
      const fare = await fares.create(actor, authzA, createInput(await newRoute(authzA), rules));
      const same = await fares.update(actor, authzA, fare.id, updateInput([...rules].reverse()));
      expect(same.updatedAt).toBe(fare.updatedAt);
      expect((await fares.revisions(authzA, fare.id, { limit: 10 })).items).toHaveLength(1);
      await fares.update(actor, authzA, fare.id, updateInput(rules, { note: "Đổi ghi chú" }));
      expect((await fares.revisions(authzA, fare.id, { limit: 10 })).items).toHaveLength(2);
    });

    it("ghi lịch sử lỗi (Mongo) → 503, không đổi giá, không tạo bảng giá", async () => {
      const route = await newRoute(authzA);
      const fare = await fares.create(actor, authzA, createInput(route, [rule({ price: 100_000 })]));
      const broken = {
        recordAuditEvent: async () => {
          throw new AuditWriteError(new Error("Mongo down"));
        },
      } as unknown as AuditService;
      const failing = new FareService(prisma, broken);
      expect(await rejectionOf(failing.update(actor, authzA, fare.id, updateInput([rule({ price: 999 })])))).toMatchObject({
        status: 503,
        code: "SERVICE_UNAVAILABLE",
      });
      expect((await fares.get(authzA, fare.id)).rules[0]!.price).toBe(100_000);
      const otherRoute = await newRoute(authzA);
      expect(await rejectionOf(failing.create(actor, authzA, createInput(otherRoute, [rule()])))).toMatchObject({ status: 503 });
      expect((await fares.list(authzA, { routeId: otherRoute, limit: 10 })).items).toEqual([]);
    });

    it(
      "ghi lịch sử chậm hơn hạn transaction (5s) → 503 thay vì 500, không đổi giá, khoá dòng được nhả",
      async () => {
        // Audit thật bị driver giới hạn 2s; bản giả chậm 6s mô phỏng trường hợp giới hạn đó không có tác dụng.
        const fare = await fares.create(actor, authzA, createInput(await newRoute(authzA), [rule({ price: 100_000 })]));
        const slow = {
          recordAuditEvent: () => new Promise<void>((resolve) => setTimeout(resolve, 6_000)),
        } as unknown as AuditService;
        expect(
          await rejectionOf(new FareService(prisma, slow).update(actor, authzA, fare.id, updateInput([rule({ price: 999 })]))),
        ).toMatchObject({ status: 503, code: "SERVICE_UNAVAILABLE" });
        expect((await fares.get(authzA, fare.id)).rules[0]!.price).toBe(100_000);
        // Khoá dòng đã nhả: lần sửa kế tiếp (audit thật) chạy được.
        await fares.update(actor, authzA, fare.id, updateInput([rule({ price: 200_000 })]));
        expect((await fares.get(authzA, fare.id)).rules[0]!.price).toBe(200_000);
      },
      20_000,
    );
  });

  describe("Giá ghế của chuyến (Q1 = PA1)", () => {
    it("theo tuyến × loại xe đang gắn × loại chỗ × giờ khởi hành; đổi xe thường → VIP thì đổi giá; INACTIVE / không xe → null", async () => {
      const route = await newRoute(authzA);
      const fare = await fares.create(
        actor,
        authzA,
        createInput(route, [
          rule({ vehicleTypeId: typeSleeper, price: 300_000 }),
          rule({ vehicleTypeId: typeSleeper, seatType: "BED", price: 320_000 }),
          rule({ vehicleTypeId: typeLimo, price: 450_000 }),
          rule({ validFrom: "2032-01-20T00:00:00Z", validTo: "2032-01-27T00:00:00Z", price: 600_000 }),
        ]),
      );
      const sleeper = await vehicleOfType(typeSleeper);
      const limo = await vehicleOfType(typeLimo);
      const start = nextDay();
      const base = { routeId: route, departureAt: at(start, 1), arrivalAt: at(start, 5), stopTimes: null, note: null };
      const trip = await trips.create(authzA, TripInputSchema.parse({ ...base, vehicleId: sleeper.id }));
      const prices = (seats: { code: string; price: number | null }[]) => seats.map((seat) => [seat.code, seat.price]);
      expect(prices(trip.seats)).toEqual([
        ["A1", 300_000],
        ["A2", 320_000],
      ]);
      const vip = await trips.update(authzA, trip.id, TripInputSchema.parse({ ...base, vehicleId: limo.id }));
      expect(prices(vip.seats)).toEqual([
        ["A1", 450_000],
        ["A2", 450_000],
      ]);
      const tetStart = Date.UTC(2032, 0, 22);
      const tet = await trips.create(
        authzA,
        TripInputSchema.parse({ ...base, vehicleId: sleeper.id, departureAt: at(tetStart, 1), arrivalAt: at(tetStart, 5) }),
      );
      expect(prices(tet.seats)).toEqual([
        ["A1", 600_000],
        ["A2", 600_000],
      ]);
      await fares.update(actor, authzA, fare.id, updateInput([rule({ vehicleTypeId: typeSleeper, price: 300_000 })], { status: "INACTIVE" }));
      expect(prices((await trips.get(authzA, trip.id)).seats)).toEqual([
        ["A1", null],
        ["A2", null],
      ]);
    });

    it("tuyến chưa có bảng giá hoặc không có rule cho loại xe → null (TRN-006 chặn mở bán)", async () => {
      const route = await newRoute(authzA);
      const limo = await vehicleOfType(typeLimo);
      const start = nextDay();
      const input = TripInputSchema.parse({
        routeId: route,
        vehicleId: limo.id,
        departureAt: at(start, 1),
        arrivalAt: at(start, 5),
        stopTimes: null,
        note: null,
      });
      const trip = await trips.create(authzA, input);
      expect(trip.seats.every((seat) => seat.price === null)).toBe(true);
      await fares.create(actor, authzA, createInput(route, [rule({ vehicleTypeId: typeSleeper, price: 300_000 })]));
      expect((await trips.get(authzA, trip.id)).seats.every((seat) => seat.price === null)).toBe(true);
    });
  });
});
