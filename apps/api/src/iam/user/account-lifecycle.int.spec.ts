import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseAppConfig } from "../../config/env.config";
import { PrismaService } from "../../database/prisma.service";
import { SubjectType } from "../../database/prisma.types";
import type { AuditService } from "../../audit/audit.service";
import { RefreshTokenService } from "../session/refresh-token.service";
import type { SessionCache } from "../session/session-cache";
import { SessionService } from "../session/session.service";

// Chạy trên Postgres đã migrate + role app, không dùng mock để kiểm tra constraint/trigger/RLS.
const url = process.env.DATABASE_URL;
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

async function rejectionText(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return "";
  } catch (error) {
    return JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error);
  }
}

describe.skipIf(!url && !requireDb)("IAM-005 account lifecycle — Postgres thật, role app", () => {
  let prisma: PrismaService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const tenantWithoutAccount = randomUUID();
  const ownerA = randomUUID();
  const employeeA = randomUUID();
  const employeeB = randomUUID();
  const epochSessionId = randomUUID();
  const slugA = `iam005-a-${tag}`;
  const slugB = `iam005-b-${tag}`;
  const sharedUsername = `shared-${tag}`;
  const employeeUsername = `driver-${tag}`;
  let ready = false;

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    const problems = await prisma.rlsProblems();
    if (problems.length > 0) {
      throw new Error(`DATABASE_URL không phải role app có FORCE RLS: ${problems.join("; ")}`);
    }

    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: slugA, displayName: "IAM-005 A" },
          { id: tenantB, operatorSlug: slugB, displayName: "IAM-005 B" },
          { id: tenantWithoutAccount, operatorSlug: `iam005-empty-${tag}`, displayName: "IAM-005 Empty" },
        ],
      });
      await tx.operatorAccount.create({
        data: {
          id: ownerA,
          operatorId: tenantA,
          operatorSlug: slugA,
          username: sharedUsername,
          passwordHash: "x",
        },
      });
      await tx.employeeAccount.createMany({
        data: [
          { id: employeeA, operatorId: tenantA, username: employeeUsername, passwordHash: "x", role: "DRIVER" },
          { id: employeeB, operatorId: tenantB, username: sharedUsername, passwordHash: "x", role: "DRIVER" },
        ],
      });
    });
    ready = true;
  });

  afterAll(async () => {
    if (ready) {
      await prisma.withSystem(async (tx) => {
        await tx.authSession.deleteMany({ where: { id: epochSessionId } });
        await tx.employeeAccount.deleteMany({ where: { id: { in: [employeeA, employeeB] } } });
        await tx.operatorAccount.delete({ where: { id: ownerA } });
        await tx.operatorProfile.deleteMany({ where: { id: { in: [tenantA, tenantB, tenantWithoutAccount] } } });
      });
    }
    await prisma?.$disconnect();
  });

  it("Owner và Employee cùng tenant không thể lấy cùng username, nhưng tenant khác được", async () => {
    const employeeConflict = await rejectionText(
      prisma.withSystem((tx) =>
        tx.employeeAccount.create({
          data: { operatorId: tenantA, username: sharedUsername, passwordHash: "x", role: "DRIVER" },
        }),
      ),
    );
    expect(employeeConflict).toMatch(/operator_login_names_pkey|P2002|unique constraint/i);

    const ownerConflict = await rejectionText(
      prisma.withSystem((tx) =>
        tx.operatorAccount.create({
          data: { operatorId: tenantA, operatorSlug: slugA, username: employeeUsername, passwordHash: "x" },
        }),
      ),
    );
    expect(ownerConflict).toMatch(/operator_login_names_pkey|P2002|unique constraint/i);

    const crossTenant = await prisma.withSystem((tx) =>
      tx.operatorLoginName.findMany({ where: { username: sharedUsername }, select: { operatorId: true } }),
    );
    expect(crossTenant.map((row) => row.operatorId).sort()).toEqual([tenantA, tenantB].sort());
  });

  it("operator_slug bất biến kể cả trước khi tenant có account", async () => {
    const text = await rejectionText(
      prisma.withSystem((tx) =>
        tx.operatorProfile.update({ where: { id: tenantWithoutAccount }, data: { operatorSlug: `renamed-${tag}` } }),
      ),
    );
    expect(text).toMatch(/operator_slug is immutable/);
  });

  it("Owner operatorSlug phải khớp chính operatorId (compound FK)", async () => {
    const text = await rejectionText(
      prisma.withSystem((tx) =>
        tx.operatorAccount.create({
          data: { operatorId: tenantA, operatorSlug: slugB, username: `bad-${tag}`, passwordHash: "x" },
        }),
      ),
    );
    expect(text).toMatch(/operator_accounts_operator_id_operator_slug_fkey|P2003|foreign key/i);
  });

  it("registry không có context thì ẩn; tenant chỉ thấy reservation của mình", async () => {
    expect(await prisma.operatorLoginName.findMany({ where: { operatorId: { in: [tenantA, tenantB] } } })).toEqual([]);

    const seenA = await prisma.withTenant(tenantA, (tx) =>
      tx.operatorLoginName.findMany({
        where: { operatorId: { in: [tenantA, tenantB] } },
        select: { operatorId: true, username: true },
      }),
    );
    expect(seenA.map((row) => row.username).sort()).toEqual([employeeUsername, sharedUsername].sort());
    expect(seenA.every((row) => row.operatorId === tenantA)).toBe(true);

    const seenB = await prisma.withTenant(tenantB, (tx) =>
      tx.operatorLoginName.findMany({
        where: { operatorId: { in: [tenantA, tenantB] } },
        select: { operatorId: true, username: true },
      }),
    );
    expect(seenB).toEqual([{ operatorId: tenantB, username: sharedUsername }]);
  });

  it("tenant không thể sửa reservation của tenant khác hoặc ghi trực tiếp registry", async () => {
    const foreign = await prisma.withTenant(tenantA, (tx) =>
      tx.operatorLoginName.updateMany({ where: { operatorId: tenantB }, data: { accountId: randomUUID() } }),
    );
    expect(foreign.count).toBe(0);

    const direct = await rejectionText(
      prisma.withTenant(tenantA, (tx) =>
        tx.operatorLoginName.updateMany({
          where: { operatorId: tenantA, username: sharedUsername },
          data: { accountId: randomUUID() },
        }),
      ),
    );
    expect(direct).toMatch(/operator_login_names is trigger-managed/);
  });

  it("account auth_epoch mới vô hiệu access cũ dù Redis vẫn cache active", async () => {
    const config = parseAppConfig({ DATABASE_URL: url });
    const cache = {
      lookup: async () => "active" as const,
      markActive: async () => undefined,
    } as unknown as SessionCache;
    const sessions = new SessionService(
      config,
      prisma,
      new RefreshTokenService(),
      { recordAuditEvent: async () => undefined } as unknown as AuditService,
      cache,
    );
    await prisma.withSystem((tx) => tx.authSession.create({
      data: {
        id: epochSessionId,
        subjectType: SubjectType.EMPLOYEE,
        subjectId: employeeA,
        userRef: `employee:${employeeA}`,
        familyId: randomUUID(),
        refreshTokenHash: randomUUID(),
        expiresAt: new Date(Date.now() + 60_000),
        operatorId: tenantA,
        authEpoch: 0,
      },
    }));
    const claims = {
      sid: epochSessionId,
      sub: employeeA,
      scope: "operator" as const,
      role: "DRIVER",
      operatorId: tenantA,
      operatorSlug: slugA,
    };
    await expect(sessions.assertActive(epochSessionId)).resolves.toBeUndefined();
    await expect(sessions.assertOperatorAccountCurrent(claims)).resolves.toBeUndefined();

    await prisma.withSystem((tx) => tx.employeeAccount.update({
      where: { id: employeeA },
      data: { authEpoch: { increment: 1 }, status: "LOCKED" },
    }));
    // Simulates post-mutation Redis revoke failing: cache still says active, DB version wins.
    await expect(sessions.assertActive(epochSessionId)).resolves.toBeUndefined();
    await expect(sessions.assertOperatorAccountCurrent(claims)).rejects.toMatchObject({
      response: expect.objectContaining({ code: "AUTH_SESSION_EXPIRED" }),
    });
  });
});
