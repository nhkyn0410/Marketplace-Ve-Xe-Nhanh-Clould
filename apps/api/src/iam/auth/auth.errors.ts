import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Lỗi auth → RFC 7807 (ADR-012) với `code` GLOSSARY. ProblemDetailsExceptionFilter
 * đọc `{ code, detail, title }` từ response. KHÔNG tiết lộ account tồn tại hay không (LLD §7).
 */
export class AuthException extends HttpException {
  constructor(
    status: HttpStatus,
    code: string,
    detail: string,
    title = "Authentication error",
  ) {
    super({ code, detail, title }, status);
  }
}

/** Sai credential HOẶC account không tồn tại — cùng 1 response (chống account enumeration). */
export function invalidCredentials(): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_INVALID_CREDENTIALS",
    "Thông tin đăng nhập không hợp lệ.",
  );
}

/** Account bị khóa/vô hiệu — chỉ trả khi credential ĐÚNG (không leak). */
export function accountLocked(): AuthException {
  return new AuthException(
    HttpStatus.FORBIDDEN,
    "AUTH_ACCOUNT_LOCKED",
    "Tài khoản đã bị khóa hoặc vô hiệu hóa.",
  );
}

/** OTP/đăng nhập vượt giới hạn tần suất (SEC-OQ-07). */
export function otpRateLimited(): AuthException {
  return new AuthException(
    HttpStatus.TOO_MANY_REQUESTS,
    "AUTH_OTP_RATE_LIMITED",
    "Yêu cầu OTP quá nhiều. Vui lòng thử lại sau.",
  );
}

/** Sai cổng đăng nhập cho namespace (FR-IAM-02b/02c). */
export function wrongLoginChannel(): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_INVALID_CREDENTIALS",
    "Thông tin đăng nhập không hợp lệ.",
  );
}

/** Credential đầu tiên đúng nhưng role bắt buộc chưa hoàn tất MFA. */
export function mfaRequired(): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_MFA_REQUIRED",
    "Phiên đăng nhập cần xác thực MFA.",
  );
}

/** Thao tác nhạy cảm cần bằng chứng `/auth/re-auth` còn hiệu lực (TASK-IAM-005 Q8). */
export function reauthRequired(): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_REAUTH_REQUIRED",
    "Vui lòng xác thực lại trước khi thực hiện thao tác này.",
  );
}

export function passwordChangeRequired(detail = "Bạn phải đổi mật khẩu tạm trước khi đăng nhập."): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_PASSWORD_CHANGE_REQUIRED",
    detail,
  );
}

export function invalidPasswordChangeToken(): AuthException {
  return new AuthException(
    HttpStatus.UNAUTHORIZED,
    "AUTH_PASSWORD_CHANGE_TOKEN_INVALID",
    "Yêu cầu đổi mật khẩu không hợp lệ hoặc đã hết hạn.",
  );
}

export function passwordReuseForbidden(): AuthException {
  return new AuthException(
    HttpStatus.BAD_REQUEST,
    "AUTH_PASSWORD_REUSE_FORBIDDEN",
    "Mật khẩu mới phải khác mật khẩu tạm.",
  );
}

/** Redis chết → fail-closed (KHÔNG bypass) nhưng trả đúng 503 thay vì 500 (ADR-015). */
export function serviceUnavailable(): AuthException {
  return new AuthException(
    HttpStatus.SERVICE_UNAVAILABLE,
    "SERVICE_UNAVAILABLE",
    "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.",
  );
}
