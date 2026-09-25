import {
  applyDecorators,
  createParamDecorator,
  type ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { ProblemDetailsDto } from "../../openapi/openapi.dto";
import { AccessTokenGuard } from "../auth/access-token.guard";
import { type Authorization, type AuthorizedRequest, REQUIRED_PERMISSION } from "./authorization";
import type { Permission } from "./permissions";
import { PermissionGuard } from "./permission.guard";
import { TenantGuard } from "./tenant.guard";
import { RecentReauthGuard } from "./recent-reauth.guard";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

/**
 * Cửa duy nhất để bảo vệ route (TASK-IAM-003): đăng nhập → có quyền → đúng tenant.
 * Route chỉ khai QUYỀN, không khai role — thêm role mới không phải sửa route nào.
 * Module dùng decorator này phải import `IamModule` (guard cần `TokenService` + `SessionService`).
 *
 * Chỉ đặt trên METHOD (kiểu trả về chặn ở compile-time): đặt trên class thì guard đọc không thấy quyền,
 * còn đặt cả class lẫn method thì chuỗi guard chạy hai lần.
 * Route công khai (Guest) KHÔNG dùng decorator này — nó đòi token trước tiên (401); quyền của
 * ANONYMOUS trong bảng chỉ để service hỏi `can(null, …)`.
 */
export function Authorize(
  permission: Permission,
  options: { requireReauth?: boolean } = {},
): MethodDecorator {
  return applyDecorators(
    SetMetadata(REQUIRED_PERMISSION, permission),
    UseGuards(
      AccessTokenGuard,
      PermissionGuard,
      TenantGuard,
      ...(options.requireReauth ? [RecentReauthGuard] : []),
    ),
    ApiBearerAuth(),
    ApiExtraModels(ProblemDetailsDto),
    ApiResponse({ status: 401, description: "Thiếu hoặc sai access token.", content: problemContent }),
    ApiResponse({
      status: 403,
      description: "`PERMISSION_DENIED` hoặc `TENANT_SCOPE_VIOLATION`.",
      content: problemContent,
    }),
  );
}

export const Authz = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Authorization => {
    const authz = context.switchToHttp().getRequest<AuthorizedRequest>().authz;
    if (!authz) {
      // Lỗi lập trình (quên @Authorize) → 500 to rõ, không phải 401/403.
      throw new Error("@Authz() dùng trên route thiếu @Authorize().");
    }
    return authz;
  },
);
