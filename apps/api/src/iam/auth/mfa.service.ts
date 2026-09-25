import { createHash, randomBytes } from "node:crypto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import type Redis from "ioredis";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { type DbTransaction, PrismaService } from "../../database/prisma.service";
import { SubjectType } from "../../database/prisma.types";
import { REDIS_CLIENT } from "../../redis/redis.config";
import { SessionService } from "../session/session.service";
import { DEV_BETTER_AUTH_SECRET } from "./auth.config";
import { invalidCredentials, serviceUnavailable } from "./auth.errors";
import type { RequestContext } from "./auth.service";
import { LoginHistoryService } from "./login-history.service";
import { OtpRateLimiter } from "./otp-rate-limiter";
import { createOtpAuthUri, generateTotpSecret, openMfaValue, sealMfaValue, verifyTotp } from "./totp";

export const MFA_CHALLENGE_TTL_SECONDS = 5 * 60;
export const MFA_BACKUP_CODE_COUNT = 10;
export const MFA_MAX_CHALLENGE_ATTEMPTS = 5;

const MFA_CHALLENGE_LOCK_SECONDS = 30;
const BACKUP_CODE_BYTES = 10;

/**
 * Challenge là một HASH `{ payload, attempts }`: đếm lần thử bằng HINCRBY, không cần `cjson`
 * (Lua trên Redis managed không chắc có). Chỉ các lệnh Redis thuần.
 * Export để unit test giả lập đúng từng script; không dùng ngoài file này.
 */
export const MFA_CHALLENGE_SCRIPTS = {
  /** Tạo challenge + TTL trong MỘT lệnh: lỗi giữa HSET và EXPIRE không để lại key sống mãi. */
  create: `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('HSET', KEYS[1], 'payload', ARGV[1], 'attempts', 0)
redis.call('EXPIRE', KEYS[1], ARGV[2])
return 1
`,
  /**
   * Một verifier giữ lease ngắn trong lúc giải mã/đọc DB; lease và bộ đếm lần thử lấy cùng một
   * lệnh. Process chết giữa chừng chỉ làm challenge kẹt 30 giây, không phải cả TTL.
   */
  claim: `
if redis.call('EXISTS', KEYS[1]) == 0 then return {'MISSING'} end
if not redis.call('SET', KEYS[2], ARGV[1], 'EX', ARGV[2], 'NX') then return {'BUSY'} end
local attempts = redis.call('HINCRBY', KEYS[1], 'attempts', 1)
if attempts > tonumber(ARGV[3]) then
  redis.call('DEL', KEYS[1], KEYS[2])
  return {'LIMIT'}
end
return {'OK', redis.call('HGET', KEYS[1], 'payload')}
`,
  /** Proof sai: trả lease; lần sai thứ 5 xoá luôn challenge. */
  release: `
if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
local attempts = tonumber(redis.call('HGET', KEYS[1], 'attempts') or '0')
if attempts >= tonumber(ARGV[2]) then redis.call('DEL', KEYS[1]) end
redis.call('DEL', KEYS[2])
return 1
`,
  /** Proof đúng: chỉ được đổi Postgres SAU khi compare-and-delete này thành công. */
  consume: `
if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
if redis.call('EXISTS', KEYS[1]) == 0 then
  redis.call('DEL', KEYS[2])
  return 0
end
redis.call('DEL', KEYS[1], KEYS[2])
return 1
`,
} as const;

export type MfaSubject = {
  subjectType: SubjectType;
  subjectId: string;
  operatorId?: string;
};

export type MfaPrincipal = MfaSubject & { label: string };

export type MfaChallengeResult = {
  mfaRequired: true;
  challengeToken: string;
  enrollmentRequired: boolean;
  challengeExpiresIn: number;
  otpAuthUri?: string;
};

export type MfaVerificationMethod = "totp" | "backup_code";

export type VerifyMfaResult<T> = MfaSubject & {
  enrolled: boolean;
  method: MfaVerificationMethod;
  backupCodes?: string[];
  /** Kết quả `precheck` của caller (vd account đã nạp) — tránh đọc lại DB. */
  checked: T;
};

type StoredChallenge = MfaSubject & {
  version: 1;
  enrollmentRequired: boolean;
  secretCiphertext?: string;
};

type ChallengeLease = {
  tokenHash: string;
  lockToken: string;
};

type ClaimedChallenge = ChallengeLease & { value: StoredChallenge };

type StoredCredential = {
  id: string;
  secretCiphertext: string;
  lastTotpCounter: bigint | null;
};

