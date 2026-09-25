import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../../redis/redis.config";
import { AuthException, serviceUnavailable } from "../auth/auth.errors";

/** Credential emails use a separate, deliberately small budget from passenger OTP emails. */
export const TEMP_EMAIL_WINDOW_SECONDS = 24 * 60 * 60;
export const TEMP_EMAIL_GLOBAL_MAX = 30;
export const TEMP_EMAIL_TENANT_MAX = 10;
export const TEMP_EMAIL_ACTOR_MAX = 5;
export const TEMP_EMAIL_EMPLOYEE_RESET_COOLDOWN_SECONDS = 60 * 60;

/**
 * Check every dimension before changing any key. Redis runs the whole script atomically, so
 * concurrent requests cannot each pass a separately checked global/tenant/actor threshold.
 */
const RESERVE_TEMP_EMAIL = `
for i = 1, 3 do
  if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i]) then
    return i
  end
end
if ARGV[5] == '1' and redis.call('EXISTS', KEYS[4]) == 1 then
  return 4
end
for i = 1, 3 do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then redis.call('EXPIRE', KEYS[i], ARGV[4]) end
end
if ARGV[5] == '1' then
  redis.call('SET', KEYS[4], '1', 'EX', ARGV[6])
end
return 0
`;

export type TemporaryCredentialEmailRequest = {
  operatorId: string;
  actorType: string;
  actorId: string;
  /** Only employee password resets are subject to the per-employee cooldown. */
  employeeId?: string;
};

@Injectable()
export class TemporaryCredentialEmailLimiter {
  private readonly logger = new Logger(TemporaryCredentialEmailLimiter.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /** Reserve before account/password mutation. A later delivery failure does not refund the budget. */
  async reserve(request: TemporaryCredentialEmailRequest): Promise<void> {
    const keys = [
      "iam:temp-email:global",
      `iam:temp-email:tenant:${request.operatorId}`,
      `iam:temp-email:actor:${request.actorType}:${request.actorId}`,
    ];
    if (request.employeeId) {
      keys.push(`iam:temp-email:employee-reset:${request.employeeId}`);
    }

    let result: unknown;
    try {
      result = await this.redis.eval(
        RESERVE_TEMP_EMAIL,
        keys.length,
        ...keys,
        String(TEMP_EMAIL_GLOBAL_MAX),
        String(TEMP_EMAIL_TENANT_MAX),
        String(TEMP_EMAIL_ACTOR_MAX),
        String(TEMP_EMAIL_WINDOW_SECONDS),
        request.employeeId ? "1" : "0",
        String(TEMP_EMAIL_EMPLOYEE_RESET_COOLDOWN_SECONDS),
      );
    } catch {
      throw serviceUnavailable();
    }

    if (result === 0) {
      return;
    }
    if (typeof result !== "number" || result < 1 || result > 4) {
      throw serviceUnavailable();
    }
    this.logger.warn({
      event: "iam.temporary_credential_email.rate_limited",
      dimension: ["global", "tenant", "actor", "employee_reset"][result - 1],
    });
    throw new AuthException(
      HttpStatus.TOO_MANY_REQUESTS,
      "ACCOUNT_TEMP_EMAIL_RATE_LIMITED",
      "Đã gửi quá nhiều email mật khẩu tạm. Vui lòng thử lại sau.",
      "Account management error",
    );
  }
}
