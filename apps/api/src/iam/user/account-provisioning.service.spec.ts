import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import type { PrismaService } from "../../database/prisma.service";
import type { EmailNotifier } from "../../external/notification/email-notifier";
import type { CredentialService } from "../auth/credential.service";
import type { Authorization } from "../role/authorization";
import type { SessionService } from "../session/session.service";
import type { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";
import { AccountProvisioningService, TEMPORARY_PASSWORD_TTL_MS } from "./account-provisioning.service";
import type { AccountActor } from "./account.types";

const admin: AccountActor = {
  sub: "admin-1",
  sid: "00000000-0000-4000-8000-000000000001",
  scope: "platform",
  role: "PLATFORM_ADMIN",
};
const platformAuthz = {
  permission: "account:lock",
  scope: "any",
  db: { kind: "platform" },
} as unknown as Authorization;
const input = {
  operatorId: "00000000-0000-4000-8000-000000000010",
  operatorSlug: "North-Bus",
  displayName: "North Bus",
  ownerUsername: "owner01",
  contactEmail: "OWNER@EXAMPLE.COM",
  reason: "KYC đã được duyệt",
};

function setup() {
  const operatorProfile = { create: vi.fn().mockResolvedValue({ id: input.operatorId }) };
  const operatorAccount = {
    create: vi.fn().mockResolvedValue({ version: 0 }),
    findFirst: vi.fn().mockResolvedValue({
      id: "owner-1",
      operatorId: input.operatorId,
      operatorSlug: "north-bus",
      username: "owner01",
      contactEmail: "owner@example.com",
      version: 0,
    }),
    updateManyAndReturn: vi.fn().mockResolvedValue([{ version: 1 }]),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
  };
  const tx = { operatorProfile, operatorAccount };
  const prisma = {
    withScope: vi.fn(async (_db: unknown, work: (value: typeof tx) => Promise<unknown>) => work(tx)),
  };
  const credentials = { hash: vi.fn().mockResolvedValue("scrypt$mock-hash") };
  const email = {
    sendOtp: vi.fn(),
    sendTemporaryPassword: vi.fn().mockResolvedValue(undefined),
  };
  const audit = { recordAuditEvent: vi.fn().mockResolvedValue(undefined) };
  const sessions = { hasRecentReauth: vi.fn().mockResolvedValue(true) };
  const emailLimiter = { reserve: vi.fn().mockResolvedValue(undefined) };
  const service = new AccountProvisioningService(
    prisma as unknown as PrismaService,
    credentials as unknown as CredentialService,
    email as EmailNotifier,
    audit as unknown as AuditService,
    sessions as unknown as SessionService,
    emailLimiter as unknown as TemporaryCredentialEmailLimiter,
  );
  return { audit, credentials, email, emailLimiter, operatorAccount, operatorProfile, prisma, service, sessions };
}

describe("AccountProvisioningService", () => {
  it("permits only PlatformAdmin", async () => {
    const ctx = setup();
    await expect(
      ctx.service.provisionOperatorOwner(
        { ...admin, role: "PLATFORM_SUPPORT" },
        platformAuthz,
        input,
      ),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      ctx.service.provisionOperatorOwner(
        { ...admin, scope: "operator", role: "OPERATOR_OWNER", operatorId: "operator-a" },
        platformAuthz,
        input,
      ),
    ).rejects.toMatchObject({ status: 403 });
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
  });

  it("requires a recent re-auth proof before audit or mutation", async () => {
    const ctx = setup();
    ctx.sessions.hasRecentReauth.mockResolvedValue(false);

    await expect(ctx.service.provisionOperatorOwner(admin, platformAuthz, input)).rejects.toMatchObject({
      status: 401,
      response: expect.objectContaining({ code: "AUTH_REAUTH_REQUIRED" }),
    });
    expect(ctx.audit.recordAuditEvent).not.toHaveBeenCalled();
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
  });

  it("writes fail-closed intent, creates pending Owner, delivers once, then clears only delivery flag", async () => {
    const ctx = setup();
    const before = Date.now();
    const result = await ctx.service.provisionOperatorOwner(admin, platformAuthz, input);
    const after = Date.now();

    expect(ctx.audit.recordAuditEvent.mock.calls[0][0]).toMatchObject({
      action: "iam.operator.provision.intent",
      targetId: input.operatorId,
    });
    expect(ctx.operatorAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          operatorSlug: "north-bus",
          contactEmail: "owner@example.com",
          status: "ACTIVE",
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
        }),
      }),
    );
    const mail = ctx.email.sendTemporaryPassword.mock.calls[0][0];
    const secret = mail.temporaryPassword as string;
    expect(mail.loginIdentifier).toBe("north-bus/owner01");
    expect(mail.expiresAt.getTime()).toBeGreaterThanOrEqual(before + TEMPORARY_PASSWORD_TTL_MS);
    expect(mail.expiresAt.getTime()).toBeLessThanOrEqual(after + TEMPORARY_PASSWORD_TTL_MS);
    expect(ctx.operatorAccount.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ credentialDeliveryPending: true, version: 0 }),
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
      }),
    );
    expect(result).toEqual({
      operatorId: input.operatorId,
      ownerAccountId: expect.any(String),
    });
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(JSON.stringify(ctx.audit.recordAuditEvent.mock.calls)).not.toContain(secret);
  });

  it("does not mutate when the intent audit fails", async () => {
    const ctx = setup();
    ctx.audit.recordAuditEvent.mockRejectedValueOnce(new Error("Mongo down"));

    await expect(ctx.service.provisionOperatorOwner(admin, platformAuthz, input)).rejects.toThrow("Mongo down");
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
    expect(ctx.email.sendTemporaryPassword).not.toHaveBeenCalled();
  });

  it("rejects an exhausted email budget before hashing a provision credential", async () => {
    const ctx = setup();
    ctx.emailLimiter.reserve.mockRejectedValueOnce({ status: 429 });

    await expect(ctx.service.provisionOperatorOwner(admin, platformAuthz, input))
      .rejects.toMatchObject({ status: 429 });
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
  });

  it("leaves the Owner delivery-pending when email delivery fails", async () => {
    const ctx = setup();
    ctx.email.sendTemporaryPassword.mockRejectedValue(new Error("Resend down"));

    await expect(ctx.service.provisionOperatorOwner(admin, platformAuthz, input)).rejects.toMatchObject({
      status: 503,
    });
    expect(ctx.operatorAccount.create.mock.calls[0][0].data.credentialDeliveryPending).toBe(true);
    expect(ctx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("retries only delivery-pending Owner and increments auth epoch without changing disciplinary status", async () => {
    const ctx = setup();
    await ctx.service.retryOwnerDelivery(
      admin,
      platformAuthz,
      { operatorSlug: "North-Bus", ownerUsername: "owner01", reason: "Resend retry" },
    );

    expect(ctx.operatorAccount.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        operatorSlug: "north-bus",
        username: "owner01",
        credentialDeliveryPending: true,
        passwordChangeRequired: true,
      }),
    }));
    expect(ctx.operatorAccount.updateManyAndReturn).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ version: 0 }),
      data: expect.objectContaining({
        passwordHash: "scrypt$mock-hash",
        authEpoch: { increment: 1 },
        version: { increment: 1 },
      }),
    }));
    expect(ctx.email.sendTemporaryPassword).toHaveBeenCalledWith(expect.objectContaining({
      loginIdentifier: "north-bus/owner01",
    }));
    expect(ctx.operatorAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { credentialDeliveryPending: false, version: { increment: 1 } },
    }));
  });

  it("retry vẫn giữ cờ chờ gửi khi lần gửi sau tiếp tục lỗi", async () => {
    const ctx = setup();
    ctx.email.sendTemporaryPassword.mockRejectedValue(new Error("Resend down"));

    await expect(ctx.service.retryOwnerDelivery(
      admin,
      platformAuthz,
      { operatorSlug: "north-bus", ownerUsername: "owner01", reason: "Resend retry" },
    )).rejects.toMatchObject({ status: 503 });
    expect(ctx.operatorAccount.updateMany).not.toHaveBeenCalled();
  });

  it("retry từ chối reason rỗng trước audit và cập nhật credential", async () => {
    const ctx = setup();

    await expect(ctx.service.retryOwnerDelivery(
      admin,
      platformAuthz,
      { operatorSlug: "north-bus", ownerUsername: "owner01", reason: "  " },
    )).rejects.toThrow(/requires a reason/);
    expect(ctx.audit.recordAuditEvent).not.toHaveBeenCalled();
    expect(ctx.operatorAccount.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it("retry bị giới hạn email không thực hiện phép hash scrypt", async () => {
    const ctx = setup();
    ctx.emailLimiter.reserve.mockRejectedValueOnce({ status: 429 });

    await expect(ctx.service.retryOwnerDelivery(
      admin,
      platformAuthz,
      { operatorSlug: "north-bus", ownerUsername: "owner01", reason: "Resend retry" },
    )).rejects.toMatchObject({ status: 429 });
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.operatorAccount.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it.each([
    { operatorSlug: "platform" },
    { ownerUsername: "bad/name" },
    { contactEmail: "first@example.com,second@example.com" },
  ])("rejects invalid internal provision input before audit", async (override) => {
    const ctx = setup();
    await expect(ctx.service.provisionOperatorOwner(admin, platformAuthz, {
      ...input,
      ...override,
    })).rejects.toMatchObject({ status: 400 });
    expect(ctx.audit.recordAuditEvent).not.toHaveBeenCalled();
    expect(ctx.emailLimiter.reserve).not.toHaveBeenCalled();
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
  });
});
