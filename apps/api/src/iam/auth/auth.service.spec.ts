import { Logger, type HttpException } from "@nestjs/common";
import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseAppConfig } from "../../config/env.config";
import { AuthController } from "./auth.controller";
import { AuthService, type LoginResult } from "./auth.service";

function setup() {
  const auth = {
    api: {
      sendVerificationOTP: vi.fn().mockResolvedValue({}),
      signInEmailOTP: vi.fn(),
      signInSocial: vi.fn(),
      getSession: vi.fn()
    }
  };
  const prisma = {
    session: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    user: { findUnique: vi.fn() },
    operatorProfile: { findUnique: vi.fn() },
    operatorAccount: { findUnique: vi.fn() },
    employeeAccount: { findUnique: vi.fn() },
    platformAccount: { findUnique: vi.fn() },
    // Ngữ cảnh RLS (IAM-003): unit test không có Postgres — chạy callback thẳng trên chính mock này.
    withSystem: vi.fn(),
    withTenant: vi.fn()
  };
  prisma.withSystem.mockImplementation((work: (tx: typeof prisma) => Promise<unknown>) => work(prisma));
  prisma.withTenant.mockImplementation((_operatorId: string, work: (tx: typeof prisma) => Promise<unknown>) =>
    work(prisma)
  );
  const tokens = {
    mintAccessToken: vi
      .fn()
      .mockResolvedValue({ accessToken: "tok", tokenType: "Bearer", expiresInSeconds: 900 })
  };
  const credentials = { verify: vi.fn(), hash: vi.fn() };
  const rateLimiter = {
    assertCanRequest: vi.fn().mockResolvedValue(undefined),
    assertCanAttemptLogin: vi.fn().mockResolvedValue(undefined),
    assertCanRefresh: vi.fn().mockResolvedValue(undefined),
    assertCanRotateFamily: vi.fn().mockResolvedValue(undefined),
    assertCanReauth: vi.fn().mockResolvedValue(undefined)
  };
  const history = { record: vi.fn().mockResolvedValue(undefined) };
  const sessions = {
    create: vi.fn(async (subject: { type: string; id: string; operatorId?: string; authEpoch?: number }) => ({
      session: sessionRow({ subjectType: subject.type, subjectId: subject.id, operatorId: subject.operatorId ?? null, authEpoch: subject.authEpoch ?? 0 }),
      refreshToken: "refresh-raw"
    })),
    rotate: vi.fn(),
    logout: vi.fn(),
    findById: vi.fn(),
    revokeFamily: vi.fn(),
    grantReauth: vi.fn(),
    recordEvent: vi.fn()
  };
  const mfa = {
    begin: vi.fn().mockResolvedValue({
      mfaRequired: true,
      challengeToken: "mfa-challenge-token-that-is-long-enough",
      enrollmentRequired: false,
      challengeExpiresIn: 300
    }),
    verifyChallenge: vi.fn(),
    verifyForSubject: vi.fn()
  };
  const passwordChanges = {
    begin: vi.fn().mockResolvedValue({
      passwordChangeRequired: true,
      passwordChangeToken: "password-change-token-that-is-long-enough",
      passwordChangeExpiresIn: 300
    }),
    changeRequiredPassword: vi.fn().mockResolvedValue(undefined)
  };
  const config = {
    AUTH_ALLOWED_CALLBACK_ORIGINS: ["http://localhost:3000", "vexenhanh://"],
    REFRESH_TOKEN_TTL_SECONDS: 2_592_000
  };

  const service = new AuthService(
    auth as never,
    config as never,
    prisma as never,
    tokens as never,
    credentials as never,
    rateLimiter as never,
    history as never,
    sessions as never,
    mfa as never,
    passwordChanges as never
  );
  return {
    service,
    auth,
    config,
    prisma,
    tokens,
    credentials,
    rateLimiter,
    history,
    sessions,
    mfa,
    passwordChanges
  };
}

function sessionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "sess-1",
    subjectType: "PASSENGER",
    subjectId: "user-9",
    userRef: "passenger:user-9",
    familyId: "fam-1",
    operatorId: null,
    authEpoch: 0,
    mfaVerifiedAt: null,
    revokedAt: null,
    ...overrides
  };
}

async function statusOf(promise: Promise<unknown>): Promise<number> {
  try {
    await promise;
    return 0;
  } catch (error) {
    return (error as HttpException).getStatus();
  }
}

async function problemOf(promise: Promise<unknown>): Promise<{ status: number; code?: string }> {
  try {
    await promise;
    return { status: 0 };
  } catch (error) {
    const exception = error as HttpException;
    return { status: exception.getStatus(), code: (exception.getResponse() as { code?: string }).code };
  }
}

const ACTIVE_OPERATOR = { id: "op-1", operatorSlug: "phuongtrang", status: "ACTIVE" };
const OWNER = {
  id: "acc-1",
  operatorId: "op-1",
  operatorSlug: "phuongtrang",
  username: "owner01",
  passwordHash: "scrypt$x$y",
  authEpoch: 0,
  role: "OPERATOR_OWNER",
  status: "ACTIVE",
  credentialDeliveryPending: false,
  passwordChangeRequired: false,
  temporaryPasswordExpiresAt: null
};

