import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// ── Request DTOs (Zod tại boundary, nestjs-zod) ──
export class RegisterDto extends createZodDto(
  z.object({ email: z.email() })
) {}

export class OtpRequestDto extends createZodDto(
  z.object({ email: z.email() })
) {}

export class OtpVerifyDto extends createZodDto(
  z.object({
    email: z.email(),
    otp: z.string().min(4).max(10)
  })
) {}

/** Login Operator/Employee + Platform: identifier = `{slug}/{username}` hoặc `platform/{username}`. */
export class CredentialLoginDto extends createZodDto(
  z.object({
    identifier: z.string().min(3).max(160),
    password: z.string().min(1).max(200)
  })
) {}

export class OAuthInitDto extends createZodDto(
  z.object({ callbackURL: z.url().optional() })
) {}

/** Refresh token opaque (43 ký tự base64url); trần 200 chỉ để chặn payload rác. */
export class RefreshTokenDto extends createZodDto(
  z.object({ refreshToken: z.string().min(1).max(200) })
) {}

/**
 * Mã MFA: TOTP 6 số (app hay hiển thị `123 456`), hoặc backup code 20 hex (`XXXXX-XXXXX-XXXXX-XXXXX`,
 * gạch/khoảng trắng tuỳ ý). Sai định dạng → 400; đúng định dạng nhưng sai mã → 401 generic.
 */
const MfaCodeSchema = z
  .string()
  .trim()
  .regex(/^(\d{3}\s?\d{3}|[0-9A-Fa-f]{5}([\s-]?[0-9A-Fa-f]{5}){3})$/, "TOTP 6 số hoặc backup code.");

/** Challenge MFA là credential tạm thời, entropy 256-bit; không phải access token. */
export class MfaVerifyDto extends createZodDto(
  z.object({
    challengeToken: z.string().min(32).max(200),
    /** Một field cho cả TOTP và backup code (Q: API §7.1 `/auth/mfa/verify`). */
    code: MfaCodeSchema
  })
) {}

/** Đổi mật khẩu tạm trước khi được phép đi tiếp tới MFA/token (TASK-IAM-005 Q4). */
export class PasswordChangeRequiredDto extends createZodDto(
  z.object({
    passwordChangeToken: z.string().min(32).max(200),
    // V1 ưu tiên độ dài thay vì rule ký tự khó nhớ; temp password do server sinh riêng.
    newPassword: z.string().min(12).max(128)
  })
) {}

/** Passenger gửi `otp`; account mật khẩu gửi `password` hoặc `mfaCode` khi MFA đã bật. */
export class ReauthDto extends createZodDto(
  z
    .object({
      password: z.string().min(1).max(200).optional(),
      otp: z.string().min(4).max(10).optional(),
      mfaCode: MfaCodeSchema.optional()
    })
    .refine((body) => [body.password, body.otp, body.mfaCode].filter((value) => value !== undefined).length === 1, {
      message: "Gửi đúng một trong ba: password, otp hoặc mfaCode."
    })
) {}

// ── Response schemas + DTOs ──
export const AuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive(),
  scope: z.enum(["passenger", "operator", "platform"]),
  role: z.string(),
  // IAM-002 — thêm field, KHÔNG đổi tên field cũ (client Dart đang dùng).
  refreshToken: z.string(),
  refreshExpiresIn: z.number().int().positive()
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
export class AuthTokenResponseDto extends createZodDto(AuthTokenResponseSchema) {}

export const MfaChallengeResponseSchema = z.object({
  mfaRequired: z.literal(true),
  challengeToken: z.string(),
  enrollmentRequired: z.boolean(),
  challengeExpiresIn: z.number().int().positive(),
  otpAuthUri: z.string().startsWith("otpauth://totp/").optional()
});
export type MfaChallengeResponse = z.infer<typeof MfaChallengeResponseSchema>;

export const PasswordChangeChallengeResponseSchema = z.object({
  passwordChangeRequired: z.literal(true),
  passwordChangeToken: z.string(),
  passwordChangeExpiresIn: z.number().int().positive()
});
export type PasswordChangeChallengeResponse = z.infer<typeof PasswordChangeChallengeResponseSchema>;

const CredentialTokenResponseSchema = AuthTokenResponseSchema.extend({
  mfaRequired: z.literal(false)
});

/** Login Operator/Platform: token (role không bắt buộc MFA) HOẶC challenge (role bắt buộc MFA). */
// `title`: generator Dart đặt tên model theo nó (thiếu thì ra `...OutputAnyOf1`).
export const CredentialLoginResponseSchema = z.union([
  CredentialTokenResponseSchema.meta({ title: "CredentialTokenResponse" }),
  MfaChallengeResponseSchema.meta({ title: "MfaChallengeResponse" }),
  PasswordChangeChallengeResponseSchema.meta({ title: "PasswordChangeChallengeResponse" })
]);
export type CredentialLoginResponse = z.infer<typeof CredentialLoginResponseSchema>;
// Union không `extends` được (TS2509) → DTO dạng hằng. nestjs-zod đặt tên component OpenAPI theo
// `name` của class (mặc định "AugmentedZodDto") → đặt lại cho client sinh ra có tên có nghĩa.
export const CredentialLoginResponseDto = createZodDto(CredentialLoginResponseSchema);
Object.defineProperty(CredentialLoginResponseDto, "name", { value: "CredentialLoginResponseDto" });

export const MfaVerifyResponseSchema = CredentialTokenResponseSchema.extend({
  /** Chỉ xuất hiện đúng một lần khi enrollment thành công. */
  backupCodes: z.array(z.string()).length(10).optional()
});
export type MfaVerifyResponse = z.infer<typeof MfaVerifyResponseSchema>;
export class MfaVerifyResponseDto extends createZodDto(MfaVerifyResponseSchema) {}

export const MessageResponseSchema = z.object({ status: z.literal("ok") });
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export class MessageResponseDto extends createZodDto(MessageResponseSchema) {}

export const OAuthRedirectResponseSchema = z.object({ redirectUrl: z.url() });
export type OAuthRedirectResponse = z.infer<typeof OAuthRedirectResponseSchema>;
export class OAuthRedirectResponseDto extends createZodDto(OAuthRedirectResponseSchema) {}
