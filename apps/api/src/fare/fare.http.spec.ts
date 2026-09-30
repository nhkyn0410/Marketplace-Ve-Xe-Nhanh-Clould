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
import { FareController } from "./fare.controller";
import { FareService } from "./fare.service";

/** Route thật + chuỗi guard `@Authorize("trip:manage")` thật; nghiệp vụ kiểm ở test DB. */
describe("Fare routes — HTTP", () => {
  const operatorId = randomUUID();
  const ownerSub = randomUUID();
  const id = randomUUID();
  const now = new Date().toISOString();
  const fare = {
    id,
    routeId: randomUUID(),
    routeName: "SG - ĐL",
    status: "ACTIVE",
    note: null,
    rules: [{ vehicleTypeId: null, seatType: null, validFrom: null, validTo: null, price: 300_000 }],
    createdAt: now,
    updatedAt: now,
  };
  const service = {
    list: vi.fn(async () => ({ items: [], nextCursor: null })),
    get: vi.fn(async () => fare),
    create: vi.fn(async () => fare),
    update: vi.fn(async () => fare),
    revisions: vi.fn(async () => ({ items: [], nextCursor: null })),
  };
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  @Module({
    controllers: [FareController],
    providers: [
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
      { provide: APP_CONFIG, useValue: { NODE_ENV: "test", JWT_ACCESS_TTL_SECONDS: 900, JWT_ISSUER: "vexenhanh-test" } as AppConfig },
      TokenService,
      { provide: FareService, useValue: service },
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
        sub: role === "OPERATOR_OWNER" ? ownerSub : randomUUID(),
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

  const fareBody = {
    status: "ACTIVE",
    note: null,
    rules: [{ vehicleTypeId: randomUUID(), seatType: "BED", validFrom: null, validTo: null, price: 320_000 }],
  };

  it.each([
    ["GET", "/fares", undefined, 200],
    ["GET", `/fares/${id}`, undefined, 200],
    ["POST", "/fares", { ...fareBody, routeId: randomUUID() }, 201],
    ["PUT", `/fares/${id}`, fareBody, 200],
    ["GET", `/fares/${id}/revisions`, undefined, 200],
  ] as [string, string, object | undefined, number][])(
    "%s %s: Owner được, không token 401, Employee/Platform 403",
    async (method, path, body, ok) => {
      expect((await call(method, path, await token("OPERATOR_OWNER"), body)).status).toBe(ok);
      expect((await call(method, path, undefined, body)).status).toBe(401);
      for (const role of ["DRIVER", "TICKET_STAFF", "SUPPORT_STAFF", "PLATFORM_ADMIN", "PLATFORM_SUPPORT"] as const) {
        const denied = await call(method, path, await token(role), body);
        expect(denied.status, role).toBe(403);
        expect(denied.body.code, role).toBe("PERMISSION_DENIED");
      }
    },
  );

  it("người sửa lấy từ access token (ghi audit); tenant lấy từ JWT; body không mang operatorId", async () => {
    await call("PUT", `/fares/${id}`, await token("OPERATOR_OWNER"), { ...fareBody, operatorId: randomUUID() });
    const [actor, authz, fareId, input] = service.update.mock.calls[0] as unknown as [
      { sub: string; role: string },
      { db: { operatorId: string } },
      string,
      Record<string, unknown>,
    ];
    expect(actor.sub).toBe(ownerSub);
    expect(actor.role).toBe("OPERATOR_OWNER");
    expect(authz.db.operatorId).toBe(operatorId);
    expect(fareId).toBe(id);
    expect(input).not.toHaveProperty("operatorId");
  });

  it("giá trả về là số nguyên đồng trong JSON", async () => {
    const response = await call("GET", `/fares/${id}`, await token("OPERATOR_OWNER"));
    expect((response.body.rules as { price: unknown }[])[0]!.price).toBe(300_000);
  });

  it.each([
    ["POST", "/fares", fareBody],
    ["POST", "/fares", { ...fareBody, routeId: randomUUID(), rules: [{ ...fareBody.rules[0], price: -1 }] }],
    ["PUT", `/fares/${id}`, { ...fareBody, rules: [{ ...fareBody.rules[0], validFrom: "2031-01-20T00:00:00Z" }] }],
    ["PUT", `/fares/${id}`, { status: "ACTIVE", rules: [] }],
    ["GET", "/fares?status=DRAFT", undefined],
    ["GET", `/fares/${id}/revisions?cursor=hom-qua`, undefined],
  ])("%s %s dữ liệu sai → 400, service không bị gọi", async (method, path, body) => {
    const response = await call(method, path, await token("OPERATOR_OWNER"), body);
    expect(response.status).toBe(400);
    for (const fn of Object.values(service)) {
      expect(fn).not.toHaveBeenCalled();
    }
  });
});
