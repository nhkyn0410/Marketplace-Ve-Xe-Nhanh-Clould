import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { sessionExpired } from "../session/session.errors";
import { SessionService } from "../session/session.service";
import { TokenService, type VerifiedAccessToken } from "./token.service";
import { accessCredential, type AuthTransport } from "./web/auth-transport";

export type AuthenticatedRequest = Request & {
  user?: VerifiedAccessToken;
  /** Credential đã dùng để xác thực: header Bearer hay cookie `vxn_access` (TASK-IAM-006). */
  authCredentialSource?: AuthTransport;
};

const ALLOW_REVOKED_SESSION = "iam:allow-revoked-session";

/**
 * Cho route chạy dù phiên đã bị revoke (chữ ký + hạn token vẫn phải đúng). Chỉ dành cho thao tác
 * revoke idempotent (logout và retry DELETE chính family vừa tự revoke); service đích phải bảo đảm
 * token chết không được tác động resource khác.
 */
export const AllowRevokedSession = () => SetMetadata(ALLOW_REVOKED_SESSION, true);

/**
 * CHỈ xác thực "đã đăng nhập, phiên chưa bị revoke". KHÔNG phân quyền, KHÔNG kiểm tenant —
 * RBAC 8 role + `TenantGuard` khớp `:operatorSlug` là IAM-003, đừng nhét vào đây.
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // Đúng một credential: Bearer (Mobile) HOẶC cookie `vxn_access` (web); cả hai → 400 ambiguous.
    const credential = accessCredential(request);
    // Verify chữ ký TRƯỚC khi hỏi Redis: token rác không tốn lệnh Redis nào.
    const claims = credential ? await this.tokens.verifyAccessToken(credential.token) : null;
    if (!credential || !claims) {
      throw sessionExpired();
    }
    const allowRevoked = this.reflector.getAllAndOverride<boolean | undefined>(
      ALLOW_REVOKED_SESSION,
      [context.getHandler(), context.getClass()],
    );
    if (!allowRevoked) {
      await this.sessions.assertActive(claims.sid);
      await this.sessions.assertOperatorAccountCurrent(claims);
    }
    request.user = claims;
    request.authCredentialSource = credential.source;
    return true;
  }
}
