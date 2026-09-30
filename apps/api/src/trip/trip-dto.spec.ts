import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MAX_ROUTE_STOPS } from "../route/dto/route.dto";
import { MAX_SEATS } from "../vehicle/dto/seat-map.dto";
import { TripInputSchema, TripSeatStatusInputSchema, TripStatusInputSchema } from "./dto/trip.dto";

const HOUR = 3_600_000;
const future = (hours: number) => new Date(Date.UTC(2031, 0, 1) + hours * HOUR).toISOString();

describe("TripInputSchema", () => {
  const base = {
    routeId: randomUUID(),
    vehicleId: null,
    departureAt: future(0),
    arrivalAt: future(8),
    stopTimes: null,
    onlineSaleCutoffMinutes: 60,
    note: " ",
  };

  it("chấp nhận chuyến chưa gắn xe; giờ có múi giờ đổi về UTC; ghi chú rỗng → null", () => {
    const parsed = TripInputSchema.parse({ ...base, departureAt: "2031-01-01T07:00:00+07:00" });
    expect(parsed.departureAt.toISOString()).toBe("2031-01-01T00:00:00.000Z");
    expect(parsed.note).toBeNull();
  });

  it("chấp nhận giờ từng điểm: đầu = giờ đi, cuối = giờ đến, được bằng nhau ở giữa", () => {
    const stopTimes = [future(0), future(3), future(3), future(8)];
    expect(TripInputSchema.safeParse({ ...base, stopTimes }).success).toBe(true);
  });

  it.each([
    ["giờ đến trước giờ đi", { arrivalAt: future(-1) }],
    ["giờ đến bằng giờ đi", { arrivalAt: future(0) }],
    ["khởi hành trong quá khứ", { departureAt: "2020-01-01T00:00:00Z", arrivalAt: "2020-01-01T05:00:00Z" }],
    ["chuyến dài quá 7 ngày", { arrivalAt: future(7 * 24 + 1) }],
    ["giờ không có múi giờ", { departureAt: "2031-01-01T07:00:00" }],
    ["năm UTC vượt 9999", { departureAt: "9999-12-31T20:00:00-07:00", arrivalAt: "9999-12-31T23:00:00-07:00" }],
    ["điểm đầu lệch giờ đi", { stopTimes: [future(1), future(8)] }],
    ["điểm cuối lệch giờ đến", { stopTimes: [future(0), future(7)] }],
    ["giờ các điểm giảm dần", { stopTimes: [future(0), future(5), future(4), future(8)] }],
    ["chỉ một giờ", { stopTimes: [future(0)] }],
    ["quá số điểm tối đa", { stopTimes: Array.from({ length: MAX_ROUTE_STOPS + 1 }, () => future(0)) }],
    ["route không phải uuid", { routeId: "abc" }],
    ["thiếu vehicleId (PUT thay toàn bộ)", { vehicleId: undefined }],
    ["thiếu stopTimes (PUT thay toàn bộ)", { stopTimes: undefined }],
  ])("từ chối %s", (_case, override) => {
    expect(TripInputSchema.safeParse({ ...base, ...override }).success).toBe(false);
  });

  it("bỏ field lạ: không nhận status/operatorId từ body", () => {
    const parsed = TripInputSchema.parse({ ...base, status: "OPEN_FOR_SALE", operatorId: randomUUID() });
    expect(parsed).not.toHaveProperty("status");
    expect(parsed).not.toHaveProperty("operatorId");
  });

  it("thời điểm ngừng bán online: 0–1440 phút, số nguyên, bắt buộc (PUT thay toàn bộ)", () => {
    expect(TripInputSchema.safeParse({ ...base, onlineSaleCutoffMinutes: 0 }).success).toBe(true);
    expect(TripInputSchema.safeParse({ ...base, onlineSaleCutoffMinutes: 1440 }).success).toBe(true);
    for (const value of [-1, 1441, 30.5, "60", undefined]) {
      expect(TripInputSchema.safeParse({ ...base, onlineSaleCutoffMinutes: value }).success, String(value)).toBe(false);
    }
  });
});

describe("TripStatusInputSchema", () => {
  it("mở bán / khóa / thu hồi nháp không cần lý do; lý do rỗng → null", () => {
    for (const status of ["OPEN_FOR_SALE", "LOCKED", "DRAFT"]) {
      expect(TripStatusInputSchema.parse({ status, reason: "  " }).reason).toBeNull();
    }
  });

  it("hủy bắt buộc lý do (SRS §17.3); lý do chỉ có khoảng trắng coi như thiếu", () => {
    expect(TripStatusInputSchema.safeParse({ status: "CANCELLED", reason: null }).success).toBe(false);
    expect(TripStatusInputSchema.safeParse({ status: "CANCELLED", reason: "   " }).success).toBe(false);
    expect(TripStatusInputSchema.parse({ status: "CANCELLED", reason: " Xe hỏng " }).reason).toBe("Xe hỏng");
  });

  it.each(["SOLD_OUT", "BOARDING", "DEPARTED", "IN_PROGRESS", "COMPLETED", "INCIDENT", "open_for_sale"])(
    "từ chối trạng thái %s (không do Operator đặt qua API này)",
    (status) => {
      expect(TripStatusInputSchema.safeParse({ status, reason: null }).success).toBe(false);
    },
  );

  it("lý do tối đa 500 ký tự", () => {
    expect(TripStatusInputSchema.safeParse({ status: "LOCKED", reason: "x".repeat(501) }).success).toBe(false);
  });
});

describe("TripSeatStatusInputSchema", () => {
  it("chuẩn hoá mã ghế chữ hoa; ghi chú rỗng → null", () => {
    expect(TripSeatStatusInputSchema.parse({ seatCodes: [" a1 ", "b2"], status: "BLOCKED", note: "" })).toEqual({
      seatCodes: ["A1", "B2"],
      status: "BLOCKED",
      note: null,
    });
  });

  it.each([
    ["danh sách rỗng", { seatCodes: [] }],
    ["trùng mã sau chuẩn hoá", { seatCodes: ["a1", "A1"] }],
    ["quá số ghế tối đa", { seatCodes: Array.from({ length: MAX_SEATS + 1 }, (_, index) => `S${index}`) }],
    ["mã ghế có ký tự lạ", { seatCodes: ["A-1"] }],
    ["trạng thái đích HOLDING", { status: "HOLDING" }],
    ["trạng thái đích BOOKED", { status: "BOOKED" }],
  ])("từ chối %s", (_case, override) => {
    expect(TripSeatStatusInputSchema.safeParse({ seatCodes: ["A1"], status: "BLOCKED", note: null, ...override }).success).toBe(
      false,
    );
  });
});