describe("AuthService.operatorLogin", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("từ chối owner có operatorId lệch với tenant resolve theo slug (cách ly tenant)", async () => {
    // `operator_accounts.operator_slug` là bản sao denormalized. Nếu nó lệch với
    // operator_profiles (đổi slug, tenant xoá rồi tạo lại) thì tra theo slug trả về account của
    // TENANT KHÁC — phải bị từ chối, nếu không tenant bị SUSPENDED vẫn login được và claim
    // operatorId/operatorSlug trong JWT sẽ trỏ hai tenant khác nhau.
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({ ...OWNER, operatorId: "op-KHAC" });
    ctx.prisma.employeeAccount.findUnique.mockResolvedValue(null);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "p", {}))).toBe(401);
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "failure", reason: "unknown_account" })
    );
  });

  it("MFA label dùng operatorSlug từ DB chứ không dùng nguyên input", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(true);

    await ctx.service.operatorLogin("PhuongTrang/owner01", "p", {});

    expect(ctx.mfa.begin).toHaveBeenCalledWith(
      { subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1", label: "phuongtrang/owner01" },
      {}
    );
  });

  it("giới hạn tần suất trước khi chạm DB hay chạy scrypt (Security §11)", async () => {
    ctx.rateLimiter.assertCanAttemptLogin.mockRejectedValue(new Error("limited"));

    await expect(
      ctx.service.operatorLogin("phuongtrang/owner01", "p", { ip: "1.2.3.4" })
    ).rejects.toThrow();
    expect(ctx.rateLimiter.assertCanAttemptLogin).toHaveBeenCalledWith(
      "phuongtrang/owner01",
      "1.2.3.4"
    );
    expect(ctx.prisma.operatorProfile.findUnique).not.toHaveBeenCalled();
    expect(ctx.credentials.verify).not.toHaveBeenCalled();
  });

  it("rejects when identifier is not operator namespace (FR-IAM-02c)", async () => {
    expect(await statusOf(ctx.service.operatorLogin("a@b.com", "p", {}))).toBe(401);
    expect(ctx.prisma.operatorProfile.findUnique).not.toHaveBeenCalled();
  });

  it("returns generic 401 when operator not found (no leak) and runs dummy verify", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(null);
    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "p", {}))).toBe(401);
    expect(ctx.credentials.verify).toHaveBeenCalledTimes(1); // dummy hash, timing equalised
  });

  it("returns generic 401 on bad password and records failure", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(false);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "bad", {}))).toBe(401);
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "failure", reason: "bad_password" })
    );
  });

  it("returns 403 when account is locked", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({ ...OWNER, status: "LOCKED" });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "good", {}))).toBe(403);
  });

  it("tài khoản đang chờ gửi mật khẩu không nhận challenge hay session", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({
      ...OWNER,
      credentialDeliveryPending: true,
      passwordChangeRequired: true,
      temporaryPasswordExpiresAt: new Date(Date.now() + 60_000)
    });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "temporary", {}))).toBe(403);
    expect(ctx.passwordChanges.begin).not.toHaveBeenCalled();
    expect(ctx.sessions.create).not.toHaveBeenCalled();
  });

  it("returns 403 when the tenant operator is suspended", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue({ ...ACTIVE_OPERATOR, status: "SUSPENDED" });
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/owner01", "good", {}))).toBe(403);
  });

  it("owner password đúng chỉ nhận MFA challenge, chưa nhận token", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(true);

    const result = await ctx.service.operatorLogin("phuongtrang/owner01", "good", {});
    expect(result).toMatchObject({ mfaRequired: true, challengeExpiresIn: 300 });
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
    expect(ctx.sessions.create).not.toHaveBeenCalled();
    expect(ctx.history.record).not.toHaveBeenCalledWith(expect.objectContaining({ result: "success" }));
  });

  it("mật khẩu tạm hợp lệ chỉ nhận password-change challenge, chưa tạo session/MFA", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({
      ...OWNER,
      passwordChangeRequired: true,
      temporaryPasswordExpiresAt: new Date(Date.now() + 60_000)
    });
    ctx.credentials.verify.mockResolvedValue(true);

    const result = await ctx.service.operatorLogin("phuongtrang/owner01", "temporary", {});

    expect(result).toMatchObject({ passwordChangeRequired: true, passwordChangeExpiresIn: 300 });
    expect(ctx.passwordChanges.begin).toHaveBeenCalledWith({
      subjectType: "OPERATOR",
      subjectId: "acc-1",
      operatorId: "op-1",
      authEpoch: 0
    });
    expect(ctx.mfa.begin).not.toHaveBeenCalled();
    expect(ctx.sessions.create).not.toHaveBeenCalled();
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("mật khẩu tạm hết hạn không cấp challenge, session hay token", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({
      ...OWNER,
      passwordChangeRequired: true,
      temporaryPasswordExpiresAt: new Date(Date.now() - 1)
    });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(
      await problemOf(ctx.service.operatorLogin("phuongtrang/owner01", "temporary", {}))
    ).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_REQUIRED" });
    expect(ctx.passwordChanges.begin).not.toHaveBeenCalled();
    expect(ctx.sessions.create).not.toHaveBeenCalled();
  });

  it("owner challenge giữ đúng subject OPERATOR + tenant cho bước verify", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(true);

    await ctx.service.operatorLogin("phuongtrang/owner01", "good", { ip: "1.2.3.4" });

    expect(ctx.mfa.begin).toHaveBeenCalledWith(
      expect.objectContaining({ subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1" }),
      { ip: "1.2.3.4" }
    );
    // Tenant đã biết → account đọc trong ngữ cảnh TENANT, không phải system (RLS tự chặn tenant khác).
    expect(ctx.prisma.withTenant).toHaveBeenCalledWith("op-1", expect.any(Function));
    expect(ctx.prisma.withSystem).not.toHaveBeenCalled();
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("sai mật khẩu thì KHÔNG tạo phiên", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(OWNER);
    ctx.credentials.verify.mockResolvedValue(false);

    await ctx.service.operatorLogin("phuongtrang/owner01", "bad", {}).catch(() => undefined);
    expect(ctx.sessions.create).not.toHaveBeenCalled();
  });

  it("falls back to employee_accounts when not an owner", async () => {
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(null);
    ctx.prisma.employeeAccount.findUnique.mockResolvedValue({
      id: "emp-1",
      operatorId: "op-1",
      username: "driver042",
      passwordHash: "scrypt$x$y",
      authEpoch: 0,
      role: "DRIVER",
      status: "ACTIVE",
      passwordChangeRequired: false,
      operator: ACTIVE_OPERATOR
    });
    ctx.credentials.verify.mockResolvedValue(true);

    const result = await ctx.service.operatorLogin("phuongtrang/driver042", "good", {});
    expect(result).toMatchObject({ role: "DRIVER", accessToken: "tok" });
    // Q2: employee KHÔNG được ghi thành OPERATOR — revoke-all của owner sẽ đá nhầm tài xế.
    expect(ctx.sessions.create).toHaveBeenCalledWith(
      { type: "EMPLOYEE", id: "emp-1", operatorId: "op-1", authEpoch: 0 },
      {}
    );
  });

  it("khóa Employee sau khi đọc password nhưng trước khi phát token: tự revoke session mới", async () => {
    const employee = {
      id: "emp-1",
      operatorId: "op-1",
      username: "driver042",
      passwordHash: "scrypt$x$y",
      authEpoch: 0,
      role: "DRIVER",
      status: "ACTIVE",
      passwordChangeRequired: false,
      operator: ACTIVE_OPERATOR
    };
    ctx.prisma.operatorProfile.findUnique.mockResolvedValue(ACTIVE_OPERATOR);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue(null);
    ctx.prisma.employeeAccount.findUnique
      .mockResolvedValueOnce(employee)
      .mockResolvedValueOnce({ ...employee, status: "LOCKED" });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.operatorLogin("phuongtrang/driver042", "good", {}))).toBe(403);
    expect(ctx.sessions.create).toHaveBeenCalledTimes(1);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });
});

