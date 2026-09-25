/**
 * Port gửi email (adapter pattern — ADR-006/020). Domain service chỉ phụ thuộc
 * interface này; KHÔNG import SDK vendor trực tiếp (LLD-PRIN-07).
 * Phạm vi IAM-001: gửi OTP. Notification đầy đủ (push/sms) = layer riêng sau.
 */
export const EMAIL_NOTIFIER = Symbol("EMAIL_NOTIFIER");

export type OtpEmailMessage = {
  email: string;
  otp: string;
  /** "sign-in" | "email-verification" | "forget-password" (Better Auth email-OTP type). */
  purpose: string;
};

export type TemporaryPasswordEmailMessage = {
  email: string;
  /** Plaintext secret chỉ tồn tại trong memory để gửi đúng một lần; caller không được log/lưu. */
  temporaryPassword: string;
  loginIdentifier: string;
  expiresAt: Date;
};

export interface EmailNotifier {
  sendOtp(message: OtpEmailMessage): Promise<void>;
  /** Optional trong port để adapter/mocks OTP legacy không giả vờ hỗ trợ enrollment. */
  sendTemporaryPassword?(message: TemporaryPasswordEmailMessage): Promise<void>;
}

/** Mask email cho log/audit — không lộ địa chỉ đầy đủ (Security §9). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) {
    return "***";
  }
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}
