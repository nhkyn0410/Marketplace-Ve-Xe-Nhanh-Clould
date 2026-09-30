import { describe, expect, it } from "vitest";
import { type PriceRule, resolveSeatPrice, vndToJson } from "./fare-pricing";

/** TASK-TRN-005 — test money bắt buộc (ADR-025): rule nào thắng, biên khung giờ, tiền `bigint` không qua số thực. */
const SLEEPER = "vt-sleeper";
const LIMOUSINE = "vt-limousine";
const TET_FROM = new Date("2031-01-20T00:00:00.000Z");
const TET_TO = new Date("2031-01-27T00:00:00.000Z");
const NORMAL_DAY = new Date("2031-01-10T01:00:00.000Z");

const rule = (overrides: Partial<PriceRule>): PriceRule => ({
  vehicleTypeId: null,
  seatType: null,
  validFrom: null,
  validTo: null,
  price: 0n,
  ...overrides,
});

describe("resolveSeatPrice", () => {
  const rules: PriceRule[] = [
    rule({ price: 250_000n }), // mọi loại xe, mọi loại chỗ
    rule({ vehicleTypeId: SLEEPER, price: 300_000n }),
    rule({ vehicleTypeId: SLEEPER, seatType: "BED", price: 320_000n }),
    rule({ vehicleTypeId: LIMOUSINE, price: 450_000n }),
    rule({ validFrom: TET_FROM, validTo: TET_TO, price: 600_000n }), // Tết, mọi loại
    rule({ vehicleTypeId: LIMOUSINE, validFrom: TET_FROM, validTo: TET_TO, price: 800_000n }), // Tết, Limousine
  ];

  it("ngày thường: đúng loại xe + loại chỗ thắng; đúng loại xe thắng mọi loại", () => {
    expect(resolveSeatPrice(rules, SLEEPER, "BED", NORMAL_DAY)).toBe(320_000n);
    expect(resolveSeatPrice(rules, SLEEPER, "SEAT", NORMAL_DAY)).toBe(300_000n);
    expect(resolveSeatPrice(rules, LIMOUSINE, "SEAT", NORMAL_DAY)).toBe(450_000n);
    expect(resolveSeatPrice(rules, "vt-cabin", "BED", NORMAL_DAY)).toBe(250_000n);
  });

  it("đổi xe thường → xe VIP trên cùng tuyến, cùng giờ: giá đổi theo loại xe (PA1)", () => {
    expect(resolveSeatPrice(rules, SLEEPER, "SEAT", NORMAL_DAY)).not.toBe(resolveSeatPrice(rules, LIMOUSINE, "SEAT", NORMAL_DAY));
  });

  it("dịp Tết: rule có khung giờ thắng rule không khung giờ; trong khung giờ, đúng loại xe thắng", () => {
    const tet = new Date("2031-01-22T05:00:00.000Z");
    expect(resolveSeatPrice(rules, SLEEPER, "BED", tet)).toBe(600_000n);
    expect(resolveSeatPrice(rules, LIMOUSINE, "SEAT", tet)).toBe(800_000n);
  });

  it("biên khung giờ [từ, đến): đúng giờ bắt đầu thuộc dịp, đúng giờ kết thúc thì không", () => {
    expect(resolveSeatPrice(rules, SLEEPER, "BED", TET_FROM)).toBe(600_000n);
    expect(resolveSeatPrice(rules, SLEEPER, "BED", new Date(TET_FROM.getTime() - 1))).toBe(320_000n);
    expect(resolveSeatPrice(rules, SLEEPER, "BED", new Date(TET_TO.getTime() - 1))).toBe(600_000n);
    expect(resolveSeatPrice(rules, SLEEPER, "BED", TET_TO)).toBe(320_000n);
  });

  it("không rule nào khớp → null (không tự suy giá)", () => {
    const onlyLimousine = [rule({ vehicleTypeId: LIMOUSINE, price: 450_000n })];
    expect(resolveSeatPrice(onlyLimousine, SLEEPER, "SEAT", NORMAL_DAY)).toBeNull();
    expect(resolveSeatPrice([], SLEEPER, "SEAT", NORMAL_DAY)).toBeNull();
  });

  it("giá 0 là giá hợp lệ (vé miễn phí), không bị coi là 'không có giá'", () => {
    expect(resolveSeatPrice([rule({ price: 0n })], SLEEPER, "SEAT", NORMAL_DAY)).toBe(0n);
  });

  it("thứ tự rule trong mảng không ảnh hưởng kết quả", () => {
    const reversed = [...rules].reverse();
    for (const [type, seat, when] of [
      [SLEEPER, "BED", NORMAL_DAY],
      [LIMOUSINE, "SEAT", new Date("2031-01-22T05:00:00.000Z")],
      ["vt-cabin", "SEAT", NORMAL_DAY],
    ] as const) {
      expect(resolveSeatPrice(reversed, type, seat, when)).toBe(resolveSeatPrice(rules, type, seat, when));
    }
  });

  it("tiền giữ nguyên kiểu bigint, không làm tròn qua số thực", () => {
    const big = 2n ** 60n + 1n; // vượt số nguyên an toàn của number
    expect(resolveSeatPrice([rule({ price: big })], SLEEPER, "SEAT", NORMAL_DAY)).toBe(big);
  });
});

describe("vndToJson", () => {
  it("đổi đúng số nguyên đồng", () => {
    expect(vndToJson(0n)).toBe(0);
    expect(vndToJson(99_999_999n)).toBe(99_999_999);
    expect(vndToJson(BigInt(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("từ chối tiền âm hoặc vượt số nguyên an toàn thay vì làm tròn lặng lẽ", () => {
    expect(() => vndToJson(-1n)).toThrow();
    expect(() => vndToJson(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow();
  });
});
