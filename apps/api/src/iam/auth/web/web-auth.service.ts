import { randomBytes } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { CookieOptions, Request, Response } from "express";
import { APP_CONFIG, type AppConfig, webOriginScopes } from "../../../config/env.config";
import { API_VERSION_PREFIX } from "../../../openapi/openapi";
import { csrfInvalid, originForbidden } from "../auth.errors";
import type { LoginResult } from "../auth.service";
import type { AuthScope } from "../token.service";
import type { WebSessionResponse } from "../dto/auth.dto";
import {
  ACCESS_COOKIE,
  CSRF_COOKIE,
  CSRF_HEADER,
  hasCookie,
  readCookie,
  REFRESH_COOKIE,
} from "./auth-transport";
import { constantTimeEqual, CSRF_TOKEN_MAX_AGE_SECONDS, isValidCsrfToken, signCsrfToken } from "./csrf-token";

const API_PATH = `/${API_VERSION_PREFIX}`;
const REFRESH_PATH = `${API_PATH}/auth/refresh`;
/** Header trả CSRF token mới cho web (được CORS expose). */
export const CSRF_RESPONSE_HEADER = "X-CSRF-Token";

/**
 * Cookie mode cho web Operator OS/Admin (TASK-IAM-006, API §7.1.1–§7.1.2): ghi/xoá cookie phiên,
 * cấp/kiểm CSRF signed double-submit và allowlist `Origin`. Mobile (Bearer) không đi qua đây.
 */
