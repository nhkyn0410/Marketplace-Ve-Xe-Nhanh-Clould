import type { Request } from "express";
import { authTransportAmbiguous, authTransportInvalid } from "../auth.errors";

// Tên cookie/header web auth — contract API §7.1.1–§7.1.2 (TASK-OQ-05). Đổi tên = đổi contract.
export const ACCESS_COOKIE = "vxn_access";
export const REFRESH_COOKIE = "vxn_refresh";
export const CSRF_COOKIE = "vxn_csrf";
export const AUTH_TRANSPORT_HEADER = "x-auth-transport";
export const CSRF_HEADER = "x-csrf-token";

export type AuthTransport = "cookie" | "bearer";

type RequestHeaders = Pick<Request, "headers">;

/**
 * Chế độ transport client chọn tường minh. Thiếu header = `bearer` để Mobile giữ nguyên hành vi;
 * không sniff User-Agent. Giá trị khác → 400 `AUTH_TRANSPORT_INVALID`.
 */
export function resolveAuthTransport(req: RequestHeaders): AuthTransport {
  const raw = req.headers[AUTH_TRANSPORT_HEADER];
  if (raw === undefined) {
    return "bearer";
  }
  const value = typeof raw === "string" ? raw.trim() : undefined;
  if (value === "cookie" || value === "bearer") {
    return value;
  }
  throw authTransportInvalid();
}

/**
 * Mọi giá trị của một cookie trong header `Cookie`. Trả nhiều giá trị khi trình duyệt gửi trùng tên
 * (vd cookie cùng tên do subdomain khác đặt) — caller phải coi đó là không hợp lệ, không chọn bừa.
 */
export function cookieValues(req: RequestHeaders, name: string): string[] {
  const header = req.headers.cookie;
  if (!header) {
    return [];
  }
  const values: string[] = [];
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) {
      continue;
    }
    values.push(decodeCookieValue(part.slice(separator + 1).trim()));
  }
  return values;
}

/** Giá trị duy nhất của cookie; thiếu hoặc bị gửi trùng với giá trị khác nhau → `undefined`. */
export function readCookie(req: RequestHeaders, name: string): string | undefined {
  const values = cookieValues(req, name);
  const [first] = values;
  return first && values.every((value) => value === first) ? first : undefined;
}

/** Request có mang cookie này không (kể cả giá trị rỗng/trùng) — dùng để quyết định có phải cookie mode. */
export function hasCookie(req: RequestHeaders, name: string): boolean {
  return cookieValues(req, name).length > 0;
}

export type AccessCredential = { token: string; source: AuthTransport };

/**
 * Credential của protected endpoint: ĐÚNG MỘT trong Bearer header hoặc cookie `vxn_access`.
 * Có cả hai → 400 `AUTH_TRANSPORT_AMBIGUOUS` (không ưu tiên ngầm). Không có/không đọc được → `null`.
 */
export function accessCredential(req: RequestHeaders): AccessCredential | null {
  const header = req.headers.authorization;
  const cookiePresent = hasCookie(req, ACCESS_COOKIE);
  if (header !== undefined && cookiePresent) {
    throw authTransportAmbiguous();
  }
  if (header !== undefined) {
    const token = bearerToken(header);
    return token ? { token, source: "bearer" } : null;
  }
  const token = readCookie(req, ACCESS_COOKIE);
  return token ? { token, source: "cookie" } : null;
}

/** Scheme không phân biệt hoa thường (RFC 7235) — client Dart từng gửi `bearer`. */
function bearerToken(header: string): string | undefined {
  return /^Bearer\s+(\S+)$/i.exec(header)?.[1];
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