describe("AuthService.platformLogin", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("rejects an operator-namespace identifier", async () => {
    expect(await statusOf(ctx.service.platformLogin("phuongtrang/owner01", "p", {}))).toBe(401);
  });

  it("platform password đúng chỉ nhận MFA challenge", async () => {
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({
      id: "padm-1",
      username: "khanh",
      passwordHash: "scrypt$x$y",
      role: "PLATFORM_ADMIN",
      status: "ACTIVE"
    });
    ctx.credentials.verify.mockResolvedValue(true);

    const result = await ctx.service.platformLogin("platform/khanh", "good", {});
    expect(result).toMatchObject({ mfaRequired: true, challengeExpiresIn: 300 });
    expect(ctx.mfa.begin).toHaveBeenCalledWith(
      { subjectType: "PLATFORM", subjectId: "padm-1", label: "platform/khanh" },
      {}
    );
    expect(ctx.sessions.create).not.toHaveBeenCalled();
  });

  it("account không tồn tại → 401 và VẪN chạy dummy verify (chống enumeration bằng timing)", async () => {
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(null);

    expect(await statusOf(ctx.service.platformLogin("platform/khong-co", "p", {}))).toBe(401);
    // Bỏ dummy verify là tạo ra chênh lệch thời gian đủ để dò xem username nào có thật.
    expect(ctx.credentials.verify).toHaveBeenCalledOnce();
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "platform", result: "failure", reason: "unknown_account" })
    );
  });

  it("account bị khoá → 403 (chỉ sau khi mật khẩu đã đúng, không leak trạng thái)", async () => {
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({
      id: "padm-2",
      username: "kh2",
      passwordHash: "scrypt$x$y",
      role: "PLATFORM_SUPPORT",
      status: "LOCKED"
    });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.platformLogin("platform/kh2", "good", {}))).toBe(403);
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("giới hạn tần suất áp cho cả cổng platform", async () => {
    ctx.rateLimiter.assertCanAttemptLogin.mockRejectedValue(new Error("limited"));
    await expect(ctx.service.platformLogin("platform/khanh", "p", {})).rejects.toThrow();
    expect(ctx.prisma.platformAccount.findUnique).not.toHaveBeenCalled();
  });
});

