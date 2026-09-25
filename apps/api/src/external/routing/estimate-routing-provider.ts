import type { Coordinates, RouteLeg, RoutingProvider } from "./routing-provider";

const EARTH_RADIUS_METERS = 6_371_000;
/** Tốc độ giả định 50 km/h (quyết định Q8) — đủ để demo, không phải số liệu thật. */
const ASSUMED_SPEED_METERS_PER_SECOND = 50_000 / 3_600;

/**
 * Ước lượng đường chim bay cho dev/test khi không có `GOONG_API_KEY` (Q8). Route lưu `metricsSource =
 * ESTIMATE` để không nhầm với số Goong. Production không dùng được (env bắt buộc key).
 */
export class EstimateRoutingProvider implements RoutingProvider {
  readonly source = "ESTIMATE" as const;

  /** Ước lượng các chặng liên tiếp bằng khoảng cách haversine. */
  async measureLegs(points: Coordinates[]): Promise<RouteLeg[]> {
    return points.slice(1).map((to, index) => {
      const distance = haversineMeters(points[index]!, to);
      return {
        distanceMeters: Math.round(distance),
        durationSeconds: Math.round(distance / ASSUMED_SPEED_METERS_PER_SECOND),
      };
    });
  }
}

/** Khoảng cách mặt cầu giữa hai toạ độ (mét). */
export function haversineMeters(from: Coordinates, to: Coordinates): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(to.latitude - from.latitude);
  const dLng = radians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}
