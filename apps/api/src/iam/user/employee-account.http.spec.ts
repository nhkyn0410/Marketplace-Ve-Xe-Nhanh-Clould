import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { type INestApplication, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../../common/errors/problem-details.filter";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { configureApiRoutes } from "../../openapi/openapi";
import { type AccessTokenClaims, TokenService } from "../auth/token.service";
import { SessionService } from "../session/session.service";
import { EmployeeAccountController } from "./employee-account.controller";
import { EmployeeAccountService } from "./employee-account.service";

/** Exercise the actual HTTP decorators/guard chain; service behavior is covered separately. */
describe("Employee account routes — HTTP authorization", () => {
  const operatorId = randomUUID();
  const employeeId = randomUUID();
  const create = vi.fn(async () => account());
  const update = vi.fn(async () => account());
  const resetPassword = vi.fn(async () => undefined);
  let recentReauth = false;
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  const config = {
    NODE_ENV: "test",
    JWT_ACCESS_TTL_SECONDS: 900,
    JWT_ISSUER: "vexenhanh-test",
  } as AppConfig;

  @Module({
    controllers: [EmployeeAccountController],
    providers: [
      { provide: APP_CONFIG, useValue: config },
      TokenService,
      { provide: EmployeeAccountService, useValue: { create, update, resetPassword } },
      {
        provide: SessionService,
        useValue: {
          assertActive: async () => undefined,
          assertOperatorAccountCurrent: async () => undefined,
          hasRecentReauth: async () => recentReauth,
        },
      },
    ],
  })
  class HttpTestModule {}

  function account() {
    return {
      id: employeeId,
      username: "driver-test",
      contactEmail: "driver@example.com",
      role: "DRIVER",
      status: "ACTIVE",
      credentialDeliveryPending: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  beforeAll(async () => {
    app = await NestFactory.create(HttpTestModule, { logger: false, abortOnError: false });
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/operator/employees`;
    tokens = app.get(TokenService);
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  async function token(role: AccessTokenClaims["role"]): Promise<string> {
    return (await tokens.mintAccessToken({
      sub: randomUUID(),
      sid: randomUUID(),
      scope: "operator",
      role,
      operatorId,
      operatorSlug: "test-operator",
      ...(role === "OPERATOR_OWNER" ? { mfa: true } : {}),
    })).accessToken;
  }

  async function request(method: string, path: string, accessToken: string, body: object) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() as Record<string, unknown> };
  }

  it.each([
    ["POST", "", { username: "driver-test", contactEmail: "driver@example.com", role: "DRIVER", reason: "onboarding" }],
    ["PATCH", `/${employeeId}`, { status: "LOCKED", reason: "disciplinary lock" }],
    ["POST", `/${employeeId}/password-reset`, { reason: "security reset" }],
  ])("%s %s requires recent re-auth at the real route", async (method, path, body) => {
    const ownerToken = await token("OPERATOR_OWNER");
    recentReauth = false;
    create.mockClear();
    update.mockClear();
    resetPassword.mockClear();

    const denied = await request(method, path, ownerToken, body);
    expect(denied.status).toBe(401);
    expect(denied.body.code).toBe("AUTH_REAUTH_REQUIRED");
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(resetPassword).not.toHaveBeenCalled();

    recentReauth = true;
    expect((await request(method, path, ownerToken, body)).status).toBe(method === "PATCH" ? 200 : path ? 200 : 201);
  });

  it("rejects an employee role even when recent re-auth exists", async () => {
    recentReauth = true;
    const driverToken = await token("DRIVER");
    const response = await request("POST", "", driverToken, {
      username: "driver-test",
      contactEmail: "driver@example.com",
      role: "DRIVER",
      reason: "onboarding",
    });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("PERMISSION_DENIED");
  });
});
