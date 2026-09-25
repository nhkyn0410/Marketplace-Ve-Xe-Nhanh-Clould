import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AddressInfo } from "node:net";
import { ZodValidationPipe } from "nestjs-zod";
import { describe, expect, it, vi } from "vitest";
import { APP_CONFIG, parseAppConfig } from "../config/env.config";
import { AuthController } from "../iam/auth/auth.controller";
import { AuthService } from "../iam/auth/auth.service";
import { TokenService } from "../iam/auth/token.service";
import { SessionService } from "../iam/session/session.service";
import { LoginHistoryService } from "../iam/auth/login-history.service";
import { OtpRateLimiter } from "../iam/auth/otp-rate-limiter";
import { ProblemDetailsExceptionFilter } from "./errors/problem-details.filter";
import { configureApiRoutes } from "../openapi/openapi";
import { configureTrustProxy } from "./trust-proxy";

@Module({})
class ProxyAuthTestModule {}

const WIFI_IP = "198.51.100.64";
const MOBILE_IP = "203.0.113.50";
const WIFI_XFF = `${WIFI_IP}, 192.0.2.66, 10.0.0.217`;
const MOBILE_XFF = `${MOBILE_IP}, 192.0.2.13, 10.0.0.217`;

describe("Render proxy -> auth -> Redis and audit", () => {
  it("isolates two clients and ignores a forged leftmost XFF address", async () => {
    const fixture = await createFixture();
    try {
      expect(await fixture.login("proxy-test", WIFI_XFF, WIFI_IP)).toBe(401);
      expect(await fixture.login("proxy-test", MOBILE_XFF, MOBILE_IP)).toBe(401);
      expect(
        await fixture.login("proxy-test", `192.0.2.99, ${WIFI_XFF}`, WIFI_IP)
      ).toBe(401);

      expect(fixture.counts.get("login:id:platform/proxy-test")).toBe(3);
      expect(fixture.counts.get(`login:ip:${WIFI_IP}`)).toBe(2);
      expect(fixture.counts.get(`login:ip:${MOBILE_IP}`)).toBe(1);
      expect(fixture.counts.has("login:ip:192.0.2.99")).toBe(false);
      expect(fixture.auditEvents.map((event) => event.after.ip)).toEqual([
        WIFI_IP,
        MOBILE_IP,
        WIFI_IP
      ]);
    } finally {
      await fixture.close();
    }
  });

  it("keeps the identifier bucket but omits an unconfirmed IP from Redis and audit", async () => {
    const fixture = await createFixture();
    try {
      expect(
        await fixture.login("mismatch", "192.0.2.99, 192.0.2.66, 10.0.0.217", WIFI_IP)
      ).toBe(401);

      expect([...fixture.counts.keys()]).toEqual(["login:id:platform/mismatch"]);
      expect(fixture.auditEvents[0]?.after).not.toHaveProperty("ip");
    } finally {
      await fixture.close();
    }
  });

  it("limits password spraying across identifiers sharing one client IP", async () => {
    const fixture = await createFixture();
    try {
      for (let attempt = 1; attempt <= 30; attempt++) {
        expect(await fixture.login(`probe-${attempt}`, WIFI_XFF, WIFI_IP)).toBe(401);
      }
      expect(await fixture.login("probe-31", WIFI_XFF, WIFI_IP)).toBe(429);

      expect(fixture.counts.get(`login:ip:${WIFI_IP}`)).toBe(31);
      expect(fixture.verifyPassword).toHaveBeenCalledTimes(30);
      expect(fixture.auditEvents).toHaveLength(30);
    } finally {
      await fixture.close();
    }
  });
});

async function createFixture() {
  const counts = new Map<string, number>();
  const auditEvents: Array<{ after: Record<string, unknown> }> = [];
  const redis = {
    eval: vi.fn(async (_script: string, _keyCount: number, key: string) => {
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      return count;
    })
  };
  const verifyPassword = vi.fn().mockResolvedValue(false);
  const audit = {
    recordAuditEvent: vi.fn(async (event: { after: Record<string, unknown> }) => {
      auditEvents.push(event);
    })
  };
  const config = parseAppConfig({
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "https://api.example.com",
    JWT_ACCESS_PRIVATE_KEY: "test-key",
    MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
    RESEND_API_KEY: "test-resend-key"
  });
  const history = new LoginHistoryService(audit as never);
  const limiter = new OtpRateLimiter(redis as never);
  const service = new AuthService(
    {} as never,
    config,
    { platformAccount: { findUnique: vi.fn().mockResolvedValue(null) } } as never,
    {} as never,
    { verify: verifyPassword } as never,
    limiter,
    history,
    {} as never,
    {} as never,
    {} as never
  );
  const app = await NestFactory.create<NestExpressApplication>(
    {
      module: ProxyAuthTestModule,
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: APP_CONFIG, useValue: config },
        // Dependency của AccessTokenGuard (logout, re-auth) — test này không đi qua hai route đó.
        { provide: TokenService, useValue: {} },
        { provide: SessionService, useValue: {} }
      ]
    },
    { logger: false }
  );
  configureTrustProxy(app, 3);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());
  configureApiRoutes(app);
  await app.listen(0, "127.0.0.1");
  const port = (app.getHttpServer().address() as AddressInfo).port;

  return {
    counts,
    auditEvents,
    verifyPassword,
    login: async (name: string, xForwardedFor: string, cfConnectingIp: string) => {
      const response = await fetch(`http://127.0.0.1:${port}/v1/auth/platform/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": xForwardedFor,
          "cf-connecting-ip": cfConnectingIp,
          "cf-ray": "test-ray-SIN"
        },
        body: JSON.stringify({ identifier: `platform/${name}`, password: "wrong" })
      });
      return response.status;
    },
    close: () => app.close()
  };
}
