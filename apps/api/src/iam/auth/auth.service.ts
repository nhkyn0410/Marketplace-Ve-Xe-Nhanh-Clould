import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { PrismaService } from "../../database/prisma.service";
import { type AuthSession, SessionRevokeReason, SubjectType } from "../../database/prisma.types";
import { maskEmail } from "../../external/notification/email-notifier";
import { requiresMfa } from "../role/role";
import { sessionExpired } from "../session/session.errors";
import { SessionService, type SessionSubject } from "../session/session.service";
import { type Auth } from "./auth.config";
import { BETTER_AUTH, PASSENGER_ROLE } from "./auth.constants";
import {
  accountLocked,
  AuthException,
  invalidCredentials,
  mfaRequired,
  passwordChangeRequired,
  wrongLoginChannel
} from "./auth.errors";
import { CredentialService, DUMMY_PASSWORD_HASH } from "./credential.service";
import { LoginHistoryService } from "./login-history.service";
import { MfaService, type MfaChallengeResult } from "./mfa.service";
import { resolveIdentifier } from "./namespace.resolver";
import { OtpRateLimiter } from "./otp-rate-limiter";
import {
  PasswordChangeService,
  type PasswordChangeChallenge
} from "./password-change.service";
import {
  type AccessTokenClaims,
  type AuthScope,
  type IssuedAccessToken,
  TokenService,
  type VerifiedAccessToken
} from "./token.service";

/** v1 chỉ Google (ADR-020 + quyết định 09/09/2026); Facebook/Apple defer v1.x. */
export const SUPPORTED_OAUTH = ["google"] as const;
type OAuthProvider = (typeof SUPPORTED_OAUTH)[number];

export type RequestContext = { ip?: string; userAgent?: string };

export type LoginResult = IssuedAccessToken & {
  scope: AuthScope;
  role: string;
  /** Opaque refresh token thô — chỉ xuất hiện đúng một lần, trong response này. */
  refreshToken: string;
  refreshExpiresInSeconds: number;
};

export type CredentialLoginResult = LoginResult | MfaChallengeResult | PasswordChangeChallenge;
export type MfaLoginResult = LoginResult & { backupCodes?: string[] };

/** Passenger re-auth bằng email OTP; account mật khẩu dùng password hoặc MFA đã enrollment. */
export type ReauthInput = { password?: string; otp?: string; mfaCode?: string };

type SessionClaims = Omit<AccessTokenClaims, "sub" | "sid">;

type CredentialAccount = {
  id: string;
  passwordHash: string;
  authEpoch: number;
  role: string;
  status: string;
  /** Bảng nguồn — owner và employee cùng scope `operator` nhưng KHÁC subject (Q2). */
  subjectType: SubjectType;
  operatorId?: string;
  operatorSlug?: string;
  credentialDeliveryPending: boolean;
  passwordChangeRequired: boolean;
  temporaryPasswordExpiresAt?: Date | null;
};

