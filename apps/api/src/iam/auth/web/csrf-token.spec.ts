import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CSRF_TOKEN_MAX_AGE_SECONDS, constantTimeEqual, isValidCsrfToken, signCsrfToken } from "./csrf-token";

describe("CSRF signed double-submit token", () => {
  const key = randomBytes(32);

  it("token vừa cấp hợp lệ và mỗi lần cấp một giá trị khác", () => {
    const first = signCsrfToken(key);
    const second = signCsrfToken(key);
    expect(isValidCsrfToken(key, first)).toBe(true);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^v1\.\d+\.[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/);
  });

  it("khoá khác (cookie do bên ngoài tự đặt) không hợp lệ", () => {
    expect(isValidCsrfToken(randomBytes(32), signCsrfToken(key))).toBe(false);
  });

  it("sửa bất kỳ phần nào của token làm hỏng chữ ký", () => {
    const [version, issuedAt, nonce, signature] = signCsrfToken(key).split(".") as [string, string, string, string];
    const flip = (value: string) => `${value.slice(0, -1)}${value.endsWith("A") ? "B" : "A"}`;
    for (const forged of [
      `${version}.${Number(issuedAt) + 1}.${nonce}.${signature}`,
      `${version}.${issuedAt}.${flip(nonce)}.${signature}`,
      `${version}.${issuedAt}.${nonce}.${flip(signature)}`,
      `v2.${issuedAt}.${nonce}.${signature}`,
    ]) {
      expect(isValidCsrfToken(key, forged)).toBe(false);
    }
  });

  it("quá 30 ngày hoặc ở tương lai quá xa → không hợp lệ", () => {
    const now = Date.now();
    const old = signCsrfToken(key, now - (CSRF_TOKEN_MAX_AGE_SECONDS + 5) * 1000);
    const future = signCsrfToken(key, now + 5 * 60 * 1000);
    expect(isValidCsrfToken(key, old, now)).toBe(false);
    expect(isValidCsrfToken(key, future, now)).toBe(false);
    expect(isValidCsrfToken(key, signCsrfToken(key, now - 1000), now)).toBe(true);
  });

  it.each([undefined, "", "abc", "v1.1.2", "x".repeat(300), "v1.abc.def.ghi"])("từ chối rác %s", (token) => {
    expect(isValidCsrfToken(key, token)).toBe(false);
  });

  it("so sánh constant-time đúng cả khác độ dài", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
    expect(constantTimeEqual("abc", "abd")).toBe(false);
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });
});
