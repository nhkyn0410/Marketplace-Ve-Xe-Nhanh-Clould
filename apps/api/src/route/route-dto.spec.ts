import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { StopPointInputSchema, StopPointProposalInputSchema } from "../stop-point/dto/stop-point.dto";
import { MAX_ROUTE_STOPS, RouteInputSchema } from "./dto/route.dto";

const catalogStop = (id = randomUUID()) => ({ catalogStopPointId: id, stopPointId: null, note: null });
const privateStop = (id = randomUUID()) => ({ catalogStopPointId: null, stopPointId: id, note: " " });

describe("RouteInputSchema (Q3)", () => {
  const base = { name: " Sài Gòn - Đà Lạt ", status: "ACTIVE", note: null, stops: [catalogStop(), privateStop()] };

  it("chấp nhận catalog + điểm riêng, trim tên, ghi chú rỗng → null", () => {
    const parsed = RouteInputSchema.parse(base);
    expect(parsed.name).toBe("Sài Gòn - Đà Lạt");
    expect(parsed.stops[1]!.note).toBeNull();
  });

  it.each([
    ["dưới 2 điểm", { stops: [catalogStop()] }],
    ["quá số điểm tối đa", { stops: Array.from({ length: MAX_ROUTE_STOPS + 1 }, () => catalogStop()) }],
    ["điểm không có nguồn", { stops: [catalogStop(), { catalogStopPointId: null, stopPointId: null, note: null }] }],
    ["điểm hai nguồn", { stops: [catalogStop(), { catalogStopPointId: randomUUID(), stopPointId: randomUUID(), note: null }] }],
    ["lặp điểm catalog (đầu = cuối)", (() => { const id = randomUUID(); return { stops: [catalogStop(id), privateStop(), catalogStop(id)] }; })()],
    ["lặp điểm riêng", (() => { const id = randomUUID(); return { stops: [privateStop(id), privateStop(id)] }; })()],
    ["trạng thái lạ", { status: "DRAFT" }],
    ["thiếu note (PUT thay toàn bộ)", { note: undefined }],
    ["client tự gửi role nhưng thiếu nguồn", { stops: [{ role: "ORIGIN", note: null }, catalogStop()] }],
  ])("từ chối %s", (_case, override) => {
    expect(RouteInputSchema.safeParse({ ...base, ...override }).success).toBe(false);
  });
});

describe("StopPoint / Proposal input", () => {
  const location = {
    name: "Văn phòng Quận 5",
    type: "OFFICE",
    address: "1 Trần Hưng Đạo",
    provinceId: randomUUID(),
    wardId: randomUUID(),
    latitude: 10.75,
    longitude: 106.66,
    description: null,
  };

  it("điểm riêng bắt buộc status; đề xuất KHÔNG nhận status/catalogStopPointId từ client", () => {
    expect(StopPointInputSchema.safeParse(location).success).toBe(false);
    expect(StopPointInputSchema.parse({ ...location, status: "ACTIVE" }).status).toBe("ACTIVE");
    const proposal = StopPointProposalInputSchema.parse({
      ...location,
      status: "APPROVED",
      catalogStopPointId: randomUUID(),
      rejectionReason: "x",
    });
    expect(proposal).not.toHaveProperty("status");
    expect(proposal).not.toHaveProperty("catalogStopPointId");
    expect(proposal).not.toHaveProperty("rejectionReason");
  });

  it.each([
    ["vĩ độ ngoài phạm vi", { latitude: 91 }],
    ["kinh độ ngoài phạm vi", { longitude: -181 }],
    ["loại điểm lạ", { type: "AIRPORT" }],
    ["tên rỗng", { name: "  " }],
    ["phường không phải uuid", { wardId: "x" }],
  ])("từ chối %s", (_case, override) => {
    expect(StopPointProposalInputSchema.safeParse({ ...location, ...override }).success).toBe(false);
  });
});