/** Chủ thể của một phiên, đọc lại từ DB — role/trạng thái có thể đã đổi kể từ lúc login. */
type SessionOwner = {
  claims: SessionClaims;
  active: boolean;
  authEpoch: number;
  email?: string;
  passwordHash?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(BETTER_AUTH) private readonly auth: Auth,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly credentials: CredentialService,
    private readonly otpRateLimiter: OtpRateLimiter,
    private readonly loginHistory: LoginHistoryService,
    private readonly sessions: SessionService,
    private readonly mfa: MfaService,
    private readonly passwordChanges: PasswordChangeService
  ) {}

  // ── Passenger (Better Auth: email-OTP) ──
  // Đăng ký = gửi OTP; Better Auth tạo user khi verify. Hồ sơ (name...) cập nhật sau (FR-IAM-11).
  async register(email: string): Promise<void> {
    await this.sendSignInOtp(email);
  }

  async requestOtp(email: string): Promise<void> {
    await this.sendSignInOtp(email);
  }

  private async sendSignInOtp(email: string): Promise<void> {
    await this.otpRateLimiter.assertCanRequest(email);
    try {
      await this.auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
    } catch {
      // Response luôn 200 để KHÔNG leak account tồn tại hay không — nhưng phải LOG, nếu không
      // Resend hỏng / config sai sẽ vô hình: user không bao giờ nhận OTP mà ops không có tín hiệu.
      // Chống enumeration là về response, không phải về log.
      this.logger.error(`Gửi OTP thất bại cho ${maskEmail(email)}.`);
    }
  }

  async verifyOtp(email: string, otp: string, ctx: RequestContext): Promise<LoginResult> {
    let userId: string;
    try {
      const result = await this.auth.api.signInEmailOTP({ body: { email, otp } });
      userId = result.user.id;
      await this.discardBetterAuthSession(result.token);
    } catch (error) {
      // Chỉ OTP sai mới là 401. Lỗi hạ tầng (Postgres/Redis) mà map thành 401 sẽ ghi audit sai
      // sự thật ("otp_invalid") — làm hỏng chính bằng chứng dùng để điều tra sau này.
      if (!isClientAuthError(error)) {
        throw error;
      }
      await this.loginHistory.record({
        scope: "passenger",
        result: "failure",
        targetId: maskEmail(email),
        reason: "otp_invalid",
        ...ctx
      });
      throw invalidCredentials();
    }

    return this.issuePassengerToken(userId, ctx);
  }

  // ── Operator / Employee (custom, `{slug}/{username}` + password) ──
  async operatorLogin(identifier: string, password: string, ctx: RequestContext): Promise<CredentialLoginResult> {
    await this.otpRateLimiter.assertCanAttemptLogin(identifier, ctx.ip);

    const resolved = resolveIdentifier(identifier);
    if (!resolved || resolved.scope !== "operator") {
      await this.recordUnknownAttempt("operator", identifier, "wrong_channel", ctx);
      throw wrongLoginChannel();
    }
    const { operatorSlug, username } = resolved;

    const operator = await this.prisma.operatorProfile.findUnique({ where: { operatorSlug } });
    const account = operator
      ? await this.findOperatorSideAccount(operator.id, operatorSlug, username)
      : null;

    if (!operator || !account) {
      await this.credentials.verify(password, DUMMY_PASSWORD_HASH);
      await this.recordUnknownAttempt("operator", identifier, "unknown_account", ctx);
      throw invalidCredentials();
    }

    await this.verifyOrThrow(password, account, "operator", ctx, !isActive(operator.status));

    // Mật khẩu tạm chỉ chứng minh quyền đổi mật khẩu. Chưa tạo session, chưa cấp token và chưa
    // lộ secret MFA; sau khi đổi thành công người dùng phải đăng nhập lại từ đầu (IAM-005 Q4).
    if (account.passwordChangeRequired) {
      if (
        !account.temporaryPasswordExpiresAt ||
        account.temporaryPasswordExpiresAt.getTime() <= Date.now()
      ) {
        throw passwordChangeRequired(
          "Mật khẩu tạm đã hết hạn. Vui lòng liên hệ người cấp tài khoản để đặt lại."
        );
      }
      return this.passwordChanges.begin({
        subjectType: account.subjectType as Extract<SubjectType, "OPERATOR" | "EMPLOYEE">,
        subjectId: account.id,
        operatorId: account.operatorId!,
        authEpoch: account.authEpoch
      });
    }

    if (requiresMfa(account.role)) {
      return this.mfa.begin(
        {
          subjectType: account.subjectType,
          subjectId: account.id,
          operatorId: account.operatorId,
          label: `${operator.operatorSlug}/${username}`
        },
        ctx
      );
    }

    // Slug lấy từ DB, KHÔNG từ input người dùng: claim `operatorSlug` và `operatorId` phải cùng
    // một nguồn, nếu không TenantGuard (khớp slug URL) và RLS (dùng operatorId) sẽ bất đồng ở IAM-003.
    return this.issueCredentialToken("operator", account, operator.operatorSlug, ctx);
  }

  // ── Platform (custom, `platform/{username}` + password) ──
  async platformLogin(identifier: string, password: string, ctx: RequestContext): Promise<CredentialLoginResult> {
    await this.otpRateLimiter.assertCanAttemptLogin(identifier, ctx.ip);

    const resolved = resolveIdentifier(identifier);
    if (!resolved || resolved.scope !== "platform") {
      await this.recordUnknownAttempt("platform", identifier, "wrong_channel", ctx);
      throw wrongLoginChannel();
    }

    const row = await this.prisma.platformAccount.findUnique({ where: { username: resolved.username } });
    const account: CredentialAccount | null = row
      ? {
          id: row.id,
          passwordHash: row.passwordHash,
          authEpoch: 0,
          role: String(row.role),
          status: String(row.status),
          subjectType: SubjectType.PLATFORM,
          // Provisioning Platform employee được defer khỏi IAM-005; account seed hiện hữu không
          // tham gia luồng mật khẩu tạm của Operator/Employee.
          credentialDeliveryPending: false,
          passwordChangeRequired: false,
          temporaryPasswordExpiresAt: null
        }
      : null;

    if (!account) {
      await this.credentials.verify(password, DUMMY_PASSWORD_HASH);
      await this.recordUnknownAttempt("platform", identifier, "unknown_account", ctx);
      throw invalidCredentials();
    }

    await this.verifyOrThrow(password, account, "platform", ctx, false);

    if (requiresMfa(account.role)) {
      return this.mfa.begin(
        { subjectType: account.subjectType, subjectId: account.id, label: `platform/${resolved.username}` },
        ctx
      );
    }

    return this.issueCredentialToken("platform", account, undefined, ctx);
  }

  /** Password đã đúng ở bước trước; chỉ sau proof này mới tạo session + phát token. */
  async verifyMfa(challengeToken: string, code: string, ctx: RequestContext): Promise<MfaLoginResult> {
    // Account/tenant bị khoá trong lúc challenge còn sống → dừng TRƯỚC khi tiêu proof (backup code
    // không bị đốt, secret của người khác không kịp được lưu). Như login: chỉ báo khoá khi proof đúng.
    const verified = await this.mfa.verifyChallenge(challengeToken, code, ctx, async (subject) => {
      const owner = await this.loadSubjectOwner(subject.subjectType, subject.subjectId, subject.operatorId);
      if (!owner?.active) {
        await this.loginHistory.record({
          scope: owner?.claims.scope ?? (subject.subjectType === SubjectType.PLATFORM ? "platform" : "operator"),
          result: "failure",
          targetId: subject.subjectId,
          operatorId: subject.operatorId,
          reason: owner ? "account_inactive" : "unknown_account",
          ...ctx
        });
        throw owner ? accountLocked() : invalidCredentials();
      }
      return owner;
    });
    const owner = verified.checked;

    const result = await this.issueSession(
      {
        type: verified.subjectType,
        id: verified.subjectId,
        operatorId: verified.operatorId,
        authEpoch: owner.authEpoch,
        mfaVerified: true
      },
      { ...owner.claims, mfa: true },
      ctx,
      (session) => this.assertCredentialSessionStillValid(session, owner.claims.role, owner.passwordHash)
    );
    await this.loginHistory.record({
      scope: owner.claims.scope,
      result: "success",
      targetId: verified.subjectId,
      accountId: verified.subjectId,
      role: owner.claims.role,
      operatorId: verified.operatorId,
      ...ctx
    });
    return {
      ...result,
      ...(verified.backupCodes ? { backupCodes: verified.backupCodes } : {})
    };
  }

  // ── OAuth (Passenger — Better Auth, ADR-020) ──
  async oauthInit(provider: string, callbackURL: string | undefined): Promise<string> {
    if (!SUPPORTED_OAUTH.includes(provider as OAuthProvider)) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        "AUTH_OAUTH_PROVIDER_UNSUPPORTED",
        `OAuth provider không hỗ trợ: ${provider}`
      );
    }
    this.assertAllowedCallback(callbackURL);
    const result = await this.auth.api.signInSocial({
      body: { provider: provider as OAuthProvider, callbackURL, disableRedirect: true }
    });
    if (!result.url) {
      throw new AuthException(
        HttpStatus.BAD_GATEWAY,
        "AUTH_OAUTH_INIT_FAILED",
        "Không khởi tạo được luồng OAuth."
      );
    }
    return result.url;
  }

  /** Đổi Better Auth session (sau OAuth callback) → JWT của ta (headless bridge). */
  async exchangeSession(headers: Headers, ctx: RequestContext): Promise<LoginResult> {
    const session = await this.auth.api.getSession({ headers });
    if (!session?.user) {
      throw invalidCredentials();
    }
    // Phiên Better Auth chỉ là cầu nối một lần: để nó sống thì cookie còn trên trình duyệt đổi được
    // ra family mới vô hạn lần — kể cả sau khi người dùng đã logout.
    await this.discardBetterAuthSession(session.session.token);
    return this.issuePassengerToken(session.user.id, ctx);
  }

  // ── Phiên (IAM-002: refresh rotation + logout + re-auth) ──
  async refresh(refreshToken: string, ctx: RequestContext): Promise<LoginResult> {
    // Rate limit chạm Redis TRƯỚC Postgres: Redis chết thì 503 ngay, không rotate nửa vời.
    await this.otpRateLimiter.assertCanRefresh(ctx.ip);
    let claims: SessionClaims | undefined;
    const { session, refreshToken: next } = await this.sessions.rotate(refreshToken, ctx, async (current) => {
      await this.otpRateLimiter.assertCanRotateFamily(current.familyId);
      // Đọc lại chủ thể TRƯỚC khi commit rotate: account bị khoá, tenant suspend hoặc auth_epoch
      // đã đổi đều dừng; session cũ không được nhận role/credential mới qua refresh.
      // Làm sau commit thì một lỗi tạm thời ở bước này (500/503) đã tiêu mất token cũ: client gửi lại
      // token cũ và bị coi là reuse.
      const owner = await this.loadSessionOwner(current);
      if (!owner?.active || owner.authEpoch !== current.authEpoch) {
        await this.sessions.revokeFamily(current.familyId, SessionRevokeReason.ACCOUNT_LOCKED);
        throw owner?.active ? sessionExpired() : owner ? accountLocked() : sessionExpired();
      }
      const mfaVerified = current.mfaVerifiedAt != null;
      if (requiresMfa(owner.claims.role) && !mfaVerified) {
        // Session phát trước rollout IAM-004 không được tiếp tục refresh để né MFA.
        await this.sessions.revokeFamily(current.familyId, SessionRevokeReason.MFA_REQUIRED);
        throw mfaRequired();
      }
      claims = { ...owner.claims, ...(mfaVerified ? { mfa: true as const } : {}) };
    });
    if (!claims) {
      throw new Error("rotate() hoàn tất mà không chạy beforeRotate.");
    }
    // Sau commit chỉ còn ký JWT trong bộ nhớ — không còn gì có thể hỏng vì hạ tầng.
    return this.mintForSession(session, next, claims);
  }

  async logout(sid: string): Promise<void> {
    await this.sessions.logout(sid);
  }

  async changeRequiredPassword(
    passwordChangeToken: string,
    newPassword: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.passwordChanges.changeRequiredPassword(passwordChangeToken, newPassword, ctx);
  }

  /** FR-IAM-10 (Q3): chỉ cấp bằng chứng `reauth:{sid}` 5 phút — chưa endpoint nghiệp vụ nào đọc. */
  async reauth(user: VerifiedAccessToken, input: ReauthInput, ctx: RequestContext): Promise<void> {
    const session = await this.sessions.findById(user.sid);
    if (!session || session.revokedAt) {
      throw sessionExpired();
    }
    // Chung bucket IP với login + bucket chủ thể riêng: không thành kênh dò mật khẩu đi vòng.
    await this.otpRateLimiter.assertCanReauth(session.userRef, ctx.ip);

    const owner = await this.loadSessionOwner(session);
    const verified = await this.verifyReauthProof(owner, session, input, ctx);
    this.sessions.recordEvent({
      actorId: session.subjectId,
      actorRole: session.subjectType,
      action: verified ? "auth.reauth.success" : "auth.reauth.failure",
      targetType: "auth_session",
      targetId: session.id,
      operatorId: session.operatorId ?? undefined,
      after: {
        ...(ctx.ip ? { ip: ctx.ip } : {}),
        ...(ctx.userAgent ? { userAgent: ctx.userAgent } : {})
      }
    });
    if (!verified || !owner) {
      throw invalidCredentials();
    }
    // Như login: chỉ báo "bị khoá" SAU khi bằng chứng đã đúng — không leak trạng thái account.
    if (!owner.active) {
      await this.sessions.revokeFamily(session.familyId, SessionRevokeReason.ACCOUNT_LOCKED);
      throw accountLocked();
    }
    await this.sessions.grantReauth(session.id);
  }

  // ── helpers ──
  /**
   * `callbackURL` do client gửi lên là đầu vào KHÔNG tin được. Better Auth lưu nguyên nó vào
   * bản ghi state rồi redirect tới đó **sau khi đã set session cookie** → attacker dụ nạn nhân
   * mở luồng với callbackURL của mình, nạn nhân đăng nhập Google thật rồi bị đẩy sang trang giả
   * ở trạng thái đã đăng nhập. Middleware origin-check của Better Auth KHÔNG cứu được vì nó
   * thoát sớm khi không có `ctx.request` (ta gọi server-side qua `auth.api.signInSocial`).
   */
  private assertAllowedCallback(callbackURL: string | undefined): void {
    if (!callbackURL) {
      return;
    }
    const allowed = this.config.AUTH_ALLOWED_CALLBACK_ORIGINS.some((origin) =>
      origin.endsWith("://")
        ? callbackURL.startsWith(origin) // deep-link scheme mobile: vexenhanh://...
        : callbackURL === origin || callbackURL.startsWith(`${origin}/`)
    );
    if (!allowed) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        "AUTH_OAUTH_CALLBACK_NOT_ALLOWED",
        "callbackURL không nằm trong danh sách cho phép."
      );
    }
  }

  private async issuePassengerToken(userId: string, ctx: RequestContext): Promise<LoginResult> {
    const result = await this.issueSession(
      { type: SubjectType.PASSENGER, id: userId },
      { scope: "passenger", role: PASSENGER_ROLE },
      ctx
    );
    await this.loginHistory.record({
      scope: "passenger",
      result: "success",
      targetId: userId,
      accountId: userId,
      role: PASSENGER_ROLE,
      ...ctx
    });
    return result;
  }

  /**
   * Better Auth tạo phiên riêng (bảng `user_sessions`) mỗi lần xác thực OTP/OAuth. Phiên thật của hệ
   * thống là `auth_sessions`; phiên Better Auth để lại thì logout/reuse detection không chạm tới nó.
   * Chặn rỗng: `deleteMany({ where: { token: undefined } })` của Prisma là XOÁ HẾT.
   */
  private async discardBetterAuthSession(token: string | undefined): Promise<void> {
    if (!token) {
      return;
    }
    await this.prisma.session.deleteMany({ where: { token } });
  }

  /** Mọi đường login đi qua đây: phiên tạo TRƯỚC, access token mang `sid` của đúng phiên đó. */
  private async issueSession(
    subject: SessionSubject,
    claims: SessionClaims,
    ctx: RequestContext,
    afterCreate?: (session: AuthSession) => Promise<void>
  ): Promise<LoginResult> {
    const { session, refreshToken } = await this.sessions.create(subject, ctx);
    await afterCreate?.(session);
    return this.mintForSession(session, refreshToken, claims);
  }

  /**
   * Đóng race với lock/reset/đổi role: mutation account thu hồi trước + sau DB update, còn login
   * kiểm lại SAU khi session row đã tạo và TRƯỚC khi token được phát. Nếu login tạo trước update,
   * lần revoke sau bắt nó; nếu tạo sau lần revoke sau, phép kiểm này thấy state mới và tự revoke.
   */
  private async assertCredentialSessionStillValid(
    session: AuthSession,
    expectedRole: string,
    expectedPasswordHash: string | undefined
  ): Promise<void> {
    const current = await this.loadSessionOwner(session);
    if (
      current?.active &&
      current.authEpoch === session.authEpoch &&
      current.claims.role === expectedRole &&
      current.passwordHash === expectedPasswordHash
    ) {
      return;
    }
    await this.sessions.revokeFamily(session.familyId, SessionRevokeReason.ACCOUNT_LOCKED);
    throw accountLocked();
  }

  private async mintForSession(
    session: AuthSession,
    refreshToken: string,
    claims: SessionClaims
  ): Promise<LoginResult> {
    const token = await this.tokens.mintAccessToken({
      ...claims,
      sub: session.subjectId,
      sid: session.id
    });
    return {
      ...token,
      scope: claims.scope,
      role: claims.role,
      refreshToken,
      refreshExpiresInSeconds: this.config.REFRESH_TOKEN_TTL_SECONDS
    };
  }

  private async loadSessionOwner(session: AuthSession): Promise<SessionOwner | null> {
    return this.loadSubjectOwner(
      session.subjectType,
      session.subjectId,
      session.operatorId ?? undefined
    );
  }

  private async loadSubjectOwner(
    subjectType: SubjectType,
    id: string,
    operatorId?: string
  ): Promise<SessionOwner | null> {
    switch (subjectType) {
      case SubjectType.PASSENGER: {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return user
          ? { claims: { scope: "passenger", role: PASSENGER_ROLE }, active: true, authEpoch: 0, email: user.email }
          : null;
      }
      case SubjectType.OPERATOR: {
        // Phiên phía Operator luôn mang tenant (CHECK trong DB) → đọc account trong đúng tenant đó.
        if (!operatorId) {
          return null;
        }
        const account = await this.prisma.withTenant(operatorId, (tx) =>
          tx.operatorAccount.findUnique({ where: { id }, include: { operator: true } })
        );
        return account && account.operatorId === operatorId
          ? {
              claims: {
                scope: "operator",
                role: String(account.role),
                operatorId: account.operatorId,
                operatorSlug: account.operator.operatorSlug
              },
              active: !account.credentialDeliveryPending && !account.passwordChangeRequired && isActive(String(account.status)) && isActive(String(account.operator.status)),
              authEpoch: account.authEpoch,
              passwordHash: account.passwordHash
            }
          : null;
      }
      case SubjectType.EMPLOYEE: {
        if (!operatorId) {
          return null;
        }
        const account = await this.prisma.withTenant(operatorId, (tx) =>
          tx.employeeAccount.findUnique({ where: { id }, include: { operator: true } })
        );
        return account && account.operatorId === operatorId
          ? {
              claims: {
                scope: "operator",
                role: String(account.role),
                operatorId: account.operatorId,
                operatorSlug: account.operator.operatorSlug
              },
              active: !account.credentialDeliveryPending && !account.passwordChangeRequired && isActive(String(account.status)) && isActive(String(account.operator.status)),
              authEpoch: account.authEpoch,
              passwordHash: account.passwordHash
            }
          : null;
      }
      case SubjectType.PLATFORM: {
        const account = await this.prisma.platformAccount.findUnique({ where: { id } });
        return account
          ? {
              claims: { scope: "platform", role: String(account.role) },
              active: isActive(String(account.status)),
              authEpoch: 0,
              passwordHash: account.passwordHash
            }
          : null;
      }
    }
  }

  private async verifyReauthProof(
    owner: SessionOwner | null,
    session: AuthSession,
    input: ReauthInput,
    ctx: RequestContext
  ): Promise<boolean> {
    if (session.subjectType === SubjectType.PASSENGER) {
      if (!owner?.email || !input.otp) {
        return false;
      }
      try {
        const result = await this.auth.api.signInEmailOTP({
          body: { email: owner.email, otp: input.otp }
        });
        await this.discardBetterAuthSession(result.token);
        return result.user.id === session.subjectId;
      } catch (error) {
        // Cùng quy tắc với verifyOtp: chỉ lỗi phía client mới là "sai OTP".
        if (!isClientAuthError(error)) {
          throw error;
        }
        return false;
      }
    }
    if (input.mfaCode) {
      const subject = {
        subjectType: session.subjectType,
        subjectId: session.subjectId,
        ...(session.operatorId ? { operatorId: session.operatorId } : {})
      };
      return owner !== null && (await this.mfa.verifyForSubject(subject, input.mfaCode, ctx)) !== null;
    }
    // Thiếu mật khẩu / account đã mất vẫn chạy scrypt: thời gian phản hồi không lộ nhánh nào đã chạy.
    const ok = await this.credentials.verify(
      input.password ?? "",
      owner?.passwordHash ?? DUMMY_PASSWORD_HASH
    );
    return ok && owner !== null && input.password !== undefined;
  }

  private async findOperatorSideAccount(
    operatorId: string,
    operatorSlug: string,
    username: string
  ): Promise<CredentialAccount | null> {
    // Tenant đã biết từ operator_profiles (đọc công khai) → đọc account trong ngữ cảnh TENANT: Postgres
    // tự chặn account của tenant khác, không chỉ dựa vào phép so operatorId bên dưới (TASK-IAM-003).
    const { owner, employee } = await this.prisma.withTenant(operatorId, async (tx) => ({
      owner: await tx.operatorAccount.findUnique({
        where: { operatorSlug_username: { operatorSlug, username } }
      }),
      employee: await tx.employeeAccount.findUnique({
        where: { operatorId_username: { operatorId, username } }
      })
    }));
    // `operator_slug` trên operator_accounts là bản sao denormalized. IAM-005 giữ slug immutable
    // và thêm FK kép, nhưng vẫn đối chiếu operatorId ở application boundary để defense-in-depth.
    if (owner && owner.operatorId === operatorId) {
      return {
        id: owner.id,
        passwordHash: owner.passwordHash,
        authEpoch: owner.authEpoch,
        role: String(owner.role),
        status: String(owner.status),
        subjectType: SubjectType.OPERATOR,
        operatorId: owner.operatorId,
        operatorSlug: owner.operatorSlug,
        credentialDeliveryPending: owner.credentialDeliveryPending,
        passwordChangeRequired: owner.passwordChangeRequired,
        temporaryPasswordExpiresAt: owner.temporaryPasswordExpiresAt
      };
    }

    if (employee) {
      return {
        id: employee.id,
        passwordHash: employee.passwordHash,
        authEpoch: employee.authEpoch,
        role: String(employee.role),
        status: String(employee.status),
        subjectType: SubjectType.EMPLOYEE,
        operatorId: employee.operatorId,
        operatorSlug,
        credentialDeliveryPending: employee.credentialDeliveryPending,
        passwordChangeRequired: employee.passwordChangeRequired,
        temporaryPasswordExpiresAt: employee.temporaryPasswordExpiresAt
      };
    }
    return null;
  }

  /**
   * Ghi audit cho lần thử vào account KHÔNG tồn tại / sai cổng. Không ghi thì password spraying
   * và dò namespace không để lại dấu vết nào (FR-IAM-09, Security §11 "brute force → monitoring").
   * Response trả về vẫn y hệt nhánh sai mật khẩu — audit không phải kênh leak.
   */
  private async recordUnknownAttempt(
    scope: AuthScope,
    identifier: string,
    reason: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.loginHistory.record({
      scope,
      result: "failure",
      targetId: maskIdentifier(identifier),
      reason,
      ...ctx
    });
  }

  private async verifyOrThrow(
    password: string,
    account: CredentialAccount,
    scope: AuthScope,
    ctx: RequestContext,
    tenantInactive: boolean
  ): Promise<void> {
    const ok = await this.credentials.verify(password, account.passwordHash);
    if (!ok) {
      await this.loginHistory.record({
        scope,
        result: "failure",
        targetId: account.id,
        operatorId: account.operatorId,
        reason: "bad_password",
        ...ctx
      });
      throw invalidCredentials();
    }
    if (!isActive(account.status) || account.credentialDeliveryPending || tenantInactive) {
      await this.loginHistory.record({
        scope,
        result: "failure",
        targetId: account.id,
        accountId: account.id,
        role: account.role,
        operatorId: account.operatorId,
        reason: tenantInactive ? "tenant_inactive" : "account_inactive",
        ...ctx
      });
      throw accountLocked();
    }
  }

  private async issueCredentialToken(
    scope: AuthScope,
    account: CredentialAccount,
    operatorSlug: string | undefined,
    ctx: RequestContext
  ): Promise<LoginResult> {
    const result = await this.issueSession(
      { type: account.subjectType, id: account.id, operatorId: account.operatorId, authEpoch: account.authEpoch },
      { scope, role: account.role, operatorId: account.operatorId, operatorSlug },
      ctx,
      (session) => this.assertCredentialSessionStillValid(session, account.role, account.passwordHash)
    );
    await this.loginHistory.record({
      scope,
      result: "success",
      targetId: account.id,
      accountId: account.id,
      role: account.role,
      operatorId: account.operatorId,
      ...ctx
    });
    return result;
  }
}

function isActive(status: string): boolean {
  return status === "ACTIVE";
}

/** Better Auth ném `APIError` có `status` cho lỗi phía client; lỗi hạ tầng thì không. */
function isClientAuthError(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === "number") {
    return status >= 400 && status < 500;
  }
  // better-auth dùng chuỗi cho một số mã (vd "BAD_REQUEST", "UNAUTHORIZED").
  return typeof status === "string";
}

/** Che identifier trước khi ghi audit: `phuongtrang/ow***`, `platform/kh***`, email → maskEmail. */
function maskIdentifier(identifier: string): string {
  const value = identifier.trim();
  if (value.includes("@")) {
    return maskEmail(value);
  }
  const slash = value.lastIndexOf("/");
  const prefix = slash >= 0 ? value.slice(0, slash + 1) : "";
  const username = slash >= 0 ? value.slice(slash + 1) : value;
  return `${prefix}${username.slice(0, 2)}***`;
}