describe("AuthService.verifyMfa", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  /** MfaService thật chạy `precheck` sau khi proof đúng, trước khi tiêu proof — giả lập đúng thứ tự đó. */
  function proofAccepted(subject: Record<string, unknown>, extra: Record<string, unknown> = {}) {
    ctx.mfa.verifyChallenge.mockImplementation(
      async (_token: string, _code: string, _ctx: unknown, precheck: (s: unknown) => Promise<unknown>) => ({
        ...subject,
        enrolled: false,
        method: "totp",
        ...extra,
        checked: await precheck(subject)
      })
    );
  }

  it("proof hợp lệ mới tạo session MFA, mint token và trả 10 backup code lúc enrollment", async () => {
    const backupCodes = Array.from({ length: 10 }, (_, index) => `BACKUP-${index}`);
    proofAccepted({ subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1" }, { enrolled: true, backupCodes });
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({
      ...OWNER,
      operator: ACTIVE_OPERATOR
    });

    const result = await ctx.service.verifyMfa("challenge", "123456", { ip: "1.2.3.4" });

    expect(ctx.mfa.verifyChallenge).toHaveBeenCalledWith("challenge", "123456", { ip: "1.2.3.4" }, expect.any(Function));
    // Account nạp trong precheck rồi kiểm lại sau khi tạo session để đóng race lock/reset.
    expect(ctx.prisma.withTenant).toHaveBeenCalledTimes(2);
    expect(ctx.sessions.create).toHaveBeenCalledWith(
      { type: "OPERATOR", id: "acc-1", operatorId: "op-1", authEpoch: 0, mfaVerified: true },
      { ip: "1.2.3.4" }
    );
    expect(ctx.tokens.mintAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "acc-1",
        scope: "operator",
        role: "OPERATOR_OWNER",
        operatorId: "op-1",
        operatorSlug: "phuongtrang",
        mfa: true
      })
    );
    expect(result.backupCodes).toEqual(backupCodes);
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "success", targetId: "acc-1", role: "OPERATOR_OWNER" })
    );
  });

  it("MFA proof đã đúng nhưng Owner bị khóa trước khi phát token: session mới bị revoke", async () => {
    proofAccepted({ subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1" });
    ctx.prisma.operatorAccount.findUnique
      .mockResolvedValueOnce({ ...OWNER, operator: ACTIVE_OPERATOR })
      .mockResolvedValueOnce({ ...OWNER, status: "LOCKED", operator: ACTIVE_OPERATOR });

    expect(await statusOf(ctx.service.verifyMfa("challenge", "123456", {}))).toBe(403);
    expect(ctx.sessions.create).toHaveBeenCalledTimes(1);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("Owner đang chờ gửi mật khẩu không thể hoàn tất MFA challenge cũ", async () => {
    proofAccepted({ subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1" });
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({
      ...OWNER,
      credentialDeliveryPending: true,
      operator: ACTIVE_OPERATOR
    });

    expect(await statusOf(ctx.service.verifyMfa("challenge", "123456", {}))).toBe(403);
    expect(ctx.sessions.create).not.toHaveBeenCalled();
  });

  it("account bị khoá trong lúc challenge sống → 403 từ precheck (proof chưa bị tiêu), không phát token", async () => {
    proofAccepted({ subjectType: "PLATFORM", subjectId: "padm-1" });
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({
      id: "padm-1",
      username: "khanh",
      passwordHash: "x",
      role: "PLATFORM_ADMIN",
      status: "LOCKED"
    });

    expect(await statusOf(ctx.service.verifyMfa("challenge", "123456", { ip: "1.2.3.4" }))).toBe(403);
    expect(ctx.sessions.create).not.toHaveBeenCalled();
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "failure", reason: "account_inactive", targetId: "padm-1", ip: "1.2.3.4" })
    );
  });

  it("account đã bị xoá trong lúc challenge sống → 401 generic, không phát token", async () => {
    proofAccepted({ subjectType: "PLATFORM", subjectId: "padm-1" });
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(null);

    expect(await statusOf(ctx.service.verifyMfa("challenge", "123456", {}))).toBe(401);
    expect(ctx.sessions.create).not.toHaveBeenCalled();
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "failure", reason: "unknown_account" })
    );
  });
});

