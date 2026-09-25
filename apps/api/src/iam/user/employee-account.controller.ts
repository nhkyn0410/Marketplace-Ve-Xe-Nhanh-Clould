import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import type { Request } from "express";
import { ZodResponse } from "nestjs-zod";
import { resolveTrustedClientIp } from "../../common/trusted-client-ip";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { ProblemDetailsDto } from "../../openapi/openapi.dto";
import { CurrentUser } from "../auth/current-user.decorator";
import type { VerifiedAccessToken } from "../auth/token.service";
import { Authorize, Authz } from "../role/authorize.decorator";
import type { Authorization } from "../role/authorization";
import type { AccountRequestContext } from "./account.types";
import {
  AccountMutationResponseDto,
  type AccountMutationResponse,
  EmployeeAccountResponseDto,
  type EmployeeAccountResponse,
  EmployeeCreateDto,
  EmployeeListQueryDto,
  EmployeeListResponseDto,
  type EmployeeListResponse,
  EmployeePasswordResetDto,
  EmployeeUpdateDto,
} from "./dto/employee-account.dto";
import { EmployeeAccountService } from "./employee-account.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

@ApiTags("operator-employees")
@Controller("operator/employees")
export class EmployeeAccountController {
  constructor(
    @Inject(EmployeeAccountService)
    private readonly employees: EmployeeAccountService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Get()
  @Authorize("employee:manage")
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({
    status: 200,
    description: "Danh sách tài khoản Employee trong tenant của Owner.",
    type: EmployeeListResponseDto,
  })
  @ApiResponse({ status: 400, description: "Cursor/limit không hợp lệ.", content: problemContent })
  list(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Query() query: EmployeeListQueryDto,
  ): Promise<EmployeeListResponse> {
    return this.employees.list(actor, authz, query);
  }

  @Post()
  @HttpCode(201)
  @Authorize("employee:manage", { requireReauth: true })
  @ApiBody({ type: EmployeeCreateDto })
  @ZodResponse({
    status: 201,
    description: "Tạo Employee và gửi mật khẩu tạm một lần qua email.",
    type: EmployeeAccountResponseDto,
  })
  @ApiResponse({ status: 409, description: "Username đã tồn tại.", content: problemContent })
  @ApiResponse({ status: 429, description: "Vượt giới hạn email mật khẩu tạm.", content: problemContent })
  @ApiResponse({ status: 503, description: "Gửi mật khẩu tạm lỗi: detail chứa employeeId để list/reset lại; hoặc audit không khả dụng.", content: problemContent })
  create(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Body() input: EmployeeCreateDto,
    @Req() request: Request,
  ): Promise<EmployeeAccountResponse> {
    return this.employees.create(actor, authz, input, requestContext(request, this.config.NODE_ENV));
  }

  @Patch(":employeeId")
  @Authorize("employee:manage", { requireReauth: true })
  @ApiParam({ name: "employeeId", type: String, format: "uuid" })
  @ApiBody({ type: EmployeeUpdateDto })
  @ZodResponse({
    status: 200,
    description: "Cập nhật tài khoản Employee trong cùng tenant.",
    type: EmployeeAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: "Employee không tồn tại trong tenant.", content: problemContent })
  @ApiResponse({ status: 409, description: "Username/trạng thái xung đột.", content: problemContent })
  @ApiResponse({ status: 503, description: "Audit hoặc session revoke không khả dụng.", content: problemContent })
  update(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Param("employeeId") employeeId: string,
    @Body() input: EmployeeUpdateDto,
    @Req() request: Request,
  ): Promise<EmployeeAccountResponse> {
    return this.employees.update(actor, authz, employeeId, input, requestContext(request, this.config.NODE_ENV));
  }

  @Post(":employeeId/password-reset")
  @HttpCode(200)
  @Authorize("employee:manage", { requireReauth: true })
  @ApiParam({ name: "employeeId", type: String, format: "uuid" })
  @ApiBody({ type: EmployeePasswordResetDto })
  @ZodResponse({
    status: 200,
    description: "Thu hồi mọi phiên và gửi mật khẩu tạm mới.",
    type: AccountMutationResponseDto,
  })
  @ApiResponse({ status: 404, description: "Employee không tồn tại trong tenant.", content: problemContent })
  @ApiResponse({ status: 409, description: "Trạng thái tài khoản xung đột.", content: problemContent })
  @ApiResponse({ status: 429, description: "Vượt giới hạn email mật khẩu tạm hoặc cooldown reset.", content: problemContent })
  @ApiResponse({ status: 503, description: "Không thể gửi mật khẩu tạm hoặc thu hồi session.", content: problemContent })
  async resetPassword(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Param("employeeId") employeeId: string,
    @Body() input: EmployeePasswordResetDto,
    @Req() request: Request,
  ): Promise<AccountMutationResponse> {
    await this.employees.resetPassword(
      actor,
      authz,
      employeeId,
      input,
      requestContext(request, this.config.NODE_ENV),
    );
    return { status: "ok" };
  }
}

function requestContext(request: Request, nodeEnv: AppConfig["NODE_ENV"]): AccountRequestContext {
  const userAgent = request.headers["user-agent"];
  return {
    ip: resolveTrustedClientIp(request, nodeEnv),
    userAgent: typeof userAgent === "string" ? userAgent : undefined,
  };
}
