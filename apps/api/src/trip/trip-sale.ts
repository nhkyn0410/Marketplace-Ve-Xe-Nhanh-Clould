import { FareStatus, OperatorStatus, RouteStatus, TripStatus, VehicleStatus, type SeatType } from "../database/prisma.types";
import { resolveSeatPrice, type PriceRule } from "../fare/fare-pricing";

/** Trạng thái đích Operator chọn qua `PUT /operator/trips/{id}/status` (TASK-TRN-006). */
export const OPERATOR_TARGET_STATUSES = [
  TripStatus.OPEN_FOR_SALE,
  TripStatus.LOCKED,
  TripStatus.DRAFT,
  TripStatus.CANCELLED,
] as const;
export type OperatorTargetStatus = (typeof OPERATOR_TARGET_STATUSES)[number];

// LLD §8 — chuyển trạng thái của Operator khi chưa có vé. Khóa = tạm dừng bán (Q1). `SOLD_OUT` do bán hết (BTP),
// `BOARDING`… do Employee — không có ở đây nên mọi chuyển từ các trạng thái đó đều bị từ chối.
const ALLOWED_FROM: Record<OperatorTargetStatus, readonly TripStatus[]> = {
  [TripStatus.OPEN_FOR_SALE]: [TripStatus.DRAFT, TripStatus.LOCKED],
  [TripStatus.LOCKED]: [TripStatus.OPEN_FOR_SALE],
  [TripStatus.DRAFT]: [TripStatus.OPEN_FOR_SALE, TripStatus.LOCKED],
  [TripStatus.CANCELLED]: [TripStatus.DRAFT, TripStatus.OPEN_FOR_SALE, TripStatus.LOCKED],
};

/** Operator có được chuyển chuyến từ `from` sang `to` không (chuyển sang chính trạng thái hiện tại: không). */
export function canTransition(from: TripStatus, to: OperatorTargetStatus): boolean {
  return ALLOWED_FROM[to].includes(from);
}

/** Trạng thái chuyến cho phép Operator khóa / mở ghế thủ công (Q5). */
export const SEAT_EDITABLE_STATUSES: readonly TripStatus[] = [TripStatus.DRAFT, TripStatus.OPEN_FOR_SALE, TripStatus.LOCKED];

/** Mã lý do chưa đủ điều kiện mở bán (BR-39, API §7.3) — trả trong `reasons` của 422 `TRIP_NOT_READY_FOR_SALE`. */
export type SaleReadinessReason =
  | "OPERATOR_INACTIVE"
  | "ROUTE_INACTIVE"
  | "STOP_POINT_INACTIVE"
  | "VEHICLE_MISSING"
  | "VEHICLE_INACTIVE"
  | "SEATS_MISSING"
  | "FARE_MISSING"
  | "SEAT_PRICE_MISSING"
  | "SEAT_PRICE_ZERO"
  | "SALE_WINDOW_CLOSED";

/** Dữ liệu một chuyến cần để xét điều kiện mở bán — đọc trong cùng transaction đổi trạng thái. */
export type SaleReadinessInput = {
  operatorStatus: OperatorStatus;
  routeStatus: RouteStatus;
  /** Mỗi điểm dừng của chuyến còn `ACTIVE` không (điểm catalog hoặc điểm riêng). */
  stopsActive: readonly boolean[];
  vehicle: { status: VehicleStatus; vehicleTypeId: string } | null;
  seatTypes: readonly SeatType[];
  fare: { status: FareStatus; rules: readonly PriceRule[] } | null;
  departureAt: Date;
  onlineSaleCutoffMinutes: number;
  now: Date;
};

/**
 * MỌI điều kiện mở bán chưa đạt (BR-39, Q3) — mảng rỗng = mở bán được. Không dừng ở lý do đầu tiên để Owner sửa một
 * lần. Chỉ xét lúc mở bán / mở lại (Q8). Ghế giá 0 bị chặn: gần như chắc chắn là nhập sai, cổng thanh toán có mức tối thiểu.
 */
export function saleReadinessProblems(input: SaleReadinessInput): SaleReadinessReason[] {
  const reasons: SaleReadinessReason[] = [];
  if (input.operatorStatus !== OperatorStatus.ACTIVE) reasons.push("OPERATOR_INACTIVE");
  if (input.routeStatus !== RouteStatus.ACTIVE) reasons.push("ROUTE_INACTIVE");
  if (input.stopsActive.some((active) => !active)) reasons.push("STOP_POINT_INACTIVE");
  const vehicle = input.vehicle;
  if (!vehicle) {
    reasons.push("VEHICLE_MISSING");
  } else if (vehicle.status !== VehicleStatus.ACTIVE) {
    reasons.push("VEHICLE_INACTIVE");
  }
  if (vehicle && input.seatTypes.length === 0) reasons.push("SEATS_MISSING");
  if (input.fare?.status !== FareStatus.ACTIVE) {
    reasons.push("FARE_MISSING");
  } else if (vehicle) {
    const prices = input.seatTypes.map((seatType) =>
      resolveSeatPrice(input.fare!.rules, vehicle.vehicleTypeId, seatType, input.departureAt),
    );
    if (prices.some((price) => price === null)) reasons.push("SEAT_PRICE_MISSING");
    if (prices.some((price) => price === 0n)) reasons.push("SEAT_PRICE_ZERO");
  }
  if (!isOnlineSaleOpen(input.departureAt, input.onlineSaleCutoffMinutes, input.now)) reasons.push("SALE_WINDOW_CLOSED");
  return reasons;
}

/** Còn trong thời gian bán online (AS-20, UC-14 A7): trước giờ khởi hành − số phút ngừng bán. Dùng lại ở search / giữ ghế. */
export function isOnlineSaleOpen(departureAt: Date, onlineSaleCutoffMinutes: number, now: Date): boolean {
  return now.getTime() < departureAt.getTime() - onlineSaleCutoffMinutes * 60_000;
}