describe("AuthService passenger OTP", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("rate-limits then sends an OTP on request", async () => {
    await ctx.service.requestOtp("a@b.com");
    expect(ctx.rateLimiter.assertCanRequest).toHaveBeenCalledWith("a@b.com");
    expect(ctx.auth.api.sendVerificationOTP).toHaveBeenCalledWith({
      body: { email: "a@b.com", type: "sign-in" }
    });
  });

  it("does not include provider error details in OTP delivery logs", async () => {
    const errorLog = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    try {
      ctx.auth.api.sendVerificationOTP.mockRejectedValue(new Error("provider echoed OTP 123456"));
      await ctx.service.requestOtp("a@b.com");
      expect(errorLog).toHaveBeenCalled();
      expect(JSON.stringify(errorLog.mock.calls)).not.toContain("123456");
    } finally {
      errorLog.mockRestore();
    }
  });

  it("does not send when rate limit throws", async () => {
    ctx.rateLimiter.assertCanRequest.mockRejectedValue(new Error("limited"));
    await expect(ctx.service.requestOtp("a@b.com")).rejects.toThrow();
    expect(ctx.auth.api.sendVerificationOTP).not.toHaveBeenCalled();
  });

  it("issues a passenger token after a valid OTP", async () => {
    ctx.auth.api.signInEmailOTP.mockResolvedValue({ user: { id: "user-9" } });
    const result = await ctx.service.verifyOtp("a@b.com", "123456", {});
    expect(result).toMatchObject({ scope: "passenger", role: "PASSENGER", refreshToken: "refresh-raw" });
    expect(ctx.sessions.create).toHaveBeenCalledWith({ type: "PASSENGER", id: "user-9" }, {});
  });

  it("xoá phiên Better Auth vừa sinh ra — phiên thật là auth_sessions, phiên cầu nối không được sống", async () => {
    ctx.auth.api.signInEmailOTP.mockResolvedValue({ token: "ba-token", user: { id: "user-9" } });
    await ctx.service.verifyOtp("a@b.com", "123456", {});
    expect(ctx.prisma.session.deleteMany).toHaveBeenCalledWith({ where: { token: "ba-token" } });
  });

  it("KHÔNG gọi deleteMany khi thiếu token — `where: { token: undefined }` của Prisma là xoá sạch bảng", async () => {
    ctx.auth.api.signInEmailOTP.mockResolvedValue({ user: { id: "user-9" } });
    await ctx.service.verifyOtp("a@b.com", "123456", {});
    expect(ctx.prisma.session.deleteMany).not.toHaveBeenCalled();
    expect(ctx.tokens.mintAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "user-9", scope: "passenger" })
    );
  });

  it("returns generic 401 and records failure on invalid OTP", async () => {
    // Better Auth ném APIError có `status` cho lỗi phía client.
    ctx.auth.api.signInEmailOTP.mockRejectedValue(
      Object.assign(new Error("bad otp"), { status: "UNAUTHORIZED" })
    );
    expect(await statusOf(ctx.service.verifyOtp("a@b.com", "000000", {}))).toBe(401);
    expect(ctx.history.record).toHaveBeenCalledWith(
      expect.objectContaining({ result: "failure", reason: "otp_invalid" })
    );
  });

  it("KHÔNG biến lỗi hạ tầng thành 401 và không ghi audit sai sự thật", async () => {
    // Postgres/Redis chết ném Error thường (không có `status`). Map nó thành 401 sẽ ghi
    // `otp_invalid` vào audit append-only — làm hỏng chính bằng chứng dùng để điều tra sau này.
    ctx.auth.api.signInEmailOTP.mockRejectedValue(new Error("Connection terminated"));

    await expect(ctx.service.verifyOtp("a@b.com", "000000", {})).rejects.toThrow(
      "Connection terminated"
    );
    expect(ctx.history.record).not.toHaveBeenCalled();
  });
});

describe("AuthService OAuth + session exchange", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("returns the provider redirect URL for a supported provider", async () => {
    ctx.auth.api.signInSocial.mockResolvedValue({
      url: "https://accounts.google.com/o/oauth2/auth?x=1",
      redirect: true
    });
    const url = await ctx.service.oauthInit("google", "http://localhost:3000/cb");
    expect(url).toBe("https://accounts.google.com/o/oauth2/auth?x=1");
    expect(ctx.auth.api.signInSocial).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ provider: "google", disableRedirect: true })
      })
    );
  });

  it("rejects an unsupported OAuth provider with 400", async () => {
    expect(await statusOf(ctx.service.oauthInit("twitter", undefined))).toBe(400);
    expect(ctx.auth.api.signInSocial).not.toHaveBeenCalled();
  });

  it("v1 chỉ hỗ trợ Google — Facebook và Apple bị từ chối (defer v1.x)", async () => {
    for (const provider of ["facebook", "apple"]) {
      expect(await statusOf(ctx.service.oauthInit(provider, undefined))).toBe(400);
    }
    expect(ctx.auth.api.signInSocial).not.toHaveBeenCalled();
  });

  it("chặn callbackURL ngoài allowlist — open redirect sau xác thực", async () => {
    // Better Auth lưu nguyên callbackURL vào state rồi redirect tới đó SAU KHI đã set session
    // cookie; middleware origin-check của nó thoát sớm khi gọi server-side → phải chặn ở đây.
    for (const evil of [
      "https://vexenhanh-dangnhap.evil/",
      "http://localhost:3000.evil.com/cb",
      "javascript:alert(1)"
    ]) {
      expect(await statusOf(ctx.service.oauthInit("google", evil))).toBe(400);
    }
    expect(ctx.auth.api.signInSocial).not.toHaveBeenCalled();
  });

  it("cho phép deep-link scheme của mobile trong allowlist", async () => {
    ctx.auth.api.signInSocial.mockResolvedValue({ url: "https://accounts.google.com/x", redirect: true });
    await expect(
      ctx.service.oauthInit("google", "vexenhanh://oauth/callback")
    ).resolves.toBeTruthy();
  });

  it("returns 502 when the provider returns no URL", async () => {
    ctx.auth.api.signInSocial.mockResolvedValue({ redirect: true });
    expect(await statusOf(ctx.service.oauthInit("google", undefined))).toBe(502);
  });

  it("exchanges a valid Better Auth session for a passenger token", async () => {
    ctx.auth.api.getSession.mockResolvedValue({
      session: { token: "ba-oauth-token" },
      user: { id: "user-oauth-1" }
    });
    const result = await ctx.service.exchangeSession(new Headers(), {});
    // Cookie Better Auth còn trên trình duyệt không được đổi ra family mới lần thứ hai.
    expect(ctx.prisma.session.deleteMany).toHaveBeenCalledWith({ where: { token: "ba-oauth-token" } });
    expect(result).toMatchObject({ scope: "passenger", role: "PASSENGER", refreshToken: "refresh-raw" });
    expect(ctx.tokens.mintAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "user-oauth-1", scope: "passenger" })
    );
  });

  it("rejects session exchange when there is no session", async () => {
    ctx.auth.api.getSession.mockResolvedValue(null);
    expect(await statusOf(ctx.service.exchangeSession(new Headers(), {}))).toBe(401);
  });
});

