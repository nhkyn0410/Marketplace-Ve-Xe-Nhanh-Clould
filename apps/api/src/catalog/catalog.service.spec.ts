import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { PrismaService } from "../database/prisma.service";
import { CatalogService } from "./catalog.service";

function stopPoint(id: string) {
  return {
    id,
    name: `Bến ${id}`,
    type: "BUS_STATION",
    address: "x",
    provinceId: randomUUID(),
    wardId: randomUUID(),
    latitude: 10,
    longitude: 106,
    description: null,
  };
}

function serviceWith(rows: unknown[]) {
  const findMany = vi.fn(async () => rows);
  const prisma = {
    province: { findMany },
    ward: { findMany },
    stopPointCatalog: { findMany },
    vehicleType: { findMany },
    amenity: { findMany },
  } as unknown as PrismaService;
  return { service: new CatalogService(prisma), findMany };
}

describe("CatalogService — chỉ ACTIVE + cursor", () => {
  it.each([
    ["listProvinces", (s: CatalogService) => s.listProvinces()],
    ["listVehicleTypes", (s: CatalogService) => s.listVehicleTypes()],
    ["listAmenities", (s: CatalogService) => s.listAmenities()],
  ])("%s chỉ đọc item ACTIVE, sắp theo mã", async (_name, call) => {
    const { service, findMany } = serviceWith([]);
    await call(service);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "ACTIVE" }, orderBy: { code: "asc" } }),
    );
  });

  it("listWards lọc đúng tỉnh + ACTIVE, ẩn phường của tỉnh đã vô hiệu hoá", async () => {
    const { service, findMany } = serviceWith([]);
    const provinceId = randomUUID();
    await service.listWards(provinceId);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provinceId, status: "ACTIVE", province: { status: "ACTIVE" } },
      }),
    );
  });

  it("listStopPoints: lọc ACTIVE + filter, cursor là `id > cursor` (không dùng skip), lấy dư 1 để biết còn trang", async () => {
    const { service, findMany } = serviceWith([]);
    const cursor = randomUUID();
    const provinceId = randomUUID();
    await service.listStopPoints({ provinceId, type: "OFFICE", cursor, limit: 5 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "ACTIVE",
          ward: { status: "ACTIVE", province: { status: "ACTIVE" } },
          provinceId,
          wardId: undefined,
          type: "OFFICE",
          id: { gt: cursor },
        },
        orderBy: { id: "asc" },
        take: 6,
      }),
    );
    const call = findMany.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(call[0]).not.toHaveProperty("skip");
    expect(call[0]).not.toHaveProperty("cursor");
  });

  it("nextCursor = id cuối trang khi còn dòng; null ở trang cuối", async () => {
    const rows = ["a", "b", "c"].map(stopPoint);
    const more = await serviceWith(rows).service.listStopPoints({ limit: 2 });
    expect(more.items.map((item) => item.id)).toEqual(["a", "b"]);
    expect(more.nextCursor).toBe("b");

    const last = await serviceWith(rows.slice(0, 2)).service.listStopPoints({ limit: 2 });
    expect(last.items).toHaveLength(2);
    expect(last.nextCursor).toBeNull();
  });
});
