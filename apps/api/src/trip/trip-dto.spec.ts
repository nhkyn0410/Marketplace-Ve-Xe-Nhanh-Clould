import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MAX_ROUTE_STOPS } from "../route/dto/route.dto";
import { TripInputSchema } from "./dto/trip.dto";

const HOUR = 3_600_000;
const future = (hours: number) => new Date(Date.UTC(2031, 0, 1) + hours * HOUR).toISOString();

describe("TripInputSchema", () => {
  const base = {
    routeId: randomUUID(),
    vehicleId: null,
    departureAt: future(0),
    arrivalAt: future(8),
    stopTimes: null,
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
});
