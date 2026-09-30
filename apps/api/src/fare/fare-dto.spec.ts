import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { FareCreateInputSchema, FareUpdateInputSchema, MAX_FARE_PRICE, MAX_FARE_RULES } from "./dto/fare.dto";

const baseRule = { vehicleTypeId: null, seatType: null, validFrom: null, validTo: null, price: 300_000 };
const window = { validFrom: "2031-01-20T00:00:00+07:00", validTo: "2031-01-27T00:00:00+07:00" };

describe("FareUpdateInputSchema / FareCreateInputSchema", () => {
  const base = { status: "ACTIVE", note: " ", rules: [baseRule] };

  it("chấp nhận rule giá thường + rule theo dịp; ghi chú rỗng → null; giờ đổi về UTC", () => {
    const parsed = FareUpdateInputSchema.parse({ ...base, rules: [baseRule, { ...baseRule, ...window, price: 450_000 }] });
    expect(parsed.note).toBeNull();
    expect(parsed.rules[1]!.validFrom!.toISOString()).toBe("2031-01-19T17:00:00.000Z");
  });

  it("create cần routeId; update không nhận routeId (không đổi tuyến)", () => {
    expect(FareCreateInputSchema.safeParse(base).success).toBe(false);
    expect(FareCreateInputSchema.safeParse({ ...base, routeId: randomUUID() }).success).toBe(true);
    expect(FareUpdateInputSchema.parse({ ...base, routeId: randomUUID() })).not.toHaveProperty("routeId");
  });

  it.each([
    ["giá âm", { price: -1 }],
    ["giá lẻ đồng", { price: 1000.5 }],
    ["giá vượt trần kỹ thuật", { price: MAX_FARE_PRICE + 1 }],
    ["giá dạng chuỗi", { price: "300000" }],
    ["chỉ có giờ bắt đầu", { validFrom: window.validFrom }],
    ["chỉ có giờ kết thúc", { validTo: window.validTo }],
    ["giờ kết thúc trước giờ bắt đầu", { validFrom: window.validTo, validTo: window.validFrom }],
    ["giờ không có múi giờ", { validFrom: "2031-01-20T00:00:00", validTo: window.validTo }],
    ["loại chỗ lạ", { seatType: "VIP" }],
    ["loại xe không phải uuid", { vehicleTypeId: "limousine" }],
  ])("từ chối rule %s", (_case, override) => {
    expect(FareUpdateInputSchema.safeParse({ ...base, rules: [{ ...baseRule, ...override }] }).success).toBe(false);
  });

  it.each([
    ["trạng thái lạ", { status: "DRAFT" }],
    ["thiếu note (PUT thay toàn bộ)", { note: undefined }],
    ["thiếu rules", { rules: undefined }],
    ["quá số rule tối đa", { rules: Array.from({ length: MAX_FARE_RULES + 1 }, () => baseRule) }],
  ])("từ chối %s", (_case, override) => {
    expect(FareUpdateInputSchema.safeParse({ ...base, ...override }).success).toBe(false);
  });

  it("chấp nhận giá 0 và giá đúng trần", () => {
    expect(FareUpdateInputSchema.safeParse({ ...base, rules: [{ ...baseRule, price: 0 }] }).success).toBe(true);
    expect(FareUpdateInputSchema.safeParse({ ...base, rules: [{ ...baseRule, price: MAX_FARE_PRICE }] }).success).toBe(true);
  });
});
