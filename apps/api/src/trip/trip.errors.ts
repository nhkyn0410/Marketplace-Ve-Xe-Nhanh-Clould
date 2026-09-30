import { HttpException, HttpStatus } from "@nestjs/common";

const TITLE = "Trip error";

function problem(status: HttpStatus, code: string, detail: string): HttpException {
  // ProblemDetailsExceptionFilter đọc `{ code, detail, title }` → RFC 7807 (ADR-012).
  return new HttpException({ code, detail, title: TITLE }, status);
}

/** Chuyến không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id (IDOR). */
export function tripNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "TRIP_NOT_FOUND", "Không tìm thấy chuyến.");
}

/** Chuyến đã rời `DRAFT` — sửa chuyến đang bán/đã bán thuộc luồng riêng (TRN-006/008). */
export function tripNotEditable(): HttpException {
  return problem(HttpStatus.CONFLICT, "TRIP_NOT_EDITABLE", "Chỉ sửa được chuyến đang ở trạng thái nháp.");
}

/** Route không tồn tại, thuộc tenant khác hoặc đã ngừng dùng — không phân biệt để không lộ dữ liệu tenant khác. */
export function routeUnavailable(): HttpException {
  return problem(HttpStatus.UNPROCESSABLE_ENTITY, "ROUTE_UNAVAILABLE", "Tuyến không tồn tại hoặc đã ngừng dùng.");
}

/** Xe không tồn tại, thuộc tenant khác, không `ACTIVE` hoặc chưa có sơ đồ ghế (UC-14 A2). */
export function vehicleUnavailable(): HttpException {
  return problem(
    HttpStatus.UNPROCESSABLE_ENTITY,
    "VEHICLE_UNAVAILABLE",
    "Xe không tồn tại, không hoạt động hoặc chưa có sơ đồ ghế.",
  );
}

/** Số giờ dự kiến gửi lên khác số điểm của route. */
export function tripStopTimesInvalid(): HttpException {
  return problem(
    HttpStatus.UNPROCESSABLE_ENTITY,
    "TRIP_STOP_TIMES_INVALID",
    "Số giờ dự kiến phải bằng số điểm dừng của tuyến.",
  );
}

/** BR-14 / UC-14 A1: xe đã chạy chuyến khác chồng giờ. */
export function vehicleScheduleConflict(): HttpException {
  return problem(HttpStatus.CONFLICT, "VEHICLE_SCHEDULE_CONFLICT", "Xe đã được gắn cho chuyến khác trùng thời gian.");
}

// Prisma 7 + driver adapter: lỗi DB nằm ở `cause` của `DriverAdapterError` (test tích hợp giữ bất biến này khi nâng Prisma).
function dbCause(error: unknown): { originalCode?: unknown; originalMessage?: unknown } | undefined {
  return (error as { cause?: { originalCode?: unknown; originalMessage?: unknown } } | null)?.cause;
}

/** Lỗi Postgres do ràng buộc EXCLUDE chống chồng giờ của xe (`trips_vehicle_no_overlap`, SQLSTATE 23P01). */
export function isVehicleOverlapViolation(error: unknown): boolean {
  const cause = dbCause(error);
  return (
    cause?.originalCode === "23P01" &&
    typeof cause.originalMessage === "string" &&
    cause.originalMessage.includes("trips_vehicle_no_overlap")
  );
}

/** Postgres huỷ một transaction vì deadlock (SQLSTATE 40P01). */
export function isDeadlock(error: unknown): boolean {
  return dbCause(error)?.originalCode === "40P01";
}
