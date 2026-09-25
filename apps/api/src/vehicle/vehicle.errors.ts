import { HttpException, HttpStatus } from "@nestjs/common";

const TITLE = "Vehicle error";

function problem(status: HttpStatus, code: string, detail: string): HttpException {
  // ProblemDetailsExceptionFilter đọc `{ code, detail, title }` → RFC 7807 (ADR-012).
  return new HttpException({ code, detail, title: TITLE }, status);
}

/** Xe không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id (IDOR). */
export function vehicleNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "VEHICLE_NOT_FOUND", "Không tìm thấy phương tiện.");
}

/** Biển số (đã chuẩn hoá) đã có trong nhà xe. */
export function vehiclePlateConflict(): HttpException {
  return problem(HttpStatus.CONFLICT, "VEHICLE_PLATE_CONFLICT", "Biển số đã tồn tại trong nhà xe.");
}

/** SeatMap không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id. */
export function seatMapNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "SEAT_MAP_NOT_FOUND", "Không tìm thấy sơ đồ ghế.");
}

/** Tên SeatMap đã dùng trong nhà xe. */
export function seatMapNameConflict(): HttpException {
  return problem(HttpStatus.CONFLICT, "SEAT_MAP_NAME_CONFLICT", "Tên sơ đồ ghế đã tồn tại trong nhà xe.");
}
