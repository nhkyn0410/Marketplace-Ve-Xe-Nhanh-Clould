import { Logger } from "@nestjs/common";
import { z } from "zod";
import {
  type Coordinates,
  type RouteLeg,
  type RoutingProvider,
  RoutingProviderError,
} from "../routing-provider";

const GOONG_DISTANCE_MATRIX_URL = "https://rsapi.goong.io/distancematrix";
const REQUEST_TIMEOUT_MS = 5_000;
const MAX_CONCURRENT_REQUESTS = 4;

// Response Goong Distance Matrix (đối chiếu help.goong.io 26/09/2026): distance.value = mét, duration.value = giây.
const DistanceMatrixSchema = z.object({
  rows: z
    .array(
      z.object({
        elements: z
          .array(
            z.object({
              status: z.literal("OK"),
              distance: z.object({ value: z.number().finite().nonnegative() }),
              duration: z.object({ value: z.number().finite().nonnegative() }),
            }),
          )
          .length(1),
      }),
    )
    .length(1),
});

/**
 * Adapter Goong Distance Matrix (ADR-027). Gọi TỪNG CHẶNG 1×1: tài liệu Goong không nêu giới hạn số
 * origin/destination, và mỗi chặng chỉ tốn một phần tử quota (ma trận n×n tốn n² phần tử).
 * Mọi lỗi → `RoutingProviderError` với message không chứa URL (URL có `api_key`).
 */
export class GoongRoutingProvider implements RoutingProvider {
  readonly source = "GOONG" as const;
  private readonly logger = new Logger("GoongRoutingProvider");

  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  /**
   * Đo các chặng liên tiếp, giữ đúng thứ tự. Tối đa `MAX_CONCURRENT_REQUESTS` request cùng lúc (giới hạn
   * tần suất Goong không công bố); một chặng lỗi thì huỷ các chặng còn lại để không đốt quota vô ích.
   */
  async measureLegs(points: Coordinates[]): Promise<RouteLeg[]> {
    const pairs = points.slice(1).map((to, index) => [points[index]!, to] as const);
    const legs: RouteLeg[] = new Array(pairs.length);
    const cancel = new AbortController();
    let next = 0;
    const worker = async () => {
      while (next < pairs.length && !cancel.signal.aborted) {
        const index = next++;
        const [from, to] = pairs[index]!;
        legs[index] = await this.measureLeg(from, to, cancel.signal);
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_REQUESTS, pairs.length) }, worker));
    } catch (error) {
      cancel.abort();
      throw error;
    }
    return legs;
  }

  private async measureLeg(from: Coordinates, to: Coordinates, cancel: AbortSignal): Promise<RouteLeg> {
    const url = new URL(GOONG_DISTANCE_MATRIX_URL);
    url.searchParams.set("origins", `${from.latitude},${from.longitude}`);
    url.searchParams.set("destinations", `${to.latitude},${to.longitude}`);
    url.searchParams.set("vehicle", "car");
    url.searchParams.set("api_key", this.apiKey);

    let body: unknown;
    try {
      const response = await this.fetchImpl(url, {
        signal: AbortSignal.any([cancel, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
      });
      if (!response.ok) {
        // Đọc bỏ body để trả socket về pool ngay, không đợi GC.
        await response.body?.cancel().catch(() => undefined);
        throw this.fail(`HTTP ${response.status}`);
      }
      body = await response.json();
    } catch (error) {
      if (error instanceof RoutingProviderError) {
        throw error;
      }
      if (cancel.aborted) {
        // Bị huỷ vì chặng khác đã lỗi — lỗi gốc đã được log ở chặng đó.
        throw new RoutingProviderError("Goong Distance Matrix: cancelled");
      }
      // Không nối lỗi gốc: lỗi mạng của fetch có thể mang URL (kèm api_key) vào log.
      throw this.fail(error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network error");
    }

    const parsed = DistanceMatrixSchema.safeParse(body);
    if (!parsed.success) {
      // Goong trả HTTP 200 kèm status lỗi (vd. hết quota) — log status để vận hành phân biệt với lỗi định dạng.
      const status = (body as { rows?: { elements?: { status?: unknown }[] }[] } | null)?.rows?.[0]?.elements?.[0]?.status;
      throw this.fail(
        typeof status === "string" && status !== "OK" ? `element status ${status.slice(0, 40)}` : "unexpected response shape",
      );
    }
    const element = parsed.data.rows[0]!.elements[0]!;
    return {
      distanceMeters: Math.round(element.distance.value),
      durationSeconds: Math.round(element.duration.value),
    };
  }

  private fail(reason: string): RoutingProviderError {
    this.logger.warn(`Goong Distance Matrix thất bại: ${reason}`);
    return new RoutingProviderError(`Goong Distance Matrix: ${reason}`);
  }
}
