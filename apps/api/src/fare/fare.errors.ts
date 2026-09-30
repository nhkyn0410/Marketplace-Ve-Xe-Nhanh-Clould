import { HttpException, HttpStatus } from "@nestjs/common";

const TITLE = "Fare error";

function problem(status: HttpStatus, code: string, detail: string): HttpException {
  // ProblemDetailsExceptionFilter đọc `{ code, detail, title }` → RFC 7807 (ADR-012).
  return new HttpException({ code, detail, title: TITLE }, status);
}

/** Bảng giá không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id (IDOR). */
export function fareNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "FARE_NOT_FOUND", "Không tìm thấy bảng giá.");
}

/** Tuyến đã có bảng giá (mỗi tuyến một bảng giá). */
export function fareRouteConflict(): HttpException {
  return problem(HttpStatus.CONFLICT, "FARE_ROUTE_CONFLICT", "Tuyến này đã có bảng giá.");
}

/** Hai rule cùng loại xe × loại chỗ cùng là giá thường, hoặc chồng khung giờ khởi hành → giá không xác định. */
export function fareRulesOverlap(): HttpException {
  return problem(
    HttpStatus.BAD_REQUEST,
    "FARE_RULES_OVERLAP",
    "Có hai quy tắc giá cùng loại xe và loại chỗ bị trùng (cùng là giá thường hoặc chồng khung giờ).",
  );
}

/** Không ghi được lịch sử giá (Mongo chậm / sập) hoặc transaction hết hạn — bảng giá KHÔNG đổi, client thử lại. */
export function fareHistoryUnavailable(): HttpException {
  return problem(
    HttpStatus.SERVICE_UNAVAILABLE,
    "SERVICE_UNAVAILABLE",
    "Chưa ghi được lịch sử giá nên bảng giá chưa thay đổi. Vui lòng thử lại sau.",
  );
}

/** Prisma P2028: transaction tương tác đã hết hạn / đóng (vd chờ khoá quá lâu) — Postgres đã rollback. */
export function isTransactionExpired(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "P2028";
}

/** Lỗi Postgres do EXCLUDE chống trùng phạm vi rule (SQLSTATE 23P01) — chốt chặn cuối sau kiểm tra ở service. */
export function isFareRuleOverlapViolation(error: unknown): boolean {
  // Prisma 7 + driver adapter: lỗi DB nằm ở `cause` của `DriverAdapterError`.
  const cause = (error as { cause?: { originalCode?: unknown; originalMessage?: unknown } } | null)?.cause;
  return (
    cause?.originalCode === "23P01" &&
    typeof cause.originalMessage === "string" &&
    (cause.originalMessage.includes("fare_rules_base_unique") ||
      cause.originalMessage.includes("fare_rules_window_no_overlap"))
  );
}
