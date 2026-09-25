import { randomUUID } from "node:crypto";
import Redis from "ioredis";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { parseAppConfig } from "../../config/env.config";
import { PrismaService } from "../../database/prisma.service";
import { SubjectType } from "../../database/prisma.types";
import { CredentialService } from "./credential.service";
import { PasswordChangeService } from "./password-change.service";

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
const requireInfrastructure = process.env.REQUIRE_DB_TESTS === "1";

describe.skipIf((!databaseUrl || !redisUrl) && !requireInfrastructure)(
  "PasswordChangeService — PostgreSQL và Redis thật",
  () => {
    let prisma: PrismaService;
    let redis: Redis;
    let service: PasswordChangeService;
    const credentials = new CredentialService();
    const operatorId = randomUUID();
    const accountId = randomUUID();
    const operatorSlug = `iam005-password-${operatorId.slice(0, 8)}`;
    const temporaryPassword = "temporary-password-for-integration";
    const newPassword = "new-password-for-integration";

    beforeAll(async () => {
      if (!databaseUrl || !redisUrl) {
        throw new Error("REQUIRE_DB_TESTS=1 requires DATABASE_URL and REDIS_URL.");
      }
      prisma = new PrismaService(parseAppConfig({ DATABASE_URL: databaseUrl }));
      redis = new Redis(redisUrl, {
        keyPrefix: `iam005-test:${randomUUID()}:`,
        maxRetriesPerRequest: 1,
      });
      await redis.ping();
      const passwordHash = await credentials.hash(temporaryPassword);
      await prisma.withSystem(async (tx) => {
        await tx.operatorProfile.create({
          data: { id: operatorId, operatorSlug, displayName: "Password change integration" },
        });
        await tx.operatorAccount.create({
          data: {
            id: accountId,
            operatorId,
            operatorSlug,
            username: `owner-${operatorId.slice(0, 8)}`,
            contactEmail: "password-change@example.com",
            passwordHash,
            passwordChangeRequired: true,
            temporaryPasswordExpiresAt: new Date(Date.now() + 60_000),
          },
        });
      });
      service = new PasswordChangeService(
        { NODE_ENV: "test", BETTER_AUTH_SECRET: "integration-test-secret" } as never,
        redis,
        prisma,
        credentials,
        { revokeAllForSubject: vi.fn().mockResolvedValue(0) } as never,
        { clearMfaFailures: vi.fn().mockResolvedValue(undefined) } as never,
        { recordAuditEvent: vi.fn().mockResolvedValue(undefined) } as never,
      );
    });

    afterAll(async () => {
      if (prisma) {
        await prisma.withSystem(async (tx) => {
          await tx.operatorAccount.deleteMany({ where: { id: accountId } });
          await tx.operatorProfile.deleteMany({ where: { id: operatorId } });
        });
        await prisma.$disconnect();
      }
      redis?.disconnect();
    });

    it("rejects a suspended tenant, then consumes a fresh challenge once and kills the old password", async () => {
      const staleChallenge = await service.begin({
        subjectType: SubjectType.OPERATOR,
        subjectId: accountId,
        operatorId,
        authEpoch: 0,
      });
      await prisma.withSystem((tx) => tx.operatorProfile.update({
        where: { id: operatorId },
        data: { status: "SUSPENDED" },
      }));

      await expect(service.changeRequiredPassword(
        staleChallenge.passwordChangeToken,
        newPassword,
        {},
      )).rejects.toMatchObject({ status: 401 });

      await prisma.withSystem((tx) => tx.operatorProfile.update({
        where: { id: operatorId },
        data: { status: "ACTIVE" },
      }));
      const challenge = await service.begin({
        subjectType: SubjectType.OPERATOR,
        subjectId: accountId,
        operatorId,
        authEpoch: 0,
      });
      const results = await Promise.allSettled([
        service.changeRequiredPassword(challenge.passwordChangeToken, newPassword, {}),
        service.changeRequiredPassword(
          challenge.passwordChangeToken,
          "another-new-password-for-integration",
          {},
        ),
      ]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
      const stored = await prisma.withSystem((tx) => tx.operatorAccount.findUniqueOrThrow({
        where: { id: accountId },
      }));
      expect(stored).toMatchObject({
        authEpoch: 1,
        passwordChangeRequired: false,
        temporaryPasswordExpiresAt: null,
      });
      expect(await credentials.verify(temporaryPassword, stored.passwordHash)).toBe(false);
      const winningPassword = await credentials.verify(newPassword, stored.passwordHash)
        ? newPassword
        : "another-new-password-for-integration";
      expect(await credentials.verify(winningPassword, stored.passwordHash)).toBe(true);
      // Nhiều lần scrypt (cố ý chậm): chạy riêng ~3 s nhưng vượt mặc định 5 s khi cả suite DB chạy song song.
    }, 20_000);
  },
);
