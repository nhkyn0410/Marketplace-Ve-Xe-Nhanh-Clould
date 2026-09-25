import {
  applyDecorators,
  Body,
  Controller,
  Header,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath
} from "@nestjs/swagger";
import type { Request } from "express";
import { ZodResponse } from "nestjs-zod";
import { resolveTrustedClientIp } from "../../common/trusted-client-ip";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { ProblemDetailsDto } from "../../openapi/openapi.dto";
import { AccessTokenGuard, AllowRevokedSession } from "./access-token.guard";
import {
  AuthService,
  type CredentialLoginResult,
  type LoginResult,
  type MfaLoginResult,
  type RequestContext,
  SUPPORTED_OAUTH
} from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import {
  AuthTokenResponseDto,
  type AuthTokenResponse,
  CredentialLoginDto,
  type CredentialLoginResponse,
  CredentialLoginResponseDto,
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
  RefreshTokenDto,
  RegisterDto
} from "./dto/auth.dto";
import type { VerifiedAccessToken } from "./token.service";

/** Response mang token: không proxy/CDN nào được lưu lại (RFC 6749 §5.1). */
const NoStore = () =>
  applyDecorators(Header("Cache-Control", "no-store"), Header("Pragma", "no-cache"));

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } }
};

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
    @Inject(APP_CONFIG) private readonly config: AppConfig
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
    return toTokenResponse(
      await this.authService.verifyOtp(dto.email, dto.otp, this.context(req))
    );
  }

  @Post("operator/login")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: CredentialLoginDto })
  @ZodResponse({
    status: 200,
    description: "Login Operator/Employee; role bắt buộc MFA nhận challenge thay vì token.",
    type: CredentialLoginResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập.", content: problemContent })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa.", content: problemContent })
  async operatorLogin(@Body() dto: CredentialLoginDto, @Req() req: Request): Promise<CredentialLoginResponse> {
    return toCredentialLoginResponse(
      await this.authService.operatorLogin(
        dto.identifier,
        dto.password,
        this.context(req)
      )
    );
  }

  @Post("platform/login")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: CredentialLoginDto })
  @ZodResponse({
    status: 200,
    description: "Login Platform; password đúng nhận MFA challenge, chưa cấp token.",
    type: CredentialLoginResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập.", content: problemContent })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa.", content: problemContent })
  async platformLogin(@Body() dto: CredentialLoginDto, @Req() req: Request): Promise<CredentialLoginResponse> {
    return toCredentialLoginResponse(
      await this.authService.platformLogin(
        dto.identifier,
        dto.password,
        this.context(req)
      )
    );
  }

  @Post("mfa/verify")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: MfaVerifyDto })
  @ZodResponse({
    status: 200,
    description: "Xác thực pre-auth challenge bằng TOTP/backup code rồi mới cấp token.",
    type: MfaVerifyResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Challenge/mã sai, hết hạn, đã dùng hoặc quá 5 lần thử — cùng một lỗi generic.",
    content: problemContent
  })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa trong lúc challenge còn sống.", content: problemContent })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async verifyMfa(@Body() dto: MfaVerifyDto, @Req() req: Request): Promise<MfaVerifyResponse> {
    return toMfaVerifyResponse(
      await this.authService.verifyMfa(dto.challengeToken, dto.code, this.context(req))
    );
  }

  @Post("password/change-required")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: PasswordChangeRequiredDto })
  @ZodResponse({
    status: 200,
    description: "Đổi mật khẩu tạm một lần; phải đăng nhập lại để tiếp tục MFA/token.",
    type: MessageResponseDto
  })
  @ApiResponse({
    status: 401,
    description: "Challenge giả, hết hạn, đã dùng hoặc account không còn hợp lệ.",
    content: problemContent
  })
  @ApiResponse({
    status: 400,
    description: "Mật khẩu mới trùng mật khẩu tạm.",
    content: problemContent
  })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async changeRequiredPassword(
    @Body() dto: PasswordChangeRequiredDto,
    @Req() req: Request
  ): Promise<MessageResponse> {
    await this.authService.changeRequiredPassword(
      dto.passwordChangeToken,
      dto.newPassword,
      this.context(req)
    );
    return { status: "ok" };
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

  /**
   * POST chứ không phải GET: mỗi lần gọi đều mint token mới + ghi 1 bản ghi audit vào collection
   * append-only (không xoá được). GET phải idempotent — prefetch/retry của trình duyệt sẽ bơm rác.
   */
  @Post("oauth/session")
  @HttpCode(200)
  @NoStore()
  @ZodResponse({ status: 200, description: "Đổi Better Auth session (sau OAuth callback) → access token.", type: AuthTokenResponseDto })
  async oauthSession(@Req() req: Request): Promise<AuthTokenResponse> {
    return toTokenResponse(
      await this.authService.exchangeSession(
        toHeaders(req),
        this.context(req)
      )
    );
  }

  // ── IAM-002: vòng đời phiên ──
  @Post("refresh")
  @HttpCode(200)
  @NoStore()
  @ApiBody({ type: RefreshTokenDto })
  @ZodResponse({
    status: 200,
    description: "Đổi refresh token lấy cặp token mới (rotation). Token cũ chết ngay; dùng lại nó = revoke cả family.",
    type: AuthTokenResponseDto
  })
  @ApiResponse({
    status: 401,
    description:
      "Refresh token không hợp lệ / hết hạn / đã dùng (`AUTH_SESSION_EXPIRED`); phiên owner/admin cấp trước khi bật MFA " +
      "(`AUTH_MFA_REQUIRED`) → đăng nhập lại qua MFA.",
    content: problemContent
  })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa.", content: problemContent })
  @ApiResponse({ status: 429, description: "Vượt giới hạn refresh.", content: problemContent })
  @ApiResponse({ status: 503, description: "Redis không khả dụng (fail-closed).", content: problemContent })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<AuthTokenResponse> {
    return toTokenResponse(await this.authService.refresh(dto.refreshToken, this.context(req)));
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @AllowRevokedSession()
  @ApiBearerAuth()
  @ZodResponse({ status: 200, description: "Thu hồi phiên (cả family). Idempotent.", type: MessageResponseDto })
  @ApiResponse({ status: 401, description: "Thiếu hoặc sai access token.", content: problemContent })
  async logout(@CurrentUser() user: VerifiedAccessToken): Promise<MessageResponse> {
    await this.authService.logout(user.sid);
    return { status: "ok" };
  }

  @Post("re-auth")
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiBody({ type: ReauthDto })
  @ZodResponse({
    status: 200,
    description: "Xác thực lại trước thao tác nhạy cảm — bằng chứng có hiệu lực 5 phút.",
    type: MessageResponseDto
  })
  @ApiResponse({ status: 401, description: "Sai mật khẩu/OTP hoặc phiên đã hết.", content: problemContent })
  @ApiResponse({ status: 403, description: "Tài khoản bị khóa.", content: problemContent })
  @ApiResponse({ status: 429, description: "Vượt giới hạn thử.", content: problemContent })
  async reauth(
    @CurrentUser() user: VerifiedAccessToken,
    @Body() dto: ReauthDto,
    @Req() req: Request
  ): Promise<MessageResponse> {
    await this.authService.reauth(user, dto, this.context(req));
    return { status: "ok" };
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

function toCredentialLoginResponse(result: CredentialLoginResult): CredentialLoginResponse {
  if ("passwordChangeRequired" in result) {
    return result;
  }
  if ("mfaRequired" in result) {
    return result;
  }
  return { ...toTokenResponse(result), mfaRequired: false };
}

function toMfaVerifyResponse(result: MfaLoginResult): MfaVerifyResponse {
  return {
    ...toTokenResponse(result),
    mfaRequired: false,
    ...(result.backupCodes ? { backupCodes: result.backupCodes } : {})
  };
}
