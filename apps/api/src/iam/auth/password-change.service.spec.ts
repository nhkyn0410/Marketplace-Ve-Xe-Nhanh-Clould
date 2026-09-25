import { createHash } from "node:crypto";
import { type HttpException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionRevokeReason, SubjectType } from "../../database/prisma.types";
import { resolveEncryptionKey } from "./mfa.service";
import { PasswordChangeService } from "./password-change.service";
import { sealMfaValue } from "./totp";

const testConfig = { NODE_ENV: "test", BETTER_AUTH_SECRET: "unit-test-secret" } as const;

function setup() {
  const values = new Map<string, string>();
  const redis = {
    set: vi.fn(async (key: string, value: string) => {
      if (values.has(key)) {
        return null;
      }
      values.set(key, value);
      return "OK";
    }),
    eval: vi.fn(async (_script: string, _keyCount: number, key: string) => {
      const value = values.get(key);
      values.delete(key);
      return value ?? null;
    })
  };
  const account = {
    id: "owner-1",
    operatorId: "operator-1",
    status: "ACTIVE",
    passwordHash: "temporary-password-hash",
    authEpoch: 0,
    credentialDeliveryPending: false,
    passwordChangeRequired: true,
    temporaryPasswordExpiresAt: new Date(Date.now() + 60_000),
    operator: { status: "ACTIVE" }
  };
  const tx = {
    operatorAccount: {
      findFirst: vi.fn().mockResolvedValue(account),
      updateMany: vi.fn().mockResolvedValue({ count: 1 })
    },
    employeeAccount: {
      findFirst: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 })
    }
  };
  const prisma = {
    withTenant: vi.fn((_operatorId: string, work: (tenantTx: typeof tx) => unknown) => work(tx))
  };
  const credentials = {
    verify: vi.fn().mockResolvedValue(false),
    hash: vi.fn().mockResolvedValue("new-password-hash")
  };
  const sessions = { revokeAllForSubject: vi.fn().mockResolvedValue(0) };
  const limiter = { clearMfaFailures: vi.fn().mockResolvedValue(undefined) };
  const audit = { recordAuditEvent: vi.fn().mockResolvedValue(undefined) };
  const service = new PasswordChangeService(
    testConfig as never,
    redis as never,
    prisma as never,
    credentials as never,
    sessions as never,
    limiter as never,
    audit as never
  );

  return { service, redis, values, account, tx, prisma, credentials, sessions, limiter, audit };
}

async function problemOf(promise: Promise<unknown>): Promise<{ status: number; code?: string }> {
  try {
    await promise;
    return { status: 0 };
  } catch (error) {
    const exception = error as HttpException;
    return {
      status: exception.getStatus(),
      code: (exception.getResponse() as { code?: string }).code
    };
  }
}

