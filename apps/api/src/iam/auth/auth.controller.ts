import {
  applyDecorators,
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import type { Request, Response } from "express";
import { ZodResponse } from "nestjs-zod";
import { resolveTrustedClientIp } from "../../common/trusted-client-ip";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { ProblemDetailsDto } from "../../openapi/openapi.dto";
import { sessionExpired } from "../session/session.errors";
import { AccessTokenGuard, AllowRevokedSession, type AuthenticatedRequest } from "./access-token.guard";
import { authTransportAmbiguous, authTransportInvalid } from "./auth.errors";
import {
  AuthService,
  type CredentialLoginResult,
  type LoginResult,
  type RequestContext,
  SUPPORTED_OAUTH
} from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import {
  type AuthMeResponse,
  AuthMeResponseDto,
  AuthTokenResponseDto,
  type AuthTokenResponse,
  CredentialLoginDto,
  type CredentialLoginResponse,
  CredentialLoginResponseDto,
  type CsrfTokenResponse,
  CsrfTokenResponseDto,
  type MessageResponse,
  MessageResponseDto,
  MfaVerifyDto,
  type MfaVerifyResponse,
  MfaVerifyResponseDto,
  OAuthInitDto,
  type OAuthRedirectResponse,
  OAuthRedirectResponseDto,
  OtpRequestDto,
  OtpVerifyDto,
  PasswordChangeRequiredDto,
  ReauthDto,
  type RefreshResponse,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto
} from "./dto/auth.dto";
import type { VerifiedAccessToken } from "./token.service";
import { type AuthTransport, resolveAuthTransport } from "./web/auth-transport";
import { WebAuthService } from "./web/web-auth.service";

/** Response mang token: không proxy/CDN nào được lưu lại (RFC 6749 §5.1). */
const NoStore = () =>
  applyDecorators(Header("Cache-Control", "no-store"), Header("Pragma", "no-cache"));

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } }
};

/**
 * Endpoint hỗ trợ cả hai transport (API §7.1.1): web gửi `X-Auth-Transport: cookie` + `X-CSRF-Token`;
 * Mobile không gửi gì (mặc định bearer). Khai tường minh để client sinh ra có header.
 */
const DualTransport = (extraBadRequest = "") =>
  applyDecorators(
    ApiHeader({
      name: "X-Auth-Transport",
      required: false,
      description: "`cookie` (web: phiên trong cookie httpOnly) hoặc `bearer` (mặc định, Mobile).",
      schema: { type: "string", enum: ["cookie", "bearer"] }
    }),
    ApiHeader({
      name: "X-CSRF-Token",
      required: false,
      description: "Bắt buộc ở cookie mode: token từ `GET /auth/csrf` (signed double-submit)."
    }),
    ApiResponse({
      status: 400,
      description:
        "`X-Auth-Transport` sai (`AUTH_TRANSPORT_INVALID`) hoặc gửi cả Bearer lẫn cookie (`AUTH_TRANSPORT_AMBIGUOUS`)." +
        extraBadRequest,
      content: problemContent
    }),
    ApiResponse({
      status: 403,
      description:
        "Cookie mode: CSRF thiếu/sai (`AUTH_CSRF_INVALID`), Origin ngoài allowlist (`AUTH_ORIGIN_FORBIDDEN`) hoặc tài khoản bị khóa.",
      content: problemContent
    })
  );

/**
 * `@ApiBody` / `@ApiParam` phải khai TƯỜNG MINH, không dựa vào suy luận từ `@Body()`/`@Param()`:
 * script `openapi:generate` chạy bằng **tsx** (nền esbuild) — esbuild KHÔNG emit
 * `design:paramtypes`, nên `@nestjs/swagger` không suy ra được kiểu tham số. Thiếu các decorator
 * này thì spec sinh ra không có `requestBody`, client gen (TS lẫn Dart) mất sạch payload mà CI
 * vẫn xanh. Đã có test hồi quy ở `openapi.spec.ts`.
 */