describe("AuthService.refresh (IAM-002)", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  const rotatedEmployee = sessionRow({
    id: "sess-2",
    subjectType: "EMPLOYEE",
    subjectId: "emp-1",
    userRef: "employee:emp-1",
    operatorId: "op-1"
  });

  it("rate limit theo IP chạy TRƯỚC rotate — Redis chết thì không đụng Postgres", async () => {
    ctx.rateLimiter.assertCanRefresh.mockRejectedValue(new Error("503"));
    await expect(ctx.service.refresh("rt", { ip: "1.2.3.4" })).rejects.toThrow("503");
    expect(ctx.rateLimiter.assertCanRefresh).toHaveBeenCalledWith("1.2.3.4");
    expect(ctx.sessions.rotate).not.toHaveBeenCalled();
  });

  /** Giả lập `rotate` thật: chạy hook TRƯỚC khi "commit", hook ném thì không có phiên mới. */
  function rotateRunsHook(current: ReturnType<typeof sessionRow>, child: ReturnType<typeof sessionRow>) {
    ctx.sessions.rotate.mockImplementation(
      async (_raw: string, _ctx: unknown, beforeRotate: (s: unknown) => Promise<void>) => {
        await beforeRotate(current);
        return { session: child, refreshToken: "rt-2" };
      }
    );
  }

  it("gắn rate limit theo family vào rotate (chạy trước khi ghi row mới)", async () => {
    rotateRunsHook(rotatedEmployee, rotatedEmployee);
    ctx.rateLimiter.assertCanRotateFamily.mockRejectedValue(new Error("429"));
    await expect(ctx.service.refresh("rt", {})).rejects.toThrow("429");
    expect(ctx.rateLimiter.assertCanRotateFamily).toHaveBeenCalledWith("fam-1");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("IAM-004: phiên owner/admin KHÔNG có mfa_verified_at (cấp trước rollout) → revoke family MFA_REQUIRED + 401", async () => {
    const legacyAdmin = sessionRow({ subjectType: "PLATFORM", subjectId: "padm-1", userRef: "platform:padm-1" });
    rotateRunsHook(legacyAdmin, legacyAdmin);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({
      id: "padm-1",
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
      passwordHash: "x"
    });

    expect(await problemOf(ctx.service.refresh("rt", {}))).toMatchObject({ status: 401, code: "AUTH_MFA_REQUIRED" });
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "MFA_REQUIRED");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("IAM-004: phiên đã qua MFA → token mới giữ claim mfa", async () => {
    const mfaAdmin = sessionRow({
      subjectType: "PLATFORM",
      subjectId: "padm-1",
      userRef: "platform:padm-1",
      mfaVerifiedAt: new Date()
    });
    rotateRunsHook(mfaAdmin, mfaAdmin);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({
      id: "padm-1",
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
      passwordHash: "x"
    });

    await ctx.service.refresh("rt", {});
    expect(ctx.tokens.mintAccessToken).toHaveBeenCalledWith(expect.objectContaining({ role: "PLATFORM_ADMIN", mfa: true }));
  });

  it("role đổi tăng auth_epoch: refresh cũ bị thu hồi trước rotate commit", async () => {
    rotateRunsHook(rotatedEmployee, rotatedEmployee);
    ctx.prisma.employeeAccount.findUnique.mockResolvedValue({
      id: "emp-1",
      operatorId: "op-1",
      role: "TICKET_STAFF",
      status: "ACTIVE",
      authEpoch: 1,
      passwordHash: "scrypt$x$y",
      operator: ACTIVE_OPERATOR
    });

    expect(await statusOf(ctx.service.refresh("rt-1", {}))).toBe(401);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("account bị khoá hoặc tenant bị suspend → revoke cả family + 403, TRƯỚC khi rotate commit", async () => {
    rotateRunsHook(rotatedEmployee, rotatedEmployee);
    ctx.prisma.employeeAccount.findUnique.mockResolvedValue({
      id: "emp-1",
      operatorId: "op-1",
      role: "DRIVER",
      status: "ACTIVE",
      passwordHash: "x",
      operator: { ...ACTIVE_OPERATOR, status: "SUSPENDED" }
    });

    expect(await statusOf(ctx.service.refresh("rt-1", {}))).toBe(403);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("account thuộc tenant khác phiên (dữ liệu lệch) → coi như không có account", async () => {
    rotateRunsHook(rotatedEmployee, rotatedEmployee);
    ctx.prisma.employeeAccount.findUnique.mockResolvedValue({
      id: "emp-1",
      operatorId: "op-KHAC",
      role: "DRIVER",
      status: "ACTIVE",
      passwordHash: "x",
      operator: ACTIVE_OPERATOR
    });

    expect(await statusOf(ctx.service.refresh("rt-1", {}))).toBe(401);
    expect(ctx.prisma.withTenant).toHaveBeenCalledWith("op-1", expect.any(Function));
    expect(ctx.tokens.mintAccessToken).not.toHaveBeenCalled();
  });

  it("account đã biến mất → revoke family + 401", async () => {
    const platformRow = sessionRow({ subjectType: "PLATFORM", subjectId: "padm-x" });
    rotateRunsHook(platformRow, platformRow);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(null);

    expect(await statusOf(ctx.service.refresh("rt-1", {}))).toBe(401);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
  });
});

describe("AuthService.reauth (IAM-002, FR-IAM-10)", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  const platformSession = sessionRow({
    id: "sess-p",
    subjectType: "PLATFORM",
    subjectId: "padm-1",
    userRef: "platform:padm-1"
  });
  const platformUser = { sub: "padm-1", sid: "sess-p", scope: "platform" as const, role: "PLATFORM_ADMIN" };
  const platformAccount = {
    id: "padm-1",
    username: "khanh",
    passwordHash: "scrypt$x$y",
    role: "PLATFORM_ADMIN",
    status: "ACTIVE"
  };

  it("sai mật khẩu → 401, audit failure, KHÔNG cấp bằng chứng; có đi qua rate limit login", async () => {
    ctx.sessions.findById.mockResolvedValue(platformSession);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(platformAccount);
    ctx.credentials.verify.mockResolvedValue(false);

    expect(await statusOf(ctx.service.reauth(platformUser, { password: "bad" }, { ip: "1.2.3.4" }))).toBe(401);
    expect(ctx.rateLimiter.assertCanReauth).toHaveBeenCalledWith("platform:padm-1", "1.2.3.4");
    expect(ctx.sessions.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.reauth.failure", targetId: "sess-p" })
    );
    expect(ctx.sessions.grantReauth).not.toHaveBeenCalled();
  });

  it("đúng mật khẩu → cấp bằng chứng cho đúng sid + audit success", async () => {
    ctx.sessions.findById.mockResolvedValue(platformSession);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(platformAccount);
    ctx.credentials.verify.mockResolvedValue(true);

    await ctx.service.reauth(platformUser, { password: "good" }, {});
    expect(ctx.credentials.verify).toHaveBeenCalledWith("good", "scrypt$x$y");
    expect(ctx.sessions.grantReauth).toHaveBeenCalledWith("sess-p");
    expect(ctx.sessions.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "auth.reauth.success" })
    );
  });

  it("gửi otp thay vì password cho account mật khẩu → 401 (vẫn chạy scrypt để không lộ nhánh)", async () => {
    ctx.sessions.findById.mockResolvedValue(platformSession);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue(platformAccount);
    ctx.credentials.verify.mockResolvedValue(false);

    expect(await statusOf(ctx.service.reauth(platformUser, { otp: "123456" }, {}))).toBe(401);
    expect(ctx.credentials.verify).toHaveBeenCalledOnce();
    expect(ctx.sessions.grantReauth).not.toHaveBeenCalled();
  });

  it("mfaCode → xác thực bằng MFA của đúng chủ thể + tenant của phiên, không chạy scrypt", async () => {
    const ownerSession = sessionRow({
      id: "sess-o",
      subjectType: "OPERATOR",
      subjectId: "acc-1",
      userRef: "operator:acc-1",
      operatorId: "op-1"
    });
    ctx.sessions.findById.mockResolvedValue(ownerSession);
    ctx.prisma.operatorAccount.findUnique.mockResolvedValue({ ...OWNER, operator: ACTIVE_OPERATOR });
    ctx.mfa.verifyForSubject.mockResolvedValueOnce("backup_code").mockResolvedValueOnce(null);
    const ownerUser = { sub: "acc-1", sid: "sess-o", scope: "operator" as const, role: "OPERATOR_OWNER" };

    await ctx.service.reauth(ownerUser, { mfaCode: "10203-40506-70809-A0B0C" }, { ip: "1.2.3.4" });
    expect(ctx.mfa.verifyForSubject).toHaveBeenCalledWith(
      { subjectType: "OPERATOR", subjectId: "acc-1", operatorId: "op-1" },
      "10203-40506-70809-A0B0C",
      { ip: "1.2.3.4" }
    );
    expect(ctx.sessions.grantReauth).toHaveBeenCalledWith("sess-o");
    expect(ctx.credentials.verify).not.toHaveBeenCalled();

    expect(await statusOf(ctx.service.reauth(ownerUser, { mfaCode: "000000" }, {}))).toBe(401);
    expect(ctx.sessions.grantReauth).toHaveBeenCalledTimes(1);
  });

  it("đúng mật khẩu nhưng account đã bị khoá → revoke family + 403", async () => {
    ctx.sessions.findById.mockResolvedValue(platformSession);
    ctx.prisma.platformAccount.findUnique.mockResolvedValue({ ...platformAccount, status: "LOCKED" });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(await statusOf(ctx.service.reauth(platformUser, { password: "good" }, {}))).toBe(403);
    expect(ctx.sessions.revokeFamily).toHaveBeenCalledWith("fam-1", "ACCOUNT_LOCKED");
    expect(ctx.sessions.grantReauth).not.toHaveBeenCalled();
  });

  it("passenger re-auth bằng OTP gửi tới email của CHÍNH account trong phiên", async () => {
    ctx.sessions.findById.mockResolvedValue(sessionRow());
    ctx.prisma.user.findUnique.mockResolvedValue({ id: "user-9", email: "rider@example.com" });
    ctx.auth.api.signInEmailOTP.mockResolvedValue({ user: { id: "user-9" } });

    await ctx.service.reauth(
      { sub: "user-9", sid: "sess-1", scope: "passenger", role: "PASSENGER" },
      { otp: "123456" },
      {}
    );
    expect(ctx.auth.api.signInEmailOTP).toHaveBeenCalledWith({
      body: { email: "rider@example.com", otp: "123456" }
    });
    expect(ctx.sessions.grantReauth).toHaveBeenCalledWith("sess-1");
  });

  it("passenger sai OTP → 401", async () => {
    ctx.sessions.findById.mockResolvedValue(sessionRow());
    ctx.prisma.user.findUnique.mockResolvedValue({ id: "user-9", email: "rider@example.com" });
    ctx.auth.api.signInEmailOTP.mockRejectedValue(Object.assign(new Error("bad"), { status: 401 }));

    expect(
      await statusOf(
        ctx.service.reauth({ sub: "user-9", sid: "sess-1", scope: "passenger", role: "PASSENGER" }, { otp: "000000" }, {})
      )
    ).toBe(401);
    expect(ctx.sessions.grantReauth).not.toHaveBeenCalled();
  });

  it("phiên đã revoke → 401 trước cả rate limit", async () => {
    ctx.sessions.findById.mockResolvedValue(sessionRow({ revokedAt: new Date() }));
    expect(await statusOf(ctx.service.reauth(platformUser, { password: "good" }, {}))).toBe(401);
    expect(ctx.rateLimiter.assertCanReauth).not.toHaveBeenCalled();
  });
});

describe("AuthController trusted client IP", () => {
  it("passes a Cloudflare-confirmed IP to credential login", async () => {
    const { controller, operatorLogin } = setupAuthController();

    await controller.operatorLogin(
      { identifier: "phuongtrang/owner01", password: "password" },
      proxyRequest("203.0.113.10", "203.0.113.10")
    );

    expect(operatorLogin).toHaveBeenCalledWith(
      "phuongtrang/owner01",
      "password",
      expect.objectContaining({ ip: "203.0.113.10" })
    );
  });

  it("omits an unconfirmed IP and emits an operational warning", async () => {
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    const { controller, operatorLogin } = setupAuthController();

    try {
      await controller.operatorLogin(
        { identifier: "phuongtrang/owner01", password: "password" },
        proxyRequest("192.0.2.99", "203.0.113.10")
      );

      expect(operatorLogin).toHaveBeenCalledWith(
        "phuongtrang/owner01",
        "password",
        expect.objectContaining({ ip: undefined })
      );
      expect(warn).toHaveBeenCalledWith({
        event: "auth.proxy_ip_untrusted",
        cfRay: "test-ray-SIN"
      });
    } finally {
      warn.mockRestore();
    }
  });
});

function setupAuthController() {
  const result: LoginResult = {
    accessToken: "access-token",
    tokenType: "Bearer",
    expiresInSeconds: 900,
    scope: "operator",
    role: "OPERATOR_OWNER",
    refreshToken: "refresh-token",
    refreshExpiresInSeconds: 2_592_000
  };
  const operatorLogin = vi.fn().mockResolvedValue(result);
  const authService = { operatorLogin } as unknown as AuthService;
  const config = parseAppConfig({
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "https://api.example.com",
    JWT_ACCESS_PRIVATE_KEY: "test-key",
    MFA_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString("base64"),
    RESEND_API_KEY: "test-resend-key"
  });

  return { controller: new AuthController(authService, config), operatorLogin };
}

function proxyRequest(ip: string, cfConnectingIp: string): Request {
  return {
    ip,
    headers: {
      "cf-connecting-ip": cfConnectingIp,
      "cf-ray": "test-ray-SIN",
      "user-agent": "vitest"
    }
  } as unknown as Request;
}
