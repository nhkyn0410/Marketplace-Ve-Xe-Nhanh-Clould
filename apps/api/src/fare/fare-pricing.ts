import type { SeatType } from "../database/prisma.types";

/** Rule giá tối thiểu để tính giá: `null` = mọi loại xe / mọi loại chỗ / không khung giờ. */
export type PriceRule = {
  vehicleTypeId: string | null;
  seatType: SeatType | null;
  validFrom: Date | null;
  validTo: Date | null;
  /** VND, số nguyên đồng. */
  price: bigint;
};

/**
 * Giá (VND) của một ghế theo bảng giá của tuyến (TASK-TRN-005, Q1 = PA1, Q2): chọn rule **cụ thể nhất** khớp loại xe,
 * loại chỗ và giờ khởi hành — có khung giờ > không; đúng loại xe > mọi loại; đúng loại chỗ > mọi loại. Khung giờ là
 * `[validFrom, validTo)`. Không có rule khớp → `null`. Ràng buộc EXCLUDE ở DB bảo đảm không có hai rule cùng hạng
 * cùng khớp, nên kết quả luôn xác định. Không có phép tính số học — giá là số tuyệt đối, không làm tròn.
 */
export function resolveSeatPrice(
  rules: readonly PriceRule[],
  vehicleTypeId: string,
  seatType: SeatType,
  departureAt: Date,
): bigint | null {
  let best: PriceRule | null = null;
  let bestRank = -1;
  for (const rule of rules) {
    if (rule.vehicleTypeId !== null && rule.vehicleTypeId !== vehicleTypeId) continue;
    if (rule.seatType !== null && rule.seatType !== seatType) continue;
    if (rule.validFrom && rule.validTo && (departureAt < rule.validFrom || departureAt >= rule.validTo)) continue;
    const rank = (rule.validFrom ? 4 : 0) + (rule.vehicleTypeId ? 2 : 0) + (rule.seatType ? 1 : 0);
    if (rank > bestRank) {
      best = rule;
      bestRank = rank;
    }
  }
  return best?.price ?? null;
}

/**
 * Đổi tiền `bigint` sang số nguyên JSON (API §4: VND = số nguyên đồng). Chỉ dùng ở biên response; tiền vượt phạm vi
 * số nguyên an toàn của JS là lỗi dữ liệu, không được làm tròn lặng lẽ.
 */
export function vndToJson(value: bigint): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`Số tiền ${value} ngoài phạm vi trả về JSON.`);
  }
  return Number(value);
}
