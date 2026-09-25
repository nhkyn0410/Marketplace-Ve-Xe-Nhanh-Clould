import { HttpException, HttpStatus } from "@nestjs/common";
import type { DbScope } from "../database/db-scope";
import type { Authorization } from "../iam/role/authorization";
import { tenantScopeViolation } from "../iam/role/authorization.errors";

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

/** Loại xe / tiện ích không có trong catalog hoặc đã ngừng dùng. */
export function catalogItemUnavailable(): HttpException {
  return problem(
    HttpStatus.UNPROCESSABLE_ENTITY,
    "CATALOG_ITEM_UNAVAILABLE",
    "Loại xe hoặc tiện ích không tồn tại hoặc đã ngừng sử dụng.",
  );
}

/**
 * Lấy ngữ cảnh tenant do `TenantGuard` trao. Guard đã chặn, nhưng service kiểm lại (defense-in-depth):
 * mọi truy vấn Vehicle/SeatMap phải chạy trong scope tenant và lọc đúng `operatorId` đó.
 */
export function requireTenant(authz: Authorization): { db: DbScope; operatorId: string } {
  // Chỉ grant phạm vi `tenant`: TenantGuard đổi grant `assigned` (Employee) thành scope cả tenant, mà
  // module này chưa lọc theo phân công (EMP-001) → lỡ đổi route sang `vehicle:read` sẽ lộ cả đội xe.
  if (authz.scope !== "tenant" || authz.db?.kind !== "tenant") {
    throw tenantScopeViolation();
  }
  return { db: authz.db, operatorId: authz.db.operatorId };
}