describe("PasswordChangeService", () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  it("lưu challenge đã mã hóa và chỉ trả opaque token", async () => {
    const result = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });

    expect(result).toMatchObject({
      passwordChangeRequired: true,
      passwordChangeExpiresIn: 300
    });
    expect(result.passwordChangeToken).toHaveLength(43);
    const stored = [...ctx.values.values()][0];
    expect(stored).toBeTypeOf("string");
    expect(stored).not.toContain("owner-1");
    expect(ctx.redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^password-change:[a-f0-9]{64}$/),
      expect.any(String),
      "EX",
      300,
      "NX"
    );
  });

  it("đổi mật khẩu một lần, thu hồi mọi session và xóa cờ bắt buộc", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });

    await ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      { ip: "203.0.113.77", userAgent: "Mozilla/5.0" }
    );

    expect(ctx.prisma.withTenant).toHaveBeenCalledWith("operator-1", expect.any(Function));
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledWith(
      SubjectType.OPERATOR,
      "owner-1",
      SessionRevokeReason.PASSWORD_RESET
    );
    expect(ctx.tx.operatorAccount.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: "owner-1",
        operatorId: "operator-1",
        authEpoch: 0,
        status: "ACTIVE",
        operator: { status: "ACTIVE" },
        credentialDeliveryPending: false,
        passwordHash: "temporary-password-hash",
        passwordChangeRequired: true
      }),
      data: {
        passwordHash: "new-password-hash",
        authEpoch: { increment: 1 },
        version: { increment: 1 },
        passwordChangeRequired: false,
        temporaryPasswordExpiresAt: null
      }
    });
    expect(ctx.limiter.clearMfaFailures).toHaveBeenCalledWith("operator:owner-1");
    expect(ctx.audit.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "auth.password_change.intent",
        operatorId: "operator-1",
        after: { ip: "203.0.113.0/24", device: "web" }
      })
    );

    await expect(
      ctx.service.changeRequiredPassword(
        challenge.passwordChangeToken,
        "another-new-password",
        {}
      )
    ).rejects.toMatchObject({ status: 401 });
    expect(ctx.tx.operatorAccount.updateMany).toHaveBeenCalledTimes(1);
  });

  it("hai consume đồng thời chỉ cho phép đúng một lần đổi mật khẩu", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });

    const results = await Promise.allSettled([
      ctx.service.changeRequiredPassword(
        challenge.passwordChangeToken,
        "a-new-password-that-is-long",
        {}
      ),
      ctx.service.changeRequiredPassword(
        challenge.passwordChangeToken,
        "a-different-password-that-is-long",
        {}
      )
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: expect.objectContaining({ status: 401 })
    });
    expect(ctx.tx.operatorAccount.updateMany).toHaveBeenCalledTimes(1);
  });

  it("từ chối dùng lại mật khẩu tạm và không thay đổi DB", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.credentials.verify.mockResolvedValue(true);

    expect(
      await problemOf(
        ctx.service.changeRequiredPassword(challenge.passwordChangeToken, "temporary-password", {})
      )
    ).toEqual({ status: 400, code: "AUTH_PASSWORD_REUSE_FORBIDDEN" });
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
    expect(ctx.sessions.revokeAllForSubject).not.toHaveBeenCalled();
  });

  it("challenge hết hạn hoặc account không còn hợp lệ trả cùng lỗi generic", async () => {
    const missing = await problemOf(
      ctx.service.changeRequiredPassword("x".repeat(43), "a-new-password-that-is-long", {})
    );

    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.tx.operatorAccount.findFirst.mockResolvedValue({
      ...ctx.account,
      temporaryPasswordExpiresAt: new Date(Date.now() - 1)
    });
    const expired = await problemOf(
      ctx.service.changeRequiredPassword(
        challenge.passwordChangeToken,
        "a-new-password-that-is-long",
        {}
      )
    );

    expect(missing).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(expired).toEqual(missing);
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("reset sau khi cấp challenge làm token cũ vô hiệu dù hash hiện tại đã đổi", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.tx.operatorAccount.findFirst.mockResolvedValue({
      ...ctx.account,
      authEpoch: 1,
      passwordHash: "replacement-temporary-password-hash"
    });

    expect(await problemOf(ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      {}
    ))).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
    expect(ctx.sessions.revokeAllForSubject).not.toHaveBeenCalled();
  });

  it("trạng thái đổi sau read vẫn bị chặn ở lệnh ghi có điều kiện", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.tx.operatorAccount.updateMany.mockResolvedValueOnce({ count: 0 });

    expect(await problemOf(ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      {}
    ))).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(ctx.tx.operatorAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: "ACTIVE",
        authEpoch: 0,
        operator: { status: "ACTIVE" },
        credentialDeliveryPending: false
      })
    }));
  });

  it("tenant bị đình chỉ sau khi cấp challenge thì không được đổi mật khẩu", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.tx.operatorAccount.findFirst.mockResolvedValue({
      ...ctx.account,
      operator: { status: "SUSPENDED" }
    });

    expect(await problemOf(ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      {}
    ))).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("tài khoản đang chờ gửi mật khẩu không được dùng challenge", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.tx.operatorAccount.findFirst.mockResolvedValue({
      ...ctx.account,
      credentialDeliveryPending: true
    });

    expect(await problemOf(ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      {}
    ))).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("challenge v1 chưa gắn authEpoch bị từ chối fail-closed", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    const tokenHash = createHash("sha256").update(challenge.passwordChangeToken).digest("hex");
    ctx.values.set(
      `password-change:${tokenHash}`,
      sealMfaValue(
        JSON.stringify({ version: 1, subjectType: SubjectType.OPERATOR, subjectId: "owner-1", operatorId: "operator-1" }),
        resolveEncryptionKey(testConfig as never),
        `password-change-challenge:${tokenHash}`
      )
    );

    expect(await problemOf(ctx.service.changeRequiredPassword(
      challenge.passwordChangeToken,
      "a-new-password-that-is-long",
      {}
    ))).toEqual({ status: 401, code: "AUTH_PASSWORD_CHANGE_TOKEN_INVALID" });
    expect(ctx.tx.operatorAccount.findFirst).not.toHaveBeenCalled();
  });

  it("audit intent fail-closed trước khi thu hồi session hay đổi mật khẩu", async () => {
    const challenge = await ctx.service.begin({
      subjectType: SubjectType.OPERATOR,
      subjectId: "owner-1",
      operatorId: "operator-1",
      authEpoch: 0
    });
    ctx.audit.recordAuditEvent.mockRejectedValueOnce(new Error("audit unavailable"));

    await expect(
      ctx.service.changeRequiredPassword(
        challenge.passwordChangeToken,
        "a-new-password-that-is-long",
        {}
      )
    ).rejects.toThrow("audit unavailable");
    expect(ctx.sessions.revokeAllForSubject).not.toHaveBeenCalled();
    expect(ctx.tx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("Redis lỗi thì fail-closed 503", async () => {
    ctx.redis.set.mockRejectedValueOnce(new Error("redis unavailable"));

    expect(
      await problemOf(
        ctx.service.begin({
          subjectType: SubjectType.OPERATOR,
          subjectId: "owner-1",
          operatorId: "operator-1",
          authEpoch: 0
        })
      )
    ).toEqual({ status: 503, code: "SERVICE_UNAVAILABLE" });
  });
});
