import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type Redis from "ioredis";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "../../../app.module";
import { ProblemDetailsExceptionFilter } from "../../../common/errors/problem-details.filter";
import { configureWebCors } from "../../../common/web-cors";
import { loadAppConfig } from "../../../config/env.config";
import { PrismaService } from "../../../database/prisma.service";
import { configureApiRoutes } from "../../../openapi/openapi";
import { REDIS_CLIENT } from "../../../redis/redis.config";
import { CredentialService } from "../credential.service";
import { generateTotp } from "../totp";

/**
 * TASK-IAM-006 — luồng web cookie mode trên app đầy đủ + Postgres/Redis/Mongo thật (TC-SEC-005..008 mức API):
 * first-login Owner (mật khẩu tạm → đổi → login lại → TOTP → backup code) → `/auth/me` → refresh rotate →
 * reuse xoá cookie + revoke family → logout. Trình duyệt được mô phỏng bằng cookie jar tôn trọng Path.
 */
const ready = Boolean(process.env.DATABASE_URL && process.env.REDIS_URL && process.env.MONGODB_AUDIT_URI);
const ORIGIN = "http://localhost:3002";

/** Cookie jar tối thiểu: `vxn_refresh` chỉ gửi tới `/auth/refresh` như Path `/v1/auth/refresh` của trình duyệt. */
class CookieJar {
  private readonly cookies = new Map<string, string>();

  /** Áp Set-Cookie của response; Max-Age=0 = xoá. */
  store(response: Response): void {
    for (const line of response.headers.getSetCookie()) {
      const [pair = ""] = line.split(";");
      const name = pair.slice(0, pair.indexOf("="));
      const value = pair.slice(pair.indexOf("=") + 1);
      if (/max-age=0/i.test(line) || value === "") {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, value);
      }
    }
  }

  /** Header Cookie cho một path API. */
  header(path: string): string {
    return [...this.cookies]
      .filter(([name]) => name !== "vxn_refresh" || path === "/auth/refresh")
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /** Giá trị cookie hiện tại (test đọc được cả cookie httpOnly — trình duyệt thì không). */
  get(name: string): string | undefined {
    return this.cookies.get(name);
  }

  /** Ghi đè một cookie (mô phỏng kẻ tấn công giữ refresh token cũ). */
  set(name: string, value: string): void {
    this.cookies.set(name, value);
  }
}

