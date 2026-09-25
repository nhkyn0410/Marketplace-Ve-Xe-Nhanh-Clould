import { type HttpException, Logger } from "@nestjs/common";
import type Redis from "ioredis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TEMP_EMAIL_ACTOR_MAX,
  TEMP_EMAIL_EMPLOYEE_RESET_COOLDOWN_SECONDS,
  TEMP_EMAIL_GLOBAL_MAX,
  TEMP_EMAIL_TENANT_MAX,
  TEMP_EMAIL_WINDOW_SECONDS,
  TemporaryCredentialEmailLimiter,
} from "./temporary-credential-email-limiter";

async function problemOf(promise: Promise<unknown>): Promise<{ status: number; code?: string }> {
  try {
    await promise;
    return { status: 0 };
  } catch (error) {
    const exception = error as HttpException;
    return {
      status: exception.getStatus(),
      code: (exception.getResponse() as { code?: string }).code,
    };
  }
}

describe("TemporaryCredentialEmailLimiter", () => {
  const evalScript = vi.fn();
  const redis = { eval: evalScript } as unknown as Redis;
  const limiter = new TemporaryCredentialEmailLimiter(redis);
  const request = {
    operatorId: "tenant-1",
    actorType: "operator",
    actorId: "owner-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    evalScript.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reserves global, tenant and actor budgets together with 24-hour limits", async () => {
    await expect(limiter.reserve(request)).resolves.toBeUndefined();

    const [script, keyCount, ...args] = evalScript.mock.calls[0] as [string, number, ...string[]];
    expect(keyCount).toBe(3);
    expect(args).toEqual([
      "iam:temp-email:global",
      "iam:temp-email:tenant:tenant-1",
      "iam:temp-email:actor:operator:owner-1",
      String(TEMP_EMAIL_GLOBAL_MAX),
      String(TEMP_EMAIL_TENANT_MAX),
      String(TEMP_EMAIL_ACTOR_MAX),
      String(TEMP_EMAIL_WINDOW_SECONDS),
      "0",
      String(TEMP_EMAIL_EMPLOYEE_RESET_COOLDOWN_SECONDS),
    ]);
    expect([TEMP_EMAIL_GLOBAL_MAX, TEMP_EMAIL_TENANT_MAX, TEMP_EMAIL_ACTOR_MAX]).toEqual([
      30, 10, 5,
    ]);
    expect(TEMP_EMAIL_WINDOW_SECONDS).toBe(86_400);
    expect(evalScript).toHaveBeenCalledOnce();
    expect(script.indexOf("for i = 1, 3 do")).toBeLessThan(script.indexOf("redis.call('INCR'"));
    expect(script.indexOf("redis.call('EXISTS'")).toBeLessThan(script.indexOf("redis.call('INCR'"));
  });

  it("includes a per-employee 1-hour cooldown only for password reset", async () => {
    await limiter.reserve({ ...request, employeeId: "employee-1" });

    const [, keyCount, ...args] = evalScript.mock.calls[0] as [string, number, ...string[]];
    expect(keyCount).toBe(4);
    expect(args[3]).toBe("iam:temp-email:employee-reset:employee-1");
    expect(args[8]).toBe("1");
    expect(TEMP_EMAIL_EMPLOYEE_RESET_COOLDOWN_SECONDS).toBe(3_600);
  });

  it.each([
    [1, "global"],
    [2, "tenant"],
    [3, "actor"],
    [4, "employee_reset"],
  ])("denies dimension %i (%s) with typed 429", async (dimension, label) => {
    evalScript.mockResolvedValue(dimension);

    expect(await problemOf(limiter.reserve({ ...request, employeeId: "employee-1" }))).toEqual({
      status: 429,
      code: "ACCOUNT_TEMP_EMAIL_RATE_LIMITED",
    });
    expect(Logger.prototype.warn).toHaveBeenCalledWith({
      event: "iam.temporary_credential_email.rate_limited",
      dimension: label,
    });
    expect(evalScript).toHaveBeenCalledOnce();
  });

  it("fails closed with 503 when Redis is unavailable", async () => {
    evalScript.mockRejectedValue(new Error("Redis unavailable"));

    expect(await problemOf(limiter.reserve(request))).toEqual({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("fails closed on an unexpected script result", async () => {
    evalScript.mockResolvedValue("unexpected");

    expect(await problemOf(limiter.reserve(request))).toEqual({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  });
});
