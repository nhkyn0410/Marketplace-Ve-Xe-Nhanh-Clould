import { randomUUID } from "node:crypto";
import type { HttpException } from "@nestjs/common";
import Redis from "ioredis";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TemporaryCredentialEmailLimiter } from "./temporary-credential-email-limiter";

const redisUrl = process.env.REDIS_URL;
const requireInfrastructure = process.env.REQUIRE_DB_TESTS === "1";

describe.skipIf(!redisUrl && !requireInfrastructure)(
  "TemporaryCredentialEmailLimiter — Redis thật",
  () => {
    let redis: Redis;
    let limiter: TemporaryCredentialEmailLimiter;
    const keys = new Set<string>();

    beforeAll(async () => {
      if (!redisUrl) {
        throw new Error("REQUIRE_DB_TESTS=1 requires REDIS_URL for the temp-email limiter test.");
      }
      redis = new Redis(redisUrl, {
        keyPrefix: `iam005-test:${randomUUID()}:`,
        maxRetriesPerRequest: 1,
      });
      await redis.ping();
      limiter = new TemporaryCredentialEmailLimiter(redis);
    });

    afterAll(async () => {
      if (!redis) {
        return;
      }
      if (keys.size > 0) {
        await redis.del(...keys);
      }
      redis.disconnect();
    });

    it("atomically allows only five concurrent reservations for one actor", async () => {
      const request = {
        operatorId: randomUUID(),
        actorType: "operator",
        actorId: randomUUID(),
      };
      trackKeys(request);

      const results = await Promise.allSettled(
        Array.from({ length: 6 }, () => limiter.reserve(request)),
      );

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(5);
      const rejected = results.filter((result) => result.status === "rejected");
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toSatisfy(
        (error: HttpException) => error.getStatus() === 429,
      );
      await expect(redis.get(actorKey(request))).resolves.toBe("5");
    });

    it("atomically applies the one-hour cooldown to concurrent employee resets", async () => {
      const request = {
        operatorId: randomUUID(),
        actorType: "operator",
        actorId: randomUUID(),
        employeeId: randomUUID(),
      };
      trackKeys(request);

      const results = await Promise.allSettled([
        limiter.reserve(request),
        limiter.reserve(request),
      ]);

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.filter((result) => result.status === "rejected");
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toSatisfy(
        (error: HttpException) => error.getStatus() === 429,
      );
      await expect(redis.ttl(employeeKey(request.employeeId))).resolves.toBeGreaterThan(0);
    });

    function trackKeys(request: {
      operatorId: string;
      actorType: string;
      actorId: string;
      employeeId?: string;
    }): void {
      keys.add("iam:temp-email:global");
      keys.add(`iam:temp-email:tenant:${request.operatorId}`);
      keys.add(actorKey(request));
      if (request.employeeId) {
        keys.add(employeeKey(request.employeeId));
      }
    }

    function actorKey(request: { actorType: string; actorId: string }): string {
      return `iam:temp-email:actor:${request.actorType}:${request.actorId}`;
    }

    function employeeKey(employeeId: string): string {
      return `iam:temp-email:employee-reset:${employeeId}`;
    }
  },
);
