import { describe, expect, it } from "vitest";
import { redactSecretQuery, scrubBreadcrumb, scrubSentryEvent } from "./sentry";

const GOONG_URL = "https://rsapi.goong.io/distancematrix?origins=10.7,106.6&destinations=10.8,106.8&vehicle=car&api_key=goong-secret";

describe("che secret trong URL gửi Sentry (TASK-TRN-002 security M1)", () => {
  it("redactSecretQuery che giá trị api_key/token/key, giữ các param khác", () => {
    expect(redactSecretQuery(GOONG_URL)).toBe(
      "https://rsapi.goong.io/distancematrix?origins=10.7,106.6&destinations=10.8,106.8&vehicle=car&api_key=[Filtered]",
    );
    expect(redactSecretQuery("/x?token=abc&keep=1&access_token=def")).toBe("/x?token=[Filtered]&keep=1&access_token=[Filtered]");
    expect(redactSecretQuery("/x?monkey=banana")).toBe("/x?monkey=banana");
  });

  it("breadcrumb fetch đi ra: che url và http.query", () => {
    const breadcrumb = scrubBreadcrumb({
      category: "http",
      data: { url: GOONG_URL, "http.query": "?origins=1,2&api_key=goong-secret", "http.method": "GET" },
    });
    expect(JSON.stringify(breadcrumb)).not.toContain("goong-secret");
    expect(breadcrumb.data["http.method"]).toBe("GET");
  });

  it("event lỗi / transaction: che breadcrumb, span, trace context và request.url", () => {
    const event = scrubSentryEvent({
      request: { url: "https://api.example.com/v1/x?token=incoming-secret", query_string: "token=incoming-secret&a=1" },
      breadcrumbs: [{ message: `GET ${GOONG_URL}`, data: { url: GOONG_URL } }],
      spans: [{ description: `GET ${GOONG_URL}`, data: { "url.full": GOONG_URL, "http.query": "api_key=goong-secret" } }],
      contexts: { trace: { data: { "http.url": GOONG_URL } } },
    });
    expect(JSON.stringify(event)).not.toMatch(/goong-secret|incoming-secret/);
    expect(event.request.query_string).toBe("token=[Filtered]&a=1");
  });
});

describe("scrubSentryEvent", () => {
  it("bỏ body request và header mang credential, giữ phần còn lại để debug", () => {
    const event = scrubSentryEvent({
      request: {
        url: "https://api.example.com/v1/auth/mfa/verify",
        method: "POST",
        data: { challengeToken: "challenge-secret", code: "123456" },
        headers: { Authorization: "Bearer jwt-secret", cookie: "sid=secret", "user-agent": "vitest" }
      }
    });

    expect(JSON.stringify(event)).not.toMatch(/secret|123456/);
    expect(event.request).toEqual({
      url: "https://api.example.com/v1/auth/mfa/verify",
      method: "POST",
      headers: { "user-agent": "vitest" }
    });
  });

  it("event không có request thì giữ nguyên", () => {
    const event: { message: string; request?: undefined } = { message: "boom" };
    expect(scrubSentryEvent(event)).toEqual({ message: "boom" });
  });
});
