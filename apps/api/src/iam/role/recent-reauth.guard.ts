import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { reauthRequired } from "../auth/auth.errors";
import { SessionService } from "../session/session.service";
import type { AuthorizedRequest } from "./authorization";

/** Bước cuối của route nhạy cảm: token/permission/tenant đã hợp lệ, giờ kiểm proof 5 phút. */
@Injectable()
export class RecentReauthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const user = request.user;
    if (!user) {
      throw new Error("RecentReauthGuard phải chạy sau AccessTokenGuard.");
    }
    if (!(await this.sessions.hasRecentReauth(user.sid))) {
      throw reauthRequired();
    }
    return true;
  }
}
