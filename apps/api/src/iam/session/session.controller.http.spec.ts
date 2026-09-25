import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { type INestApplication, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../../common/errors/problem-details.filter";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { SubjectType } from "../../database/prisma.types";
import { configureApiRoutes } from "../../openapi/openapi";
import { type AccessTokenClaims, TokenService } from "../auth/token.service";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";

describe("Session family routes — HTTP", () => {
  const listForSubject = vi.fn(async () => ({ items: [], nextCursor: null }));
  const revokeOwnedFamily = vi.fn(async () => undefined);
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  @Module({
    controllers: [SessionController],
    providers: [
      {
        provide: APP_CONFIG,
        useValue: { NODE_ENV: "test", JWT_ACCESS_TTL_SECONDS: 900, JWT_ISSUER: "vexenhanh-test" } as AppConfig,
      },
      TokenService,
      {
        provide: SessionService,
        useValue: {
          assertActive: async () => undefined,
          assertOperatorAccountCurrent: async () => undefined,
          listForSubject,
          revokeOwnedFamily,
        },
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
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/auth/sessions`;
    tokens = app.get(TokenService);
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  async function token(claims: Omit<AccessTokenClaims, "sid">) {
    return (await tokens.mintAccessToken({ ...claims, sid: randomUUID() })).accessToken;
  }

  it.each([
    ["PASSENGER", "passenger", SubjectType.PASSENGER],
    ["PLATFORM_ADMIN", "platform", SubjectType.PLATFORM],
    ["OPERATOR_OWNER", "operator", SubjectType.OPERATOR],
    ["DRIVER", "operator", SubjectType.EMPLOYEE],
  ] as const)("GET maps %s to %s subject", async (role, scope, subjectType) => {
    const sub = randomUUID();
    const accessToken = await token({
      sub,
      role,
      scope,
      ...(scope === "operator" ? { operatorId: randomUUID(), operatorSlug: "test-operator" } : {}),
      ...(role === "OPERATOR_OWNER" || role === "PLATFORM_ADMIN" ? { mfa: true } : {}),
    });
    listForSubject.mockClear();
    const response = await fetch(`${base}?limit=7`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [], nextCursor: null });
    expect(listForSubject).toHaveBeenCalledWith(subjectType, sub, expect.any(String), { limit: 7 });
  });

  it("DELETE forwards the public family id and returns 204", async () => {
    const sub = randomUUID();
    const familyId = randomUUID();
    const accessToken = await token({ sub, role: "PASSENGER", scope: "passenger" });
    revokeOwnedFamily.mockClear();
    const response = await fetch(`${base}/${familyId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.status).toBe(204);
    expect(revokeOwnedFamily).toHaveBeenCalledWith(
      SubjectType.PASSENGER,
      sub,
      familyId,
      expect.any(String),
    );
  });

  it("GET without Bearer is rejected before reaching the service", async () => {
    listForSubject.mockClear();
    const response = await fetch(base);
    expect(response.status).toBe(401);
    expect(listForSubject).not.toHaveBeenCalled();
  });
});
