import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const VERSION = "v1";
/** Trùng Max-Age của cookie `vxn_csrf` (API §7.1.1): token quá tuổi này bị từ chối dù cookie còn. */
export const CSRF_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
/** Chênh lệch đồng hồ tối đa chấp nhận cho `issuedAt` nằm ở tương lai. */
const CLOCK_SKEW_SECONDS = 60;

/**
 * Cấp CSRF token signed double-submit: `v1.<issuedAt>.<nonce 256-bit>.<HMAC-SHA256>`.
 * Chữ ký chỉ chặn token tự bịa; ai cũng xin được token hợp lệ qua `GET /auth/csrf`, nên lớp chặn CSRF
 * thật sự là Origin allowlist + header tuỳ biến (cần CORS preflight) — HMAC là lớp phụ.
 */
export function signCsrfToken(key: Buffer, nowMs = Date.now()): string {
  const payload = `${VERSION}.${Math.floor(nowMs / 1000)}.${randomBytes(32).toString("base64url")}`;
  return `${payload}.${sign(key, payload)}`;
}

/** Token đúng định dạng, đúng chữ ký và chưa quá hạn. KHÔNG trả lý do — mọi lỗi cùng một 403. */
export function isValidCsrfToken(key: Buffer, token: string | undefined, nowMs = Date.now()): boolean {
  if (!token || token.length > 256) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    return false;
  }
  const [version, issuedAtText, nonce, signature] = parts as [string, string, string, string];
  if (!/^\d{1,12}$/.test(issuedAtText) || !/^[A-Za-z0-9_-]{43}$/.test(nonce)) {
    return false;
  }
  const age = Math.floor(nowMs / 1000) - Number(issuedAtText);
  if (age > CSRF_TOKEN_MAX_AGE_SECONDS || age < -CLOCK_SKEW_SECONDS) {
    return false;
  }
  return constantTimeEqual(signature, sign(key, `${version}.${issuedAtText}.${nonce}`));
}

/** So sánh hai chuỗi không lộ thời gian theo vị trí ký tự khác nhau. */
export function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(key: Buffer, payload: string): string {
  return createHmac("sha256", key).update(`vxn-csrf:${payload}`).digest("base64url");
}
