import { describe, expect, it } from "vitest";
import { FareStatus, OperatorStatus, RouteStatus, TripStatus, VehicleStatus } from "../database/prisma.types";
import {
  canTransition,
  isOnlineSaleOpen,
  OPERATOR_TARGET_STATUSES,
  saleReadinessProblems,
  type SaleReadinessInput,
} from "./trip-sale";

const HOUR = 3_600_000;
const now = new Date("2031-01-10T00:00:00Z");
const departureAt = new Date(now.getTime() + 5 * HOUR);
const sleeper = "11111111-1111-4111-8111-111111111111";
const rule = (price: bigint, seatType: "SEAT" | "BED" | null = null) => ({
  vehicleTypeId: null,
  seatType,
  validFrom: null,
  validTo: null,
  price,
});

/** Chuyến đủ điều kiện mở bán; mỗi test đổi một phần. */
function ready(overrides: Partial<SaleReadinessInput> = {}): SaleReadinessInput {
  return {
    operatorStatus: OperatorStatus.ACTIVE,
    routeStatus: RouteStatus.ACTIVE,
    stopsActive: [true, true, true],
    vehicle: { status: VehicleStatus.ACTIVE, vehicleTypeId: sleeper },
    seatTypes: ["SEAT", "BED"],
    fare: { status: FareStatus.ACTIVE, rules: [rule(300_000n)] },
    departureAt,
    onlineSaleCutoffMinutes: 60,
    now,
    ...overrides,
  };
}

describe("canTransition — bảng chuyển trạng thái của Operator (LLD §8, TRN-006)", () => {
  const allowed = new Set([
    "DRAFT→OPEN_FOR_SALE",
    "LOCKED→OPEN_FOR_SALE",
    "OPEN_FOR_SALE→LOCKED",
    "OPEN_FOR_SALE→DRAFT",
    "LOCKED→DRAFT",
    "DRAFT→CANCELLED",
    "OPEN_FOR_SALE→CANCELLED",
    "LOCKED→CANCELLED",
  ]);

  it.each(
    Object.values(TripStatus).flatMap((from) => OPERATOR_TARGET_STATUSES.map((to) => [from, to] as const)),
  )("%s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(allowed.has(`${from}→${to}`));
  });

  it("chỉ 4 trạng thái đích; SOLD_OUT / BOARDING… không do Operator đặt", () => {
    expect([...OPERATOR_TARGET_STATUSES].sort()).toEqual(["CANCELLED", "DRAFT", "LOCKED", "OPEN_FOR_SALE"]);
  });
});

describe("saleReadinessProblems — điều kiện mở bán (BR-39, Q3)", () => {
  it("đủ điều kiện → không có lý do", () => {
    expect(saleReadinessProblems(ready())).toEqual([]);
  });

  it("trả MỌI lý do cùng lúc, không dừng ở lý do đầu tiên", () => {
    expect(
      saleReadinessProblems(
        ready({
          operatorStatus: OperatorStatus.SUSPENDED,
          routeStatus: RouteStatus.INACTIVE,
          stopsActive: [true, false],
          vehicle: null,
          fare: null,
          departureAt: new Date(now.getTime() + 30 * 60_000),
        }),
      ),
    ).toEqual(["OPERATOR_INACTIVE", "ROUTE_INACTIVE", "STOP_POINT_INACTIVE", "VEHICLE_MISSING", "FARE_MISSING", "SALE_WINDOW_CLOSED"]);
  });

  it.each([
    ["xe bảo dưỡng", { vehicle: { status: VehicleStatus.MAINTENANCE, vehicleTypeId: sleeper } }, ["VEHICLE_INACTIVE"]],
    ["xe không có ghế", { seatTypes: [] }, ["SEATS_MISSING"]],
    ["bảng giá INACTIVE", { fare: { status: FareStatus.INACTIVE, rules: [rule(300_000n)] } }, ["FARE_MISSING"]],
    ["chỉ có giá giường, thiếu giá ghế ngồi", { fare: { status: FareStatus.ACTIVE, rules: [rule(300_000n, "BED")] } }, ["SEAT_PRICE_MISSING"]],
    ["có ghế giá 0", { fare: { status: FareStatus.ACTIVE, rules: [rule(300_000n), rule(0n, "BED")] } }, ["SEAT_PRICE_ZERO"]],
    [
      "vừa thiếu giá vừa giá 0",
      { fare: { status: FareStatus.ACTIVE, rules: [rule(0n, "BED")] } },
      ["SEAT_PRICE_MISSING", "SEAT_PRICE_ZERO"],
    ],
  ] as const)("%s", (_case, overrides, reasons) => {
    expect(saleReadinessProblems(ready(overrides as Partial<SaleReadinessInput>))).toEqual(reasons);
  });

  it("chưa gắn xe → chỉ VEHICLE_MISSING, không báo thêm lỗi ghế / giá", () => {
    expect(saleReadinessProblems(ready({ vehicle: null, seatTypes: [] }))).toEqual(["VEHICLE_MISSING"]);
  });
});

describe("isOnlineSaleOpen — thời điểm ngừng bán online (AS-20)", () => {
  it("mở tới trước giờ khởi hành − số phút; đúng mốc thì đã đóng", () => {
    const cutoffAt = new Date(departureAt.getTime() - 60 * 60_000);
    expect(isOnlineSaleOpen(departureAt, 60, new Date(cutoffAt.getTime() - 1))).toBe(true);
    expect(isOnlineSaleOpen(departureAt, 60, cutoffAt)).toBe(false);
  });

  it("0 phút = bán tới giờ khởi hành; chuyến đã khởi hành thì đóng", () => {
    expect(isOnlineSaleOpen(departureAt, 0, new Date(departureAt.getTime() - 1))).toBe(true);
    expect(isOnlineSaleOpen(departureAt, 0, departureAt)).toBe(false);
  });
});
