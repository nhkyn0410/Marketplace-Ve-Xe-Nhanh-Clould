import { TripStatus } from "../database/prisma.types";

/**
 * Điều kiện "chuyến chưa kết thúc" (UC-12 A3): chưa hoàn thành/huỷ và chưa qua giờ đến dự kiến. Module
 * `vehicle/` dùng để chặn sửa sơ đồ ghế đang được chuyến dùng; chuyến nháp đã quá giờ không giữ khoá mãi.
 */
export function unfinishedTripWhere(now: Date) {
  return {
    status: { notIn: [TripStatus.COMPLETED, TripStatus.CANCELLED] },
    arrivalAt: { gt: now },
  };
}
