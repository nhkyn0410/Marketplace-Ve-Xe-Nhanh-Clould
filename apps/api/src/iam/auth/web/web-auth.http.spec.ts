import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { Controller, HttpCode, type INestApplication, Module, Post, UseGuards } from "@nestjs/common";
import { APP_GUARD, NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemDetailsExceptionFilter } from "../../../common/errors/problem-details.filter";
import { configureWebCors } from "../../../common/web-cors";
import { APP_CONFIG, parseAppConfig } from "../../../config/env.config";
import { configureApiRoutes } from "../../../openapi/openapi";
import { SessionController } from "../../session/session.controller";
import { sessionExpired } from "../../session/session.errors";
import { SessionService } from "../../session/session.service";
import { AccessTokenGuard } from "../access-token.guard";
import { AuthController } from "../auth.controller";
import {
  accountLocked,
  invalidCredentials,
  originForbidden,
  otpRateLimited,
  serviceUnavailable,
} from "../auth.errors";
import { AuthService, type LoginResult } from "../auth.service";
import { TokenService } from "../token.service";
import { WebAuthService } from "./web-auth.service";
import { WebCsrfGuard } from "./web-csrf.guard";

/**
 * TASK-IAM-006 — contract dual transport qua HTTP thật (guard/filter/CORS thật, service giả):
 * TC-SEC-005 (CSRF/Origin), TC-SEC-006 (transport sai/ambiguous), TC-SEC-007 (`/auth/me`), cookie flags
 * và hồi quy Mobile JSON/Bearer. Luồng DB thật nằm ở `web-auth.int.spec.ts`.
 */
const OPERATOR_ORIGIN = "http://localhost:3002";
const ADMIN_ORIGIN = "http://localhost:3003";

/** Route nghiệp vụ giả: chứng minh CSRF áp cho MỌI unsafe request dùng cookie, không riêng /auth. */
@Controller("probe")
class ProbeController {
  /** Mutation giả cần đăng nhập. */
  @Post()
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  mutate(): { ok: true } {
    return { ok: true };
  }
}

const session: LoginResult = {
  accessToken: "raw-access-token",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  scope: "operator",
  role: "DRIVER",
  refreshToken: "raw-refresh-token",
  refreshExpiresInSeconds: 2_592_000,
};
const backupCodes = Array.from({ length: 10 }, (_, index) => `AAAAA-BBBBB-CCCCC-${String(index).padStart(5, "0")}`);

type Cookie = { value: string; attributes: string[] };

function setCookies(response: Response): Map<string, Cookie> {
  const cookies = new Map<string, Cookie>();
  for (const line of response.headers.getSetCookie()) {
    const [pair = "", ...attributes] = line.split(";").map((part) => part.trim());
    const separator = pair.indexOf("=");
    cookies.set(pair.slice(0, separator), { value: pair.slice(separator + 1), attributes });
  }
  return cookies;
}

function attribute(cookie: Cookie | undefined, name: string): string | undefined {
  const found = cookie?.attributes.find((item) => item.toLowerCase().startsWith(name.toLowerCase()));
  return found?.includes("=") ? found.slice(found.indexOf("=") + 1) : found;
}

