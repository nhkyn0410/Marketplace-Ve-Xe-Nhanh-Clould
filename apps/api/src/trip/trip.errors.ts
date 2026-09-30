import { HttpException, HttpStatus } from "@nestjs/common";
import type { SaleReadinessReason } from "./trip-sale";

const TITLE = "Trip error";

function problem(status: HttpStatus, code: string, detail: string, reasons?: string[]): HttpException {
  // ProblemDetailsExceptionFilter đọc `{ code, detail, title, reasons }` → RFC 7807 (ADR-012, API §6.2).
  return new HttpException({ code, detail, title: TITLE, ...(reasons ? { reasons } : {}) }, status);
}

/** Chuyến không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id (IDOR). */
export function tripNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "TRIP_NOT_FOUND", "Không tìm thấy chuyến.");
}

/** Chuyến đang ở trạng thái không cho thao tác này (sửa chuyến: chỉ `DRAFT`; khóa ghế: `DRAFT`/`OPEN_FOR_SALE`/`LOCKED`). */
export function tripNotEditable(detail = "Chỉ sửa được chuyến đang ở trạng thái nháp."): HttpException {
  return problem(HttpStatus.CONFLICT, "TRIP_NOT_EDITABLE", detail);
}

/** Chuyển trạng thái không có trong bảng (LLD §8), hoặc thu hồi nháp / hủy khi chuyến đã có vé (TRN-008). */
export function tripStatusTransitionInvalid(detail: string): HttpException {
  return problem(HttpStatus.CONFLICT, "TRIP_STATUS_TRANSITION_INVALID", detail);
}

/** BR-39: chưa đủ điều kiện mở bán — `reasons` liệt kê MỌI điều kiện chưa đạt để Owner sửa một lần. */
export function tripNotReadyForSale(reasons: SaleReadinessReason[]): HttpException {
  return problem(
    HttpStatus.UNPROCESSABLE_ENTITY,
    "TRIP_NOT_READY_FOR_SALE",
    "Chuyến chưa đủ điều kiện mở bán.",
    reasons,
  );
}

/** Mã ghế không thuộc chuyến. */
export function tripSeatUnknown(): HttpException {
  return problem(HttpStatus.UNPROCESSABLE_ENTITY, "TRIP_SEAT_UNKNOWN", "Có mã ghế không thuộc chuyến.");
}

/** Ghế đang được giữ / đã bán / đã check-in — không khóa hay mở thủ công được. */
export function tripSeatNotAvailable(): HttpException {
  return problem(HttpStatus.CONFLICT, "TRIP_SEAT_NOT_AVAILABLE", "Có ghế đang được giữ hoặc đã bán.");
}

/**
 * Sinh lại ghế (đổi / bỏ xe, nháp quá hạn) mà sơ đồ mới thiếu ghế đang khóa (bán ngoài Platform) — mất ghế khóa là bán
 * trùng (BR-42). `detail` nêu mã ghế để Owner biết mở khóa ghế nào.
 */
export function tripBlockedSeatsMissing(seatCodes: string[]): HttpException {
  return problem(
    HttpStatus.CONFLICT,
    "TRIP_BLOCKED_SEATS_MISSING",
    `Sơ đồ ghế sau khi đổi không còn ghế đang khóa: ${seatCodes.join(", ")}. Mở khóa các ghế này trước rồi thử lại.`,
  );
}

/** Không ghi được lịch sử (audit Mongo chậm / sập) hoặc transaction hết hạn — chuyến KHÔNG đổi, client thử lại. */
export function tripHistoryUnavailable(): HttpException {
  return problem(
    HttpStatus.SERVICE_UNAVAILABLE,
    "SERVICE_UNAVAILABLE",
    "Chưa ghi được lịch sử thay đổi nên chuyến chưa đổi trạng thái. Vui lòng thử lại sau.",
  );
}

/** Transaction hết hạn (vd chờ khoá dòng chuyến quá lâu) — chuyến KHÔNG đổi, client thử lại. */
export function tripBusy(): HttpException {
  return problem(
    HttpStatus.SERVICE_UNAVAILABLE,
    "SERVICE_UNAVAILABLE",
    "Chuyến đang được cập nhật bởi thao tác khác. Vui lòng thử lại.",
  );
}

/** Prisma P2028: transaction tương tác đã hết hạn / đóng — Postgres đã rollback. */
export function isTransactionExpired(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "P2028";
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
