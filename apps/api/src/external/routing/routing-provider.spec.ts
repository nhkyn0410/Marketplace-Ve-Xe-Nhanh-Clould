import { describe, expect, it, vi } from "vitest";
import { EstimateRoutingProvider, haversineMeters } from "./estimate-routing-provider";
import { GoongRoutingProvider } from "./goong/goong-routing-provider";
import { RoutingProviderError } from "./routing-provider";

const SECRET = "goong-secret-key";
const A = { latitude: 10.7406, longitude: 106.619 };
const B = { latitude: 10.8787, longitude: 106.8164 };
const C = { latitude: 11.9275, longitude: 108.4448 };

function okLeg(distance: number, duration: number) {
  return { rows: [{ elements: [{ status: "OK", distance: { text: "", value: distance }, duration: { text: "", value: duration } }] }] };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("GoongRoutingProvider — Distance Matrix, từng chặng 1×1 (không gọi mạng thật)", () => {
  it("gọi đúng endpoint/tham số cho từng chặng và trả chặng theo thứ tự", async () => {
    const fetchImpl = vi.fn(async (url: URL | RequestInfo) => {
      const origin = new URL(String(url)).searchParams.get("origins");
      return jsonResponse(origin === `${A.latitude},${A.longitude}` ? okLeg(25_000.4, 1800) : okLeg(300_000, 21_600.6));
    });
    const provider = new GoongRoutingProvider(SECRET, fetchImpl as unknown as typeof fetch);

    expect(await provider.measureLegs([A, B, C])).toEqual([
      { distanceMeters: 25_000, durationSeconds: 1800 },
      { distanceMeters: 300_000, durationSeconds: 21_601 },
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const first = new URL(String(fetchImpl.mock.calls[0]![0]));
    expect(`${first.origin}${first.pathname}`).toBe("https://rsapi.goong.io/distancematrix");
    expect(Object.fromEntries(first.searchParams)).toEqual({
      origins: `${A.latitude},${A.longitude}`,
      destinations: `${B.latitude},${B.longitude}`,
      vehicle: "car",
      api_key: SECRET,
    });
  });

  it.each([
    ["HTTP 500", () => jsonResponse({ error: "boom" }, 500)],
    ["HTTP 403 (key sai)", () => jsonResponse({ error: "forbidden" }, 403)],
    ["status khác OK", () => jsonResponse({ rows: [{ elements: [{ status: "ZERO_RESULTS" }] }] })],
    ["thiếu duration", () => jsonResponse({ rows: [{ elements: [{ status: "OK", distance: { value: 1 } }] }] })],
    ["số âm", () => jsonResponse(okLeg(-1, 10))],
    ["thừa phần tử", () => jsonResponse({ rows: [okLeg(1, 1).rows[0], okLeg(1, 1).rows[0]] })],
    ["body không phải JSON", () => new Response("<html>", { status: 200 })],
  ])("%s → RoutingProviderError, message không lộ key", async (_case, respond) => {
    const provider = new GoongRoutingProvider(SECRET, (async () => respond()) as unknown as typeof fetch);
    const error = await provider.measureLegs([A, B]).catch((failure: unknown) => failure);
    expect(error).toBeInstanceOf(RoutingProviderError);
    expect(String((error as Error).message)).not.toContain(SECRET);
  });

  it("tối đa 4 request cùng lúc; một chặng lỗi thì không gọi các chặng còn lại", async () => {
    const points = Array.from({ length: 13 }, (_, index) => ({ latitude: 10 + index / 10, longitude: 106 }));
    let inFlight = 0;
    let peak = 0;
    const slowOk = vi.fn(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return jsonResponse(okLeg(1000, 60));
    });
    expect(await new GoongRoutingProvider(SECRET, slowOk as unknown as typeof fetch).measureLegs(points)).toHaveLength(12);
    expect(peak).toBe(4);

    // Chặng đầu lỗi ngay; các chặng khác chậm 5 ms → sau khi huỷ không được mở thêm request nào.
    const failFirst = vi.fn(async (url: URL | RequestInfo) => {
      if (new URL(String(url)).searchParams.get("origins") === "10,106") {
        return jsonResponse({}, 500);
      }
      await new Promise((resolve) => setTimeout(resolve, 5));
      return jsonResponse(okLeg(1, 1));
    });
    await expect(new GoongRoutingProvider(SECRET, failFirst as unknown as typeof fetch).measureLegs(points)).rejects.toBeInstanceOf(
      RoutingProviderError,
    );
    expect(failFirst.mock.calls.length).toBe(4);
  });

  it("lỗi mạng / timeout → RoutingProviderError không mang lỗi gốc (có thể chứa URL + key)", async () => {
    for (const failure of [new TypeError(`fetch failed https://rsapi.goong.io/?api_key=${SECRET}`), Object.assign(new Error("t"), { name: "TimeoutError" })]) {
      const provider = new GoongRoutingProvider(SECRET, (async () => {
        throw failure;
      }) as unknown as typeof fetch);
      const error = (await provider.measureLegs([A, B]).catch((caught: unknown) => caught)) as Error;
      expect(error).toBeInstanceOf(RoutingProviderError);
      expect(error.message).not.toContain(SECRET);
      expect(error.cause).toBeUndefined();
    }
  });
});

describe("EstimateRoutingProvider — dev không có key (Q8)", () => {
  it("haversine: cùng điểm = 0; HCM → Hà Nội ≈ 1.140 km", () => {
    expect(haversineMeters(A, A)).toBe(0);
    const hanoi = { latitude: 21.0285, longitude: 105.8542 };
    expect(haversineMeters(A, hanoi) / 1000).toBeGreaterThan(1_100);
    expect(haversineMeters(A, hanoi) / 1000).toBeLessThan(1_180);
  });

  it("n−1 chặng số nguyên, thời gian theo 50 km/h, nguồn ESTIMATE", async () => {
    const provider = new EstimateRoutingProvider();
    const legs = await provider.measureLegs([A, B, C]);
    expect(provider.source).toBe("ESTIMATE");
    expect(legs).toHaveLength(2);
    for (const leg of legs) {
      expect(Number.isInteger(leg.distanceMeters) && Number.isInteger(leg.durationSeconds)).toBe(true);
      expect(Math.abs(leg.durationSeconds - leg.distanceMeters / (50_000 / 3_600))).toBeLessThanOrEqual(1);
    }
  });
});
