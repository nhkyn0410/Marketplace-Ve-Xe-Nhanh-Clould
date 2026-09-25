import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseAppConfig } from "../config/env.config";
import { PrismaService } from "../database/prisma.service";
import { StopPointType } from "../database/prisma.types";
import { type CatalogSeedData, seedCatalog } from "./catalog-seed";
import { CatalogService } from "./catalog.service";

/**
 * TASK-CAT-001 — catalog trên Postgres THẬT bằng role APP (bắt buộc: RLS chỉ có hiệu lực với role
 * không superuser/BYPASSRLS/owner). Fixture dùng mã gắn `tag` để không đụng dữ liệu seed thật.
 */
const url = process.env.DATABASE_URL;
// CI job `db-integration` đặt REQUIRE_DB_TESTS=1: thiếu DB thì ĐỎ thay vì lặng lẽ bỏ qua.
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

async function rejectionText(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return "";
  } catch (error) {
    // Adapter pg có thể để message rỗng; SQLSTATE nằm trong cause/meta — gom hết lại để so.
    return JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error);
  }
}

describe.skipIf(!url && !requireDb)("Catalog — Postgres thật, role app", () => {
  let prisma: PrismaService;
  let catalog: CatalogService;
  const tag = randomUUID().slice(0, 8);
  const provinceA = randomUUID();
  const provinceB = randomUUID();
  const provinceInactive = randomUUID();
  const wardA = randomUUID();
  const wardB = randomUUID();
  const wardInactive = randomUUID(); // thuộc tỉnh A, INACTIVE
  const wardOfInactiveProvince = randomUUID(); // ACTIVE nhưng tỉnh cha INACTIVE
  const fixtureProvinces = [provinceA, provinceB, provinceInactive];
  const seedProvinceCodes = [`s1-${tag}`, `s2-${tag}`];
  const extraCodes = [`x-${tag}`, `p-${tag}`];
  /** Bến ACTIVE của tỉnh A, sắp theo id — kỳ vọng thứ tự trả về qua các trang. */
  let activeStopIds: string[] = [];
  let inactiveStopId = "";

  function stopPoint(overrides: Record<string, unknown> = {}) {
    return {
      name: `Bến ${tag}`,
      type: StopPointType.BUS_STATION,
      address: "Địa chỉ test",
      provinceId: provinceA,
      wardId: wardA,
      latitude: 10.8,
      longitude: 106.7,
      ...overrides,
    };
  }

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    catalog = new CatalogService(prisma);
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    // Chống XANH GIẢ: superuser/BYPASSRLS bỏ qua mọi policy.
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL đang là superuser/BYPASSRLS — dùng role app (CAT-001-guide.md §0).");
    }

    await prisma.withSystem(async (tx) => {
      await tx.province.createMany({
        data: [
          { id: provinceA, code: `a-${tag}`, name: "Tỉnh A" },
          { id: provinceB, code: `b-${tag}`, name: "Tỉnh B" },
          { id: provinceInactive, code: `i-${tag}`, name: "Tỉnh ngừng", status: "INACTIVE" },
        ],
      });
      await tx.ward.createMany({
        data: [
          { id: wardA, provinceId: provinceA, code: `wa-${tag}`, name: "Phường A" },
          { id: wardB, provinceId: provinceB, code: `wb-${tag}`, name: "Phường B" },
          { id: wardInactive, provinceId: provinceA, code: `wi-${tag}`, name: "Phường ngừng", status: "INACTIVE" },
          { id: wardOfInactiveProvince, provinceId: provinceInactive, code: `wx-${tag}`, name: "Phường tỉnh ngừng" },
        ],
      });
      const created = await Promise.all(
        [
          stopPoint(),
          stopPoint({ type: StopPointType.OFFICE }),
          stopPoint({ type: StopPointType.REST_STOP }),
          stopPoint({ type: StopPointType.PICKUP_POINT }),
          stopPoint({ status: "INACTIVE" }),
        ].map((data) => tx.stopPointCatalog.create({ data, select: { id: true, status: true } })),
      );
      activeStopIds = created.filter((row) => row.status === "ACTIVE").map((row) => row.id).sort();
      inactiveStopId = created.find((row) => row.status === "INACTIVE")!.id;
      // Điểm ACTIVE nhưng phường/tỉnh cha đã vô hiệu hoá: API phải ẩn (UC-24 bước 6).
      await tx.stopPointCatalog.createMany({
        data: [
          stopPoint({ wardId: wardInactive }),
          stopPoint({ provinceId: provinceInactive, wardId: wardOfInactiveProvince }),
        ],
      });
    });
  }, 30_000);

  afterAll(async () => {
    if (!prisma) {
      return;
    }
    await prisma.withSystem(async (tx) => {
      const provinceIds = (
        await tx.province.findMany({
          where: { OR: [{ id: { in: fixtureProvinces } }, { code: { in: [...seedProvinceCodes, ...extraCodes] } }] },
          select: { id: true },
        })
      ).map((row) => row.id);
      await tx.stopPointCatalog.deleteMany({ where: { provinceId: { in: provinceIds } } });
      await tx.ward.deleteMany({ where: { provinceId: { in: provinceIds } } });
      await tx.province.deleteMany({ where: { id: { in: provinceIds } } });
      await tx.vehicleType.deleteMany({ where: { code: { endsWith: tag } } });
      await tx.amenity.deleteMany({ where: { code: { endsWith: tag } } });
    });
    await prisma.$disconnect();
  });

  describe("RLS — ai cũng đọc, chỉ platform/system được ghi (Q3)", () => {
    it("5 bảng đã ENABLE + FORCE RLS; rlsProblems() rỗng với role app", async () => {
      const rows = await prisma.$queryRaw<{ relname: string }[]>`
        SELECT relname FROM pg_class
        WHERE relname IN ('provinces','wards','stop_points_catalog','vehicle_types','amenities')
          AND relrowsecurity AND relforcerowsecurity`;
      expect(rows.map((row) => row.relname).sort()).toEqual(
        ["amenities", "provinces", "stop_points_catalog", "vehicle_types", "wards"],
      );
      expect(await prisma.rlsProblems()).toEqual([]);
    });

    it("mỗi bảng đúng 4 policy: đọc tự do, INSERT/UPDATE/DELETE chỉ platform/system", async () => {
      const policies = await prisma.$queryRaw<
        { tablename: string; policyname: string; cmd: string; qual: string | null; with_check: string | null }[]
      >`
        SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies
        WHERE tablename IN ('provinces','wards','stop_points_catalog','vehicle_types','amenities')`;
      const privileged = /app\.scope.*platform.*system/s;
      for (const table of ["provinces", "wards", "stop_points_catalog", "vehicle_types", "amenities"]) {
        const byName = new Map(policies.filter((row) => row.tablename === table).map((row) => [row.policyname, row]));
        expect([...byName.keys()].sort(), table).toEqual(
          ["platform_delete", "platform_insert", "platform_update", "public_read"],
        );
        expect(byName.get("public_read")).toMatchObject({ cmd: "SELECT", qual: "true" });
        expect(byName.get("platform_insert")?.cmd).toBe("INSERT");
        expect(byName.get("platform_insert")?.with_check).toMatch(privileged);
        expect(byName.get("platform_update")?.cmd).toBe("UPDATE");
        expect(byName.get("platform_update")?.qual).toMatch(privileged);
        expect(byName.get("platform_update")?.with_check).toMatch(privileged);
        expect(byName.get("platform_delete")?.cmd).toBe("DELETE");
        expect(byName.get("platform_delete")?.qual).toMatch(privileged);
      }
    });

    it("không ngữ cảnh: đọc được, không ghi được", async () => {
      expect(await prisma.province.findUnique({ where: { id: provinceA } })).not.toBeNull();
      expect(await rejectionText(prisma.province.create({ data: { code: extraCodes[0]!, name: "X" } }))).toMatch(
        /row-level security|42501/,
      );
      expect((await prisma.province.updateMany({ where: { id: provinceA }, data: { name: "Hack" } })).count).toBe(0);
      expect((await prisma.stopPointCatalog.deleteMany({ where: { provinceId: provinceA } })).count).toBe(0);
    });

    it("scope tenant (route Operator có bug) đọc được nhưng không sửa/xoá/tạo được catalog", async () => {
      await prisma.withTenant(randomUUID(), async (tx) => {
        expect(await tx.ward.findUnique({ where: { id: wardA } })).not.toBeNull();
        expect((await tx.ward.updateMany({ where: { id: wardA }, data: { name: "Hack" } })).count).toBe(0);
        // Chỉ nhắm fixture: nếu RLS hỏng, test đỏ mà không xoá dữ liệu thật của DB dùng chung.
        expect((await tx.stopPointCatalog.deleteMany({ where: { provinceId: provinceA } })).count).toBe(0);
      });
      const denied = await rejectionText(
        prisma.withTenant(randomUUID(), (tx) => tx.amenity.create({ data: { code: extraCodes[0]!, name: "X" } })),
      );
      expect(denied).toMatch(/row-level security|42501/);
      expect(await prisma.province.findUnique({ where: { id: provinceA }, select: { name: true } })).toEqual({
        name: "Tỉnh A",
      });
    });

    it("scope platform (ADM-001) ghi được", async () => {
      const created = await prisma.withPlatform((tx) =>
        tx.province.create({ data: { code: extraCodes[1]!, name: "Tỉnh platform" }, select: { id: true } }),
      );
      expect(created.id).toBeTruthy();
    });
  });

  describe("Invariant DB", () => {
    it("FK ghép chặn phường không thuộc tỉnh (UC-24 A2)", async () => {
      const text = await rejectionText(
        prisma.withSystem((tx) => tx.stopPointCatalog.create({ data: stopPoint({ provinceId: provinceB }) })),
      );
      expect(text).toMatch(/stop_points_catalog_ward_id_province_id_fkey|23503|Foreign key/i);
    });

    it.each([
      ["latitude", { latitude: 90.5 }],
      ["longitude", { longitude: -180.5 }],
    ])("CHECK phạm vi %s", async (column, overrides) => {
      const text = await rejectionText(
        prisma.withSystem((tx) => tx.stopPointCatalog.create({ data: stopPoint(overrides) })),
      );
      expect(text).toMatch(new RegExp(`stop_points_catalog_${column}_range|23514`));
    });

    it("trùng code bị unique chặn", async () => {
      const text = await rejectionText(
        prisma.withSystem((tx) => tx.ward.create({ data: { provinceId: provinceB, code: `wa-${tag}`, name: "Trùng" } })),
      );
      expect(text).toMatch(/Unique constraint|P2002|23505/);
    });

    it("không xoá cứng được tỉnh còn phường (FK RESTRICT, không cascade)", async () => {
      const text = await rejectionText(prisma.withSystem((tx) => tx.province.delete({ where: { id: provinceB } })));
      expect(text).toMatch(/wards_province_id_fkey|23001|23503|Foreign key/i);
      expect(await prisma.ward.findUnique({ where: { id: wardB } })).not.toBeNull();
    });
  });

  describe("CatalogService — chỉ ACTIVE, lọc, phân trang", () => {
    it("provinces/wards chỉ trả item ACTIVE", async () => {
      const provinces = (await catalog.listProvinces()).items.map((item) => item.id);
      expect(provinces).toEqual(expect.arrayContaining([provinceA, provinceB]));
      expect(provinces).not.toContain(provinceInactive);
      expect((await catalog.listWards(provinceA)).items.map((item) => item.id)).toEqual([wardA]);
      expect((await catalog.listWards(randomUUID())).items).toEqual([]);
    });

    it("tỉnh/phường cha bị vô hiệu hoá thì ẩn luôn con dù con còn ACTIVE", async () => {
      expect((await catalog.listWards(provinceInactive)).items).toEqual([]);
      expect((await catalog.listStopPoints({ provinceId: provinceInactive, limit: 100 })).items).toEqual([]);
      expect((await catalog.listStopPoints({ wardId: wardInactive, limit: 100 })).items).toEqual([]);
    });

    it("stop-points lọc tỉnh/phường/loại; không lộ item INACTIVE", async () => {
      const all = await catalog.listStopPoints({ provinceId: provinceA, limit: 100 });
      expect(all.items.map((item) => item.id)).toEqual(activeStopIds);
      expect(all.nextCursor).toBeNull();
      const office = await catalog.listStopPoints({ provinceId: provinceA, type: StopPointType.OFFICE, limit: 100 });
      expect(office.items).toHaveLength(1);
      expect((await catalog.listStopPoints({ wardId: wardB, limit: 100 })).items).toEqual([]);
      expect(Object.keys(all.items[0]!).sort()).toEqual(
        ["address", "description", "id", "latitude", "longitude", "name", "provinceId", "type", "wardId"],
      );
    });

    it("cursor đi hết các trang không lặp/sót, kể cả khi dòng cursor bị vô hiệu hoá giữa hai trang", async () => {
      const first = await catalog.listStopPoints({ provinceId: provinceA, limit: 2 });
      expect(first.items.map((item) => item.id)).toEqual(activeStopIds.slice(0, 2));
      expect(first.nextCursor).toBe(activeStopIds[1]);

      // Dòng cursor bị vô hiệu hoá trước khi client xin trang tiếp.
      await prisma.withSystem((tx) =>
        tx.stopPointCatalog.update({ where: { id: first.nextCursor! }, data: { status: "INACTIVE" } }),
      );
      try {
        const second = await catalog.listStopPoints({ provinceId: provinceA, cursor: first.nextCursor!, limit: 2 });
        expect(second.items.map((item) => item.id)).toEqual(activeStopIds.slice(2, 4));
        expect(second.items.map((item) => item.id)).not.toContain(inactiveStopId);
        expect(second.nextCursor).toBeNull();
      } finally {
        await prisma.withSystem((tx) =>
          tx.stopPointCatalog.update({ where: { id: first.nextCursor! }, data: { status: "ACTIVE" } }),
        );
      }
    });
  });

  describe("seedCatalog — create-only, idempotent (Q4)", () => {
    const data: CatalogSeedData = {
      provinces: [
        { code: seedProvinceCodes[0]!, name: "Tỉnh seed 1" },
        { code: seedProvinceCodes[1]!, name: "Tỉnh seed 2" },
      ],
      wards: [
        { code: `sw1-${tag}`, name: "Phường Seed", provinceCode: seedProvinceCodes[0]! },
        { code: `sw2-${tag}`, name: "Xã Seed", provinceCode: seedProvinceCodes[1]! },
      ],
      vehicleTypes: [{ code: `VT-${tag}`, name: "Loại test", description: "mô tả" }],
      amenities: [{ code: `AM-${tag}`, name: "Tiện ích test" }],
      sampleStopPoints: [
        {
          name: `Bến mẫu ${tag}`,
          type: StopPointType.BUS_STATION,
          address: "x",
          provinceCode: seedProvinceCodes[0]!,
          wardName: "phường Seed", // khác hoa/thường ở ký tự ASCII: không phụ thuộc locale DB
          latitude: 10,
          longitude: 106,
        },
        {
          name: `Bến lạc ${tag}`,
          type: StopPointType.BUS_STATION,
          address: "x",
          provinceCode: seedProvinceCodes[0]!,
          wardName: "Phường không tồn tại",
          latitude: 10,
          longitude: 106,
        },
      ],
    };

    it("lần 1 tạo đủ, lần 2 không tạo thêm và không ghi đè sửa tay", async () => {
      const first = await prisma.withSystem((tx) => seedCatalog(tx, data));
      expect(first).toEqual({
        provinces: 2,
        wards: 2,
        vehicleTypes: 1,
        amenities: 1,
        stopPoints: 1,
        skippedStopPoints: [`Bến lạc ${tag}`],
      });

      await prisma.withSystem((tx) =>
        tx.province.update({ where: { code: seedProvinceCodes[0]! }, data: { name: "Admin đã sửa" } }),
      );
      const second = await prisma.withSystem((tx) => seedCatalog(tx, data));
      expect(second).toEqual({
        provinces: 0,
        wards: 0,
        vehicleTypes: 0,
        amenities: 0,
        stopPoints: 0,
        skippedStopPoints: [`Bến lạc ${tag}`],
      });

      const province = await prisma.province.findUnique({
        where: { code: seedProvinceCodes[0]! },
        select: { id: true, name: true },
      });
      expect(province?.name).toBe("Admin đã sửa");
      const ward = await prisma.ward.findUnique({ where: { code: `sw1-${tag}` }, select: { provinceId: true } });
      expect(ward?.provinceId).toBe(province?.id);
      expect(await prisma.stopPointCatalog.count({ where: { name: `Bến mẫu ${tag}` } })).toBe(1);
    });

    it("scope tenant không seed được (RLS chặn cả đường seed)", async () => {
      const text = await rejectionText(
        prisma.withTenant(randomUUID(), (tx) =>
          seedCatalog(tx, { ...data, provinces: [{ code: `t-${tag}`, name: "T" }], wards: [], sampleStopPoints: [] }),
        ),
      );
      expect(text).toMatch(/row-level security|42501/);
    });
  });
});
