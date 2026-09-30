import { createPublicKey } from "node:crypto";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { z } from "zod";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { isRole, requiresMfa, ROLE_SCOPE } from "../role/role";

const ALG = "RS256";

/**
 * jose là ESM-only → dynamic import (module=Node16 giữ import động ở runtime).
 * Bọc `import()` ở value-position để khỏi cần attribute 'resolution-mode' (TS1542).
 */
const loadJose = () => import("jose");
type Jose = Awaited<ReturnType<typeof loadJose>>;
type SignKey = Parameters<InstanceType<Jose["SignJWT"]>["sign"]>[0];
type VerifyKey = Awaited<ReturnType<Jose["importSPKI"]>>;

export type AuthScope = "passenger" | "operator" | "platform";

export type AccessTokenClaims = {
  /** subject = id account (passenger user / operator-account / platform-account). */
  sub: string;
  /** `auth_sessions.id` — để guard tra được phiên đã bị revoke chưa. */
  sid: string;
  scope: AuthScope;
  role: string;
  /** Chỉ `true` khi session được tạo sau TOTP/backup-code hợp lệ. */
  mfa?: true;
  operatorId?: string;
  operatorSlug?: string;
};

/**
 * Parse bằng Zod dù chữ ký đã đúng: chữ ký chỉ chứng minh token do ta ký, không chứng minh nó
 * đúng hình dạng hiện tại — token IAM-001 (không có `sid`) vẫn ký hợp lệ nhưng KHÔNG revoke được.
 */
const verifiedClaimsSchema = z
  .object({
    sub: z.string().min(1),
    sid: z.uuid(),
    scope: z.enum(["passenger", "operator", "platform"]),
    role: z.string().min(1),
    mfa: z.literal(true).optional(),
    operatorId: z.string().min(1).optional(),
    operatorSlug: z.string().min(1).optional(),
    // jose đã bắt buộc `exp` (requiredClaims) nên token thật luôn có; giữ lại để `/auth/me` trả
    // `accessExpiresAt` (TASK-IAM-006). Optional ở type để fixture test cũ không phải khai.
    exp: z.number().int().positive().optional(),
  })
  .superRefine((claims, ctx) => {
    // TASK-IAM-003: role phải thuộc đúng namespace của scope, và token phía Operator phải mang đủ
    // claim tenant — một lỗi phát token (vd scope platform + role PASSENGER) không được thành quyền.
    if (!isRole(claims.role) || ROLE_SCOPE[claims.role] !== claims.scope) {
      ctx.addIssue({ code: "custom", message: "role không thuộc scope" });
    }
    if (claims.scope === "operator" && (!claims.operatorId || !claims.operatorSlug)) {
      ctx.addIssue({ code: "custom", message: "token operator thiếu claim tenant" });
    }
    // Token cũ / code phát token nhầm không được bypass rollout MFA chỉ vì chữ ký vẫn hợp lệ.
    if (requiresMfa(claims.role) && claims.mfa !== true) {
      ctx.addIssue({ code: "custom", message: "role bắt buộc MFA nhưng token thiếu bằng chứng" });
    }
  });

export type VerifiedAccessToken = z.infer<typeof verifiedClaimsSchema>;

export type IssuedAccessToken = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
};

/**
 * Mint JWT access RS256 (Security §5.1, ADR-017). IAM-001 chỉ phát access ngắn hạn;
 * opaque refresh + rotation + family = IAM-002.
 * Key load từ env (PEM raw/base64); thiếu ở dev → sinh ephemeral (cảnh báo). Production bắt buộc.
 */
@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);
  private jose!: Jose;
  private privateKey!: SignKey;
  private publicKey!: VerifyKey;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  async onModuleInit(): Promise<void> {
    this.jose = await loadJose();

    const privatePem = decodePem(this.config.JWT_ACCESS_PRIVATE_KEY);
    if (privatePem) {
      this.privateKey = await this.jose.importPKCS8(privatePem, ALG);
      // Suy public key TỪ private key thay vì đọc JWT_ACCESS_PUBLIC_KEY: một nguồn duy nhất,
      // không thể lệch cặp. Lệch cặp = mọi token đều 401 mà lúc khởi động không báo gì.
      const publicPem = createPublicKey(privatePem)
        .export({ type: "spki", format: "pem" })
        .toString();
      this.publicKey = await this.jose.importSPKI(publicPem, ALG);
      return;
    }

    if (this.config.NODE_ENV === "production") {
      throw new Error("JWT_ACCESS_PRIVATE_KEY is required in production.");
    }

    this.logger.warn(
      "JWT_ACCESS_PRIVATE_KEY chưa set - sinh keypair ephemeral cho dev (token mất hiệu lực sau restart).",
    );
    const pair = await this.jose.generateKeyPair(ALG, { extractable: true });
    this.privateKey = pair.privateKey;
    this.publicKey = pair.publicKey;
  }

  async mintAccessToken(claims: AccessTokenClaims): Promise<IssuedAccessToken> {
    const ttl = this.config.JWT_ACCESS_TTL_SECONDS;
    const payload: Record<string, string | boolean> = {
      sid: claims.sid,
      scope: claims.scope,
      role: claims.role,
    };
    if (claims.mfa) {
      payload.mfa = true;
    }
    if (claims.operatorId) {
      payload.operatorId = claims.operatorId;
    }
    if (claims.operatorSlug) {
      payload.operatorSlug = claims.operatorSlug;
    }

    const accessToken = await new this.jose.SignJWT(payload)
      .setProtectedHeader({ alg: ALG, typ: "JWT" })
      .setSubject(claims.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setIssuedAt()
      .setExpirationTime(`${ttl}s`)
      .sign(this.privateKey);

    return { accessToken, tokenType: "Bearer", expiresInSeconds: ttl };
  }

  /**
   * `null` = không dùng được: sai chữ ký, hết hạn, sai issuer, sai thuật toán, thiếu/sai claim.
   * Cố ý KHÔNG trả lý do — caller trả đúng một kiểu 401, không cho kẻ dò token biết sai ở đâu.
   */
  async verifyAccessToken(token: string): Promise<VerifiedAccessToken | null> {
    try {
      const { payload } = await this.jose.jwtVerify(token, this.publicKey, {
        issuer: this.config.JWT_ISSUER,
        // jose vốn đã từ chối `alg: none`; khoá cứng thuật toán để chặn nhầm thuật toán
        algorithms: [ALG],
        // jose chỉ kiểm `exp` KHI có mặt: token ký hợp lệ mà thiếu `exp` sẽ sống vĩnh viễn.
        requiredClaims: ["exp", "iat"],
      });
      const claim = verifiedClaimsSchema.safeParse(payload);
      return claim.success ? claim.data : null;
    } catch {
      return null;
    }
  }
}

/** Nhận PEM raw (chứa "BEGIN") hoặc base64-encoded PEM. */
function decodePem(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.includes("BEGIN")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");
}
