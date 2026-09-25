import type { AddressInfo } from "node:net";
import { type INestApplication, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../../common/errors/problem-details.filter";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { configureApiRoutes } from "../../openapi/openapi";
import { SessionService } from "../session/session.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

describe("Required password change — HTTP contract", () => {
  const changeRequiredPassword = vi.fn(async () => undefined);
  let app: INestApplication;
  let url: string;

  @Module({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: { changeRequiredPassword } },
      { provide: APP_CONFIG, useValue: { NODE_ENV: "test" } as AppConfig },
      TokenService,
      { provide: SessionService, useValue: { assertActive: async () => undefined } },
    ],
  })
  class HttpTestModule {}

  beforeAll(async () => {
    app = await NestFactory.create(HttpTestModule, { logger: false, abortOnError: false });
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    url = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1/auth/password/change-required`;
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  it("accepts a one-time challenge without Bearer and never returns a session token", async () => {
    const passwordChangeToken = "t".repeat(43);
    const newPassword = "a-new-password-123";
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passwordChangeToken, newPassword }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok" });
    expect(changeRequiredPassword).toHaveBeenCalledWith(
      passwordChangeToken,
      newPassword,
      expect.any(Object),
    );
  });

  it("rejects a malformed challenge at the route before calling the service", async () => {
    changeRequiredPassword.mockClear();
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ passwordChangeToken: "short", newPassword: "short" }),
    });
    expect(response.status).toBe(400);
    expect(changeRequiredPassword).not.toHaveBeenCalled();
  });
});