type ResolvedProof = { method: "totp"; counter: bigint } | { method: "backup_code"; backupCodeId: string };

const CREDENTIAL_SELECT = {
  id: true,
  secretCiphertext: true,
  lastTotpCounter: true,
} as const;

/**
 * TOTP + backup code cho role bắt buộc MFA (TASK-IAM-004, ADR-017).
 * - Hai bảng MFA chỉ mở cho ngữ cảnh `system` (RLS) → mọi truy vấn đi qua `withSystem`.
 * - Payload challenge trong Redis được niêm phong AES-GCM (AAD = hash token): ai ghi được Redis cũng
 *   không tự dựng được challenge cho account khác — trước IAM-004 quyền ghi Redis không tạo ra phiên.
 */
@Injectable()
export class MfaService {
  private readonly encryptionKey: Buffer;

  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly sessions: SessionService,
    private readonly limiter: OtpRateLimiter,
    private readonly loginHistory: LoginHistoryService,
  ) {
    this.encryptionKey = resolveEncryptionKey(config);
  }

  /** Password đã đúng: tạo pre-auth challenge, CHƯA có session hay token nào. */
  async begin(principal: MfaPrincipal, ctx: RequestContext): Promise<MfaChallengeResult> {
    const credential = await this.system((tx) =>
      tx.mfaCredential.findUnique({
        where: {
          subjectType_subjectId: { subjectType: principal.subjectType, subjectId: principal.subjectId },
        },
        select: { id: true },
      }),
    );
    const enrollmentRequired = credential === null;
    const secret = enrollmentRequired ? generateTotpSecret() : undefined;
    const stored: StoredChallenge = {
      version: 1,
      subjectType: principal.subjectType,
      subjectId: principal.subjectId,
      ...(principal.operatorId ? { operatorId: principal.operatorId } : {}),
      enrollmentRequired,
      // Secret enrollment chỉ vào Postgres khi TOTP đầu tiên đúng; AAD khoá nó vào đúng chủ thể.
      ...(secret ? { secretCiphertext: sealMfaValue(secret, this.encryptionKey, secretContext(principal)) } : {}),
    };
    const challengeToken = randomBytes(32).toString("base64url");
    const tokenHash = hashChallengeToken(challengeToken);

    let created: unknown;
    try {
      created = await this.redis.eval(
        MFA_CHALLENGE_SCRIPTS.create,
        1,
        challengeKey(tokenHash),
        sealMfaValue(JSON.stringify(stored), this.encryptionKey, challengeContext(tokenHash)),
        String(MFA_CHALLENGE_TTL_SECONDS),
      );
    } catch {
      throw serviceUnavailable();
    }
    if (Number(created) !== 1) {
      throw serviceUnavailable();
    }

    // Password đúng mà không đi tiếp MFA vẫn phải để lại dấu vết (dò mật khẩu thành công).
    this.record(principal, "auth.mfa.challenge_issued", principal.subjectId, ctx);
    return {
      mfaRequired: true,
      challengeToken,
      enrollmentRequired,
      challengeExpiresIn: MFA_CHALLENGE_TTL_SECONDS,
      ...(secret ? { otpAuthUri: createOtpAuthUri(secret, principal.label) } : {}),
    };
  }

  /**
   * Mọi thất bại (sai / hết hạn / replay / quá lần thử / race) → cùng một 401 generic.
   * `precheck` (vd account/tenant còn active) chạy SAU khi proof đúng nhưng TRƯỚC khi tiêu proof:
   * account bị khoá thì backup code không bị đốt, và kẻ tấn công không enroll được secret của mình.
   */
  async verifyChallenge<T>(
    challengeToken: string,
    code: string,
    ctx: RequestContext,
    precheck: (subject: MfaSubject) => Promise<T>,
  ): Promise<VerifyMfaResult<T>> {
    const claimed = await this.claimChallenge(challengeToken);
    const { value } = claimed;
    const subject = subjectOf(value);
    const failures = failureKey(value, "login");
    try {
      await this.assertNotLocked(subject, failures, ctx);
    } catch (error) {
      await this.consumeChallenge(claimed);
      throw error;
    }

    const credential = value.enrollmentRequired
      ? null
      : await this.findCredential(value.subjectType, value.subjectId);
    const proof = value.enrollmentRequired
      ? this.enrollmentProof(value, code)
      : credential && (await this.resolveProof(subject, credential, code));
    if (!proof) {
      return this.rejectClaim(claimed, ctx);
    }

    let checked: T;
    try {
      checked = await precheck(subject);
    } catch (error) {
      await this.consumeChallenge(claimed);
      throw error;
    }
    if (!(await this.consumeChallenge(claimed))) {
      // Thua race với request song song cùng challenge — không phải đoán sai, không tính vào trần.
      this.record(value, "auth.mfa.verification_failed", credential?.id ?? value.subjectId, ctx);
      throw invalidCredentials();
    }

    let backupCodes: string[] | undefined;
    let credentialId: string;
    if (credential) {
      if (!(await this.applyProof(credential.id, proof))) {
        this.record(value, "auth.mfa.verification_failed", credential.id, ctx);
        throw invalidCredentials();
      }
      credentialId = credential.id;
    } else {
      backupCodes = generateBackupCodes();
      credentialId = await this.enroll(value, proof, backupCodes);
    }

    await this.limiter.clearMfaFailures(failures);
    this.record(value, credential ? proofAction(proof) : "auth.mfa.enrolled", credentialId, ctx);
    return {
      ...subject,
      enrolled: !credential,
      method: proof.method,
      ...(backupCodes ? { backupCodes } : {}),
      checked,
    };
  }

  /**
   * `/auth/re-auth`: cùng đường proof atomic với login; sai/replay → `null`. Bộ đếm lần sai RIÊNG:
   * dùng chung với login thì kẻ cầm phiên bị đánh cắp (không cần mật khẩu) cố ý sai re-auth là khoá
   * được chủ account khỏi đăng nhập MFA suốt cửa sổ 24h.
   */
  async verifyForSubject(subject: MfaSubject, code: string, ctx: RequestContext): Promise<MfaVerificationMethod | null> {
    const failures = failureKey(subject, "reauth");
    await this.assertNotLocked(subject, failures, ctx);
    const credential = await this.findCredential(subject.subjectType, subject.subjectId);
    const proof = credential && (await this.resolveProof(subject, credential, code));
    if (!credential || !proof) {
      await this.limiter.recordMfaFailure(failures);
      this.record(subject, "auth.mfa.verification_failed", credential?.id ?? subject.subjectId, ctx);
      return null;
    }
    if (!(await this.applyProof(credential.id, proof))) {
      this.record(subject, "auth.mfa.verification_failed", credential.id, ctx);
      return null;
    }
    await this.limiter.clearMfaFailures(failures);
    this.record(subject, proofAction(proof), credential.id, ctx);
    return proof.method;
  }

  private enrollmentProof(value: StoredChallenge, code: string): ResolvedProof | null {
    if (!value.secretCiphertext) {
      return null;
    }
    const secret = openMfaValue(value.secretCiphertext, this.encryptionKey, secretContext(value));
    const counter = verifyTotp(secret, normalizeTotp(code));
    return counter === null ? null : { method: "totp", counter };
  }

  private async enroll(value: StoredChallenge, proof: ResolvedProof, backupCodes: string[]): Promise<string> {
    try {
      const credential = await this.system((tx) =>
        tx.mfaCredential.create({
          data: {
            subjectType: value.subjectType,
            subjectId: value.subjectId,
            secretCiphertext: value.secretCiphertext!,
            lastTotpCounter: proof.method === "totp" ? proof.counter : null,
            backupCodes: {
              create: backupCodes.map((backupCode) => ({ codeHash: hashMfaBackupCode(backupCode) })),
            },
          },
          select: { id: true },
        }),
      );
      return credential.id;
    } catch (error) {
      // Hai challenge enrollment song song của cùng account: chỉ cái đầu tiên được lưu.
      if (isUniqueConflict(error)) {
        throw invalidCredentials();
      }
      throw error;
    }
  }

  private findCredential(subjectType: SubjectType, subjectId: string): Promise<StoredCredential | null> {
    return this.system((tx) =>
      tx.mfaCredential.findUnique({
        where: { subjectType_subjectId: { subjectType, subjectId } },
        select: CREDENTIAL_SELECT,
      }),
    );
  }

  private async resolveProof(
    subject: MfaSubject,
    credential: StoredCredential,
    code: string,
  ): Promise<ResolvedProof | null> {
    const totp = normalizeTotp(code);
    if (/^\d{6}$/.test(totp)) {
      const secret = openMfaValue(credential.secretCiphertext, this.encryptionKey, secretContext(subject));
      const counter = verifyTotp(secret, totp, { lastCounter: credential.lastTotpCounter });
      return counter === null ? null : { method: "totp", counter };
    }

    const backup = await this.system((tx) =>
      tx.mfaBackupCode.findUnique({
        where: {
          credentialId_codeHash: { credentialId: credential.id, codeHash: hashMfaBackupCode(code) },
        },
        select: { id: true, usedAt: true },
      }),
    );
    return backup && backup.usedAt === null ? { method: "backup_code", backupCodeId: backup.id } : null;
  }

  /** Compare-and-set trong Postgres: hai request cùng counter / cùng backup code chỉ một thắng. */
  private async applyProof(credentialId: string, proof: ResolvedProof): Promise<boolean> {
    const { count } = await this.system((tx) =>
      proof.method === "totp"
        ? tx.mfaCredential.updateMany({
            where: {
              id: credentialId,
              OR: [{ lastTotpCounter: null }, { lastTotpCounter: { lt: proof.counter } }],
            },
            data: { lastTotpCounter: proof.counter },
          })
        : tx.mfaBackupCode.updateMany({
            where: { id: proof.backupCodeId, credentialId, usedAt: null },
            data: { usedAt: new Date() },
          }),
    );
    return count === 1;
  }

  private async claimChallenge(challengeToken: string): Promise<ClaimedChallenge> {
    const tokenHash = hashChallengeToken(challengeToken);
    const lockToken = randomBytes(24).toString("base64url");
    let result: unknown;
    try {
      result = await this.redis.eval(
        MFA_CHALLENGE_SCRIPTS.claim,
        2,
        challengeKey(tokenHash),
        lockKey(tokenHash),
        lockToken,
        String(MFA_CHALLENGE_LOCK_SECONDS),
        String(MFA_MAX_CHALLENGE_ATTEMPTS),
      );
    } catch {
      throw serviceUnavailable();
    }

    const [status, payload] = Array.isArray(result) ? result.map(String) : [];
    if (status !== "OK" || !payload) {
      throw invalidCredentials();
    }
    const value = this.openChallenge(payload, tokenHash);
    if (!value) {
      await this.consumeChallenge({ tokenHash, lockToken });
      throw invalidCredentials();
    }
    return { tokenHash, lockToken, value };
  }

  /** Payload không mở được bằng key + đúng hash token (bị sửa / ghép từ token khác) → coi như không có. */
  private openChallenge(payload: string, tokenHash: string): StoredChallenge | null {
    try {
      return parseStoredChallenge(openMfaValue(payload, this.encryptionKey, challengeContext(tokenHash)));
    } catch {
      return null;
    }
  }

  private async rejectClaim(claimed: ClaimedChallenge, ctx: RequestContext): Promise<never> {
    const { value } = claimed;
    try {
      await this.redis.eval(
        MFA_CHALLENGE_SCRIPTS.release,
        2,
        challengeKey(claimed.tokenHash),
        lockKey(claimed.tokenHash),
        claimed.lockToken,
        String(MFA_MAX_CHALLENGE_ATTEMPTS),
      );
    } catch {
      throw serviceUnavailable();
    }
    await this.limiter.recordMfaFailure(failureKey(value, "login"));
    // Password đúng + MFA sai = dấu hiệu mạnh nhất của mật khẩu bị lộ → vào lịch sử đăng nhập kèm IP.
    await this.loginHistory.record({
      scope: value.subjectType === SubjectType.PLATFORM ? "platform" : "operator",
      result: "failure",
      targetId: value.subjectId,
      accountId: value.subjectId,
      operatorId: value.operatorId,
      reason: "mfa_invalid",
      ...ctx,
    });
    throw invalidCredentials();
  }

  private async consumeChallenge(claimed: ChallengeLease): Promise<boolean> {
    try {
      const result = await this.redis.eval(
        MFA_CHALLENGE_SCRIPTS.consume,
        2,
        challengeKey(claimed.tokenHash),
        lockKey(claimed.tokenHash),
        claimed.lockToken,
      );
      return Number(result) === 1;
    } catch {
      throw serviceUnavailable();
    }
  }

  /** Chạm trần = dấu hiệu mạnh của mật khẩu/phiên bị lộ → để lại audit (không chỉ log). */
  private async assertNotLocked(subject: MfaSubject, key: string, ctx: RequestContext): Promise<void> {
    try {
      await this.limiter.assertMfaNotLocked(key);
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
        this.record(subject, "auth.mfa.locked", subject.subjectId, ctx);
      }
      throw error;
    }
  }

  private system<T>(work: (tx: DbTransaction) => Promise<T>): Promise<T> {
    return this.prisma.withSystem(work);
  }

  /** Audit chỉ metadata: KHÔNG bao giờ code, secret, challenge token. */
  private record(subject: MfaSubject, action: string, targetId: string, ctx: RequestContext): void {
    this.sessions.recordEvent({
      actorId: subject.subjectId,
      actorRole: subject.subjectType,
      action,
      targetType: "mfa_credential",
      targetId,
      operatorId: subject.operatorId,
      after: {
        ...(ctx.ip ? { ip: ctx.ip } : {}),
        ...(ctx.userAgent ? { userAgent: ctx.userAgent } : {}),
      },
    });
  }
}

