import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { authTransportAmbiguous } from "../auth.errors";
import { TokenService } from "../token.service";
import { ACCESS_COOKIE, hasCookie, readCookie, resolveAuthTransport } from "./auth-transport";
import { WebAuthService } from "./web-auth.service";

/** Method an toàn không được tạo side effect nên miễn CSRF (API §7.1.2). */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Guard toàn cục (APP_GUARD) cho mọi route `/v1/**`: validate `X-Auth-Transport`; phiên cookie gọi từ
 * origin của app khác scope → 403 (kể cả GET); unsafe request dùng cookie (header `cookie` hoặc mang
 * cookie phiên) bắt buộc Origin allowlist + CSRF. Bearer thuần (Mobile) không mang cookie nên không bị ảnh hưởng.
 */
@Injectable()
export class WebCsrfGuard implements CanActivate {
  constructor(
    private readonly web: WebAuthService,
    private readonly tokens: TokenService,
  ) {}

  /** Chạy trước guard của route: request cookie sai origin/thiếu CSRF bị chặn trước khi chạm handler. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request>();
    const transport = resolveAuthTransport(req);
    const unsafe = !SAFE_METHODS.has(req.method);
    const accessCookie = hasCookie(req, ACCESS_COOKIE);

    // Kiểm ambiguity trước CSRF để client nhận đúng lỗi 400 thay vì 403 khó hiểu.
    if (unsafe && accessCookie && req.headers.authorization !== undefined) {
      throw authTransportAmbiguous();
    }
    if (unsafe && (transport === "cookie" || this.web.carriesSessionCookie(req))) {
      this.web.assertUnsafeCookieRequest(req);
    }
    // Ràng origin ↔ scope phiên (M1): chỉ khi token hợp lệ; token hỏng để AccessTokenGuard trả 401.
    if (accessCookie && req.headers.origin !== undefined && req.headers.authorization === undefined) {
      const token = readCookie(req, ACCESS_COOKIE);
      const claims = token ? await this.tokens.verifyAccessToken(token) : null;
      if (claims) {
        this.web.assertOriginScope(req, claims.scope);
      }
    }
    return true;
  }
}
