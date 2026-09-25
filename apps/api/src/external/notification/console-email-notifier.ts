import { Injectable, Logger } from "@nestjs/common";
import {
  type EmailNotifier,
  maskEmail,
  type OtpEmailMessage,
  type TemporaryPasswordEmailMessage,
} from "./email-notifier";

/** Dev fallback: never print OTP; configure Resend to test email delivery. */
@Injectable()
export class ConsoleEmailNotifier implements EmailNotifier {
  private readonly logger = new Logger("EmailNotifier");

  async sendOtp(message: OtpEmailMessage): Promise<void> {
    // Production requires Resend at config validation; keep a guard for direct use.
    if (process.env.NODE_ENV === "production") {
      throw new Error("ConsoleEmailNotifier is not available in production.");
    }
    this.logger.warn({
      event: "auth.otp.delivery_unavailable",
      purpose: message.purpose,
      email: maskEmail(message.email)
    });
    throw new Error("OTP delivery unavailable: configure RESEND_API_KEY.");
  }

  async sendTemporaryPassword(message: TemporaryPasswordEmailMessage): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ConsoleEmailNotifier is not available in production.");
    }
    this.logger.warn({
      event: "auth.temporary_password.delivery_unavailable",
      email: maskEmail(message.email),
    });
    throw new Error("Temporary password delivery unavailable: configure RESEND_API_KEY.");
  }
}
