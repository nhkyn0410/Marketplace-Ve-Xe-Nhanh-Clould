import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

/** DI token cho cấu hình môi trường đã validate. */
export const APP_CONFIG = Symbol("APP_CONFIG");

/**
 * Schema env — nguồn chân lý cho biến môi trường app cần (Zod, ADR-010).
 * Connection string để `optional` ở foundation; siết `required` khi module tương ứng
 * được wire (DatabaseModule / MongoAuditModule) + provision dịch vụ thật.
 */
/** Coi chuỗi rỗng / toàn whitespace như "không set" (quy ước env phổ biến). */
const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

// So lại dạng chuẩn: Buffer.from bỏ qua bit đệm/ký tự lạ nên chuỗi gõ sai vẫn "decode được" thành key khác.
const optionalBase64Key32 = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, "must be standard base64")
    .refine(
      (value) => {
        const key = Buffer.from(value, "base64");
        return key.length === 32 && key.toString("base64") === value;
      },
      "must be canonical base64 of exactly 32 bytes",
    )
    .optional(),
);

export const envSchema = z
  .object({
    NODE_ENV: z.preprocess(
      emptyToUndefined,
      z.enum(["development", "test", "production"]).default("development"),
    ),
    PORT: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().positive().max(65535).default(3000),
    ),
    // Số proxy tin cậy tính từ socket gần app nhất. Local mặc định 0 (không tin forwarded IP).
    TRUST_PROXY_HOPS: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().nonnegative().default(0),
    ),

    // Postgres (Prisma) — operational DB
    DATABASE_URL: optionalString,
    // Mongo audit (Mongoose, cluster RIÊNG — ADR-011)
    MONGODB_AUDIT_URI: optionalString,

    // Redis / BullMQ (ADR-015 / ADR-016 — FND-004)
    REDIS_URL: optionalString,
    BULLMQ_PREFIX: optionalString,
    BULL_BOARD_TOKEN: optionalString,

    // Logging (Pino — ADR-026 / FND-006)
    LOG_LEVEL: z.preprocess(
      emptyToUndefined,
      z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
    ),

    // Observability (ADR-026 — FND-006)
    SENTRY_DSN: optionalString,
    SENTRY_ENVIRONMENT: optionalString,
    SENTRY_TRACES_SAMPLE_RATE: z.preprocess(
      emptyToUndefined,
      z.coerce.number().min(0).max(1).default(0.1),
    ),
    OTEL_SERVICE_NAME: z.preprocess(
      emptyToUndefined,
      z.string().min(1).default("vexenhanh-api"),
    ),

    // ── IAM / Auth (TASK-IAM-001) ──
    // Better Auth (ADR-017). Secret bắt buộc ở production (validate khi wire).
    BETTER_AUTH_SECRET: optionalString,
    BETTER_AUTH_URL: z.preprocess(
      emptyToUndefined,
      z.url().default("http://localhost:3000"),
    ),
    // JWT access RS256 (Security §5.1). Key = PEM (raw hoặc base64). Thiếu ở dev → sinh ephemeral.
    JWT_ACCESS_PRIVATE_KEY: optionalString,
    JWT_ACCESS_PUBLIC_KEY: optionalString,
    JWT_ACCESS_TTL_SECONDS: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().positive().default(900),
    ),
    JWT_ISSUER: z.preprocess(
      emptyToUndefined,
      z.string().min(1).default("vexenhanh"),
    ),
    // Refresh token opaque (Security §5.1, ADR-017: 30 ngày). Mặc định = trần = 30 ngày:
    // env chỉ để RÚT NGẮN khi kiểm thử hết hạn, không để kéo dài một quyết định bảo mật.
    // Đặt vượt trần thì app không khởi động (fail-fast), thay vì âm thầm cấp phiên 1 năm.
    REFRESH_TOKEN_TTL_SECONDS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .positive()
        .max(30 * 24 * 60 * 60)
        .default(30 * 24 * 60 * 60),
    ),
    // AES-256-GCM key mã hóa TOTP secret (TASK-IAM-004). Production bắt buộc tách khỏi
    // BETTER_AUTH_SECRET; dev thiếu key thì MfaService mới dùng derivation ổn định có domain separation.
    MFA_ENCRYPTION_KEY: optionalBase64Key32,
    // OAuth Passenger (ADR-020) — v1 chỉ Google; Facebook/Apple defer v1.x (ADR-028: v1 không lên
    // store nên App Store Guideline 4.8 không ép Apple Sign-In). Giữ biến để bật lại không cần sửa schema.
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    FACEBOOK_CLIENT_ID: optionalString,
    FACEBOOK_CLIENT_SECRET: optionalString,
    APPLE_CLIENT_ID: optionalString,
    APPLE_CLIENT_SECRET: optionalString,
    /**
     * Origin được phép nhận redirect sau OAuth. `callbackURL` do client gửi lên KHÔNG được tin:
     * Better Auth lưu nguyên nó vào state rồi redirect tới đó sau khi đã set session cookie
     * → open redirect ở trạng thái đã đăng nhập (nền phishing rất thuyết phục). Mặc định chỉ
     * localhost cho dev; production phải khai tường minh.
     */
    AUTH_ALLOWED_CALLBACK_ORIGINS: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim().length > 0
          ? value
              .split(",")
              .map((origin) => origin.trim())
              .filter(Boolean)
          : undefined,
      z
        .array(z.string().min(1))
        .default([
          "http://localhost:3000",
          "vexenhanh://",
          "vexenhanh-operator://",
        ]),
    ),
    // Email OTP delivery (Resend required for delivery; dev fallback never prints OTP).
    RESEND_API_KEY: optionalString,
    RESEND_FROM_EMAIL: z.preprocess(
      emptyToUndefined,
      z.email().default("no-reply@vexenhanh.com"),
    ),
    // Goong REST (ADR-027, TASK-TRN-002): tính khoảng cách/thời gian khi cấu hình route. Thiếu ở dev →
    // ước lượng đường chim bay (Q8); production bắt buộc để số liệu route không phải ước lượng.
    GOONG_API_KEY: optionalString,
  })
  .superRefine((env, ctx) => {
    // Production fail-fast: secret/key bắt buộc, base URL phải https non-localhost (sec H1/M4).
    if (env.NODE_ENV !== "production") {
      return;
    }
    // RESEND_API_KEY bắt buộc: production không được rơi về dev fallback không gửi OTP.
    for (const key of [
      "BETTER_AUTH_SECRET",
      "JWT_ACCESS_PRIVATE_KEY",
      "MFA_ENCRYPTION_KEY",
      "RESEND_API_KEY",
      "GOONG_API_KEY",
    ] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required in production.`,
        });
      }
    }
    if (
      env.BETTER_AUTH_URL.startsWith("http://") ||
      env.BETTER_AUTH_URL.includes("localhost")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message:
          "BETTER_AUTH_URL must be a non-localhost HTTPS URL in production.",
      });
    }
  });

export type AppConfig = z.infer<typeof envSchema>;

/** Parse + validate env (fail-fast, thông báo rõ). Tách khỏi I/O để unit-test được. */
export function parseAppConfig(
  source: Record<string, unknown> = process.env,
): AppConfig {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}

let cached: AppConfig | undefined;

/**
 * Nạp env 2 phần rồi validate (Node 24 `process.loadEnvFile`):
 *   1) `.env`            → chọn môi trường (`NODE_ENV`).
 *   2) `.env.{NODE_ENV}` → giá trị theo môi trường (vd `.env.development`).
 * Precedence (cao→thấp): env thật (shell/Render) > `.env` > `.env.{NODE_ENV}`
 * (`loadEnvFile` KHÔNG override biến đã set). Trên Render/Docker không có file
 * `.env*` (đã .gitignore + .dockerignore) → đọc env thật từ env group/secrets.
 * Kết quả được cache (gọi nhiều lần an toàn).
 */
export function loadAppConfig(): AppConfig {
  if (cached) {
    return cached;
  }

  const cwd = process.cwd();
  loadEnvFileIfExists(resolve(cwd, ".env"));

  const nodeEnv = process.env.NODE_ENV?.trim() || "development";
  loadEnvFileIfExists(resolve(cwd, `.env.${nodeEnv}`));

  cached = parseAppConfig(process.env);
  return cached;
}

function loadEnvFileIfExists(path: string): void {
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}