@Injectable()
export class WebAuthService {
  private readonly logger = new Logger(WebAuthService.name);
  private readonly csrfKey: Buffer;
  private readonly secure: boolean;
  private readonly originScopes: ReadonlyMap<string, AuthScope>;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    // Local HTTP không đặt được cookie Secure; staging/production (NODE_ENV=production) luôn Secure.
    this.secure = config.NODE_ENV === "production";
    this.originScopes = webOriginScopes(config);
    if (config.WEB_CSRF_SECRET) {
      this.csrfKey = Buffer.from(config.WEB_CSRF_SECRET, "base64");
    } else {
      // Env đã fail-fast ở production; dev/test dùng khoá ngẫu nhiên — restart thì web tự lấy CSRF mới.
      this.logger.warn("WEB_CSRF_SECRET chưa set - dùng khoá CSRF ngẫu nhiên cho dev (token mất hiệu lực sau restart).");
      this.csrfKey = randomBytes(32);
    }
  }

  /** Origin có nằm trong exact allowlist (`OPERATOR_WEB_ORIGINS` ∪ `ADMIN_WEB_ORIGINS`) không. */
  isAllowedOrigin(origin: string | undefined): boolean {
    return origin !== undefined && this.originScopes.has(origin);
  }

  /**
   * Phiên cookie chỉ dùng được từ đúng app của scope (M1 security-auditor): XSS ở Operator OS không được
   * mượn cookie của phiên Admin cùng trình duyệt. Request không có `Origin` (không phải fetch cross-origin
   * từ trình duyệt) không bị xét ở đây — unsafe request đã bắt buộc Origin ở `assertUnsafeCookieRequest`.
   */
  assertOriginScope(req: Request, scope: AuthScope): void {
    const origin = req.headers.origin;
    if (typeof origin === "string" && this.originScopes.get(origin) !== scope) {
      throw originForbidden();
    }
  }

  /** Scope của app web gửi request (theo `Origin`); `undefined` nếu không có hoặc ngoài allowlist. */
  scopeOfOrigin(req: Request): AuthScope | undefined {
    const origin = req.headers.origin;
    return typeof origin === "string" ? this.originScopes.get(origin) : undefined;
  }

  /**
   * Chặn unsafe request dùng cookie: `Origin` phải thuộc allowlist, header `X-CSRF-Token` phải trùng
   * cookie `vxn_csrf` và có chữ ký hợp lệ. Thứ tự kiểm cố định: origin trước, CSRF sau.
   */
  assertUnsafeCookieRequest(req: Request): void {
    const origin = req.headers.origin;
    if (!this.isAllowedOrigin(typeof origin === "string" ? origin : undefined)) {
      throw originForbidden();
    }
    const header = req.headers[CSRF_HEADER];
    const cookie = readCookie(req, CSRF_COOKIE);
    if (
      typeof header !== "string" ||
      !cookie ||
      !constantTimeEqual(header, cookie) ||
      !isValidCsrfToken(this.csrfKey, cookie)
    ) {
      throw csrfInvalid();
    }
  }

  /**
   * `GET /auth/csrf`: trả lại token còn hợp lệ trong cookie (reload trang không làm tab khác mất token),
   * chỉ cấp mới khi thiếu/sai/hết hạn.
   */
  csrfForBootstrap(req: Request, res: Response): string {
    const current = readCookie(req, CSRF_COOKIE);
    return current && isValidCsrfToken(this.csrfKey, current) ? current : this.issueCsrf(res);
  }

  /** Cấp CSRF token mới: cookie `vxn_csrf` + header `X-CSRF-Token`. Dùng khi cấp session/refresh/đổi mật khẩu. */
  issueCsrf(res: Response): string {
    const token = signCsrfToken(this.csrfKey);
    res.cookie(CSRF_COOKIE, token, this.csrfCookieOptions(CSRF_TOKEN_MAX_AGE_SECONDS));
    res.setHeader(CSRF_RESPONSE_HEADER, token);
    return token;
  }

  /** Ghi `vxn_access` + `vxn_refresh`, rotate CSRF và trả metadata phiên — không có token thô trong body. */
  writeSession(res: Response, result: LoginResult): WebSessionResponse {
    res.cookie(ACCESS_COOKIE, result.accessToken, this.accessCookieOptions(result.expiresInSeconds));
    res.cookie(REFRESH_COOKIE, result.refreshToken, this.refreshCookieOptions(result.refreshExpiresInSeconds));
    this.issueCsrf(res);
    return {
      authenticated: true,
      scope: result.scope,
      role: result.role,
      expiresIn: result.expiresInSeconds,
      refreshExpiresIn: result.refreshExpiresInSeconds,
    };
  }

  /** Xoá cả 3 cookie bằng đúng attributes lúc đặt (Max-Age=0 + Expires quá khứ). */
  clearSession(res: Response): void {
    res.cookie(ACCESS_COOKIE, "", this.accessCookieOptions(0));
    res.cookie(REFRESH_COOKIE, "", this.refreshCookieOptions(0));
    res.cookie(CSRF_COOKIE, "", this.csrfCookieOptions(0));
  }

  /** Refresh token của cookie mode (chỉ gửi tới `/v1/auth/refresh`). */
  refreshTokenFrom(req: Request): string | undefined {
    return readCookie(req, REFRESH_COOKIE);
  }

  /** Request có mang cookie phiên web (access hoặc refresh) không. */
  carriesSessionCookie(req: Request): boolean {
    return hasCookie(req, ACCESS_COOKIE) || hasCookie(req, REFRESH_COOKIE);
  }

  private accessCookieOptions(maxAgeSeconds: number): CookieOptions {
    return this.options({ httpOnly: true, sameSite: "lax", path: API_PATH }, maxAgeSeconds);
  }

  private refreshCookieOptions(maxAgeSeconds: number): CookieOptions {
    return this.options({ httpOnly: true, sameSite: "strict", path: REFRESH_PATH }, maxAgeSeconds);
  }

  private csrfCookieOptions(maxAgeSeconds: number): CookieOptions {
    return this.options({ httpOnly: false, sameSite: "strict", path: API_PATH }, maxAgeSeconds);
  }

  /** Host-only (không `domain`); Express sinh cả `Max-Age` lẫn `Expires` từ `maxAge` (ms). */
  private options(base: CookieOptions, maxAgeSeconds: number): CookieOptions {
    return { ...base, secure: this.secure, maxAge: maxAgeSeconds * 1000 };
  }
}
