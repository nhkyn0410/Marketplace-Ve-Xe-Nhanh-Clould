import { HttpException, HttpStatus } from "@nestjs/common";

const TITLE = "Stop point error";

function problem(status: HttpStatus, code: string, detail: string): HttpException {
  // ProblemDetailsExceptionFilter đọc `{ code, detail, title }` → RFC 7807 (ADR-012).
  return new HttpException({ code, detail, title: TITLE }, status);
}

/** Điểm riêng không tồn tại HOẶC thuộc tenant khác — cùng một lỗi để chống dò id (IDOR). */
export function stopPointNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "STOP_POINT_NOT_FOUND", "Không tìm thấy điểm đón/trả.");
}

/** Tên điểm riêng đã dùng trong nhà xe. */
export function stopPointNameConflict(): HttpException {
  return problem(HttpStatus.CONFLICT, "STOP_POINT_NAME_CONFLICT", "Tên điểm đón/trả đã tồn tại trong nhà xe.");
}

/**
 * Điểm gắn vào route không dùng được: không tồn tại, INACTIVE, thuộc tenant khác, hoặc tỉnh/phường của
 * nó đã ngừng dùng (BR-38, UC-13 A1). Không phân biệt các lý do để không lộ điểm của tenant khác.
 */
export function stopPointUnavailable(): HttpException {
  return problem(
    HttpStatus.UNPROCESSABLE_ENTITY,
    "STOP_POINT_UNAVAILABLE",
    "Có điểm đón/trả không tồn tại hoặc không còn hiệu lực.",
  );
}

/** Đề xuất không tồn tại HOẶC thuộc tenant khác. */
export function stopPointProposalNotFound(): HttpException {
  return problem(HttpStatus.NOT_FOUND, "STOP_POINT_PROPOSAL_NOT_FOUND", "Không tìm thấy đề xuất.");
}

/** Chỉ đề xuất đang `REJECTED` mới được sửa và gửi lại. */
export function stopPointProposalStateInvalid(): HttpException {
  return problem(
    HttpStatus.CONFLICT,
    "STOP_POINT_PROPOSAL_STATE_INVALID",
    "Chỉ sửa và gửi lại được đề xuất đã bị từ chối.",
  );
}
