/**
 * Port routing (ADR-006/027): domain chỉ phụ thuộc interface này, không gọi Goong trực tiếp. Chỉ dùng
 * lúc CẤU HÌNH route — kết quả lưu DB; GET/search không bao giờ gọi (cache-once).
 */
export const ROUTING_PROVIDER = Symbol("ROUTING_PROVIDER");

export type Coordinates = { latitude: number; longitude: number };

/** Một chặng giữa hai điểm liên tiếp. */
export type RouteLeg = { distanceMeters: number; durationSeconds: number };

export interface RoutingProvider {
  /** Nguồn số liệu, lưu cùng route để phân biệt số thật và số ước lượng. */
  readonly source: "GOONG" | "ESTIMATE";
  /** Đo các chặng liên tiếp: kết quả có đúng `points.length - 1` phần tử, theo thứ tự. */
  measureLegs(points: Coordinates[]): Promise<RouteLeg[]>;
}

/** Provider không trả được kết quả hợp lệ (timeout, HTTP lỗi, response sai). Message không chứa key/URL. */
export class RoutingProviderError extends Error {
  override readonly name = "RoutingProviderError";
}
