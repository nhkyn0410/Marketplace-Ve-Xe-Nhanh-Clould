import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { type INestApplication, Module } from "@nestjs/common";
import { APP_INTERCEPTOR, NestFactory } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../common/errors/problem-details.filter";
import { configureApiRoutes } from "../openapi/openapi";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

/** Route thật (decorator, ZodValidationPipe, serializer, filter RFC 7807); dữ liệu do test DB lo. */
describe("Catalog routes — HTTP công khai", () => {
  const provinceId = randomUUID();
  const timestamps = { status: "ACTIVE", createdAt: new Date(), updatedAt: new Date() };
  const listProvinces = vi.fn(async () => ({
    // Field thừa (status/timestamp) mô phỏng service lỡ trả thêm: serializer phải cắt.
    items: [{ id: provinceId, code: "79", name: "Thành phố Hồ Chí Minh", ...timestamps }],
  }));
  const listWards = vi.fn(async () => ({ items: [] }));
  const listStopPoints = vi.fn(async () => ({ items: [], nextCursor: null }));
  const listVehicleTypes = vi.fn(async () => ({ items: [] }));
  const listAmenities = vi.fn(async () => ({ items: [] }));
  let app: INestApplication;
  let base: string;

  @Module({
    controllers: [CatalogController],
    providers: [
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
      {
        provide: CatalogService,
        useValue: { listProvinces, listWards, listStopPoints, listVehicleTypes, listAmenities },
      },
    ],
  })
  class HttpTestModule {}

  beforeAll(async () => {
    app = await NestFactory.create(HttpTestModule, { logger: false, abortOnError: false });
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/catalog`;
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["provinces", `wards?provinceId=${provinceId}`, "stop-points", "vehicle-types", "amenities"])(
    "GET /catalog/%s trả 200 khi KHÔNG có token",
    async (path) => {
      const response = await fetch(`${base}/${path}`);
      expect(response.status).toBe(200);
    },
  );

  it("response chỉ giữ field công khai (không status/timestamp)", async () => {
    const body = await (await fetch(`${base}/provinces`)).json();
    expect(body).toEqual({ items: [{ id: provinceId, code: "79", name: "Thành phố Hồ Chí Minh" }] });
  });

  it("wards chuyển đúng provinceId xuống service", async () => {
    await fetch(`${base}/wards?provinceId=${provinceId}`);
    expect(listWards).toHaveBeenCalledWith(provinceId);
  });

  it("stop-points áp mặc định limit=20 và ép kiểu query", async () => {
    await fetch(`${base}/stop-points?type=BUS_STATION&limit=5`);
    expect(listStopPoints).toHaveBeenLastCalledWith({ type: "BUS_STATION", limit: 5 });
    await fetch(`${base}/stop-points`);
    expect(listStopPoints).toHaveBeenLastCalledWith({ limit: 20 });
  });

  it.each([
    "wards",
    "wards?provinceId=khong-phai-uuid",
    "stop-points?limit=0",
    "stop-points?limit=101",
    "stop-points?type=AIRPORT",
    "stop-points?cursor=abc",
    "stop-points?wardId=abc",
  ])("GET /catalog/%s → 400 problem+json, service không bị gọi", async (path) => {
    const response = await fetch(`${base}/${path}`);
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect(listWards).not.toHaveBeenCalled();
    expect(listStopPoints).not.toHaveBeenCalled();
  });
});