describe("Web auth dual transport — HTTP (TASK-IAM-006)", () => {
  const authService = {
    operatorLogin: vi.fn(),
    employeeLogin: vi.fn(),
    verifyOtp: vi.fn(),
    exchangeSession: vi.fn(),
    oauthInit: vi.fn(),
    platformLogin: vi.fn(),
    verifyMfa: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(async () => undefined),
    reauth: vi.fn(async () => undefined),
    changeRequiredPassword: vi.fn(async () => undefined),
    me: vi.fn(),
  };
  const revokeOwnedFamily = vi.fn(async () => ({ current: true }));
  const config = parseAppConfig({ NODE_ENV: "test" });
  let app: INestApplication;
  let base: string;
  let tokens: TokenService;

  @Module({
    controllers: [AuthController, SessionController, ProbeController],
    providers: [
      { provide: AuthService, useValue: authService },
      { provide: APP_CONFIG, useValue: config },
      TokenService,
      {
        provide: SessionService,
        useValue: {
          assertActive: async () => undefined,
          assertOperatorAccountCurrent: async () => undefined,
          revokeOwnedFamily,
        },
      },
      WebAuthService,
      { provide: APP_GUARD, useClass: WebCsrfGuard },
    ],
  })
  class HttpTestModule {}

  beforeAll(async () => {
    app = await NestFactory.create(HttpTestModule, { logger: false, abortOnError: false });
    configureWebCors(app, config);
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1`;
    tokens = app.get(TokenService);
  }, 15_000);

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    authService.operatorLogin.mockResolvedValue(session);
    authService.employeeLogin.mockResolvedValue(session);
    authService.exchangeSession.mockResolvedValue({ ...session, scope: "passenger", role: "PASSENGER" });
    authService.platformLogin.mockResolvedValue({
      mfaRequired: true,
      challengeToken: "c".repeat(43),
      enrollmentRequired: true,
      challengeExpiresIn: 300,
      otpAuthUri: "otpauth://totp/VeXeNhanh:platform%2Fkhanh?secret=ABCDEF&issuer=VeXeNhanh",
    });
    authService.verifyMfa.mockResolvedValue({ ...session, scope: "platform", role: "PLATFORM_ADMIN", backupCodes });
    authService.refresh.mockImplementation(async (token: string) => {
      if (token !== "good-refresh") {
        throw sessionExpired();
      }
      return session;
    });
  });

  async function csrf(): Promise<{ token: string; cookie: string }> {
    const response = await fetch(`${base}/auth/csrf`, { headers: { origin: OPERATOR_ORIGIN } });
    const cookie = setCookies(response).get("vxn_csrf")!;
    return { token: ((await response.json()) as { csrfToken: string }).csrfToken, cookie: cookie.value };
  }

  async function accessToken(): Promise<string> {
    return (
      await tokens.mintAccessToken({
        sub: randomUUID(),
        sid: randomUUID(),
        scope: "operator",
        role: "DRIVER",
        operatorId: randomUUID(),
        operatorSlug: "phuongtrang",
      })
    ).accessToken;
  }

  async function post(path: string, init: { headers?: Record<string, string>; body?: unknown } = {}) {
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...init.headers },
      body: JSON.stringify(init.body ?? {}),
    });
    const text = await response.text();
    return { response, json: (text ? JSON.parse(text) : {}) as Record<string, unknown> };
  }

  async function cookieHeaders(extraCookies = "", origin = OPERATOR_ORIGIN): Promise<Record<string, string>> {
    const { token, cookie } = await csrf();
    return {
      origin,
      "x-auth-transport": "cookie",
      "x-csrf-token": token,
      cookie: `vxn_csrf=${cookie}${extraCookies ? `; ${extraCookies}` : ""}`,
    };
  }

  const login = { identifier: "phuongtrang/driver01", password: "secret-password" };

  describe("hồi quy Mobile (không header = bearer)", () => {
    it("login trả token JSON như cũ, không Set-Cookie", async () => {
      const { response, json } = await post("/auth/operator/login", { body: login });
      expect(response.status).toBe(200);
      expect(json).toMatchObject({ accessToken: "raw-access-token", refreshToken: "raw-refresh-token", mfaRequired: false });
      expect(response.headers.getSetCookie()).toEqual([]);
    });

    it("refresh bearer vẫn đọc refreshToken trong body; thiếu → 400", async () => {
      const ok = await post("/auth/refresh", { body: { refreshToken: "good-refresh" } });
      expect(ok.response.status).toBe(200);
      expect(ok.json).toMatchObject({ accessToken: "raw-access-token", refreshToken: "raw-refresh-token" });
      expect(ok.response.headers.getSetCookie()).toEqual([]);
      expect((await post("/auth/refresh")).response.status).toBe(400);
    });

    it("mutation Bearer thuần không bị đòi CSRF", async () => {
      const { response } = await post("/probe", { headers: { authorization: `Bearer ${await accessToken()}` } });
      expect(response.status).toBe(200);
    });
  });

  describe("cổng nhân viên + endpoint chỉ Bearer (TASK-IAM-006)", () => {
    const employee = { identifier: "phuongtrang/nv.driver01", password: "secret-password" };

    it("POST /auth/employee/login (Bearer) → token JSON, không cookie", async () => {
      const { response, json } = await post("/auth/employee/login", { body: employee });
      expect(response.status).toBe(200);
      expect(json).toMatchObject({ accessToken: "raw-access-token", mfaRequired: false });
      expect(response.headers.getSetCookie()).toEqual([]);
      expect(authService.employeeLogin).toHaveBeenCalledWith(employee.identifier, employee.password, expect.any(Object));
      expect(authService.operatorLogin).not.toHaveBeenCalled();
    });

    it.each([
      ["/auth/employee/login", employee],
      ["/auth/otp/verify", { email: "a@example.com", otp: "123456" }],
      ["/auth/oauth/session", {}],
    ])("%s ở cookie mode → 400 AUTH_TRANSPORT_INVALID, không trả token thô", async (path, body) => {
      const { response, json } = await post(path, { headers: await cookieHeaders(), body });
      expect(response.status).toBe(400);
      expect(json.code).toBe("AUTH_TRANSPORT_INVALID");
      expect(response.headers.getSetCookie()).toEqual([]);
      expect(authService.employeeLogin).not.toHaveBeenCalled();
      expect(authService.verifyOtp).not.toHaveBeenCalled();
      expect(authService.exchangeSession).not.toHaveBeenCalled();
    });

    it("hồi quy: POST /auth/oauth/session tới đúng handler, không bị `oauth/:provider` nuốt", async () => {
      const { response, json } = await post("/auth/oauth/session");
      expect(response.status).toBe(200);
      expect(json).toMatchObject({ scope: "passenger", accessToken: "raw-access-token" });
      expect(authService.exchangeSession).toHaveBeenCalledOnce();
      expect(authService.oauthInit).not.toHaveBeenCalled();
    });
  });

  describe("M1: phiên cookie chỉ dùng được từ app đúng scope", () => {
    it("cookie phiên operator gọi từ origin Admin → 403 AUTH_ORIGIN_FORBIDDEN (cả GET lẫn mutation)", async () => {
      const token = await accessToken();
      authService.me.mockResolvedValue({});
      const read = await fetch(`${base}/auth/me`, { headers: { origin: ADMIN_ORIGIN, cookie: `vxn_access=${token}` } });
      expect(read.status).toBe(403);
      expect(((await read.json()) as { code: string }).code).toBe("AUTH_ORIGIN_FORBIDDEN");
      expect(authService.me).not.toHaveBeenCalled();

      const write = await post("/probe", { headers: await cookieHeaders(`vxn_access=${token}`, ADMIN_ORIGIN) });
      expect(write.response.status).toBe(403);
      expect(write.json.code).toBe("AUTH_ORIGIN_FORBIDDEN");
    });

    it("cùng cookie gọi từ Operator OS hoặc không có Origin (công cụ) vẫn qua", async () => {
      const token = await accessToken();
      authService.me.mockResolvedValue({
        subjectId: randomUUID(),
        scope: "operator",
        role: "DRIVER",
        username: "nv.driver01",
        sessionId: randomUUID(),
        accessExpiresAt: new Date().toISOString(),
        mfaVerified: false,
      });
      const variants: Record<string, string>[] = [{ origin: OPERATOR_ORIGIN }, {}];
      for (const headers of variants) {
        const response = await fetch(`${base}/auth/me`, { headers: { ...headers, cookie: `vxn_access=${token}` } });
        expect(response.status).toBe(200);
      }
    });

    it.each([
      ["/auth/operator/login", ADMIN_ORIGIN],
      ["/auth/platform/login", OPERATOR_ORIGIN],
    ])("%s cookie mode từ origin %s → 403, không gọi service", async (path, origin) => {
      const { response, json } = await post(path, {
        headers: await cookieHeaders("", origin),
        body: { identifier: "x/y", password: "secret-password" },
      });
      expect(response.status).toBe(403);
      expect(json.code).toBe("AUTH_ORIGIN_FORBIDDEN");
      expect(authService.operatorLogin).not.toHaveBeenCalled();
      expect(authService.platformLogin).not.toHaveBeenCalled();
    });

    it("refresh từ Admin truyền scope platform; lỗi sai origin KHÔNG xoá cookie", async () => {
      authService.refresh.mockRejectedValueOnce(originForbidden());
      const { response } = await post("/auth/refresh", {
        headers: await cookieHeaders("vxn_refresh=good-refresh", ADMIN_ORIGIN),
      });
      expect(response.status).toBe(403);
      expect(authService.refresh).toHaveBeenCalledWith("good-refresh", expect.any(Object), "platform");
      expect(response.headers.getSetCookie()).toEqual([]);
    });
  });

  describe("TC-SEC-006 transport", () => {
    it("X-Auth-Transport lạ → 400 AUTH_TRANSPORT_INVALID", async () => {
      const { response, json } = await post("/auth/operator/login", {
        headers: { "x-auth-transport": "session" },
        body: login,
      });
      expect(response.status).toBe(400);
      expect(json.code).toBe("AUTH_TRANSPORT_INVALID");
      expect(authService.operatorLogin).not.toHaveBeenCalled();
    });

    it("Bearer + cookie ở GET và unsafe request → 400 AUTH_TRANSPORT_AMBIGUOUS", async () => {
      const token = await accessToken();
      const both = { authorization: `Bearer ${token}`, cookie: `vxn_access=${token}` };
      const me = await fetch(`${base}/auth/me`, { headers: both });
      expect(me.status).toBe(400);
      expect(((await me.json()) as { code: string }).code).toBe("AUTH_TRANSPORT_AMBIGUOUS");
      const mutation = await post("/probe", { headers: { ...both, origin: OPERATOR_ORIGIN } });
      expect(mutation.response.status).toBe(400);
      expect(mutation.json.code).toBe("AUTH_TRANSPORT_AMBIGUOUS");
    });
  });

  describe("cookie mode cấp phiên", () => {
    it("login: body chỉ metadata, 3 cookie đúng flags, CSRF rotate qua header", async () => {
      const headers = await cookieHeaders();
      const { response, json } = await post("/auth/operator/login", { headers, body: login });
      expect(response.status).toBe(200);
      expect(json).toEqual({
        authenticated: true,
        scope: "operator",
        role: "DRIVER",
        expiresIn: 900,
        refreshExpiresIn: 2_592_000,
      });
      expect(JSON.stringify(json)).not.toContain("raw-");
      expect(response.headers.get("cache-control")).toBe("no-store");

      const cookies = setCookies(response);
      const access = cookies.get("vxn_access");
      const refresh = cookies.get("vxn_refresh");
      const csrfCookie = cookies.get("vxn_csrf");
      expect(access?.value).toBe("raw-access-token");
      expect(refresh?.value).toBe("raw-refresh-token");
      expect(attribute(access, "HttpOnly")).toBe("HttpOnly");
      expect(attribute(access, "SameSite")).toBe("Lax");
      expect(attribute(access, "Path")).toBe("/v1");
      expect(attribute(access, "Max-Age")).toBe("900");
      expect(attribute(refresh, "HttpOnly")).toBe("HttpOnly");
      expect(attribute(refresh, "SameSite")).toBe("Strict");
      expect(attribute(refresh, "Path")).toBe("/v1/auth/refresh");
      expect(attribute(refresh, "Max-Age")).toBe("2592000");
      expect(attribute(csrfCookie, "HttpOnly")).toBeUndefined();
      expect(attribute(csrfCookie, "SameSite")).toBe("Strict");
      expect(attribute(csrfCookie, "Path")).toBe("/v1");
      for (const cookie of [access, refresh, csrfCookie]) {
        expect(attribute(cookie, "Expires")).toBeDefined();
        // Host-only; local HTTP không Secure (production có — xem web-auth.service.spec).
        expect(attribute(cookie, "Domain")).toBeUndefined();
        expect(attribute(cookie, "Secure")).toBeUndefined();
      }
      expect(response.headers.get("x-csrf-token")).toBe(csrfCookie?.value);
      expect(csrfCookie?.value).not.toBe(headers["x-csrf-token"]);
    });

    it("challenge MFA vẫn ở JSON, chưa cấp cookie phiên", async () => {
      const { response, json } = await post("/auth/platform/login", {
        headers: await cookieHeaders("", ADMIN_ORIGIN),
        body: { identifier: "platform/khanh", password: "secret-password" },
      });
      expect(response.status).toBe(200);
      expect(json).toMatchObject({ mfaRequired: true, enrollmentRequired: true });
      expect(response.headers.getSetCookie()).toEqual([]);
    });

    it("MFA verify: cookie + metadata + backup code đúng một lần trong body", async () => {
      const { response, json } = await post("/auth/mfa/verify", {
        headers: await cookieHeaders(),
        body: { challengeToken: "c".repeat(43), code: "123456" },
      });
      expect(response.status).toBe(200);
      expect(json).toEqual({
        authenticated: true,
        scope: "platform",
        role: "PLATFORM_ADMIN",
        expiresIn: 900,
        refreshExpiresIn: 2_592_000,
        backupCodes,
      });
      expect([...setCookies(response).keys()].sort()).toEqual(["vxn_access", "vxn_csrf", "vxn_refresh"]);
    });

    it("đổi mật khẩu bắt buộc: rotate CSRF, không cấp phiên", async () => {
      const { response } = await post("/auth/password/change-required", {
        headers: await cookieHeaders(),
        body: { passwordChangeToken: "t".repeat(43), newPassword: "a-new-password-123" },
      });
      expect(response.status).toBe(200);
      expect([...setCookies(response).keys()]).toEqual(["vxn_csrf"]);
      expect(response.headers.get("x-csrf-token")).toBe(setCookies(response).get("vxn_csrf")?.value);
    });
  });

  describe("TC-SEC-005 CSRF + Origin", () => {
    it("thiếu X-CSRF-Token → 403 AUTH_CSRF_INVALID, không chạm service", async () => {
      const { "x-csrf-token": _omit, ...headers } = await cookieHeaders();
      const { response, json } = await post("/auth/operator/login", { headers, body: login });
      expect(response.status).toBe(403);
      expect(json.code).toBe("AUTH_CSRF_INVALID");
      expect(authService.operatorLogin).not.toHaveBeenCalled();
    });

    it.each([
      ["thiếu", undefined],
      ["lạ", "https://evil.example"],
      ["null", "null"],
      ["khác port", "http://localhost:3999"],
    ])("Origin %s → 403 AUTH_ORIGIN_FORBIDDEN", async (_label, origin) => {
      const { origin: _omit, ...headers } = await cookieHeaders();
      const { response, json } = await post("/auth/operator/login", {
        headers: origin ? { ...headers, origin } : headers,
        body: login,
      });
      expect(response.status).toBe(403);
      expect(json.code).toBe("AUTH_ORIGIN_FORBIDDEN");
    });

    it("token cũ sau rotate, token giả chữ ký, cookie trùng tên → 403", async () => {
      const first = await csrf();
      const second = await csrf();
      const forged = `${second.token.slice(0, -1)}${second.token.endsWith("A") ? "B" : "A"}`;
      for (const [header, cookie] of [
        [first.token, second.cookie],
        [forged, forged],
        [second.token, `${second.cookie}; vxn_csrf=${first.cookie}`],
      ] as const) {
        const { response, json } = await post("/auth/operator/login", {
          headers: {
            origin: OPERATOR_ORIGIN,
            "x-auth-transport": "cookie",
            "x-csrf-token": header,
            cookie: `vxn_csrf=${cookie}`,
          },
          body: login,
        });
        expect(response.status).toBe(403);
        expect(json.code).toBe("AUTH_CSRF_INVALID");
      }
    });

    it("route nghiệp vụ dùng access cookie cũng bị chặn khi thiếu CSRF; đủ CSRF thì qua", async () => {
      const token = await accessToken();
      const blocked = await post("/probe", { headers: { origin: OPERATOR_ORIGIN, cookie: `vxn_access=${token}` } });
      expect(blocked.response.status).toBe(403);
      expect(blocked.json.code).toBe("AUTH_CSRF_INVALID");
      const allowed = await post("/probe", { headers: await cookieHeaders(`vxn_access=${token}`) });
      expect(allowed.response.status).toBe(200);
    });

    it("GET /auth/csrf khôi phục token còn hợp lệ thay vì rotate (không làm tab khác mất token)", async () => {
      const first = await csrf();
      const again = await fetch(`${base}/auth/csrf`, { headers: { cookie: `vxn_csrf=${first.cookie}` } });
      expect(again.headers.get("cache-control")).toBe("no-store");
      expect(((await again.json()) as { csrfToken: string }).csrfToken).toBe(first.token);
      expect(again.headers.getSetCookie()).toEqual([]);
    });
  });

  describe("TC-SEC-007 /auth/me", () => {
    const me = {
      subjectId: randomUUID(),
      scope: "operator",
      role: "DRIVER",
      username: "driver01",
      sessionId: randomUUID(),
      accessExpiresAt: new Date().toISOString(),
      mfaVerified: false,
      operatorId: randomUUID(),
      operatorSlug: "phuongtrang",
    };

    it("đọc được bằng cookie hoặc Bearer, no-store, không token", async () => {
      authService.me.mockResolvedValue(me);
      const token = await accessToken();
      const variants: Record<string, string>[] = [{ cookie: `vxn_access=${token}` }, { authorization: `Bearer ${token}` }];
      for (const headers of variants) {
        const response = await fetch(`${base}/auth/me`, { headers });
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(await response.json()).toEqual(me);
      }
    });

    it("access hết hạn/giả → 401, KHÔNG tự refresh, không Set-Cookie", async () => {
      const response = await fetch(`${base}/auth/me`, {
        headers: { cookie: "vxn_access=expired.or.forged; vxn_refresh=good-refresh" },
      });
      expect(response.status).toBe(401);
      expect(authService.refresh).not.toHaveBeenCalled();
      expect(response.headers.getSetCookie()).toEqual([]);
    });
  });

  describe("refresh / logout / revoke ở cookie mode", () => {
    it("refresh đọc vxn_refresh, ghi lại cookie và rotate CSRF", async () => {
      const { response, json } = await post("/auth/refresh", {
        headers: await cookieHeaders("vxn_refresh=good-refresh"),
      });
      expect(response.status).toBe(200);
      expect(json).toMatchObject({ authenticated: true, expiresIn: 900 });
      expect(json).not.toHaveProperty("refreshToken");
      // Scope theo Origin (Operator OS → operator) để service chặn phiên khác scope trước khi xoay (M1).
      expect(authService.refresh).toHaveBeenCalledWith("good-refresh", expect.any(Object), "operator");
      expect([...setCookies(response).keys()].sort()).toEqual(["vxn_access", "vxn_csrf", "vxn_refresh"]);
    });

    it.each([
      [429, otpRateLimited],
      [503, serviceUnavailable],
    ])("refresh lỗi tạm thời %i → GIỮ cookie để client thử lại", async (status, error) => {
      authService.refresh.mockRejectedValueOnce(error());
      const { response } = await post("/auth/refresh", { headers: await cookieHeaders("vxn_refresh=good-refresh") });
      expect(response.status).toBe(status);
      expect(response.headers.getSetCookie()).toEqual([]);
    });

    it("re-auth: khoá tài khoản → xoá cookie; sai mật khẩu → giữ cookie", async () => {
      const token = await accessToken();
      authService.reauth.mockRejectedValueOnce(accountLocked());
      const locked = await post("/auth/re-auth", {
        headers: await cookieHeaders(`vxn_access=${token}`),
        body: { password: "whatever" },
      });
      expect(locked.response.status).toBe(403);
      expect([...setCookies(locked.response).keys()].sort()).toEqual(["vxn_access", "vxn_csrf", "vxn_refresh"]);

      authService.reauth.mockRejectedValueOnce(invalidCredentials());
      const wrong = await post("/auth/re-auth", {
        headers: await cookieHeaders(`vxn_access=${token}`),
        body: { password: "whatever" },
      });
      expect(wrong.response.status).toBe(401);
      expect(wrong.response.headers.getSetCookie()).toEqual([]);
    });

    it("cookie mode gửi kèm refreshToken trong body → 400 AUTH_TRANSPORT_AMBIGUOUS", async () => {
      const { response, json } = await post("/auth/refresh", {
        headers: await cookieHeaders("vxn_refresh=good-refresh"),
        body: { refreshToken: "good-refresh" },
      });
      expect(response.status).toBe(400);
      expect(json.code).toBe("AUTH_TRANSPORT_AMBIGUOUS");
    });

    it.each([
      ["refresh sai/reuse", "vxn_refresh=reused-refresh"],
      ["thiếu refresh cookie", ""],
    ])("%s → 401 và xoá cả 3 cookie đúng attributes", async (_label, cookie) => {
      const { response, json } = await post("/auth/refresh", { headers: await cookieHeaders(cookie) });
      expect(response.status).toBe(401);
      expect(json.code).toBe("AUTH_SESSION_EXPIRED");
      const cleared = setCookies(response);
      expect(attribute(cleared.get("vxn_access"), "Path")).toBe("/v1");
      expect(attribute(cleared.get("vxn_refresh"), "Path")).toBe("/v1/auth/refresh");
      expect(attribute(cleared.get("vxn_csrf"), "Path")).toBe("/v1");
      for (const item of cleared.values()) {
        expect(item.value).toBe("");
        expect(attribute(item, "Max-Age")).toBe("0");
      }
    });

    it("logout bằng cookie xoá cookie; logout Bearer không Set-Cookie", async () => {
      const token = await accessToken();
      const cookieLogout = await post("/auth/logout", { headers: await cookieHeaders(`vxn_access=${token}`) });
      expect(cookieLogout.response.status).toBe(200);
      expect([...setCookies(cookieLogout.response).keys()].sort()).toEqual(["vxn_access", "vxn_csrf", "vxn_refresh"]);

      const bearerLogout = await post("/auth/logout", { headers: { authorization: `Bearer ${token}` } });
      expect(bearerLogout.response.status).toBe(200);
      expect(bearerLogout.response.headers.getSetCookie()).toEqual([]);
    });

    it("DELETE /auth/sessions/:id: chỉ xoá cookie khi thu hồi chính family hiện tại", async () => {
      const token = await accessToken();
      const revoke = async () =>
        fetch(`${base}/auth/sessions/${randomUUID()}`, {
          method: "DELETE",
          headers: await cookieHeaders(`vxn_access=${token}`),
        });
      const current = await revoke();
      expect(current.status).toBe(204);
      expect(setCookies(current).has("vxn_access")).toBe(true);

      revokeOwnedFamily.mockResolvedValueOnce({ current: false });
      const other = await revoke();
      expect(other.status).toBe(204);
      expect(other.headers.getSetCookie()).toEqual([]);
    });
  });

  describe("CORS credentialed exact-origin", () => {
    async function preflight(origin: string, path = "/auth/me") {
      return fetch(`${base}${path}`, {
        method: "OPTIONS",
        headers: {
          origin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type,x-auth-transport,x-csrf-token",
        },
      });
    }

    it("origin hợp lệ: echo đúng origin, credentials, Vary: Origin; preflight không qua auth", async () => {
      const response = await preflight(OPERATOR_ORIGIN, "/probe");
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe(OPERATOR_ORIGIN);
      expect(response.headers.get("access-control-allow-credentials")).toBe("true");
      expect(response.headers.get("vary")).toMatch(/Origin/);
      expect(response.headers.get("access-control-allow-headers")).toMatch(/X-CSRF-Token/);
      const actual = await fetch(`${base}/auth/csrf`, { headers: { origin: OPERATOR_ORIGIN } });
      expect(actual.headers.get("access-control-expose-headers")).toMatch(/X-CSRF-Token/);
    });

    it("origin lạ: không có header CORS nào (không `*`)", async () => {
      const response = await preflight("https://evil.example");
      expect(response.headers.get("access-control-allow-origin")).toBeNull();
      expect(response.headers.get("access-control-allow-credentials")).toBeNull();
    });
  });
});
