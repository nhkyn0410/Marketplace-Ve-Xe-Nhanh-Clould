import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { type INestApplication, Module } from "@nestjs/common";
import { APP_INTERCEPTOR, NestFactory } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../common/errors/problem-details.filter";
import { APP_CONFIG, type AppConfig } from "../config/env.config";
import { type AccessTokenClaims, TokenService } from "../iam/auth/token.service";
import { SessionService } from "../iam/session/session.service";
import { configureApiRoutes } from "../openapi/openapi";
import { SeatMapController } from "./seat-map.controller";
import { SeatMapService } from "./seat-map.service";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./vehicle.service";

/** Route thật + chuỗi guard `@Authorize` thật; nghiệp vụ service kiểm ở test DB. */
describe("Vehicle / SeatMap routes — HTTP", () => {
  const operatorId = randomUUID();
  const vehicleId = randomUUID();
  const seatMapId = randomUUID();
  const now = new Date().toISOString();
  const vehicle = {
    id: vehicleId,
    plateNumber: "51B12345",
    vehicleTypeId: randomUUID(),
    seatMapId: null,
    amenityIds: [],
    status: "ACTIVE",
    description: null,
    createdAt: now,
    updatedAt: now,
  };
  const seatMap = {
    id: seatMapId,
    name: "Ghế 2",
    seatCount: 1,
    layout: { decks: [{ deck: 1, rows: 1, columns: 1 }] },
    seats: [{ code: "A1", deck: 1, row: 1, column: 1, type: "SEAT" }],
    createdAt: now,
    updatedAt: now,
  };
  const vehicles = {
    list: vi.fn(async () => ({ items: [vehicle], nextCursor: null })),
    get: vi.fn(async () => vehicle),
    create: vi.fn(async () => vehicle),
    update: vi.fn(async () => vehicle),
  };
  const seatMaps = {
    list: vi.fn(async () => ({ items: [], nextCursor: null })),
    get: vi.fn(async () => seatMap),
    create: vi.fn(async () => seatMap),
    update: vi.fn(async () => seatMap),
  };
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  const config = { NODE_ENV: "test", JWT_ACCESS_TTL_SECONDS: 900, JWT_ISSUER: "vexenhanh-test" } as AppConfig;

  @Module({
    controllers: [VehicleController, SeatMapController],
    providers: [
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
      { provide: APP_CONFIG, useValue: config },
      TokenService,
      { provide: VehicleService, useValue: vehicles },
      { provide: SeatMapService, useValue: seatMaps },
      {
        provide: SessionService,
        useValue: { assertActive: async () => undefined, assertOperatorAccountCurrent: async () => undefined },
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
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/operator`;
    tokens = app.get(TokenService);
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function token(role: AccessTokenClaims["role"]): Promise<string> {
    const platform = role === "PLATFORM_ADMIN" || role === "PLATFORM_SUPPORT";
    return (
      await tokens.mintAccessToken({
        sub: randomUUID(),
        sid: randomUUID(),
        scope: platform ? "platform" : "operator",
        role,
        ...(platform ? {} : { operatorId, operatorSlug: "test-operator" }),
        ...(role === "OPERATOR_OWNER" || platform ? { mfa: true } : {}),
      })
    ).accessToken;
  }

  async function call(method: string, path: string, accessToken?: string, body?: object) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        "content-type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  }

  const vehicleBody = {
    plateNumber: "51b-123.45",
    vehicleTypeId: randomUUID(),
    seatMapId: null,
    amenityIds: [],
    status: "ACTIVE",
    description: null,
  };
  const seatMapBody = {
    name: "Ghế 2",
    layout: { decks: [{ deck: 1, rows: 1, columns: 1 }] },
    seats: [{ code: "a1", deck: 1, row: 1, column: 1, type: "SEAT" }],
  };
  const routes: [string, string, object | undefined, number][] = [
    ["GET", "/vehicles", undefined, 200],
    ["GET", `/vehicles/${vehicleId}`, undefined, 200],
    ["POST", "/vehicles", vehicleBody, 201],
    ["PUT", `/vehicles/${vehicleId}`, vehicleBody, 200],
    ["GET", "/seat-maps", undefined, 200],
    ["GET", `/seat-maps/${seatMapId}`, undefined, 200],
    ["POST", "/seat-maps", seatMapBody, 201],
    ["PUT", `/seat-maps/${seatMapId}`, seatMapBody, 200],
  ];

  it.each(routes)("%s %s: Owner được, không token 401, Employee/Platform 403", async (method, path, body, ok) => {
    expect((await call(method, path, await token("OPERATOR_OWNER"), body)).status).toBe(ok);
    expect((await call(method, path, undefined, body)).status).toBe(401);
    for (const role of ["DRIVER", "TICKET_STAFF", "SUPPORT_STAFF", "PLATFORM_ADMIN"] as const) {
      const denied = await call(method, path, await token(role), body);
      expect(denied.status, role).toBe(403);
      expect(denied.body.code, role).toBe("PERMISSION_DENIED");
    }
  });

  it("service nhận scope tenant lấy từ JWT + dữ liệu đã chuẩn hoá", async () => {
    await call("POST", "/vehicles", await token("OPERATOR_OWNER"), vehicleBody);
    expect(vehicles.create).toHaveBeenCalledWith(
      expect.objectContaining({ db: expect.objectContaining({ kind: "tenant", operatorId }) }),
      expect.objectContaining({ plateNumber: "51B12345", amenityIds: [], status: "ACTIVE" }),
    );
    await call("POST", "/seat-maps", await token("OPERATOR_OWNER"), seatMapBody);
    expect(seatMaps.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ seats: [expect.objectContaining({ code: "A1" })] }),
    );
  });

  it("mass assignment: operatorId/id trong body bị bỏ, tenant chỉ lấy từ JWT", async () => {
    const otherTenant = randomUUID();
    await call("POST", "/vehicles", await token("OPERATOR_OWNER"), { ...vehicleBody, operatorId: otherTenant, id: randomUUID() });
    await call("POST", "/seat-maps", await token("OPERATOR_OWNER"), {
      ...seatMapBody,
      operatorId: otherTenant,
      seats: [{ ...seatMapBody.seats[0], id: randomUUID(), operatorId: otherTenant }],
    });
    const [vehicleAuthz, vehicleInput] = vehicles.create.mock.calls[0] as unknown as [
      { db: { operatorId: string } },
      Record<string, unknown>,
    ];
    expect(vehicleAuthz.db.operatorId).toBe(operatorId);
    expect(vehicleInput).not.toHaveProperty("operatorId");
    expect(vehicleInput).not.toHaveProperty("id");
    const [, seatMapInput] = seatMaps.create.mock.calls[0] as unknown as [unknown, { seats: object[] }];
    expect(seatMapInput).not.toHaveProperty("operatorId");
    expect(seatMapInput.seats[0]).not.toHaveProperty("id");
    expect(seatMapInput.seats[0]).not.toHaveProperty("operatorId");
  });

  it.each([
    ["POST", "/vehicles", { ...vehicleBody, plateNumber: "ABC" }],
    ["POST", "/vehicles", { ...vehicleBody, vehicleTypeId: "x" }],
    ["PUT", `/vehicles/${vehicleId}`, { plateNumber: "51B12345" }],
    ["POST", "/seat-maps", { ...seatMapBody, seats: [{ ...seatMapBody.seats[0], row: 2 }] }],
    ["GET", "/vehicles?status=BROKEN", undefined],
    ["GET", "/seat-maps?limit=101", undefined],
  ])("%s %s dữ liệu sai → 400 problem+json, service không bị gọi", async (method, path, body) => {
    const response = await call(method, path, await token("OPERATOR_OWNER"), body);
    expect(response.status).toBe(400);
    expect(vehicles.create).not.toHaveBeenCalled();
    expect(vehicles.update).not.toHaveBeenCalled();
    expect(vehicles.list).not.toHaveBeenCalled();
    expect(seatMaps.create).not.toHaveBeenCalled();
    expect(seatMaps.list).not.toHaveBeenCalled();
  });
});
