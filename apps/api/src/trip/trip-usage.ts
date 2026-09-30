import { TripStatus } from "../database/prisma.types";

/**
 * Điều kiện "chuyến chưa kết thúc" (UC-12 A3): chưa hoàn thành/huỷ. Riêng chuyến nháp thì hết giữ khi đã qua giờ
 * đến dự kiến — nháp bỏ quên không khoá sơ đồ ghế mãi; chuyến đã mở bán / đang chạy trễ giờ vẫn giữ (có vé).
 */
export function unfinishedTripWhere(now: Date) {
  return {
    OR: [
      { status: TripStatus.DRAFT, arrivalAt: { gt: now } },
      { status: { notIn: [TripStatus.DRAFT, TripStatus.COMPLETED, TripStatus.CANCELLED] } },
    ],
  };
}
