import { HttpStatus } from "@nestjs/common";
import { AuthException } from "../auth/auth.errors";

const TITLE = "Account management error";

export function accountUsernameConflict(): AuthException {
  return new AuthException(
    HttpStatus.CONFLICT,
    "ACCOUNT_USERNAME_CONFLICT",
    "Tên đăng nhập đã tồn tại trong nhà xe.",
    TITLE,
  );
}

/** Cố ý dùng chung cho không tồn tại và khác tenant để chống enumeration/IDOR. */
export function accountNotFound(): AuthException {
  return new AuthException(
    HttpStatus.NOT_FOUND,
    "ACCOUNT_NOT_FOUND",
    "Không tìm thấy tài khoản.",
    TITLE,
  );
}

export function accountStateConflict(): AuthException {
  return new AuthException(
    HttpStatus.CONFLICT,
    "ACCOUNT_STATE_CONFLICT",
    "Trạng thái tài khoản đã thay đổi hoặc không cho phép thao tác này.",
    TITLE,
  );
}

export function temporaryPasswordDeliveryFailed(employeeId?: string): AuthException {
  return new AuthException(
    HttpStatus.SERVICE_UNAVAILABLE,
    "SERVICE_UNAVAILABLE",
    employeeId
      ? `Không thể gửi mật khẩu tạm. Employee ${employeeId} đã được tạo; dùng ID này để đặt lại mật khẩu sau.`
      : "Không thể gửi mật khẩu tạm. Tài khoản vẫn chờ giao thông tin đăng nhập; vui lòng thử lại sau.",
    TITLE,
  );
}

export function isPrismaUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
