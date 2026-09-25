import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseAppConfig } from "../config/env.config";
import { tenantScope } from "../database/db-scope";
import { PrismaService } from "../database/prisma.service";
import type { Authorization } from "../iam/role/authorization";
import { type SeatMapInput, SeatMapInputSchema } from "./dto/seat-map.dto";
import { type VehicleInput, VehicleInputSchema } from "./dto/vehicle.dto";
import { SeatMapService } from "./seat-map.service";
import { VehicleService } from "./vehicle.service";

/**
 * TASK-TRN-001 — test bắt buộc tenant-RLS (ADR-025) trên Postgres THẬT bằng role APP. Nhiều query dưới
 * đây CỐ Ý không lọc `operator_id` để chứng minh RLS chặn cả khi code quên.
 */
const url = process.env.DATABASE_URL;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

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

describe.skipIf(!url && !requireDb)("Vehicle / SeatMap — Postgres thật, role app", () => {
  let prisma: PrismaService;
  let vehicles: VehicleService;
  let seatMaps: SeatMapService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const typeActive = randomUUID();
  const typeOther = randomUUID();
  const typeInactive = randomUUID();
  const amenityActive = randomUUID();
  const amenityInactive = randomUUID();
  const amenitySecond = randomUUID();
  const authzA = authz(tenantA);
  const authzB = authz(tenantB);

  function authz(operatorId: string): Authorization {
    return { permission: "vehicle:manage", scope: "tenant", db: tenantScope(operatorId) };
  }

  function seatMapInput(name: string, seats = 2): SeatMapInput {
    return SeatMapInputSchema.parse({
      name,
      layout: { decks: [{ deck: 1, rows: 5, columns: 2 }] },
      seats: Array.from({ length: seats }, (_, index) => ({
        code: `A${index + 1}`,
        deck: 1,
        row: Math.floor(index / 2) + 1,
        column: (index % 2) + 1,
        type: "SEAT",
      })),
    });
  }

  function vehicleInput(overrides: Record<string, unknown> = {}): VehicleInput {
    return VehicleInputSchema.parse({
      plateNumber: "51B-123.45",
      vehicleTypeId: typeActive,
      seatMapId: null,
      amenityIds: [],
      status: "ACTIVE",
      description: null,
      ...overrides,
    });
  }

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    vehicles = new VehicleService(prisma);
    seatMaps = new SeatMapService(prisma);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (TRN-001-guide.md §0).");
    }
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `veh-a-${tag}`, displayName: "Veh A" },
          { id: tenantB, operatorSlug: `veh-b-${tag}`, displayName: "Veh B" },
        ],
      });
      await tx.vehicleType.createMany({
        data: [
          { id: typeActive, code: `T1-${tag}`, name: "Ghế" },
          { id: typeOther, code: `T2-${tag}`, name: "Giường" },
          { id: typeInactive, code: `T3-${tag}`, name: "Ngừng", status: "INACTIVE" },
        ],
      });
      await tx.amenity.createMany({
        data: [
          { id: amenityActive, code: `A1-${tag}`, name: "Wi-Fi" },
          { id: amenityInactive, code: `A2-${tag}`, name: "Ngừng", status: "INACTIVE" },
          { id: amenitySecond, code: `A3-${tag}`, name: "Nước" },
        ],
      });
    });
  }, 30_000);

  afterAll(async () => {
    if (!prisma) {
      return;
    }
    await prisma.withSystem(async (tx) => {
      const operatorId = { in: [tenantA, tenantB] };
      await tx.vehicleAmenity.deleteMany({ where: { operatorId } });
      await tx.vehicle.deleteMany({ where: { operatorId } });
      await tx.seat.deleteMany({ where: { operatorId } });
      await tx.seatMap.deleteMany({ where: { operatorId } });
      await tx.vehicleType.deleteMany({ where: { id: { in: [typeActive, typeOther, typeInactive] } } });
      await tx.amenity.deleteMany({ where: { id: { in: [amenityActive, amenityInactive, amenitySecond] } } });
      await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
    });
    await prisma.$disconnect();
  });

  describe("RLS", () => {
    it("4 bảng ENABLE + FORCE RLS với policy tenant_isolation; rlsProblems() rỗng", async () => {
      const rows = await prisma.$queryRaw<{ relname: string }[]>`
        SELECT c.relname FROM pg_class c JOIN pg_policies p ON p.tablename = c.relname
        WHERE c.relname IN ('vehicles','seat_maps','seats','vehicle_amenities')
          AND c.relrowsecurity AND c.relforcerowsecurity AND p.policyname = 'tenant_isolation'
          AND p.cmd = 'ALL' AND p.qual LIKE '%app_rls_allows%' AND p.with_check LIKE '%app_rls_allows%'`;
      expect(rows.map((row) => row.relname).sort()).toEqual(["seat_maps", "seats", "vehicle_amenities", "vehicles"]);
      expect(await prisma.rlsProblems()).toEqual([]);
    });

    it("query CỐ Ý quên lọc operator_id vẫn chỉ thấy/ghi được tenant của mình; không ngữ cảnh → 0 dòng", async () => {
      const mapA = await seatMaps.create(authzA, seatMapInput(`RLS ${tag}`));
      const vehicleA = await vehicles.create(
        authzA,
        vehicleInput({ plateNumber: "30A-00001", seatMapId: mapA.id, amenityIds: [amenityActive] }),
      );

      await prisma.withTenant(tenantB, async (tx) => {
        expect(await tx.vehicle.findMany({ where: { id: vehicleA.id } })).toEqual([]);
        expect(await tx.seat.findMany({ where: { seatMapId: mapA.id } })).toEqual([]);
        expect(await tx.vehicleAmenity.findMany({ where: { vehicleId: vehicleA.id } })).toEqual([]);
        expect((await tx.vehicleAmenity.deleteMany({ where: { vehicleId: vehicleA.id } })).count).toBe(0);
        expect((await tx.vehicle.updateMany({ where: { id: vehicleA.id }, data: { description: "hack" } })).count).toBe(0);
        expect((await tx.seat.deleteMany({ where: { seatMapId: mapA.id } })).count).toBe(0);
      });
      const denied = await rejectionOf(
        prisma.withTenant(tenantB, (tx) =>
          tx.vehicle.create({ data: { operatorId: tenantA, plateNumber: "30A99999", vehicleTypeId: typeActive } }),
        ),
      );
      expect(denied.text).toMatch(/row-level security|42501/);
      expect(await prisma.vehicle.findMany({ where: { id: vehicleA.id } })).toEqual([]);
      expect(await vehicles.get(authzA, vehicleA.id)).toMatchObject({ description: null, amenityIds: [amenityActive] });
    });
  });

  describe("Invariant DB (chạy scope system để chứng minh DB tự chặn, không nhờ service)", () => {
    it("FK ghép chặn xe tenant A gắn SeatMap của tenant B", async () => {
      const mapB = await seatMaps.create(authzB, seatMapInput(`FK ${tag}`));
      const failure = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.vehicle.create({
            data: { operatorId: tenantA, plateNumber: "30A00002", vehicleTypeId: typeActive, seatMapId: mapB.id },
          }),
        ),
      );
      expect(failure.text).toMatch(/vehicles_seat_map_id_operator_id_fkey|23503|Foreign key/i);
    });

    it("FK ghép chặn ghế tenant A trong SeatMap của B, và tiện ích tenant A gắn cho xe của B", async () => {
      const mapB = await seatMaps.create(authzB, seatMapInput(`FK2 ${tag}`));
      const vehicleB = await vehicles.create(authzB, vehicleInput({ plateNumber: "30B-00003" }));
      const seat = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.seat.create({
            data: { operatorId: tenantA, seatMapId: mapB.id, code: "X1", deck: 1, row: 5, column: 2, type: "SEAT" },
          }),
        ),
      );
      expect(seat.text).toMatch(/seats_seat_map_id_operator_id_fkey|23503|Foreign key/i);
      const amenity = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.vehicleAmenity.create({ data: { operatorId: tenantA, vehicleId: vehicleB.id, amenityId: amenityActive } }),
        ),
      );
      expect(amenity.text).toMatch(/vehicle_amenities_vehicle_id_operator_id_fkey|23503|Foreign key/i);
    });

    it("ghế trùng vị trí bị unique chặn; CHECK vị trí ≥ 1", async () => {
      const map = await seatMaps.create(authzA, seatMapInput(`INV ${tag}`, 1));
      const duplicate = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.seat.create({
            data: { operatorId: tenantA, seatMapId: map.id, code: "Z9", deck: 1, row: 1, column: 1, type: "SEAT" },
          }),
        ),
      );
      expect(duplicate.text).toMatch(/Unique constraint|P2002|23505/);
      const negative = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.seat.create({
            data: { operatorId: tenantA, seatMapId: map.id, code: "Z8", deck: 0, row: 1, column: 2, type: "SEAT" },
          }),
        ),
      );
      expect(negative.text).toMatch(/seats_position_positive|23514/);
    });

    it("CHECK biển số dạng chuẩn hoá: đường ghi bỏ qua service cũng không lưu được `51b-123.45`", async () => {
      const failure = await rejectionOf(
        prisma.withSystem((tx) =>
          tx.vehicle.create({ data: { operatorId: tenantA, plateNumber: "51b-123.45", vehicleTypeId: typeActive } }),
        ),
      );
      expect(failure.text).toMatch(/vehicles_plate_number_normalized|23514/);
    });
  });

  describe("SeatMapService", () => {
    it("tạo → seatCount = số ghế, ghế sắp theo tầng/hàng/cột; tenant khác → 404", async () => {
      const created = await seatMaps.create(authzA, seatMapInput(`Mẫu ${tag}`, 3));
      expect(created.seatCount).toBe(3);
      expect(created.seats.map((seat) => seat.code)).toEqual(["A1", "A2", "A3"]);
      expect((await rejectionOf(seatMaps.get(authzB, created.id))).code).toBe("SEAT_MAP_NOT_FOUND");
      expect((await seatMaps.list(authzB, { limit: 100 })).items.map((item) => item.id)).not.toContain(created.id);
    });

    it("trùng tên trong tenant → 409; tenant khác được trùng tên", async () => {
      await seatMaps.create(authzA, seatMapInput(`Trùng ${tag}`));
      expect((await rejectionOf(seatMaps.create(authzA, seatMapInput(`Trùng ${tag}`)))).code).toBe(
        "SEAT_MAP_NAME_CONFLICT",
      );
      expect((await seatMaps.create(authzB, seatMapInput(`Trùng ${tag}`))).name).toBe(`Trùng ${tag}`);
    });

    it("PUT thay ghế nguyên tử: lỗi giữa chừng giữ nguyên ghế cũ; tenant khác PUT → 404", async () => {
      const original = await seatMaps.create(authzA, seatMapInput(`PUT ${tag}`, 2));
      await seatMaps.create(authzA, seatMapInput(`Khác ${tag}`, 1));

      const conflict = await rejectionOf(seatMaps.update(authzA, original.id, seatMapInput(`Khác ${tag}`, 4)));
      expect(conflict.code).toBe("SEAT_MAP_NAME_CONFLICT");
      const unchanged = await seatMaps.get(authzA, original.id);
      expect(unchanged.seatCount).toBe(2);
      expect(unchanged.seats).toHaveLength(2);

      const replaced = await seatMaps.update(authzA, original.id, seatMapInput(`PUT ${tag}`, 4));
      expect(replaced.seatCount).toBe(4);
      expect(replaced.seats.map((seat) => seat.code)).toEqual(["A1", "A2", "A3", "A4"]);
      expect((await rejectionOf(seatMaps.update(authzB, original.id, seatMapInput("x")))).code).toBe(
        "SEAT_MAP_NOT_FOUND",
      );
      expect((await seatMaps.get(authzA, original.id)).seatCount).toBe(4);
    });

    it("bản sao tùy chỉnh (Q1): sửa mẫu gốc không đổi ghế của bản sao đang gắn cho xe khác", async () => {
      const template = await seatMaps.create(authzA, seatMapInput(`Gốc ${tag}`, 4));
      const copy = await seatMaps.create(authzA, { ...seatMapInput(`Sao ${tag}`, 4), seats: template.seats.slice(0, 3) });
      await vehicles.create(authzA, vehicleInput({ plateNumber: "30A-00010", seatMapId: template.id }));
      await vehicles.create(authzA, vehicleInput({ plateNumber: "30A-00011", seatMapId: copy.id }));

      await seatMaps.update(authzA, template.id, seatMapInput(`Gốc ${tag}`, 2));
      expect((await seatMaps.get(authzA, copy.id)).seatCount).toBe(3);
    });
  });

  describe("VehicleService", () => {
    it("tạo xe: biển số chuẩn hoá, tiện ích, SeatMap cùng tenant", async () => {
      const map = await seatMaps.create(authzA, seatMapInput(`Xe ${tag}`));
      const created = await vehicles.create(
        authzA,
        vehicleInput({ plateNumber: "51b 777.88", seatMapId: map.id, amenityIds: [amenityActive] }),
      );
      expect(created).toMatchObject({
        plateNumber: "51B77788",
        seatMapId: map.id,
        amenityIds: [amenityActive],
        status: "ACTIVE",
      });
      expect(await vehicles.get(authzA, created.id)).toEqual(created);
    });

    it("biển số trùng trong tenant (khác cách gõ) → 409; tenant khác được trùng", async () => {
      await vehicles.create(authzA, vehicleInput({ plateNumber: "29B-111.22" }));
      expect((await rejectionOf(vehicles.create(authzA, vehicleInput({ plateNumber: "29b11122" })))).code).toBe(
        "VEHICLE_PLATE_CONFLICT",
      );
      expect((await vehicles.create(authzB, vehicleInput({ plateNumber: "29B11122" }))).plateNumber).toBe("29B11122");
      const other = await vehicles.create(authzA, vehicleInput({ plateNumber: "29B-111.23" }));
      expect((await rejectionOf(vehicles.update(authzA, other.id, vehicleInput({ plateNumber: "29B 111.22" })))).code).toBe(
        "VEHICLE_PLATE_CONFLICT",
      );
    });

    it.each([
      ["loại xe INACTIVE", () => ({ vehicleTypeId: typeInactive }), "CATALOG_ITEM_UNAVAILABLE", 422],
      ["loại xe không tồn tại", () => ({ vehicleTypeId: randomUUID() }), "CATALOG_ITEM_UNAVAILABLE", 422],
      ["tiện ích INACTIVE", () => ({ amenityIds: [amenityInactive] }), "CATALOG_ITEM_UNAVAILABLE", 422],
      ["SeatMap không tồn tại", () => ({ seatMapId: randomUUID() }), "SEAT_MAP_NOT_FOUND", 404],
    ])("%s → %s", async (_case, overrides, code, status) => {
      const failure = await rejectionOf(vehicles.create(authzA, vehicleInput({ plateNumber: "30A-55555", ...overrides() })));
      expect(failure).toMatchObject({ code, status });
    });

    it("SeatMap của tenant khác → 404 (không lộ tồn tại); xe tenant khác → 404", async () => {
      const mapB = await seatMaps.create(authzB, seatMapInput(`Của B ${tag}`));
      expect((await rejectionOf(vehicles.create(authzA, vehicleInput({ plateNumber: "30A-66666", seatMapId: mapB.id })))).code).toBe(
        "SEAT_MAP_NOT_FOUND",
      );
      const vehicleB = await vehicles.create(authzB, vehicleInput({ plateNumber: "30B-66666" }));
      expect((await rejectionOf(vehicles.get(authzA, vehicleB.id))).code).toBe("VEHICLE_NOT_FOUND");
      expect((await rejectionOf(vehicles.update(authzA, vehicleB.id, vehicleInput({ plateNumber: "30B-66666" })))).code).toBe(
        "VEHICLE_NOT_FOUND",
      );
    });

    it("PUT: thay tiện ích/trạng thái; giữ được loại xe/tiện ích cũ đã INACTIVE, nhưng không chọn mới item INACTIVE", async () => {
      const created = await vehicles.create(
        authzA,
        vehicleInput({ plateNumber: "30A-77777", vehicleTypeId: typeOther, amenityIds: [amenityActive] }),
      );
      await prisma.withSystem(async (tx) => {
        await tx.vehicleType.update({ where: { id: typeOther }, data: { status: "INACTIVE" } });
        await tx.amenity.update({ where: { id: amenitySecond }, data: { status: "INACTIVE" } });
      });
      try {
        // Tiện ích amenitySecond được gán khi còn ACTIVE (sửa thẳng DB để dựng tình huống), rồi bị vô hiệu hoá.
        await prisma.withSystem((tx) =>
          tx.vehicleAmenity.create({ data: { vehicleId: created.id, amenityId: amenitySecond, operatorId: tenantA } }),
        );
        const kept = await vehicles.update(
          authzA,
          created.id,
          vehicleInput({
            plateNumber: "30A-77777",
            vehicleTypeId: typeOther,
            status: "MAINTENANCE",
            amenityIds: [amenitySecond],
          }),
        );
        expect(kept).toMatchObject({ vehicleTypeId: typeOther, status: "MAINTENANCE", amenityIds: [amenitySecond] });
        const switched = await rejectionOf(
          vehicles.update(authzA, created.id, vehicleInput({ plateNumber: "30A-77777", vehicleTypeId: typeInactive })),
        );
        expect(switched.code).toBe("CATALOG_ITEM_UNAVAILABLE");
      } finally {
        await prisma.withSystem(async (tx) => {
          await tx.vehicleType.update({ where: { id: typeOther }, data: { status: "ACTIVE" } });
          await tx.amenity.update({ where: { id: amenitySecond }, data: { status: "ACTIVE" } });
        });
      }
    });

    it("hai PUT đồng thời cùng xe: bản sau thắng trọn vẹn, không trộn hai danh sách tiện ích (A4)", async () => {
      const created = await vehicles.create(authzA, vehicleInput({ plateNumber: "30A-88888" }));
      const inputs = [
        vehicleInput({ plateNumber: "30A-88888", amenityIds: [amenityActive] }),
        vehicleInput({ plateNumber: "30A-88888", amenityIds: [amenitySecond] }),
      ];
      await Promise.all(inputs.map((input) => vehicles.update(authzA, created.id, input)));
      const finalIds = (await vehicles.get(authzA, created.id)).amenityIds;
      expect([[amenityActive], [amenitySecond]]).toContainEqual(finalIds);
    });

    it("list: lọc trạng thái, cursor đi hết không lặp/sót, chỉ xe của tenant", async () => {
      for (const plate of ["31A-10001", "31A-10002", "31A-10003"]) {
        await vehicles.create(authzB, vehicleInput({ plateNumber: plate, status: "INACTIVE" }));
      }
      const expected = (await prisma.withTenant(tenantB, (tx) =>
        tx.vehicle.findMany({ where: { operatorId: tenantB, status: "INACTIVE" }, select: { id: true }, orderBy: { id: "asc" } }),
      )).map((row) => row.id);
      const seen: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await vehicles.list(authzB, { status: "INACTIVE", cursor, limit: 2 });
        seen.push(...page.items.map((item) => item.id));
        expect(page.items.every((item) => item.status === "INACTIVE")).toBe(true);
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
      expect(seen).toEqual(expected);
      expect(expected).toHaveLength(3);
    });
  });
});
