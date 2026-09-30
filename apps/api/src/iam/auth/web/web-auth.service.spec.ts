import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { type AppConfig, parseAppConfig } from "../../../config/env.config";
import { WebAuthService } from "./web-auth.service";

function fakeResponse() {
  const cookie = vi.fn();
  const setHeader = vi.fn();
  return { res: { cookie, setHeader } as unknown as Response, cookie };
}

describe("WebAuthService cookie attributes", () => {
  it("production đặt Secure cho cả 3 cookie, không Domain", () => {
    const config = parseAppConfig({
      NODE_ENV: "production",
      BETTER_AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "https://api.example.com",
      JWT_ACCESS_PRIVATE_KEY: "test-key",
      MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
      RESEND_API_KEY: "test-resend-key",
      GOONG_API_KEY: "k",
      WEB_CSRF_SECRET: Buffer.alloc(32, 2).toString("base64"),
      OPERATOR_WEB_ORIGINS: "https://operator.vexenhanh.vn",
      ADMIN_WEB_ORIGINS: "https://admin.vexenhanh.vn",
    });
    const { res, cookie } = fakeResponse();
    new WebAuthService(config).writeSession(res, {
      accessToken: "a",
      tokenType: "Bearer",
      expiresInSeconds: 900,
      scope: "operator",
      role: "OPERATOR_OWNER",
      refreshToken: "r",
      refreshExpiresInSeconds: 60,
    });
    expect(cookie).toHaveBeenCalledTimes(3);
    for (const [, , options] of cookie.mock.calls) {
      expect(options).toMatchObject({ secure: true });
      expect(options).not.toHaveProperty("domain");
    }
    // Refresh cookie sống đúng TTL phiên (ms) chứ không cố định.
    expect(cookie.mock.calls.find(([name]) => name === "vxn_refresh")?.[2]).toMatchObject({ maxAge: 60_000 });
  });

  it("chỉ origin trong allowlist mới hợp lệ, so khớp tuyệt đối", () => {
    const web = new WebAuthService(parseAppConfig({ NODE_ENV: "test" }) as AppConfig);
    expect(web.isAllowedOrigin("http://localhost:3002")).toBe(true);
    expect(web.isAllowedOrigin("http://localhost:3003")).toBe(true);
    expect(web.isAllowedOrigin("http://localhost:3002/")).toBe(false);
    expect(web.isAllowedOrigin("http://127.0.0.1:3002")).toBe(false);
    expect(web.isAllowedOrigin(undefined)).toBe(false);
  });
});
