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

export type AuthenticatedRequest = Request & { user?: VerifiedAccessToken };

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
    const token = bearerToken(request.headers.authorization);
    // Verify chữ ký TRƯỚC khi hỏi Redis: token rác không tốn lệnh Redis nào.
    const claims = token ? await this.tokens.verifyAccessToken(token) : null;
    if (!claims) {
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
    return true;
  }
}

/** Scheme không phân biệt hoa thường (RFC 7235) — client Dart từng gửi `bearer`. */
function bearerToken(header: string | undefined): string | undefined {
  return /^Bearer\s+(\S+)$/i.exec(header ?? "")?.[1];
}
