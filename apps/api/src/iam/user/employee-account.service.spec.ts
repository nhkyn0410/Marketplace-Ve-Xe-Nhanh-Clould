import type { AuditService } from "../../audit/audit.service";
import type { PrismaService } from "../../database/prisma.service";
import type { EmailNotifier } from "../../external/notification/email-notifier";
import type { CredentialService } from "../auth/credential.service";
import type { Authorization } from "../role/authorization";
import type { SessionService } from "../session/session.service";
import type { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";
import type { AccountActor } from "./account.types";
import { EmployeeAccountService } from "./employee-account.service";
import { describe, expect, it, vi } from "vitest";

const actor: AccountActor = {
  sub: "owner-1",
  sid: "00000000-0000-4000-8000-000000000001",
  scope: "operator",
  role: "OPERATOR_OWNER",
  operatorId: "operator-a",
  operatorSlug: "operator-a",
};
const authz = {
  permission: "employee:manage",
  scope: "tenant",
  db: { kind: "tenant", operatorId: "operator-a" },
} as unknown as Authorization;

function row(
  overrides: Partial<{
    id: string;
    username: string;
    contactEmail: string | null;
    role: "DRIVER" | "TICKET_STAFF" | "SUPPORT_STAFF";
    status: "ACTIVE" | "LOCKED" | "DISABLED";
    credentialDeliveryPending: boolean;
    version: number;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: overrides.id ?? "00000000-0000-4000-8000-000000000099",
    operatorId: "operator-a",
    username: overrides.username ?? "driver01",
    contactEmail: overrides.contactEmail === undefined ? "driver@example.com" : overrides.contactEmail,
    role: overrides.role ?? ("DRIVER" as const),
    status: overrides.status ?? ("ACTIVE" as const),
    credentialDeliveryPending: overrides.credentialDeliveryPending ?? false,
    version: overrides.version ?? 0,
    createdAt: new Date("2026-09-22T00:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2026-09-22T00:00:00.000Z"),
  };
}

function setup() {
  const employeeAccount = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    updateManyAndReturn: vi.fn(),
  };
  const tx = { employeeAccount };
  const prisma = {
    withScope: vi.fn(async (_db: unknown, work: (value: typeof tx) => Promise<unknown>) =>
      work(tx),
    ),
  };
  const credentials = { hash: vi.fn().mockResolvedValue("scrypt$mock-hash") };
  const email = {
    sendOtp: vi.fn(),
    sendTemporaryPassword: vi.fn().mockResolvedValue(undefined),
  };
  const audit = { recordAuditEvent: vi.fn().mockResolvedValue(undefined) };
  const sessions = {
    hasRecentReauth: vi.fn().mockResolvedValue(true),
    revokeAllForSubject: vi.fn().mockResolvedValue(1),
  };
  const emailLimiter = { reserve: vi.fn().mockResolvedValue(undefined) };
  const service = new EmployeeAccountService(
    prisma as unknown as PrismaService,
    credentials as unknown as CredentialService,
    email as EmailNotifier,
    audit as unknown as AuditService,
    sessions as unknown as SessionService,
    emailLimiter as unknown as TemporaryCredentialEmailLimiter,
  );
  return { audit, credentials, email, emailLimiter, employeeAccount, prisma, service, sessions };
}