describe.skipIf(!ready && process.env.REQUIRE_DB_TESTS !== "1")("Web auth cookie mode — HTTP + DB thật (IAM-006)", () => {
  const tag = randomUUID().slice(0, 8);
  const operatorId = randomUUID();
  const operatorSlug = `iam006-${tag}`;
  const ownerUsername = `owner-${tag}`;
  const driverUsername = `nv.driver-${tag}`;
  const temporaryPassword = `Temp!${randomUUID()}`;
  const newPassword = `New!${randomUUID()}`;
  const driverPassword = `Drv!${randomUUID()}`;
  let app: INestApplication;
  let base: string;
  let prisma: PrismaService;
  let redis: Redis;
  let ownerId: string;
  let driverId: string;
  /** Backup code của Owner (enrollment ở ca đầu) — các ca sau đăng nhập web bằng chúng. */
  let backupCodes: string[] = [];

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
    configureWebCors(app, loadAppConfig());
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1`;
    prisma = app.get(PrismaService);
    redis = app.get<Redis>(REDIS_CLIENT);

    const credentials = new CredentialService();
    const [temporaryHash, driverHash] = await Promise.all([
      credentials.hash(temporaryPassword),
      credentials.hash(driverPassword),
    ]);
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.create({ data: { id: operatorId, operatorSlug, displayName: "IAM-006 web auth" } });
      const owner = await tx.operatorAccount.create({
        data: {
          operatorId,
          operatorSlug,
          username: ownerUsername,
          contactEmail: "iam006-owner@example.com",
          passwordHash: temporaryHash,
          passwordChangeRequired: true,
          temporaryPasswordExpiresAt: new Date(Date.now() + 10 * 60_000),
        },
      });
      const driver = await tx.employeeAccount.create({
        data: { operatorId, username: driverUsername, passwordHash: driverHash, role: "DRIVER" },
      });
      ownerId = owner.id;
      driverId = driver.id;
    });
  }, 60_000);

  beforeEach(async () => {
    await redis.del("login:ip:127.0.0.1", "refresh:ip:127.0.0.1");
  });

  afterAll(async () => {
    if (prisma && ownerId) {
      const subjects = [ownerId, driverId];
      await prisma.withSystem(async (tx) => {
        await tx.mfaCredential.deleteMany({ where: { subjectId: { in: subjects } } });
        await tx.authSession.deleteMany({ where: { subjectId: { in: subjects } } });
        await tx.employeeAccount.deleteMany({ where: { id: driverId } });
        await tx.operatorAccount.deleteMany({ where: { id: ownerId } });
        await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
      });
    }
    if (redis) {
      const keys = await redis.keys(`login:id:*${tag}*`);
      if (keys.length) {
        await redis.del(...keys);
      }
      await redis.del("login:ip:127.0.0.1", "refresh:ip:127.0.0.1");
    }
    await app?.close();
  });

  /** Trình duyệt web tối thiểu: Origin cố định, CSRF trong memory, cookie jar theo Path. */
  function browser() {
    const jar = new CookieJar();
    let csrf = "";

    async function call(method: string, path: string, body?: unknown) {
      const response = await fetch(`${base}${path}`, {
        method,
        headers: {
          origin: ORIGIN,
          "x-auth-transport": "cookie",
          ...(method === "GET" ? {} : { "content-type": "application/json", "x-csrf-token": csrf }),
          cookie: jar.header(path),
        },
        body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
      });
      jar.store(response);
      csrf = response.headers.get("x-csrf-token") ?? csrf;
      const text = await response.text();
      return { status: response.status, json: (text ? JSON.parse(text) : {}) as Record<string, unknown>, response };
    }

    return {
      jar,
      call,
      async bootstrap() {
        const result = await call("GET", "/auth/csrf");
        csrf = String(result.json.csrfToken);
      },
    };
  }

  it("⭐ TC-SEC-008 (API): Owner first-login → đổi mật khẩu → TOTP → backup code → /auth/me qua cookie", async () => {
    const web = browser();
    await web.bootstrap();
    const identifier = `${operatorSlug}/${ownerUsername}`;

    const first = await web.call("POST", "/auth/operator/login", { identifier, password: temporaryPassword });
    expect(first.status).toBe(200);
    expect(first.json).toMatchObject({ passwordChangeRequired: true });
    expect(web.jar.get("vxn_access")).toBeUndefined();

    const changed = await web.call("POST", "/auth/password/change-required", {
      passwordChangeToken: first.json.passwordChangeToken,
      newPassword,
    });
    expect(changed.status).toBe(200);
    expect(changed.response.headers.get("x-csrf-token")).toBe(web.jar.get("vxn_csrf"));
    expect(web.jar.get("vxn_access")).toBeUndefined();

    const challenge = await web.call("POST", "/auth/operator/login", { identifier, password: newPassword });
    expect(challenge.json).toMatchObject({ mfaRequired: true, enrollmentRequired: true });
    const secret = new URL(String(challenge.json.otpAuthUri)).searchParams.get("secret")!;

    const verified = await web.call("POST", "/auth/mfa/verify", {
      challengeToken: challenge.json.challengeToken,
      code: generateTotp(secret),
    });
    expect(verified.status).toBe(200);
    expect(verified.json).toMatchObject({ authenticated: true, scope: "operator", role: "OPERATOR_OWNER" });
    expect(verified.json.backupCodes).toHaveLength(10);
    backupCodes = verified.json.backupCodes as string[];
    expect(verified.json).not.toHaveProperty("accessToken");
    expect(web.jar.get("vxn_access")).toBeDefined();
    expect(web.jar.get("vxn_refresh")).toBeDefined();

    const me = await web.call("GET", "/auth/me");
    expect(me.status).toBe(200);
    expect(me.response.headers.get("cache-control")).toBe("no-store");
    const family = await prisma.withSystem((tx) =>
      tx.authSession.findFirstOrThrow({ where: { subjectId: ownerId, revokedAt: null }, select: { familyId: true } }),
    );
    expect(me.json).toMatchObject({
      subjectId: ownerId,
      scope: "operator",
      role: "OPERATOR_OWNER",
      username: ownerUsername,
      sessionId: family.familyId,
      mfaVerified: true,
      operatorId,
      operatorSlug,
    });
    expect(Date.parse(String(me.json.accessExpiresAt))).toBeGreaterThan(Date.now());
    expect(JSON.stringify(me.json)).not.toMatch(/backup|secret|refresh/i);
  }, 60_000);

  /** Owner đã enrollment ở ca đầu: mỗi lần đăng nhập web tiêu một backup code. */
  async function ownerSession() {
    const web = browser();
    await web.bootstrap();
    const challenge = await web.call("POST", "/auth/operator/login", {
      identifier: `${operatorSlug}/${ownerUsername}`,
      password: newPassword,
    });
    const verified = await web.call("POST", "/auth/mfa/verify", {
      challengeToken: challenge.json.challengeToken,
      code: backupCodes.shift(),
    });
    expect(verified.json).toMatchObject({ authenticated: true, role: "OPERATOR_OWNER" });
    return web;
  }

  it("refresh xoay cookie; dùng lại refresh cũ → 401, xoá cookie VÀ family mới cũng chết", async () => {
    const web = await ownerSession();
    const oldRefresh = web.jar.get("vxn_refresh")!;

    const rotated = await web.call("POST", "/auth/refresh");
    expect(rotated.status).toBe(200);
    expect(web.jar.get("vxn_refresh")).not.toBe(oldRefresh);
    const me = await web.call("GET", "/auth/me");
    expect(me.json).toMatchObject({ username: ownerUsername, role: "OPERATOR_OWNER" });

    web.jar.set("vxn_refresh", oldRefresh);
    const reused = await web.call("POST", "/auth/refresh");
    expect(reused.status).toBe(401);
    expect(web.jar.get("vxn_access")).toBeUndefined();
    expect(web.jar.get("vxn_refresh")).toBeUndefined();
    expect(web.jar.get("vxn_csrf")).toBeUndefined();

    const active = await prisma.withSystem((tx) =>
      tx.authSession.count({ where: { familyId: String(me.json.sessionId), revokedAt: null } }),
    );
    expect(active).toBe(0);
  }, 60_000);

  it("M1: refresh phiên Owner từ origin Admin → 403, token KHÔNG bị xoay, phiên vẫn dùng tiếp ở Operator OS", async () => {
    const web = await ownerSession();
    const refreshBefore = web.jar.get("vxn_refresh")!;
    const csrf = web.jar.get("vxn_csrf")!;

    const foreign = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: {
        origin: "http://localhost:3003",
        "x-auth-transport": "cookie",
        "content-type": "application/json",
        "x-csrf-token": csrf,
        cookie: `vxn_csrf=${csrf}; vxn_refresh=${refreshBefore}`,
      },
      body: "{}",
    });
    expect(foreign.status).toBe(403);
    expect(((await foreign.json()) as { code: string }).code).toBe("AUTH_ORIGIN_FORBIDDEN");
    expect(foreign.headers.getSetCookie()).toEqual([]);

    // Token cũ chưa bị tiêu: refresh từ đúng app vẫn thành công (không bị coi là reuse).
    const rotated = await web.call("POST", "/auth/refresh");
    expect(rotated.status).toBe(200);
    expect(web.jar.get("vxn_refresh")).not.toBe(refreshBefore);
  }, 60_000);

  it("logout bằng cookie thu hồi family, xoá cookie; access cũ không dùng lại được", async () => {
    const web = await ownerSession();
    const access = web.jar.get("vxn_access")!;

    const logout = await web.call("POST", "/auth/logout");
    expect(logout.status).toBe(200);
    expect(web.jar.get("vxn_access")).toBeUndefined();

    const replay = await fetch(`${base}/auth/me`, { headers: { cookie: `vxn_access=${access}` } });
    expect(replay.status).toBe(401);
  }, 60_000);

  describe("cổng nhân viên tách khỏi Owner (TASK-IAM-006)", () => {
    const employee = () => ({ identifier: `${operatorSlug}/${driverUsername}`, password: driverPassword });

    async function postJson(path: string, body: unknown, headers: Record<string, string> = {}) {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      return { status: response.status, json: (await response.json()) as Record<string, unknown>, response };
    }

    it("Mobile: `/auth/employee/login` trả token JSON, không cookie; `/auth/me` đọc đúng nhân viên", async () => {
      const { status, json, response } = await postJson("/auth/employee/login", employee());
      expect(status).toBe(200);
      expect(json).toMatchObject({ role: "DRIVER", accessToken: expect.any(String), refreshToken: expect.any(String) });
      expect(response.headers.getSetCookie()).toEqual([]);
      const me = await fetch(`${base}/auth/me`, { headers: { authorization: `Bearer ${String(json.accessToken)}` } });
      expect(await me.json()).toMatchObject({ subjectId: driverId, username: driverUsername, role: "DRIVER" });
    }, 30_000);

    it("nhân viên đúng mật khẩu ở cổng Owner → 401 chung, không tạo phiên", async () => {
      const before = await prisma.withSystem((tx) => tx.authSession.count({ where: { subjectId: driverId } }));
      const { status, json } = await postJson("/auth/operator/login", employee());
      expect(status).toBe(401);
      expect(json.code).toBe("AUTH_INVALID_CREDENTIALS");
      const after = await prisma.withSystem((tx) => tx.authSession.count({ where: { subjectId: driverId } }));
      expect(after).toBe(before);
    }, 30_000);

    it("Owner đúng mật khẩu ở cổng nhân viên → 401 chung (không lộ challenge MFA)", async () => {
      const { status, json } = await postJson("/auth/employee/login", {
        identifier: `${operatorSlug}/${ownerUsername}`,
        password: newPassword,
      });
      expect(status).toBe(401);
      expect(json.code).toBe("AUTH_INVALID_CREDENTIALS");
      expect(json).not.toHaveProperty("challengeToken");
    }, 30_000);
  });
});
