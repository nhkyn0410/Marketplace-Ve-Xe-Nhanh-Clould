import type { HttpException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { accessCredential, cookieValues, readCookie, resolveAuthTransport } from "./auth-transport";

function req(headers: Record<string, string | undefined>) {
  return { headers } as never;
}

function codeOf(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (error) {
    return ((error as HttpException).getResponse() as { code: string }).code;
  }
}

describe("X-Auth-Transport", () => {
  it("thiếu header = bearer (Mobile giữ nguyên hành vi)", () => {
    expect(resolveAuthTransport(req({}))).toBe("bearer");
  });

  it.each(["cookie", "bearer", " cookie "])("chấp nhận %s", (value) => {
    expect(resolveAuthTransport(req({ "x-auth-transport": value }))).toBe(value.trim());
  });

  it.each(["", "Cookie", "session", "cookie, bearer"])("giá trị %s → AUTH_TRANSPORT_INVALID", (value) => {
    expect(codeOf(() => resolveAuthTransport(req({ "x-auth-transport": value })))).toBe("AUTH_TRANSPORT_INVALID");
  });
});

describe("cookie parsing", () => {
  it("đọc đúng cookie theo tên, bỏ qua cookie khác và khoảng trắng", () => {
    const request = req({ cookie: "a=1; vxn_csrf=tok%2Den ; vxn_csrfx=no" });
    expect(readCookie(request, "vxn_csrf")).toBe("tok-en");
    expect(readCookie(request, "missing")).toBeUndefined();
  });

  it("cookie trùng tên khác giá trị (cookie tossing) → không chọn bừa", () => {
    const request = req({ cookie: "vxn_csrf=one; vxn_csrf=two" });
    expect(cookieValues(request, "vxn_csrf")).toEqual(["one", "two"]);
    expect(readCookie(request, "vxn_csrf")).toBeUndefined();
  });
});

describe("accessCredential — đúng một credential", () => {
  it("Bearer header", () => {
    expect(accessCredential(req({ authorization: "bearer abc" }))).toEqual({ token: "abc", source: "bearer" });
  });

  it("cookie vxn_access", () => {
    expect(accessCredential(req({ cookie: "vxn_access=jwt" }))).toEqual({ token: "jwt", source: "cookie" });
  });

  it("TC-SEC-006: Bearer + cookie → AUTH_TRANSPORT_AMBIGUOUS, không ưu tiên ngầm", () => {
    expect(codeOf(() => accessCredential(req({ authorization: "Bearer abc", cookie: "vxn_access=jwt" })))).toBe(
      "AUTH_TRANSPORT_AMBIGUOUS",
    );
  });

  it("header Authorization sai scheme hoặc không có gì → null", () => {
    expect(accessCredential(req({ authorization: "Basic abc" }))).toBeNull();
    expect(accessCredential(req({}))).toBeNull();
  });
});
