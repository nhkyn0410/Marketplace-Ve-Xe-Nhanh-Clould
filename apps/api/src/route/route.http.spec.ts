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
import { StopPointProposalController } from "../stop-point/stop-point-proposal.controller";
import { StopPointProposalService } from "../stop-point/stop-point-proposal.service";
import { StopPointController } from "../stop-point/stop-point.controller";
import { StopPointService } from "../stop-point/stop-point.service";
import { RouteController } from "./route.controller";
import { RouteService } from "./route.service";

/** Route thật + chuỗi guard `@Authorize("route:manage")` thật; nghiệp vụ kiểm ở test DB. */
describe("Route / StopPoint / Proposal routes — HTTP", () => {
  const operatorId = randomUUID();
  const id = randomUUID();
  const now = new Date().toISOString();
  const location = {
    name: "Văn phòng Q5",
    type: "OFFICE",
    address: "1 Trần Hưng Đạo",
    provinceId: randomUUID(),
    wardId: randomUUID(),
    latitude: 10.75,
    longitude: 106.66,
    description: null,
  };
  const stopPoint = { ...location, id, status: "ACTIVE", createdAt: now, updatedAt: now };
  const proposal = { ...location, id, status: "PENDING", rejectionReason: null, catalogStopPointId: null, createdAt: now, updatedAt: now };
  const route = {
    id,
    name: "SG - ĐL",
    status: "ACTIVE",
    note: null,
    totalDistanceMeters: 1000,
    totalDurationSeconds: 60,
    metricsSource: "GOONG",
    stops: [],
    createdAt: now,
    updatedAt: now,
  };
  const services = {
    routes: { list: vi.fn(async () => ({ items: [], nextCursor: null })), get: vi.fn(async () => route), create: vi.fn(async () => route), update: vi.fn(async () => route) },
    stopPoints: { list: vi.fn(async () => ({ items: [], nextCursor: null })), get: vi.fn(async () => stopPoint), create: vi.fn(async () => stopPoint), update: vi.fn(async () => stopPoint) },
    proposals: { list: vi.fn(async () => ({ items: [], nextCursor: null })), create: vi.fn(async () => proposal), resubmit: vi.fn(async () => proposal) },
  };
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  @Module({
    controllers: [RouteController, StopPointController, StopPointProposalController],
    providers: [
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
      { provide: APP_CONFIG, useValue: { NODE_ENV: "test", JWT_ACCESS_TTL_SECONDS: 900, JWT_ISSUER: "vexenhanh-test" } as AppConfig },
      TokenService,
      { provide: RouteService, useValue: services.routes },
      { provide: StopPointService, useValue: services.stopPoints },
      { provide: StopPointProposalService, useValue: services.proposals },
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
      headers: { ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}), "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: (await response.json()) as Record<string, unknown> };
  }

  const routeBody = {
    name: "SG - ĐL",
    status: "ACTIVE",
    note: null,
    stops: [
      { catalogStopPointId: randomUUID(), stopPointId: null, note: null },
      { catalogStopPointId: null, stopPointId: randomUUID(), note: null },
    ],
  };
  const routes: [string, string, object | undefined, number][] = [
    ["GET", "/routes", undefined, 200],
    ["GET", `/routes/${id}`, undefined, 200],
    ["POST", "/routes", routeBody, 201],
    ["PUT", `/routes/${id}`, routeBody, 200],
    ["GET", "/stop-points", undefined, 200],
    ["GET", `/stop-points/${id}`, undefined, 200],
    ["POST", "/stop-points", { ...location, status: "ACTIVE" }, 201],
    ["PUT", `/stop-points/${id}`, { ...location, status: "ACTIVE" }, 200],
    ["GET", "/stop-point-proposals", undefined, 200],
    ["POST", "/stop-point-proposals", location, 201],
    ["PUT", `/stop-point-proposals/${id}`, location, 200],
  ];

  it.each(routes)("%s %s: Owner được, không token 401, Employee/Platform 403", async (method, path, body, ok) => {
    expect((await call(method, path, await token("OPERATOR_OWNER"), body)).status).toBe(ok);
    expect((await call(method, path, undefined, body)).status).toBe(401);
    for (const role of ["DRIVER", "TICKET_STAFF", "SUPPORT_STAFF", "PLATFORM_ADMIN", "PLATFORM_SUPPORT"] as const) {
      const denied = await call(method, path, await token(role), body);
      expect(denied.status, role).toBe(403);
      expect(denied.body.code, role).toBe("PERMISSION_DENIED");
    }
  });

  it("mass assignment: tenant lấy từ JWT; đề xuất không nhận status/catalogStopPointId từ body", async () => {
    await call("POST", "/stop-point-proposals", await token("OPERATOR_OWNER"), {
      ...location,
      operatorId: randomUUID(),
      status: "APPROVED",
      catalogStopPointId: randomUUID(),
    });
    const [authz, input] = services.proposals.create.mock.calls[0] as unknown as [
      { db: { operatorId: string } },
      Record<string, unknown>,
    ];
    expect(authz.db.operatorId).toBe(operatorId);
    for (const field of ["operatorId", "status", "catalogStopPointId", "rejectionReason"]) {
      expect(input).not.toHaveProperty(field);
    }
  });

  it.each([
    ["POST", "/routes", { ...routeBody, stops: routeBody.stops.slice(0, 1) }],
    ["POST", "/routes", { ...routeBody, stops: [routeBody.stops[0], routeBody.stops[0]] }],
    ["PUT", `/routes/${id}`, { name: "x", stops: routeBody.stops }],
    ["POST", "/stop-points", { ...location, status: "ACTIVE", latitude: 95 }],
    ["POST", "/stop-point-proposals", { ...location, wardId: "khong-phai-uuid" }],
    ["GET", "/routes?status=DRAFT", undefined],
    ["GET", "/stop-point-proposals?status=UNKNOWN", undefined],
  ])("%s %s dữ liệu sai → 400, service không bị gọi", async (method, path, body) => {
    const response = await call(method, path, await token("OPERATOR_OWNER"), body);
    expect(response.status).toBe(400);
    for (const service of Object.values(services)) {
      for (const method of Object.values(service)) {
        expect(method).not.toHaveBeenCalled();
      }
    }
  });
});
