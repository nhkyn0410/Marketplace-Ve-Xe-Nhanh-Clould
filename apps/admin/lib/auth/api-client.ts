// Client gọi API ở cookie mode (TASK-IAM-006, 05 API §7.1.1–§7.1.2). Token phiên nằm trong cookie
// httpOnly do API đặt — JS không đọc được; ở đây chỉ giữ CSRF token trong memory (không localStorage).
// Bản riêng của Admin (TASK-IAM-006 Q1: mỗi app tự có code auth) — giữ cùng cấu trúc với Operator OS.

/**
 * Base URL API (có `/v1`). Local mặc định theo Deploy §4 (http://localhost:3000). Build production thiếu env
 * thì dùng đường dẫn tương đối — hỏng rõ ràng thay vì gửi mật khẩu tới localhost của người dùng.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "/v1" : "http://localhost:3000/v1");

/** Lỗi RFC 7807 từ API: giữ `status` + `code` (GLOSSARY) để UI chọn thông báo. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** `false` cho login/MFA: 401 ở đó là sai thông tin, không phải hết phiên. */
  retryOnUnauthorized?: boolean;
};

let csrfToken: string | null = null;
let refreshInFlight: Promise<RefreshOutcome> | null = null;
let sessionExpiredListener: (() => void) | null = null;

/** Đăng ký hàm được gọi khi refresh thất bại (AuthProvider chuyển về màn đăng nhập). */
export function onSessionExpired(listener: (() => void) | null): void {
  sessionExpiredListener = listener;
}

/** Lấy CSRF token (API trả lại token còn hợp lệ trong cookie sau reload, chỉ cấp mới khi cần). */
export async function ensureCsrf(force = false): Promise<void> {
  if (csrfToken && !force) {
    return;
  }
  const body = await parse<{ csrfToken: string }>(await send("/auth/csrf", {}));
  csrfToken = body.csrfToken;
}

/** Kết quả refresh: chỉ `expired` mới là hết phiên; `unavailable` (mạng/429/503) để người dùng thử lại. */
export type RefreshOutcome = "ok" | "expired" | "unavailable";

/**
 * Refresh single-flight: N request cùng nhận 401 chỉ gây MỘT lần `POST /auth/refresh`. Gọi song song sẽ
 * khiến request sau dùng refresh token đã bị xoay → API coi là reuse và thu hồi cả phiên (đăng xuất oan).
 * Trong một tab dùng promise dùng chung; giữa các tab dùng Web Locks (cookie refresh là chung).
 */
export function refreshSession(): Promise<RefreshOutcome> {
  refreshInFlight ??= (async (): Promise<RefreshOutcome> => {
    try {
      return await withRefreshLock(async () => {
        await ensureCsrf();
        let response = await send("/auth/refresh", { method: "POST", body: {} });
        // Tab khác vừa refresh → cookie CSRF đã rotate, token trong memory cũ: lấy lại rồi thử một lần.
        if (response.status === 403 && (await problemCode(response)) === "AUTH_CSRF_INVALID") {
          await ensureCsrf(true);
          response = await send("/auth/refresh", { method: "POST", body: {} });
        }
        if (response.ok) {
          return "ok";
        }
        if (response.status === 401 || response.status === 403) {
          csrfToken = null;
          return "expired";
        }
        return "unavailable";
      });
    } catch {
      return "unavailable";
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Quên CSRF trong memory (sau logout API đã xoá cookie `vxn_csrf`). */
export function forgetCsrf(): void {
  csrfToken = null;
}

function withRefreshLock<T>(work: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  return locks ? locks.request("vxn-auth-refresh", work) : work();
}

/**
 * Gọi API cookie mode. Unsafe method tự gắn `X-CSRF-Token`; 403 `AUTH_CSRF_INVALID` (token bị tab khác
 * rotate) → lấy CSRF mới và thử lại một lần; 401 → refresh single-flight rồi thử lại đúng một lần.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const unsafe = (options.method ?? "GET") !== "GET";
  if (unsafe) {
    await ensureCsrf();
  }
  let response = await send(path, options);

  if (unsafe && response.status === 403 && (await problemCode(response)) === "AUTH_CSRF_INVALID") {
    await ensureCsrf(true);
    response = await send(path, options);
  }

  if (response.status === 401 && options.retryOnUnauthorized !== false) {
    const outcome = await refreshSession();
    if (outcome === "unavailable") {
      throw new ApiError(503, "SERVICE_UNAVAILABLE", "Không làm mới được phiên đăng nhập. Vui lòng thử lại.");
    }
    if (outcome === "ok") {
      response = await send(path, options);
    }
    if (response.status === 401) {
      sessionExpiredListener?.();
    }
  }
  return parse<T>(response);
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method ?? "GET";
  // Chỉ endpoint /auth/* cần chọn transport; route nghiệp vụ đọc cookie sẵn — bớt một header là bớt
  // preflight CORS cho mọi GET danh sách.
  const headers: Record<string, string> = path.startsWith("/auth/") ? { "X-Auth-Transport": "cookie" } : {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (method !== "GET" && csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
    cache: "no-store"
  });
  // API rotate CSRF khi cấp phiên / refresh / đổi mật khẩu và trả token mới qua header.
  const rotated = response.headers.get("X-CSRF-Token");
  if (rotated) {
    csrfToken = rotated;
  }
  return response;
}

async function problemCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.clone().json()) as { code?: unknown };
    return typeof body.code === "string" ? body.code : undefined;
  } catch {
    return undefined;
  }
}

async function parse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (response.status === 204 ? undefined : await response.json()) as T;
  }
  let code = "UNKNOWN_ERROR";
  let detail = "Đã có lỗi xảy ra. Vui lòng thử lại.";
  try {
    const body = (await response.json()) as { code?: unknown; detail?: unknown };
    code = typeof body.code === "string" ? body.code : code;
    detail = typeof body.detail === "string" ? body.detail : detail;
  } catch {
    // Body không phải JSON (proxy/mạng) — giữ thông báo chung.
  }
  throw new ApiError(response.status, code, detail);
}

/** Chỉ dùng trong test: xoá trạng thái module giữa các ca. */
export function resetApiClientForTest(): void {
  csrfToken = null;
  refreshInFlight = null;
  sessionExpiredListener = null;
}