describe("EmployeeAccountService", () => {
  it("creates delivery-pending, delivers once, clears pending flag, and never leaks password", async () => {
    const ctx = setup();
    const pending = row({ credentialDeliveryPending: true });
    const active = row({ version: 1, credentialDeliveryPending: false });
    ctx.employeeAccount.create.mockResolvedValue(pending);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([active]);

    const result = await ctx.service.create(actor, authz, {
      username: "driver01",
      contactEmail: "DRIVER@EXAMPLE.COM",
      role: "DRIVER",
      reason: "Nhân viên mới",
    });

    expect(ctx.employeeAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          operatorId: "operator-a",
          status: "ACTIVE",
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
          contactEmail: "driver@example.com",
        }),
      }),
    );
    expect(ctx.email.sendTemporaryPassword).toHaveBeenCalledOnce();
    expect(ctx.employeeAccount.updateManyAndReturn).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ credentialDeliveryPending: true, version: 0 }),
      data: { credentialDeliveryPending: false, version: { increment: 1 } },
    }));
    const secret = ctx.email.sendTemporaryPassword.mock.calls[0][0].temporaryPassword as string;
    expect(secret).toHaveLength(32);
    expect(result).toMatchObject({
      username: "driver01",
      status: "ACTIVE",
      credentialDeliveryPending: false,
    });
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(JSON.stringify(ctx.audit.recordAuditEvent.mock.calls)).not.toContain(secret);
  });

  it("keeps the account delivery-pending and reports its ID in 503 when delivery fails", async () => {
    const ctx = setup();
    ctx.employeeAccount.create.mockResolvedValue(row());
    ctx.email.sendTemporaryPassword.mockRejectedValue(new Error("provider down"));

    const failed = ctx.service.create(actor, authz, {
      username: "driver01",
      contactEmail: "driver@example.com",
      role: "DRIVER",
      reason: "Nhân viên mới",
    });
    await expect(failed).rejects.toMatchObject({
      status: 503,
    });

    expect(ctx.employeeAccount.create.mock.calls[0][0].data.credentialDeliveryPending).toBe(true);
    const employeeId = ctx.employeeAccount.create.mock.calls[0][0].data.id as string;
    await expect(failed).rejects.toMatchObject({
      response: expect.objectContaining({ detail: expect.stringContaining(employeeId) }),
    });
    expect(ctx.employeeAccount.updateManyAndReturn).not.toHaveBeenCalled();
  });

  it("fails closed before DB mutation when the audit intent cannot be written", async () => {
    const ctx = setup();
    ctx.audit.recordAuditEvent.mockRejectedValueOnce(new Error("Mongo down"));

    await expect(
      ctx.service.create(actor, authz, {
        username: "driver01",
        contactEmail: "driver@example.com",
        role: "DRIVER",
        reason: "Nhân viên mới",
      }),
    ).rejects.toThrow("Mongo down");
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.employeeAccount.create).not.toHaveBeenCalled();
    expect(ctx.email.sendTemporaryPassword).not.toHaveBeenCalled();
  });

  it("does not create an account when the credential email budget is exhausted", async () => {
    const ctx = setup();
    ctx.emailLimiter.reserve.mockRejectedValueOnce({ status: 429 });

    await expect(ctx.service.create(actor, authz, {
      username: "driver01",
      contactEmail: "driver@example.com",
      role: "DRIVER",
      reason: "Nhân viên mới",
    })).rejects.toMatchObject({ status: 429 });
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.employeeAccount.create).not.toHaveBeenCalled();
    expect(ctx.email.sendTemporaryPassword).not.toHaveBeenCalled();
  });

  it("rejects a mismatched tenant before querying", async () => {
    const ctx = setup();
    const wrongAuthz = {
      ...authz,
      db: { kind: "tenant", operatorId: "operator-b" },
    } as unknown as Authorization;

    await expect(ctx.service.list(actor, wrongAuthz, { limit: 20 })).rejects.toMatchObject({
      status: 403,
    });
    expect(ctx.prisma.withScope).not.toHaveBeenCalled();
  });

  it("filters list queries by the JWT tenant", async () => {
    const ctx = setup();
    ctx.employeeAccount.findMany.mockResolvedValue([row()]);

    await expect(ctx.service.list(actor, authz, { limit: 20 })).resolves.toMatchObject({
      items: [expect.objectContaining({ username: "driver01" })],
      nextCursor: null,
    });
    expect(ctx.employeeAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { operatorId: "operator-a" } }),
    );
  });

  it("preserves disciplinary LOCKED during reset and clears only delivery flag", async () => {
    const ctx = setup();
    const current = row({ status: "LOCKED" });
    const pending = row({ status: "LOCKED", credentialDeliveryPending: true, version: 1 });
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([pending]);
    ctx.employeeAccount.updateMany.mockResolvedValue({ count: 1 });

    await ctx.service.resetPassword(
      actor,
      authz,
      current.id,
      { reason: "Nhân viên quên mật khẩu" },
    );

    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledTimes(2);
    expect(ctx.employeeAccount.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
          authEpoch: { increment: 1 },
          version: { increment: 1 },
        }),
      }),
    );
    expect(ctx.employeeAccount.updateManyAndReturn.mock.calls[0][0].data).not.toHaveProperty("status");
    expect(ctx.email.sendTemporaryPassword).toHaveBeenCalledOnce();
    expect(ctx.employeeAccount.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ credentialDeliveryPending: true, version: 1 }),
        data: { credentialDeliveryPending: false, version: { increment: 1 } },
      }),
    );
  });

  it("does not rotate a credential or revoke sessions when reset cooldown denies email", async () => {
    const ctx = setup();
    const current = row({ status: "LOCKED" });
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.emailLimiter.reserve.mockRejectedValueOnce({ status: 429 });

    await expect(ctx.service.resetPassword(actor, authz, current.id, {
      reason: "Nhân viên quên mật khẩu",
    })).rejects.toMatchObject({ status: 429 });
    expect(ctx.emailLimiter.reserve).toHaveBeenCalledWith(expect.objectContaining({
      operatorId: "operator-a",
      employeeId: current.id,
    }));
    expect(ctx.credentials.hash).not.toHaveBeenCalled();
    expect(ctx.employeeAccount.updateManyAndReturn).not.toHaveBeenCalled();
    expect(ctx.sessions.revokeAllForSubject).not.toHaveBeenCalled();
  });

  it("maps a stale concurrent update to ACCOUNT_STATE_CONFLICT", async () => {
    const ctx = setup();
    const current = row();
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([]);

    await expect(
      ctx.service.update(actor, authz, current.id, {
        role: "TICKET_STAFF",
        reason: "Chuyển nhiệm vụ",
      }),
    ).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ code: "ACCOUNT_STATE_CONFLICT" }),
    });
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledOnce();
  });

  it("role mutation increments durable auth_epoch and revokes before/after update", async () => {
    const ctx = setup();
    const current = row();
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([row({ role: "TICKET_STAFF" })]);

    await ctx.service.update(actor, authz, current.id, {
      role: "TICKET_STAFF",
      reason: "Chuyển nhiệm vụ",
    });

    expect(ctx.employeeAccount.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ version: 0 }),
        data: expect.objectContaining({ authEpoch: { increment: 1 }, version: { increment: 1 } }),
      }),
    );
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledTimes(2);
  });

  it("unlock rotates the epoch, revokes legacy sessions and never restores a credential", async () => {
    const ctx = setup();
    const current = row({ status: "LOCKED" });
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([
      row({ status: "ACTIVE", version: 1 }),
    ]);

    await ctx.service.update(actor, authz, current.id, {
      status: "ACTIVE",
      reason: "Kết thúc kỷ luật",
    });

    const mutation = ctx.employeeAccount.updateManyAndReturn.mock.calls[0][0].data;
    expect(mutation).toEqual({
      status: "ACTIVE",
      authEpoch: { increment: 1 },
      version: { increment: 1 },
    });
    expect(mutation).not.toHaveProperty("passwordHash");
    expect(mutation).not.toHaveProperty("credentialDeliveryPending");
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledTimes(2);
  });

  it("contact-email change invalidates old challenges and blocks login until reset to the new address", async () => {
    const ctx = setup();
    const current = row();
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([
      row({ contactEmail: "new@example.com", credentialDeliveryPending: true, version: 1 }),
    ]);

    const result = await ctx.service.update(actor, authz, current.id, {
      contactEmail: "NEW@EXAMPLE.COM",
      reason: "Sửa địa chỉ nhận thông tin đăng nhập",
    });

    expect(ctx.employeeAccount.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contactEmail: "new@example.com",
          credentialDeliveryPending: true,
          passwordChangeRequired: true,
          temporaryPasswordExpiresAt: new Date(0),
          authEpoch: { increment: 1 },
          version: { increment: 1 },
        }),
      }),
    );
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledTimes(2);
    expect(result.credentialDeliveryPending).toBe(true);
  });

  it("username change invalidates an already issued password-change challenge", async () => {
    const ctx = setup();
    const current = row();
    ctx.employeeAccount.findFirst.mockResolvedValue(current);
    ctx.employeeAccount.updateManyAndReturn.mockResolvedValue([
      row({ username: "driver-renamed", version: 1 }),
    ]);

    await ctx.service.update(actor, authz, current.id, {
      username: "driver-renamed",
      reason: "Đổi tên đăng nhập",
    });

    expect(ctx.employeeAccount.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "driver-renamed",
          authEpoch: { increment: 1 },
        }),
      }),
    );
    expect(ctx.sessions.revokeAllForSubject).toHaveBeenCalledTimes(2);
  });
});
