import { Logger } from "@nestjs/common";
import {
  type EmailNotifier,
  maskEmail,
  type OtpEmailMessage,
  type TemporaryPasswordEmailMessage,
} from "./email-notifier";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Production adapter — gọi Resend REST API qua `fetch` (KHÔNG cần SDK → distroless-safe).
 * Chỉ dùng khi có `RESEND_API_KEY` (ADR-020 — free tier).
 */
export class ResendEmailNotifier implements EmailNotifier {
  private readonly logger = new Logger("EmailNotifier");

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string
  ) {}

  async sendOtp(message: OtpEmailMessage): Promise<void> {
    await this.send(
      message.email,
      "Mã OTP đăng nhập Vé Xe Nhanh",
      `<p>Mã OTP của bạn: <strong>${escapeHtml(message.otp)}</strong></p><p>Mã hết hạn sau 5 phút. Không chia sẻ mã cho bất kỳ ai.</p>`,
      "OTP",
    );
  }

  async sendTemporaryPassword(message: TemporaryPasswordEmailMessage): Promise<void> {
    await this.send(
      message.email,
      "Tài khoản Vé Xe Nhanh của bạn",
      `<p>Tài khoản: <strong>${escapeHtml(message.loginIdentifier)}</strong></p>` +
        `<p>Mật khẩu tạm: <strong>${escapeHtml(message.temporaryPassword)}</strong></p>` +
        `<p>Mật khẩu tạm hết hạn lúc ${escapeHtml(message.expiresAt.toISOString())}. ` +
        "Bạn phải đổi mật khẩu trong lần đăng nhập đầu tiên.</p>",
      "temporary password",
    );
  }

  private async send(
    email: string,
    subject: string,
    html: string,
    kind: string,
  ): Promise<void> {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      this.logger.error(
        `Resend gửi ${kind} thất bại cho ${maskEmail(email)}: HTTP ${response.status}`
      );
      throw new Error(`Resend email failed with status ${response.status}`);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
