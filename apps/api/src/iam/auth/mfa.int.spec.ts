import { createHash, randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type Redis from "ioredis";
import { ZodValidationPipe } from "nestjs-zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AppModule } from "../../app.module";
import { AuditService } from "../../audit/audit.service";
import { ProblemDetailsExceptionFilter } from "../../common/errors/problem-details.filter";
import { PrismaService } from "../../database/prisma.service";
import { configureApiRoutes } from "../../openapi/openapi";
import { REDIS_CLIENT } from "../../redis/redis.config";
import { SessionService } from "../session/session.service";
import { CredentialService } from "./credential.service";
import { MFA_MAX_FAILURES_PER_WINDOW } from "./auth.constants";
import { MFA_CHALLENGE_SCRIPTS, MFA_MAX_CHALLENGE_ATTEMPTS } from "./mfa.service";
import { generateTotp } from "./totp";

/**
 * E2E TASK-IAM-004 qua HTTP thật (Postgres + Redis + Mongo thật, `DATABASE_URL` = role app).
 * Bằng chứng cho các bất biến mà unit test chỉ giả lập được: Lua Redis thật, CAS Postgres thật dưới
 * request đồng thời, RLS của hai bảng MFA, và không rò secret/code ra DB/Redis/audit.
 *
 * TOTP phụ thuộc đồng hồ thật: enrollment dùng time-step hiện tại N, mỗi account còn đúng MỘT mã
 * hợp lệ nữa (N+1, cửa sổ ±1) → test nào cần TOTP thì tự tạo account riêng.
 */
const ready = Boolean(process.env.DATABASE_URL && process.env.REDIS_URL && process.env.MONGODB_AUDIT_URI);

type Json = Record<string, unknown>;
type Enrolled = {
  accountId: string;
  identifier: string;
  secret: string;
  backupCodes: string[];
  accessToken: string;
  refreshToken: string;
};

function claimsOf(accessToken: string): Json {
  return JSON.parse(Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8")) as Json;
}

function challengeKeyOf(challengeToken: string): string {
  return `mfa:challenge:{${createHash("sha256").update(challengeToken, "utf8").digest("hex")}}`;
}

/** Mã TOTP time-step kế tiếp: hợp lệ (cửa sổ +1) và lớn hơn counter vừa dùng lúc enrollment. */
function nextTotp(secret: string): string {
  return generateTotp(secret, { timestampMs: Date.now() + 30_000 });
}

describe.skipIf(!ready && process.env.REQUIRE_DB_TESTS !== "1")("MFA TOTP + backup code — HTTP thật (IAM-004)", () => {
  const tag = randomUUID().slice(0, 8);
  const password = `Mfa!${randomUUID()}`;
  const operatorId = randomUUID();
  const operatorSlug = `mfa-${tag}`;
  const platformIds: string[] = [];
  const operatorAccountIds: string[] = [];
  const employeeIds: string[] = [];
  let app: INestApplication;
  let base: string;
  let prisma: PrismaService;
  let redis: Redis;
  let passwordHash: string;
  let seq = 0;

  async function post(path: string, body?: unknown, accessToken?: string): Promise<{ status: number; json: Json }> {
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, json: text ? (JSON.parse(text) as Json) : {} };
  }

  async function createPlatformAccount(role: "PLATFORM_ADMIN" | "PLATFORM_SUPPORT" = "PLATFORM_ADMIN") {
    const username = `mfa_${tag}_${(seq += 1)}`;
    const account = await prisma.platformAccount.create({ data: { username, passwordHash, role } });
    platformIds.push(account.id);
    return { accountId: account.id, identifier: `platform/${username}` };
  }

  async function login(identifier: string): Promise<Json> {
    // TASK-IAM-006: nhân viên (`{slug}/nv.…`) đăng nhập ở cổng riêng.
    const path = identifier.startsWith("platform/")
      ? "/auth/platform/login"
      : identifier.includes("/nv.")
        ? "/auth/employee/login"
        : "/auth/operator/login";
    const { status, json } = await post(path, { identifier, password });
    expect(status).toBe(200);
    return json;
  }

  async function enroll(account: { accountId: string; identifier: string }): Promise<Enrolled> {
    const challenge = await login(account.identifier);
    expect(challenge).toMatchObject({ mfaRequired: true, enrollmentRequired: true });
    const secret = new URL(String(challenge.otpAuthUri)).searchParams.get("secret")!;
    const verified = await post("/auth/mfa/verify", {
      challengeToken: challenge.challengeToken,
      code: generateTotp(secret),
    });
    expect(verified.status).toBe(200);
    return {
      ...account,
      secret,
      backupCodes: verified.json.backupCodes as string[],
      accessToken: String(verified.json.accessToken),
      refreshToken: String(verified.json.refreshToken),
    };
  }

  async function mfaRows(subjectId: string) {
    return prisma.withSystem(async (tx) => ({
      credential: await tx.mfaCredential.findUnique({
        where: { subjectType_subjectId: { subjectType: "PLATFORM", subjectId } },
        include: { backupCodes: true },
      }),
      sessions: await tx.authSession.findMany({ where: { subjectId } }),
    }));
  }

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new ProblemDetailsExceptionFilter());
    configureApiRoutes(app);
    await app.listen(0, "127.0.0.1");
    base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/v1`;
    prisma = app.get(PrismaService);
    redis = app.get<Redis>(REDIS_CLIENT);

    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    // Chống xanh giả: superuser/BYPASSRLS thì phần RLS bên dưới vô nghĩa.
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error("DATABASE_URL phải là role app (IAM-003-guide §1), không phải superuser/BYPASSRLS.");
    }
    passwordHash = await new CredentialService().hash(password);

    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.create({
        data: { id: operatorId, operatorSlug, displayName: "MFA test", status: "ACTIVE" },
      });
      const owner = await tx.operatorAccount.create({
        data: { operatorId, operatorSlug, username: "owner", passwordHash, role: "OPERATOR_OWNER" },
      });
      const driver = await tx.employeeAccount.create({
        data: { operatorId, username: "nv.driver", passwordHash, role: "DRIVER" },
      });
      operatorAccountIds.push(owner.id);
      employeeIds.push(driver.id);
    });
  }, 60_000);

  beforeEach(async () => {
    // Mọi request đi từ loopback: bucket IP (30/giờ) tích luỹ qua các test → 429 giả.
    await redis.del("login:ip:127.0.0.1", "refresh:ip:127.0.0.1");
  });

  afterAll(async () => {
    if (prisma) {
      const subjects = [...platformIds, ...operatorAccountIds, ...employeeIds];
      await prisma.withSystem(async (tx) => {
        await tx.mfaCredential.deleteMany({ where: { subjectId: { in: subjects } } });
        await tx.authSession.deleteMany({ where: { subjectId: { in: subjects } } });
        await tx.employeeAccount.deleteMany({ where: { id: { in: employeeIds } } });
        await tx.operatorAccount.deleteMany({ where: { id: { in: operatorAccountIds } } });
        await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
      });
      await prisma.platformAccount.deleteMany({ where: { id: { in: platformIds } } });
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

  it("enrollment: password đúng chỉ ra challenge (không token, không session); verify TOTP mới ra token + 10 backup code", async () => {
    const account = await createPlatformAccount();
    const challenge = await login(account.identifier);

    expect(challenge).toMatchObject({ mfaRequired: true, enrollmentRequired: true, challengeExpiresIn: 300 });
    expect(challenge).not.toHaveProperty("accessToken");
    expect(challenge).not.toHaveProperty("refreshToken");
    expect((await mfaRows(account.accountId)).sessions).toHaveLength(0);

    // Redis: key là SHA-256 của token (không token thô), TTL ≤ 300, payload không có secret/token.
    const secret = new URL(String(challenge.otpAuthUri)).searchParams.get("secret")!;
    const key = challengeKeyOf(String(challenge.challengeToken));
    const ttl = await redis.ttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(300);
    const stored = JSON.stringify(await redis.hgetall(key));
    expect(stored).not.toContain(secret);
    expect(stored).not.toContain(String(challenge.challengeToken));
    // Payload niêm phong AES-GCM: cả subject id cũng không đọc được từ Redis.
    expect(stored).not.toContain(account.accountId);
    expect(await redis.keys(`*${String(challenge.challengeToken)}*`)).toEqual([]);
    // Chưa proof → chưa ghi credential.
    expect((await mfaRows(account.accountId)).credential).toBeNull();

    const verified = await post("/auth/mfa/verify", {
      challengeToken: challenge.challengeToken,
      code: generateTotp(secret),
    });
    expect(verified.status).toBe(200);
    expect(verified.json).toMatchObject({ mfaRequired: false, tokenType: "Bearer", scope: "platform" });
    const backupCodes = verified.json.backupCodes as string[];
    expect(backupCodes).toHaveLength(10);
    expect(new Set(backupCodes).size).toBe(10);
    expect(claimsOf(String(verified.json.accessToken))).toMatchObject({ mfa: true, role: "PLATFORM_ADMIN" });

    const rows = await mfaRows(account.accountId);
    const persisted = JSON.stringify(rows.credential, (_key, value: unknown) =>
      typeof value === "bigint" ? value.toString() : value,
    );
    expect(persisted).not.toContain(secret);
    for (const code of backupCodes) {
      expect(persisted).not.toContain(code);
      expect(persisted).not.toContain(code.replace(/-/g, ""));
    }
    expect(rows.credential?.backupCodes).toHaveLength(10);
    expect(rows.credential?.lastTotpCounter).not.toBeNull();
    expect(rows.sessions).toHaveLength(1);
    expect(rows.sessions[0]!.mfaVerifiedAt).toBeInstanceOf(Date);
    expect(await redis.exists(key)).toBe(0);

    // Challenge đã dùng → 401 generic, như challenge chưa từng tồn tại.
    const replay = await post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: nextTotp(secret) });
    const fake = await post("/auth/mfa/verify", { challengeToken: "x".repeat(43), code: "123456" });
    expect(replay).toEqual(fake);
    expect(replay).toMatchObject({ status: 401, json: { code: "AUTH_INVALID_CREDENTIALS" } });
  });

  it("login sau enrollment không trả otpAuthUri; backup code dùng được một lần và không trả lại danh sách", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const challenge = await login(enrolled.identifier);
    expect(challenge).toMatchObject({ mfaRequired: true, enrollmentRequired: false });
    expect(challenge).not.toHaveProperty("otpAuthUri");

    const code = enrolled.backupCodes[0]!;
    const verified = await post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code });
    expect(verified.status).toBe(200);
    expect(verified.json).not.toHaveProperty("backupCodes");

    const again = await login(enrolled.identifier);
    expect(
      await post("/auth/mfa/verify", { challengeToken: again.challengeToken, code: code.toLowerCase() }),
    ).toMatchObject({ status: 401, json: { code: "AUTH_INVALID_CREDENTIALS" } });
    const used = (await mfaRows(enrolled.accountId)).credential!.backupCodes.filter((row) => row.usedAt);
    expect(used).toHaveLength(1);
  });

  it("⭐ hai challenge song song cùng MỘT backup code → đúng một 200", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const [first, second] = [await login(enrolled.identifier), await login(enrolled.identifier)];
    const code = enrolled.backupCodes[1]!;

    const results = await Promise.all([
      post("/auth/mfa/verify", { challengeToken: first.challengeToken, code }),
      post("/auth/mfa/verify", { challengeToken: second.challengeToken, code }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 401]);
    const used = (await mfaRows(enrolled.accountId)).credential!.backupCodes.filter((row) => row.usedAt);
    expect(used).toHaveLength(1);
  });

  it("⭐ hai challenge song song cùng MỘT mã TOTP (cùng time-step) → đúng một 200 (anti-replay)", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const [first, second] = [await login(enrolled.identifier), await login(enrolled.identifier)];
    const code = nextTotp(enrolled.secret);

    const results = await Promise.all([
      post("/auth/mfa/verify", { challengeToken: first.challengeToken, code }),
      post("/auth/mfa/verify", { challengeToken: second.challengeToken, code }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 401]);
  });

  it("⭐ hai verify song song cùng MỘT challenge (hai backup code khác nhau) → đúng một 200, code thua không bị đốt", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const challenge = await login(enrolled.identifier);

    const results = await Promise.all([
      post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: enrolled.backupCodes[2] }),
      post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: enrolled.backupCodes[3] }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([200, 401]);
    const sessions = (await mfaRows(enrolled.accountId)).sessions;
    expect(sessions).toHaveLength(2); // enrollment + đúng một lần thắng
    expect((await mfaRows(enrolled.accountId)).credential!.backupCodes.filter((row) => row.usedAt)).toHaveLength(1);
  });

  it("5 lần sai làm challenge hết hiệu lực; mã đúng sau đó vẫn 401; sai định dạng → 400", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const challenge = await login(enrolled.identifier);
    const wrong = { challengeToken: challenge.challengeToken, code: "00000-00000-00000-00000" };

    expect((await post("/auth/mfa/verify", { ...wrong, code: "12ab" })).status).toBe(400);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect((await post("/auth/mfa/verify", wrong)).status).toBe(401);
    }
    expect(await redis.exists(challengeKeyOf(String(challenge.challengeToken)))).toBe(0);
    expect(
      await post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: enrolled.backupCodes[4] }),
    ).toMatchObject({ status: 401, json: { code: "AUTH_INVALID_CREDENTIALS" } });
    // Backup code không bị đốt bởi challenge đã chết.
    expect((await mfaRows(enrolled.accountId)).credential!.backupCodes.filter((row) => row.usedAt)).toHaveLength(0);
  });

  it("re-auth: đúng MỘT phương thức; TOTP/backup code cấp proof 5 phút, không mint token; replay → 401", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const sid = String(claimsOf(enrolled.accessToken).sid);
    const reauth = (body: Json) => post("/auth/re-auth", body, enrolled.accessToken);

    expect((await reauth({})).status).toBe(400);
    expect((await reauth({ password, mfaCode: "123456" })).status).toBe(400);

    const totp = nextTotp(enrolled.secret);
    const first = await reauth({ mfaCode: totp });
    expect(first).toEqual({ status: 200, json: { status: "ok" } });
    const ttl = await redis.ttl(`reauth:${sid}`);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(300);

    await redis.del(`reauth:${sid}`);
    expect(await reauth({ mfaCode: totp })).toMatchObject({ status: 401, json: { code: "AUTH_INVALID_CREDENTIALS" } });
    expect(await redis.exists(`reauth:${sid}`)).toBe(0);

    expect((await reauth({ mfaCode: enrolled.backupCodes[5] })).status).toBe(200);
    expect((await reauth({ mfaCode: enrolled.backupCodes[5] })).status).toBe(401);
    expect((await reauth({ password })).status).toBe(200);
    // Re-auth không tạo phiên mới.
    expect((await mfaRows(enrolled.accountId)).sessions).toHaveLength(1);
  });

  it("refresh giữ bằng chứng MFA; phiên role bắt buộc KHÔNG có MFA (trước rollout) → 401 AUTH_MFA_REQUIRED + family bị thu hồi", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const rotated = await post("/auth/refresh", { refreshToken: enrolled.refreshToken });
    expect(rotated.status).toBe(200);
    expect(claimsOf(String(rotated.json.accessToken)).mfa).toBe(true);
    const next = await prisma.withSystem((tx) =>
      tx.authSession.findUniqueOrThrow({ where: { id: String(claimsOf(String(rotated.json.accessToken)).sid) } }),
    );
    expect(next.mfaVerifiedAt).toBeInstanceOf(Date);

    const legacy = await createPlatformAccount();
    const { session, refreshToken } = await app
      .get(SessionService)
      .create({ type: "PLATFORM", id: legacy.accountId }, {});
    expect(await post("/auth/refresh", { refreshToken })).toMatchObject({
      status: 401,
      json: { code: "AUTH_MFA_REQUIRED" },
    });
    const revoked = await prisma.withSystem((tx) => tx.authSession.findUniqueOrThrow({ where: { id: session.id } }));
    expect(revoked.revokedAt).toBeInstanceOf(Date);
  });

  it("ma trận role: PLATFORM_SUPPORT + OPERATOR_OWNER phải MFA (challenge bind tenant); DRIVER nhận token ngay", async () => {
    expect(await login((await createPlatformAccount("PLATFORM_SUPPORT")).identifier)).toMatchObject({
      mfaRequired: true,
    });

    const ownerChallenge = await login(`${operatorSlug}/owner`);
    expect(ownerChallenge).toMatchObject({ mfaRequired: true, enrollmentRequired: true });
    expect(ownerChallenge).not.toHaveProperty("accessToken");
    const secret = new URL(String(ownerChallenge.otpAuthUri)).searchParams.get("secret")!;
    const owner = await post("/auth/mfa/verify", {
      challengeToken: ownerChallenge.challengeToken,
      code: generateTotp(secret),
    });
    expect(owner.status).toBe(200);
    expect(claimsOf(String(owner.json.accessToken))).toMatchObject({
      scope: "operator",
      role: "OPERATOR_OWNER",
      operatorId,
      operatorSlug,
      mfa: true,
    });

    const driver = await login(`${operatorSlug}/nv.driver`);
    expect(driver).toMatchObject({ mfaRequired: false, role: "DRIVER", tokenType: "Bearer" });
    expect(claimsOf(String(driver.accessToken))).not.toHaveProperty("mfa");
    await prisma.withSystem(async (tx) =>
      expect(await tx.mfaCredential.count({ where: { subjectId: employeeIds[0] } })).toBe(0),
    );
  });

  it("RLS: hai bảng MFA chỉ mở cho ngữ cảnh system — không ngữ cảnh / tenant / platform → 0 row, không ghi được", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const where = { subjectId: enrolled.accountId };

    expect(await prisma.mfaCredential.findMany({ where })).toEqual([]);
    expect(await prisma.mfaBackupCode.count()).toBe(0);
    expect(await prisma.withTenant(operatorId, (tx) => tx.mfaCredential.findMany({ where }))).toEqual([]);
    expect(await prisma.withPlatform((tx) => tx.mfaCredential.findMany({ where }))).toEqual([]);
    // Xoá được credential = login sau quay về enrollment chỉ bằng mật khẩu → phải 0 row.
    expect(await prisma.withPlatform((tx) => tx.mfaCredential.deleteMany({ where }))).toEqual({ count: 0 });
    expect(await prisma.mfaBackupCode.updateMany({ data: { usedAt: null } })).toEqual({ count: 0 });
    expect(await prisma.withSystem((tx) => tx.mfaCredential.count({ where }))).toBe(1);

    // CHECK: Passenger không có credential TOTP ở v1 (kể cả ngữ cảnh system).
    await expect(
      prisma.withSystem((tx) =>
        tx.mfaCredential.create({
          data: { subjectType: "PASSENGER", subjectId: `p-${tag}`, secretCiphertext: "v1.x.y.z" },
        }),
      ),
    ).rejects.toThrow();
  });

  it("⭐ hai enrollment song song của cùng account (Postgres thật): đúng một 200, secret thua KHÔNG ghi đè", async () => {
    const account = await createPlatformAccount();
    const [first, second] = [await login(account.identifier), await login(account.identifier)];
    const secrets = [first, second].map((challenge) => new URL(String(challenge.otpAuthUri)).searchParams.get("secret")!);

    const results = await Promise.all(
      [first, second].map((challenge, index) =>
        post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: generateTotp(secrets[index]!) }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([200, 401]);
    // Secret được lưu là của request thắng: mã của bên thắng dùng được, của bên thua thì không.
    const winner = secrets[results.findIndex((result) => result.status === 200)]!;
    const loser = secrets[results.findIndex((result) => result.status === 401)]!;
    const next = await login(account.identifier);
    expect(
      (await post("/auth/mfa/verify", { challengeToken: next.challengeToken, code: nextTotp(loser) })).status,
    ).toBe(401);
    const again = await login(account.identifier);
    expect(
      (await post("/auth/mfa/verify", { challengeToken: again.challengeToken, code: nextTotp(winner) })).status,
    ).toBe(200);
  });

  it("⭐ trần lần sai theo chủ thể (qua nhiều challenge): chạm trần → 429 kể cả mã đúng; đúng lại sau khi hết cửa sổ", async () => {
    const enrolled = await enroll(await createPlatformAccount());
    const failKey = `mfa-fail:platform:${enrolled.accountId}`;
    const wrong = "00000-00000-00000-00000";
    for (let challenge = 0; challenge < MFA_MAX_FAILURES_PER_WINDOW / MFA_MAX_CHALLENGE_ATTEMPTS; challenge += 1) {
      const { challengeToken } = await login(enrolled.identifier);
      for (let attempt = 0; attempt < MFA_MAX_CHALLENGE_ATTEMPTS; attempt += 1) {
        expect((await post("/auth/mfa/verify", { challengeToken, code: wrong })).status).toBe(401);
      }
    }
    expect(Number(await redis.get(failKey))).toBe(MFA_MAX_FAILURES_PER_WINDOW);
    const ttl = await redis.ttl(failKey);
    expect(ttl).toBeGreaterThan(23 * 3600);

    const locked = await login(enrolled.identifier);
    expect(
      await post("/auth/mfa/verify", { challengeToken: locked.challengeToken, code: enrolled.backupCodes[6] }),
    ).toMatchObject({ status: 429, json: { code: "AUTH_LOGIN_RATE_LIMITED" } });
    // Backup code không bị đốt khi đang bị khoá.
    expect((await mfaRows(enrolled.accountId)).credential!.backupCodes.filter((row) => row.usedAt)).toHaveLength(0);
    // Re-auth có bộ đếm RIÊNG: khoá login không kéo theo khoá re-auth, và ngược lại (phiên bị đánh cắp
    // cố ý sai re-auth không khoá được login của chủ account).
    expect((await post("/auth/re-auth", { mfaCode: enrolled.backupCodes[8] }, enrolled.accessToken)).status).toBe(200);
    await redis.set(`mfa-fail:reauth:platform:${enrolled.accountId}`, String(MFA_MAX_FAILURES_PER_WINDOW), "EX", 60);
    expect(await post("/auth/re-auth", { mfaCode: enrolled.backupCodes[9] }, enrolled.accessToken)).toMatchObject({
      status: 429,
    });
    await redis.del(`mfa-fail:reauth:platform:${enrolled.accountId}`);

    // Hết cửa sổ (giả lập bằng xoá bộ đếm) → mã đúng lại dùng được, và thành công thì reset bộ đếm.
    await redis.set(failKey, "3", "EX", 3600);
    const unlocked = await login(enrolled.identifier);
    expect(
      (await post("/auth/mfa/verify", { challengeToken: unlocked.challengeToken, code: enrolled.backupCodes[6] })).status,
    ).toBe(200);
    expect(await redis.exists(failKey)).toBe(0);
  });

  it("⭐ ai ghi được Redis cũng không dựng được challenge: payload tự viết / ghép từ challenge khác → 401", async () => {
    const victim = await enroll(await createPlatformAccount());
    const attacker = await enroll(await createPlatformAccount());
    const victimChallenge = await login(victim.identifier);
    const attackerChallenge = await login(attacker.identifier);
    const victimKey = challengeKeyOf(String(victimChallenge.challengeToken));
    const attackerKey = challengeKeyOf(String(attackerChallenge.challengeToken));

    // Ghép payload hợp lệ của challenge nạn nhân vào key challenge của kẻ tấn công.
    await redis.hset(attackerKey, "payload", (await redis.hget(victimKey, "payload"))!);
    expect(
      await post("/auth/mfa/verify", { challengeToken: attackerChallenge.challengeToken, code: victim.backupCodes[7] }),
    ).toMatchObject({ status: 401 });

    // Tự viết payload JSON trần trỏ vào nạn nhân.
    const forged = await login(attacker.identifier);
    await redis.hset(
      challengeKeyOf(String(forged.challengeToken)),
      "payload",
      JSON.stringify({ version: 1, subjectType: "PLATFORM", subjectId: victim.accountId, enrollmentRequired: false }),
    );
    expect(
      await post("/auth/mfa/verify", { challengeToken: forged.challengeToken, code: victim.backupCodes[7] }),
    ).toMatchObject({ status: 401 });
    expect((await mfaRows(victim.accountId)).sessions).toHaveLength(1); // chỉ phiên enrollment
  });

  it("script Lua trên Redis thật: tạo 1 lần, lease NX (BUSY), release/consume chỉ bằng đúng lease, hết hạn giữa chừng → không consume", async () => {
    const key = `mfa:challenge:script-${tag}`;
    const lock = `mfa:challenge-lock:script-${tag}`;
    const { create, claim, release, consume } = MFA_CHALLENGE_SCRIPTS;
    const max = String(MFA_MAX_CHALLENGE_ATTEMPTS);
    try {
      expect(await redis.eval(create, 1, key, "{}", "300")).toBe(1);
      expect(await redis.eval(create, 1, key, "{}", "300")).toBe(0);
      expect(await redis.ttl(key)).toBeGreaterThan(0);

      expect(await redis.eval(claim, 2, key, lock, "lease-a", "30", max)).toEqual(["OK", "{}"]);
      // Verifier thứ hai trong lúc lease còn → BUSY, không chen vào được.
      expect(await redis.eval(claim, 2, key, lock, "lease-b", "30", max)).toEqual(["BUSY"]);
      expect(await redis.eval(release, 2, key, lock, "lease-b", max)).toBe(0);
      expect(await redis.eval(consume, 2, key, lock, "lease-b")).toBe(0);
      expect(await redis.exists(key)).toBe(1);

      // Challenge hết TTL trong lúc đang giữ lease → consume phải từ chối.
      await redis.del(key);
      expect(await redis.eval(consume, 2, key, lock, "lease-a")).toBe(0);
      expect(await redis.exists(lock)).toBe(0);
      expect(await redis.eval(claim, 2, key, lock, "lease-c", "30", max)).toEqual(["MISSING"]);

      // Hết lượt: lần claim vượt trần xoá luôn challenge.
      await redis.eval(create, 1, key, "{}", "300");
      for (let attempt = 1; attempt <= MFA_MAX_CHALLENGE_ATTEMPTS; attempt += 1) {
        expect(await redis.eval(claim, 2, key, lock, `l${attempt}`, "30", max)).toEqual(["OK", "{}"]);
        expect(await redis.eval(release, 2, key, lock, `l${attempt}`, max)).toBe(1);
      }
      expect(await redis.exists(key)).toBe(0);
    } finally {
      await redis.del(key, lock);
    }
  });

  it("payload audit (gửi xuống Mongo) không chứa secret, backup code hay challenge token", async () => {
    const recorded = vi.spyOn(app.get(AuditService), "recordAuditEvent");
    try {
      const account = await createPlatformAccount();
      const challenge = await login(account.identifier);
      const secret = new URL(String(challenge.otpAuthUri)).searchParams.get("secret")!;
      await post("/auth/mfa/verify", { challengeToken: challenge.challengeToken, code: "00000-00000-00000-00000" });
      const verified = await post("/auth/mfa/verify", {
        challengeToken: challenge.challengeToken,
        code: generateTotp(secret),
      });
      expect(verified.status).toBe(200);
      const backupCodes = verified.json.backupCodes as string[];
      await post("/auth/re-auth", { mfaCode: backupCodes[0] }, String(verified.json.accessToken));

      const dump = JSON.stringify(recorded.mock.calls);
      for (const action of [
        "auth.mfa.challenge_issued",
        "auth.login.failure",
        "mfa_invalid",
        "auth.mfa.enrolled",
        "auth.mfa.backup_code_used",
      ]) {
        expect(dump).toContain(action);
      }
      expect(dump).not.toContain(secret);
      expect(dump).not.toContain(String(challenge.challengeToken));
      for (const code of backupCodes) {
        expect(dump).not.toContain(code);
        expect(dump).not.toContain(code.replace(/-/g, ""));
      }
    } finally {
      recorded.mockRestore();
    }
  });
});