/** Backup code 80-bit ngẫu nhiên → SHA-256 là đủ (không cần hash chậm như mật khẩu). */
export function hashMfaBackupCode(code: string): string {
  return createHash("sha256")
    .update("vexenhanh:mfa-backup-code:v1\0", "utf8")
    .update(code.replace(/[\s-]/g, "").toUpperCase(), "utf8")
    .digest("hex");
}

/** Hash tag `{…}`: challenge và lock cùng slot — script 2 key không lỗi CROSSSLOT trên Redis Cluster. */
function challengeKey(tokenHash: string): string {
  return `mfa:challenge:{${tokenHash}}`;
}

function lockKey(tokenHash: string): string {
  return `mfa:challenge-lock:{${tokenHash}}`;
}

function challengeContext(tokenHash: string): string {
  return `mfa-challenge:${tokenHash}`;
}

function secretContext(subject: Pick<MfaSubject, "subjectType" | "subjectId">): string {
  return `mfa-secret:${subject.subjectType}:${subject.subjectId}`;
}

/** Bộ đếm lần sai: login và re-auth tách riêng (xem `verifyForSubject`). */
function failureKey(subject: Pick<MfaSubject, "subjectType" | "subjectId">, channel: "login" | "reauth"): string {
  const userRef = `${subject.subjectType.toLowerCase()}:${subject.subjectId}`;
  return channel === "login" ? userRef : `reauth:${userRef}`;
}

