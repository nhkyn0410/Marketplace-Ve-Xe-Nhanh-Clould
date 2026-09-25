import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import { parseAppConfig } from "../../config/env.config";
import { PrismaService } from "../../database/prisma.service";
import type { EmailNotifier } from "../../external/notification/email-notifier";
import { CredentialService } from "../auth/credential.service";
import type { Authorization } from "../role/authorization";
import type { SessionService } from "../session/session.service";
import type { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";
import { AccountProvisioningService } from "./account-provisioning.service";
import type { AccountActor } from "./account.types";
import { EmployeeAccountService } from "./employee-account.service";

const url = process.env.DATABASE_URL;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

describe.skipIf(!url && !requireDb)("IAM-005 account services — Postgres thật, role app", () => {
  let prisma: PrismaService;
  let provisioning: AccountProvisioningService;
  let employees: EmployeeAccountService;
  const credentials = new CredentialService();
  const sendTemporaryPassword = vi.fn().mockResolvedValue(undefined);
  const email = { sendOtp: vi.fn(), sendTemporaryPassword } as EmailNotifier;
  const audit = { recordAuditEvent: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  const sessions = {
    hasRecentReauth: vi.fn().mockResolvedValue(true),
    revokeAllForSubject: vi.fn().mockResolvedValue(0),
  } as unknown as SessionService;
  const emailLimiter = { reserve: vi.fn().mockResolvedValue(undefined) } as unknown as TemporaryCredentialEmailLimiter;
  const tag = randomUUID().slice(0, 8);
  const tenant = randomUUID();
  const foreignTenant = randomUUID();
  const provisionTenant = randomUUID();
  const concurrentProvisionTenant = randomUUID();
  const retryTenant = randomUUID();
  const foreignEmployee = randomUUID();
  const tenantSlug = `iam005-service-${tag}`;
  const foreignSlug = `iam005-foreign-${tag}`;
  const platformAuthz = { db: { kind: "platform" } } as Authorization;
  const tenantAuthz = { db: { kind: "tenant", operatorId: tenant } } as Authorization;
  const admin: AccountActor = {
    sub: randomUUID(), sid: randomUUID(), scope: "platform", role: "PLATFORM_ADMIN",
  };
  const owner: AccountActor = {
    sub: randomUUID(), sid: randomUUID(), scope: "operator", role: "OPERATOR_OWNER",
    operatorId: tenant, operatorSlug: tenantSlug,
  };

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    const problems = await prisma.rlsProblems();
    if (problems.length) {
      throw new Error(`IAM-005 integration requires app role with FORCE RLS: ${problems.join("; ")}`);
    }
    provisioning = new AccountProvisioningService(prisma, credentials, email, audit, sessions, emailLimiter);
    employees = new EmployeeAccountService(prisma, credentials, email, audit, sessions, emailLimiter);
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({ data: [
        { id: tenant, operatorSlug: tenantSlug, displayName: "Service tenant" },
        { id: foreignTenant, operatorSlug: foreignSlug, displayName: "Foreign tenant" },
      ] });
      await tx.employeeAccount.create({ data: {
        id: foreignEmployee, operatorId: foreignTenant, username: `foreign-${tag}`,
        passwordHash: "legacy-hash", role: "DRIVER",
      } });
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.withSystem(async (tx) => {
        const operatorIds = [tenant, foreignTenant, provisionTenant, concurrentProvisionTenant, retryTenant];
        await tx.authSession.deleteMany({ where: { operatorId: { in: operatorIds } } });
        await tx.employeeAccount.deleteMany({ where: { operatorId: { in: operatorIds } } });
        await tx.operatorAccount.deleteMany({ where: { operatorId: { in: operatorIds } } });
        await tx.operatorProfile.deleteMany({ where: { id: { in: operatorIds } } });
      });
      await prisma.$disconnect();
    }
  });

  it("provisions Owner atomically, sends temp password, and persists only its scrypt hash", async () => {
    const result = await provisioning.provisionOperatorOwner(admin, platformAuthz, {
      operatorId: provisionTenant,
      operatorSlug: `iam005-provision-${tag}`,
      displayName: "Provisioned tenant",
      ownerUsername: `owner-${tag}`,
      contactEmail: "owner@example.com",
      reason: "KYC approved",
    });
    const delivered = sendTemporaryPassword.mock.lastCall?.[0].temporaryPassword as string;
    const account = await prisma.withSystem((tx) => tx.operatorAccount.findUniqueOrThrow({
      where: { id: result.ownerAccountId },
    }));
    expect(account.status).toBe("ACTIVE");
    expect(account.credentialDeliveryPending).toBe(false);
    expect(account.version).toBe(1);
    expect(account.passwordChangeRequired).toBe(true);
    expect(account.authEpoch).toBe(0);
    expect(account.passwordHash).not.toContain(delivered);
    expect(await credentials.verify(delivered, account.passwordHash)).toBe(true);
  });

  it("concurrent provision requests create exactly one tenant and Owner", async () => {
    const input = {
      operatorId: concurrentProvisionTenant,
      operatorSlug: `iam005-provision-race-${tag}`,
      displayName: "Concurrent provision tenant",
      ownerUsername: `owner-race-${tag}`,
      contactEmail: "owner-race@example.com",
      reason: "KYC approved",
    };

    const results = await Promise.allSettled([
      provisioning.provisionOperatorOwner(admin, platformAuthz, input),
      provisioning.provisionOperatorOwner(admin, platformAuthz, input),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.filter((result) => result.status === "rejected");
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ status: 409 });
    const [profiles, owners] = await prisma.withSystem(async (tx) => Promise.all([
      tx.operatorProfile.count({ where: { id: concurrentProvisionTenant } }),
      tx.operatorAccount.count({ where: { operatorId: concurrentProvisionTenant } }),
    ]));
    expect({ profiles, owners }).toEqual({ profiles: 1, owners: 1 });
  });

  it("delivery failure leaves Owner pending; retry sends a new password without changing status", async () => {
    sendTemporaryPassword.mockRejectedValueOnce(new Error("provider unavailable"));
    const operatorSlug = `iam005-retry-${tag}`;
    const ownerUsername = `retry-${tag}`;
    await expect(provisioning.provisionOperatorOwner(admin, platformAuthz, {
      operatorId: retryTenant, operatorSlug, displayName: "Retry tenant", ownerUsername,
      contactEmail: "retry@example.com", reason: "KYC approved",
    })).rejects.toMatchObject({ status: 503 });
    const pending = await prisma.withSystem((tx) => tx.operatorAccount.findFirstOrThrow({
      where: { operatorId: retryTenant },
    }));
    expect(pending.status).toBe("ACTIVE");
    expect(pending.credentialDeliveryPending).toBe(true);
    const oldHash = pending.passwordHash;

    await provisioning.retryOwnerDelivery(admin, platformAuthz, {
      operatorSlug, ownerUsername, reason: "Retry delivery",
    });
    const active = await prisma.withSystem((tx) => tx.operatorAccount.findUniqueOrThrow({
      where: { id: pending.id },
    }));
    expect(active.status).toBe("ACTIVE");
    expect(active.credentialDeliveryPending).toBe(false);
    expect(active.authEpoch).toBe(1);
    expect(active.version).toBe(2);
    expect(active.passwordHash).not.toBe(oldHash);
    const delivered = sendTemporaryPassword.mock.lastCall?.[0].temporaryPassword as string;
    expect(await credentials.verify(delivered, active.passwordHash)).toBe(true);
  });

  it("Owner lifecycle stays in tenant; role/reset increment durable auth_epoch", async () => {
    const created = await employees.create(owner, tenantAuthz, {
      username: `driver-${tag}`, contactEmail: "driver@example.com", role: "DRIVER",
      reason: "New driver",
    });
    expect(created.status).toBe("ACTIVE");
    expect((await employees.list(owner, tenantAuthz, { limit: 20 })).items.map((row) => row.id)).toContain(created.id);
    await expect(employees.update(owner, tenantAuthz, foreignEmployee, {
      role: "TICKET_STAFF", reason: "Wrong tenant",
    })).rejects.toMatchObject({ status: 404 });

    const updated = await employees.update(owner, tenantAuthz, created.id, {
      role: "TICKET_STAFF", reason: "Reassignment",
    });
    expect(updated.role).toBe("TICKET_STAFF");
    const afterRole = await prisma.withSystem((tx) => tx.employeeAccount.findUniqueOrThrow({ where: { id: created.id } }));
    expect(afterRole.authEpoch).toBe(1);
    await employees.update(owner, tenantAuthz, created.id, {
      status: "LOCKED", reason: "Disciplinary lock",
    });
    await employees.resetPassword(owner, tenantAuthz, created.id, { reason: "Password reset" });
    const afterReset = await prisma.withSystem((tx) => tx.employeeAccount.findUniqueOrThrow({ where: { id: created.id } }));
    expect(afterReset.authEpoch).toBe(3);
    expect(afterReset.passwordChangeRequired).toBe(true);
    expect(afterReset.credentialDeliveryPending).toBe(false);
    expect(afterReset.status).toBe("LOCKED");
  });

  it("concurrent Employee creates with one username leave exactly one account", async () => {
    const username = `driver-race-${tag}`;
    const results = await Promise.allSettled([
      employees.create(owner, tenantAuthz, {
        username, contactEmail: "driver-race-a@example.com", role: "DRIVER",
        reason: "New driver",
      }),
      employees.create(owner, tenantAuthz, {
        username, contactEmail: "driver-race-b@example.com", role: "DRIVER",
        reason: "New driver",
      }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.filter((result) => result.status === "rejected");
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ status: 409 });
    await expect(prisma.withSystem((tx) => tx.employeeAccount.count({
      where: { operatorId: tenant, username },
    }))).resolves.toBe(1);
  });

  it("Employee delivery failure remains recoverable by ID and password reset", async () => {
    const username = `retry-driver-${tag}`;
    sendTemporaryPassword.mockRejectedValueOnce(new Error("provider unavailable"));
    const failure = await employees.create(owner, tenantAuthz, {
      username, contactEmail: "retry-driver@example.com", role: "DRIVER",
      reason: "New driver",
    }).then(() => null, (error: unknown) => error);
    expect(failure).toMatchObject({ status: 503 });

    const listed = await employees.list(owner, tenantAuthz, { limit: 20 });
    const created = listed.items.find((item) => item.username === username);
    expect(created).toBeDefined();
    expect((failure as { getResponse(): { detail: string } }).getResponse().detail).toContain(created!.id);
    const pending = await prisma.withSystem((tx) => tx.employeeAccount.findUniqueOrThrow({
      where: { id: created!.id },
    }));
    expect(pending.credentialDeliveryPending).toBe(true);
    expect(pending.status).toBe("ACTIVE");

    await employees.resetPassword(owner, tenantAuthz, created!.id, { reason: "Retry delivery" });
    const recovered = await prisma.withSystem((tx) => tx.employeeAccount.findUniqueOrThrow({
      where: { id: created!.id },
    }));
    expect(recovered.credentialDeliveryPending).toBe(false);
    expect(recovered.authEpoch).toBe(1);
  });

  it("contact-email change satisfies DB invariants and invalidates the previous credential", async () => {
    const created = await employees.create(owner, tenantAuthz, {
      username: `email-change-${tag}`,
      contactEmail: "old-address@example.com",
      role: "DRIVER",
      reason: "New driver",
    });

    const changed = await employees.update(owner, tenantAuthz, created.id, {
      contactEmail: "new-address@example.com",
      reason: "Correct delivery address",
    });

    expect(changed).toMatchObject({
      contactEmail: "new-address@example.com",
      credentialDeliveryPending: true,
    });
    const stored = await prisma.withSystem((tx) =>
      tx.employeeAccount.findUniqueOrThrow({ where: { id: created.id } }),
    );
    expect(stored.authEpoch).toBe(1);
    expect(stored.passwordChangeRequired).toBe(true);
    expect(stored.credentialDeliveryPending).toBe(true);
    expect(stored.temporaryPasswordExpiresAt).toEqual(new Date(0));
    expect(sessions.revokeAllForSubject).toHaveBeenCalled();
  });
});