@ApiTags("auth")
@ApiExtraModels(ProblemDetailsDto)
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(WebAuthService) private readonly web: WebAuthService
  ) {}

  @Post("register")
  @HttpCode(200)
  @ApiBody({ type: RegisterDto })
  @ZodResponse({ status: 200, description: "Gửi OTP đăng ký Passenger (Email).", type: MessageResponseDto })
  async register(@Body() dto: RegisterDto): Promise<MessageResponse> {
    await this.authService.register(dto.email);
    return { status: "ok" };
  }

  @Post("otp/request")
  @HttpCode(200)
  @ApiBody({ type: OtpRequestDto })
  @ZodResponse({ status: 200, description: "Gửi Email OTP (Resend/console).", type: MessageResponseDto })
  @ApiResponse({ status: 429, description: "Vượt giới hạn OTP.", content: problemContent })
  async requestOtp(@Body() dto: OtpRequestDto): Promise<MessageResponse> {
    await this.authService.requestOtp(dto.email);
    return { status: "ok" };
  }

  @Post("otp/verify")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: OtpVerifyDto })
  @ZodResponse({ status: 200, description: "Xác thực OTP → cấp access token.", type: AuthTokenResponseDto })
  @ApiResponse({ status: 401, description: "OTP không hợp lệ.", content: problemContent })
  async verifyOtp(@Body() dto: OtpVerifyDto, @Req() req: Request): Promise<AuthTokenResponse> {
    assertBearerOnly(req);
    return toTokenResponse(
      await this.authService.verifyOtp(dto.email, dto.otp, this.context(req))
    );
  }

  @Post("operator/login")
  @HttpCode(200)
  @NoStore()
  @DualTransport()
  @ApiBody({ type: CredentialLoginDto })
  @ZodResponse({
    status: 200,
    description:
      "Login Owner nhà xe `{slug}/{username}`; Owner nhận challenge đổi mật khẩu/MFA trước khi có phiên. " +
      "Tài khoản nhân viên không dùng cổng này (401 chung). Cookie mode: cấp phiên vào cookie, body chỉ metadata.",
    type: CredentialLoginResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập.", content: problemContent })
  async operatorLogin(
    @Body() dto: CredentialLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<CredentialLoginResponse> {
    const transport = resolveAuthTransport(req);
    if (transport === "cookie") {
      // Phiên Owner chỉ được cấp cho Operator OS, không cho origin Admin (M1).
      this.web.assertOriginScope(req, "operator");
    }
    return this.credentialLoginResponse(
      await this.authService.operatorLogin(dto.identifier, dto.password, this.context(req)),
      transport,
      res
    );
  }

  /** Login nhân viên nhà xe cho app Nhân viên (chỉ Bearer). */
  @Post("employee/login")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: CredentialLoginDto })
  @ZodResponse({
    status: 200,
    description:
      "Login nhân viên `{slug}/nv.{tên}` (app Nhân viên, chỉ Bearer): token JSON hoặc challenge đổi mật khẩu tạm. " +
      "Tài khoản Owner không dùng cổng này (401 chung).",
    type: CredentialLoginResponseDto
  })
  @ApiResponse({
    status: 400,
    description: "Gửi `X-Auth-Transport: cookie` (`AUTH_TRANSPORT_INVALID`) — cổng nhân viên không có cookie mode.",
    content: problemContent
  })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập.", content: problemContent })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa.", content: problemContent })
  async employeeLogin(@Body() dto: CredentialLoginDto, @Req() req: Request): Promise<CredentialLoginResponse> {
    assertBearerOnly(req);
    return this.credentialLoginResponse(
      await this.authService.employeeLogin(dto.identifier, dto.password, this.context(req)),
      "bearer"
    );
  }

  @Post("platform/login")
  @HttpCode(200)
  @NoStore()
  @DualTransport()
  @ApiBody({ type: CredentialLoginDto })
  @ZodResponse({
    status: 200,
    description: "Login Platform; password đúng nhận MFA challenge, chưa cấp token.",
    type: CredentialLoginResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập.", content: problemContent })
  async platformLogin(
    @Body() dto: CredentialLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<CredentialLoginResponse> {
    const transport = resolveAuthTransport(req);
    if (transport === "cookie") {
      this.web.assertOriginScope(req, "platform");
    }
    return this.credentialLoginResponse(
      await this.authService.platformLogin(dto.identifier, dto.password, this.context(req)),
      transport,
      res
    );
  }

  @Post("mfa/verify")
  @HttpCode(200)
  @NoStore()
  @DualTransport()
  @ApiBody({ type: MfaVerifyDto })
  @ZodResponse({
    status: 200,
    description:
      "Xác thực pre-auth challenge bằng TOTP/backup code rồi mới cấp token (Bearer) hoặc cookie phiên (web).",
    type: MfaVerifyResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Challenge/mã sai, hết hạn, đã dùng hoặc quá 5 lần thử — cùng một lỗi generic.",
    content: problemContent
  })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async verifyMfa(
    @Body() dto: MfaVerifyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<MfaVerifyResponse> {
    const transport = resolveAuthTransport(req);
    const result = await this.authService.verifyMfa(dto.challengeToken, dto.code, this.context(req));
    const backupCodes = result.backupCodes ? { backupCodes: result.backupCodes } : {};
    return transport === "cookie"
      ? { ...this.web.writeSession(res, result), ...backupCodes }
      : { ...toTokenResponse(result), mfaRequired: false, ...backupCodes };
  }

  @Post("password/change-required")
  @HttpCode(200)
  @NoStore()
  @DualTransport(" Mật khẩu mới trùng mật khẩu tạm (`AUTH_PASSWORD_REUSE_FORBIDDEN`).")
  @ApiBody({ type: PasswordChangeRequiredDto })
  @ZodResponse({
    status: 200,
    description:
      "Đổi mật khẩu tạm một lần; phải đăng nhập lại để tiếp tục MFA/token. Cookie mode: rotate CSRF qua header `X-CSRF-Token`.",
    type: MessageResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Challenge giả, hết hạn, đã dùng hoặc account không còn hợp lệ.",
    content: problemContent
  })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async changeRequiredPassword(
    @Body() dto: PasswordChangeRequiredDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    const transport = resolveAuthTransport(req);
    await this.authService.changeRequiredPassword(
      dto.passwordChangeToken,
      dto.newPassword,
      this.context(req)
    );
    if (transport === "cookie") {
      this.web.issueCsrf(res);
    }
    return { status: "ok" };
  }

  /**
   * POST chứ không phải GET: mỗi lần gọi đều mint token mới + ghi 1 bản ghi audit vào collection
   * append-only (không xoá được). GET phải idempotent — prefetch/retry của trình duyệt sẽ bơm rác.
   * PHẢI khai báo TRƯỚC `oauth/:provider`: Express khớp route theo thứ tự đăng ký, khai sau thì
   * `session` bị hiểu là tên provider và endpoint này không bao giờ chạy (lỗi phát hiện ở IAM-006).
   */
  @Post("oauth/session")
  @HttpCode(200)
  @NoStore()
  @ZodResponse({ status: 200, description: "Đổi Better Auth session (sau OAuth callback) → access token.", type: AuthTokenResponseDto })
  async oauthSession(@Req() req: Request): Promise<AuthTokenResponse> {
    assertBearerOnly(req);
    return toTokenResponse(
      await this.authService.exchangeSession(
        toHeaders(req),
        this.context(req)
      )
    );
  }

  @Post("oauth/:provider")
  @HttpCode(200)
  @ApiParam({ name: "provider", enum: SUPPORTED_OAUTH, description: "OAuth provider (v1: google)." })
  @ApiBody({ type: OAuthInitDto })
  @ZodResponse({ status: 200, description: "Khởi tạo OAuth (v1: Google).", type: OAuthRedirectResponseDto })
  async oauth(
    @Param("provider") provider: string,
    @Body() dto: OAuthInitDto
  ): Promise<OAuthRedirectResponse> {
    return { redirectUrl: await this.authService.oauthInit(provider, dto.callbackURL) };
  }

  // ── IAM-006: bootstrap phiên web ──
  /** Cấp CSRF token cho web cookie mode. */
  @Get("csrf")
  @NoStore()
  @ZodResponse({
    status: 200,
    description:
      "Cấp (hoặc khôi phục sau reload) CSRF token signed double-submit: cookie `vxn_csrf` + body `{csrfToken}`. Web giữ token trong memory.",
    type: CsrfTokenResponseDto
  })
  csrf(@Req() req: Request, @Res({ passthrough: true }) res: Response): CsrfTokenResponse {
    return { csrfToken: this.web.csrfForBootstrap(req, res) };
  }

  /** Trả thông tin phiên đăng nhập hiện tại để web bootstrap. */
  @Get("me")
  @NoStore()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ZodResponse({
    status: 200,
    description:
      "Phiên hiện tại (Bearer hoặc cookie `vxn_access`). Không trả token/secret, KHÔNG tự refresh — web nhận 401 thì refresh một lần rồi gọi lại.",
    type: AuthMeResponseDto
  })
  @ApiResponse({
    status: 400,
    description: "Gửi cả Bearer lẫn cookie (`AUTH_TRANSPORT_AMBIGUOUS`).",
    content: problemContent
  })
  @ApiResponse({ status: 401, description: "Thiếu/sai/hết hạn access token hoặc phiên đã bị thu hồi.", content: problemContent })
  async me(@CurrentUser() user: VerifiedAccessToken): Promise<AuthMeResponse> {
    return this.authService.me(user);
  }

  // ── IAM-002: vòng đời phiên ──
  @Post("refresh")
  @HttpCode(200)
  @NoStore()
  @DualTransport(" Bearer mode thiếu `refreshToken`; cookie mode gửi kèm `refreshToken` trong body.")
  @ApiBody({ type: RefreshTokenDto })
  @ZodResponse({
    status: 200,
    description:
      "Đổi refresh token lấy cặp token mới (rotation). Token cũ chết ngay; dùng lại nó = revoke cả family. " +
      "Cookie mode đọc `vxn_refresh`, ghi lại cookie và rotate CSRF.",
    type: RefreshResponseDto
  })
  @ApiResponse({
    status: 401,
    description:
      "Refresh token không hợp lệ / hết hạn / đã dùng (`AUTH_SESSION_EXPIRED`); phiên owner/admin cấp trước khi bật MFA " +
      "(`AUTH_MFA_REQUIRED`) → đăng nhập lại qua MFA. Cookie mode xoá cookie phiên.",
    content: problemContent
  })
  @ApiResponse({ status: 429, description: "Vượt giới hạn refresh.", content: problemContent })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshResponse> {
    const transport = resolveAuthTransport(req);
    if (transport === "bearer") {
      if (!dto.refreshToken) {
        throw new BadRequestException("refreshToken là bắt buộc ở bearer mode.");
      }
      return toTokenResponse(await this.authService.refresh(dto.refreshToken, this.context(req)));
    }

    // Cookie mode: refresh token chỉ nằm ở cookie httpOnly — body mang token là client lẫn hai chế độ.
    if (dto.refreshToken) {
      throw authTransportAmbiguous();
    }
    const refreshToken = this.web.refreshTokenFrom(req);
    try {
      if (!refreshToken) {
        throw sessionExpired();
      }
      // Guard CSRF đã bắt buộc Origin trong allowlist → luôn có scope; service kiểm TRƯỚC khi xoay token (M1).
      const scope = this.web.scopeOfOrigin(req);
      return this.web.writeSession(res, await this.authService.refresh(refreshToken, this.context(req), scope));
    } catch (error) {
      // Refresh hỏng vĩnh viễn (hết hạn/reuse/khoá/cần MFA) → cookie vô dụng, xoá luôn. 429/503 là lỗi
      // tạm thời: giữ cookie để client thử lại. Sai origin: KHÔNG xoá — trang lạ không được đăng xuất người dùng.
      if (isTerminalAuthFailure(error)) {
        this.web.clearSession(res);
      }
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @AllowRevokedSession()
  @ApiBearerAuth()
  @DualTransport()
  @ZodResponse({
    status: 200,
    description: "Thu hồi phiên (cả family). Idempotent. Cookie mode xoá `vxn_access`/`vxn_refresh`/`vxn_csrf`.",
    type: MessageResponseDto
  })
  @ApiResponse({ status: 401, description: "Thiếu hoặc sai access token.", content: problemContent })
  async logout(
    @CurrentUser() user: VerifiedAccessToken,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    const transport = resolveAuthTransport(req);
    await this.authService.logout(user.sid);
    if (transport === "cookie" || req.authCredentialSource === "cookie") {
      this.web.clearSession(res);
    }
    return { status: "ok" };
  }

  @Post("re-auth")
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @DualTransport()
  @ApiBody({ type: ReauthDto })
  @ZodResponse({
    status: 200,
    description: "Xác thực lại trước thao tác nhạy cảm — bằng chứng có hiệu lực 5 phút.",
    type: MessageResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai mật khẩu/OTP hoặc phiên đã hết.", content: problemContent })
  @ApiResponse({ status: 429, description: "Vượt giới hạn thử.", content: problemContent })
  async reauth(
    @CurrentUser() user: VerifiedAccessToken,
    @Body() dto: ReauthDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageResponse> {
    try {
      await this.authService.reauth(user, dto, this.context(req));
    } catch (error) {
      // Tài khoản bị khoá → service đã thu hồi family hiện tại; web xoá cookie như revoke (API §7.1.1).
      // Sai mật khẩu (401) KHÔNG xoá — người dùng chỉ nhập lại.
      if (req.authCredentialSource === "cookie" && problemCodeOf(error) === "AUTH_ACCOUNT_LOCKED") {
        this.web.clearSession(res);
      }
      throw error;
    }
    return { status: "ok" };
  }

  /** Challenge (đổi mật khẩu / MFA) luôn ở JSON; chỉ khi đã cấp phiên mới tách token JSON vs cookie. */
  private credentialLoginResponse(
    result: CredentialLoginResult,
    transport: AuthTransport,
    res?: Response
  ): CredentialLoginResponse {
    if ("passwordChangeRequired" in result || "mfaRequired" in result) {
      return result;
    }
    return transport === "cookie" && res
      ? this.web.writeSession(res, result)
      : { ...toTokenResponse(result), mfaRequired: false };
  }

  private context(req: Request): RequestContext {
    const ip = resolveTrustedClientIp(req, this.config.NODE_ENV);
    if (this.config.NODE_ENV === "production" && !ip) {
      const cfRay = req.headers["cf-ray"];
      this.logger.warn({
        event: "auth.proxy_ip_untrusted",
        cfRay: typeof cfRay === "string" ? cfRay : undefined
      });
    }

    const userAgent = req.headers["user-agent"];
    return {
      ip,
      userAgent: typeof userAgent === "string" ? userAgent : undefined
    };
  }
}

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    }
  }
  return headers;
}

function toTokenResponse(result: LoginResult): AuthTokenResponse {
  return {
    accessToken: result.accessToken,
    tokenType: result.tokenType,
    expiresIn: result.expiresInSeconds,
    scope: result.scope,
    role: result.role,
    refreshToken: result.refreshToken,
    refreshExpiresIn: result.refreshExpiresInSeconds
  };
}

/** Endpoint Passenger chưa có cookie mode (ngoài IAM-006): cookie → 400 thay vì trả token thô trong body. */
function assertBearerOnly(req: Request): void {
  if (resolveAuthTransport(req) === "cookie") {
    throw authTransportInvalid("Endpoint này chỉ hỗ trợ bearer (JSON token).");
  }
}

function problemCodeOf(error: unknown): unknown {
  return error instanceof HttpException ? (error.getResponse() as { code?: unknown }).code : undefined;
}

function isTerminalAuthFailure(error: unknown): boolean {
  if (!(error instanceof HttpException)) {
    return false;
  }
  const status = error.getStatus();
  return (
    (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) &&
    problemCodeOf(error) !== "AUTH_ORIGIN_FORBIDDEN"
  );
}