function subjectOf(value: StoredChallenge): MfaSubject {
  return {
    subjectType: value.subjectType,
    subjectId: value.subjectId,
    ...(value.operatorId ? { operatorId: value.operatorId } : {}),
  };
}

/** Nhiều app hiển thị TOTP dạng `123 456`. */
function normalizeTotp(code: string): string {
  return code.replace(/\s/g, "");
}

function proofAction(proof: ResolvedProof): string {
  return proof.method === "backup_code" ? "auth.mfa.backup_code_used" : "auth.mfa.verified";
}

/** 10 mã dạng `XXXXX-XXXXX-XXXXX-XXXXX` (20 hex = 80 bit). */
function generateBackupCodes(): string[] {
  const codes = new Set<string>();
  while (codes.size < MFA_BACKUP_CODE_COUNT) {
    const raw = randomBytes(BACKUP_CODE_BYTES).toString("hex").toUpperCase();
    codes.add(raw.match(/.{5}/g)!.join("-"));
  }
  return [...codes];
}

/** Env schema đã kiểm base64 chuẩn + đúng 32 byte; ở đây chỉ còn fallback dev. */
export function resolveEncryptionKey(config: AppConfig): Buffer {
  if (config.MFA_ENCRYPTION_KEY) {
    return Buffer.from(config.MFA_ENCRYPTION_KEY, "base64");
  }
  if (config.NODE_ENV === "production") {
    throw new Error("MFA_ENCRYPTION_KEY is required in production.");
  }
  // Dev/test thiếu key: derive ổn định, tách miền khỏi mục đích khác của BETTER_AUTH_SECRET.
  return createHash("sha256")
    .update("vexenhanh:mfa-development-key:v1\0", "utf8")
    .update(config.BETTER_AUTH_SECRET ?? DEV_BETTER_AUTH_SECRET, "utf8")
    .digest();
}

function hashChallengeToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function parseStoredChallenge(raw: string): StoredChallenge | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const challenge = parsed as Partial<StoredChallenge>;
  if (
    challenge.version !== 1 ||
    !isMfaSubjectType(challenge.subjectType) ||
    typeof challenge.subjectId !== "string" ||
    challenge.subjectId.length === 0 ||
    (challenge.operatorId !== undefined && typeof challenge.operatorId !== "string") ||
    typeof challenge.enrollmentRequired !== "boolean" ||
    (challenge.secretCiphertext !== undefined && typeof challenge.secretCiphertext !== "string")
  ) {
    return null;
  }
  return challenge as StoredChallenge;
}

function isMfaSubjectType(value: unknown): value is SubjectType {
  return value === SubjectType.OPERATOR || value === SubjectType.EMPLOYEE || value === SubjectType.PLATFORM;
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
