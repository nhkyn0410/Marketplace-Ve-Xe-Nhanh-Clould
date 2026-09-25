import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { platformScope, tenantScope } from "../database/db-scope";
import { SeatMapInputSchema } from "./dto/seat-map.dto";
import { PlateNumberSchema, VehicleInputSchema } from "./dto/vehicle.dto";
import { requireTenant } from "./vehicle.errors";

describe("requireTenant — chỉ grant phạm vi tenant", () => {
  const operatorId = randomUUID();

  it("tenant → trả scope + operatorId", () => {
    const db = tenantScope(operatorId);
    expect(requireTenant({ permission: "vehicle:manage", scope: "tenant", db })).toEqual({ db, operatorId });
  });

  it.each([
    ["assigned (Employee — chưa lọc theo phân công)", "assigned", tenantScope(operatorId)],
    ["any (Platform)", "any", platformScope()],
    ["không có scope DB", "tenant", null],
  ] as const)("%s → 403 TENANT_SCOPE_VIOLATION", (_case, scope, db) => {
    let failure: { getStatus(): number; getResponse(): unknown } | undefined;
    try {
      requireTenant({ permission: "vehicle:manage", scope, db });
    } catch (error) {
      failure = error as typeof failure;
    }
    expect(failure?.getStatus()).toBe(403);
    expect(failure?.getResponse()).toMatchObject({ code: "TENANT_SCOPE_VIOLATION" });
  });
});

describe("PlateNumberSchema — chuẩn hoá biển số (A1)", () => {
  it.each([
    ["51B-123.45", "51B12345"],
    [" 51b 123.45 ", "51B12345"],
    ["29B-1234", "29B1234"],
    ["51LD-123.45", "51LD12345"],
  ])("%j → %s", (input, expected) => {
    expect(PlateNumberSchema.parse(input)).toBe(expected);
  });

  it.each(["", "ABC-12345", "5B-12345", "51B-123", "51B-1234567", "51ABC-12345", "51B_12345"])(
    "từ chối %j",
    (input) => {
      expect(PlateNumberSchema.safeParse(input).success).toBe(false);
    },
  );
});

describe("VehicleInputSchema", () => {
  const base = {
    plateNumber: "51B-123.45",
    vehicleTypeId: randomUUID(),
    seatMapId: null,
    amenityIds: [],
    status: "MAINTENANCE",
    description: "  ",
  };

  it("chuẩn hoá biển số, mô tả rỗng → null", () => {
    expect(VehicleInputSchema.parse(base)).toEqual({ ...base, plateNumber: "51B12345", description: null });
  });

  it.each(["seatMapId", "amenityIds", "status", "description"])(
    "PUT thay toàn bộ: thiếu %s → từ chối (không lặng lẽ reset về mặc định)",
    (field) => {
      const { [field as keyof typeof base]: _omitted, ...rest } = base;
      expect(VehicleInputSchema.safeParse(rest).success).toBe(false);
    },
  );

  it("từ chối tiện ích lặp, trạng thái lạ, id không phải uuid", () => {
    const amenity = randomUUID();
    expect(VehicleInputSchema.safeParse({ ...base, amenityIds: [amenity, amenity] }).success).toBe(false);
    expect(VehicleInputSchema.safeParse({ ...base, status: "BROKEN" }).success).toBe(false);
    expect(VehicleInputSchema.safeParse({ ...base, vehicleTypeId: "abc" }).success).toBe(false);
  });
});

describe("SeatMapInputSchema — bố cục hợp lệ (UC-12 bước 5, A2)", () => {
  const valid = {
    name: " Giường 2 tầng ",
    layout: { decks: [{ deck: 1, rows: 2, columns: 2 }, { deck: 2, rows: 1, columns: 1 }] },
    seats: [
      { code: "a1", deck: 1, row: 1, column: 1, type: "BED" },
      { code: "A2", deck: 1, row: 1, column: 2, type: "BED" },
      { code: "B1", deck: 2, row: 1, column: 1, type: "BED" },
    ],
  };

  it("chấp nhận bố cục hợp lệ, chuẩn hoá tên + mã ghế", () => {
    const parsed = SeatMapInputSchema.parse(valid);
    expect(parsed.name).toBe("Giường 2 tầng");
    expect(parsed.seats.map((seat) => seat.code)).toEqual(["A1", "A2", "B1"]);
  });

  it.each([
    ["trùng mã (khác hoa/thường)", { seats: [valid.seats[0], { ...valid.seats[1], code: "A1" }] }],
    ["hai ghế cùng vị trí", { seats: [valid.seats[0], { ...valid.seats[1], column: 1 }] }],
    ["ghế ngoài số hàng", { seats: [{ ...valid.seats[0], row: 3 }] }],
    ["ghế ở tầng không khai báo", { layout: { decks: [{ deck: 1, rows: 2, columns: 2 }] }, seats: [valid.seats[2]] }],
    ["tầng không liên tục từ 1", { layout: { decks: [{ deck: 2, rows: 1, columns: 1 }] }, seats: [valid.seats[2]] }],
    ["tầng trùng", { layout: { decks: [{ deck: 1, rows: 1, columns: 1 }, { deck: 1, rows: 1, columns: 1 }] } }],
    ["không có ghế", { seats: [] }],
    ["quá 2 tầng", { layout: { decks: [1, 2, 3].map((deck) => ({ deck, rows: 1, columns: 1 })) } }],
    ["quá số hàng tối đa", { layout: { decks: [{ deck: 1, rows: 31, columns: 1 }] } }],
    ["mã ghế có ký tự lạ", { seats: [{ ...valid.seats[0], code: "A-1" }] }],
    ["loại ghế lạ", { seats: [{ ...valid.seats[0], type: "SOFA" }] }],
    ["quá 100 ghế", { seats: Array.from({ length: 101 }, (_, index) => ({ ...valid.seats[0], code: `S${index}` })) }],
  ])("từ chối %s", (_case, override) => {
    expect(SeatMapInputSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });
});
