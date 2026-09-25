import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { APP_CONFIG, type AppConfig } from "../config/env.config";
import { DatabaseModule } from "../database/database.module";
import { PrismaService } from "../database/prisma.service";
import {
  EMAIL_NOTIFIER,
  type EmailNotifier,
} from "../external/notification/email-notifier";
import { NotificationModule } from "../external/notification/notification.module";
import { RedisModule } from "../redis/redis.module";
import { createAuth } from "./auth/auth.config";
import { BETTER_AUTH } from "./auth/auth.constants";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { CredentialService } from "./auth/credential.service";
import { LoginHistoryService } from "./auth/login-history.service";
import { MfaService } from "./auth/mfa.service";
import { OtpRateLimiter } from "./auth/otp-rate-limiter";
import { PasswordChangeService } from "./auth/password-change.service";
import { TokenService } from "./auth/token.service";
import { RecentReauthGuard } from "./role/recent-reauth.guard";
import { RefreshTokenService } from "./session/refresh-token.service";
import { SessionController } from "./session/session.controller";
import { SessionService } from "./session/session.service";
import { SessionCache } from "./session/session-cache";
import { AccountProvisioningService } from "./user/account-provisioning.service";
import { EmployeeAccountController } from "./user/employee-account.controller";
import { EmployeeAccountService } from "./user/employee-account.service";
import { TemporaryCredentialEmailLimiter } from "./user/temporary-credential-email-limiter";

/** TASK-IAM-001/002 — Better Auth + login 3-namespace + hybrid token (DOMAIN-MAP `iam/auth`, `iam/session`). */
@Module({
  imports: [DatabaseModule, AuditModule, RedisModule, NotificationModule],
  controllers: [AuthController, SessionController, EmployeeAccountController],
  providers: [
    {
      provide: BETTER_AUTH,
      inject: [PrismaService, APP_CONFIG, EMAIL_NOTIFIER],
      useFactory: (
        prisma: PrismaService,
        config: AppConfig,
        notifier: EmailNotifier,
      ) => createAuth(prisma, config, notifier),
    },
    TokenService,
    CredentialService,
    OtpRateLimiter,
    LoginHistoryService,
    MfaService,
    PasswordChangeService,
    RecentReauthGuard,
    AccountProvisioningService,
    EmployeeAccountService,
    TemporaryCredentialEmailLimiter,
    AuthService,
    RefreshTokenService,
    SessionService,
    SessionCache,
  ],
  exports: [BETTER_AUTH, TokenService, SessionService, AccountProvisioningService],
})
export class IamModule {}
