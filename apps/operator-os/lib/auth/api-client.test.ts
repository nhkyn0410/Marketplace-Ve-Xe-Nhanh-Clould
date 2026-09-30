import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest, onSessionExpired, refreshSession, resetApiClientForTest } from "./api-client";

type Call = { path: string; method: string; headers: Record<string, string>; credentials?: RequestCredentials };

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers }
  });
}

describe("api-client cookie mode (TC-SEC-007 phía web)", () => {
  const calls: Call[] = [];
  let handler: (call: Call) => Response | Promise<Response>;

  beforeEach(() => {
    resetApiClientForTest();
    calls.length = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        const call = {
          path: url.replace("http://localhost:3000/v1", ""),
          method: init.method ?? "GET",
          headers: init.headers as Record<string, string>,
          credentials: init.credentials
        };
        calls.push(call);
        if (call.path === "/auth/csrf") {
          return json(200, { csrfToken: `csrf-${calls.length}` });
        }
        return handler(call);
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mọi request gửi cookie; unsafe tự gắn CSRF; chỉ /auth/* mang X-Auth-Transport (bớt preflight)", async () => {
    handler = () => json(200, { ok: true });
    await apiRequest("/probe", { method: "POST", body: {} });
    await apiRequest("/auth/me");
    const probe = calls.find((call) => call.path === "/probe")!;
    expect(probe.credentials).toBe("include");
    expect(probe.headers["X-Auth-Transport"]).toBeUndefined();
    expect(probe.headers["X-CSRF-Token"]).toBe("csrf-1");
    expect(calls.find((call) => call.path === "/auth/me")?.headers["X-Auth-Transport"]).toBe("cookie");
  });

  it("refresh gặp CSRF cũ (tab khác đã rotate) → lấy CSRF mới, thử lại, không đăng xuất", async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    let refreshAttempts = 0;
    let refreshed = false;
    handler = (call) => {
      if (call.path === "/auth/refresh") {
        refreshed = ++refreshAttempts === 2;
        return refreshed ? json(200, {}) : json(403, { code: "AUTH_CSRF_INVALID" });
      }
      return refreshed ? json(200, { ok: true }) : json(401, { code: "AUTH_SESSION_EXPIRED" });
    };
    await expect(apiRequest("/auth/me")).resolves.toEqual({ ok: true });
    expect(refreshAttempts).toBe(2);
    expect(expired).not.toHaveBeenCalled();
  });

  it.each([429, 503])("refresh lỗi tạm thời %i → báo lỗi thử lại, KHÔNG coi là hết phiên", async (status) => {
    const expired = vi.fn();
    onSessionExpired(expired);
    handler = (call) => (call.path === "/auth/refresh" ? json(status, {}) : json(401, { code: "AUTH_SESSION_EXPIRED" }));
    await expect(apiRequest("/auth/me")).rejects.toMatchObject({ status: 503, code: "SERVICE_UNAVAILABLE" });
    expect(expired).not.toHaveBeenCalled();
  });

  it("refresh chạy trong Web Lock khi trình duyệt hỗ trợ (nhiều tab không xoay cùng một token)", async () => {
    const request = vi.fn((_name: string, work: () => Promise<unknown>) => work());
    vi.stubGlobal("navigator", { locks: { request } });
    handler = () => json(200, {});
    await expect(refreshSession()).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith("vxn-auth-refresh", expect.any(Function));
  });

  it("N request cùng 401 → đúng MỘT refresh, mỗi request retry đúng một lần", async () => {
    let refreshed = false;
    handler = async (call) => {
      if (call.path === "/auth/refresh") {
        await new Promise((resolve) => setTimeout(resolve, 10));
        refreshed = true;
        return json(200, { authenticated: true }, { "X-CSRF-Token": "rotated" });
      }
      return refreshed ? json(200, { path: call.path }) : json(401, { code: "AUTH_SESSION_EXPIRED" });
    };

    const results = await Promise.all([apiRequest("/a"), apiRequest("/b"), apiRequest("/c")]);

    expect(results).toEqual([{ path: "/a" }, { path: "/b" }, { path: "/c" }]);
    expect(calls.filter((call) => call.path === "/auth/refresh")).toHaveLength(1);
    expect(calls.filter((call) => call.path === "/a")).toHaveLength(2);
  });

  it("refresh thất bại → không lặp, báo hết phiên và ném 401", async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    handler = () => json(401, { code: "AUTH_SESSION_EXPIRED", detail: "hết hạn" });

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({ status: 401, code: "AUTH_SESSION_EXPIRED" });
    expect(calls.filter((call) => call.path === "/auth/refresh")).toHaveLength(1);
    // Refresh hỏng thì không gọi lại request gốc — tránh vòng lặp 401 → refresh.
    expect(calls.filter((call) => call.path === "/auth/me")).toHaveLength(1);
    expect(expired).toHaveBeenCalledOnce();
  });

  it("login sai (retryOnUnauthorized=false) không kích hoạt refresh", async () => {
    handler = () => json(401, { code: "AUTH_INVALID_CREDENTIALS" });
    await expect(
      apiRequest("/auth/operator/login", { method: "POST", body: {}, retryOnUnauthorized: false })
    ).rejects.toBeInstanceOf(ApiError);
    expect(calls.some((call) => call.path === "/auth/refresh")).toBe(false);
  });

  it("403 AUTH_CSRF_INVALID (tab khác đã rotate) → lấy CSRF mới, thử lại một lần", async () => {
    let attempts = 0;
    handler = () => (++attempts === 1 ? json(403, { code: "AUTH_CSRF_INVALID" }) : json(200, { ok: true }));
    await expect(apiRequest("/probe", { method: "POST", body: {} })).resolves.toEqual({ ok: true });
    expect(calls.filter((call) => call.path === "/auth/csrf")).toHaveLength(2);
    expect(calls.filter((call) => call.path === "/probe").map((call) => call.headers["X-CSRF-Token"])).toEqual([
      "csrf-1",
      "csrf-3"
    ]);
  });

  it("CSRF mới trong header response được dùng cho request sau", async () => {
    handler = (call) =>
      call.path === "/auth/refresh" ? json(200, {}, { "X-CSRF-Token": "after-refresh" }) : json(200, {});
    await refreshSession();
    await apiRequest("/probe", { method: "POST", body: {} });
    expect(calls.at(-1)?.headers["X-CSRF-Token"]).toBe("after-refresh");
  });
});
