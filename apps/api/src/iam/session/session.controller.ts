import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { ProblemDetailsDto } from "../../openapi/openapi.dto";
import {
  AccessTokenGuard,
  AllowRevokedSession,
} from "../auth/access-token.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { VerifiedAccessToken } from "../auth/token.service";
import { isOperatorOwnerRole } from "../role/role";
import { SubjectType } from "../../database/prisma.types";
import {
  type SessionListResponse,
  SessionListQueryDto,
  SessionListResponseDto,
} from "./session.dto";
import { SessionService } from "./session.service";

const problemContent = {
  "application/problem+json": {
    schema: { $ref: getSchemaPath(ProblemDetailsDto) },
  },
};

@ApiTags("auth")
@ApiBearerAuth()
@ApiExtraModels(ProblemDetailsDto)
@UseGuards(AccessTokenGuard)
@Controller("auth/sessions")
export class SessionController {
  constructor(private readonly sessions: SessionService) {}

  @Get()
  @Header("Cache-Control", "no-store")
  @Header("Pragma", "no-cache")
  @ApiQuery({ name: "cursor", required: false, type: String })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  })
  @ZodResponse({
    status: 200,
    description: "Danh sách session family đang hoạt động của subject hiện tại.",
    type: SessionListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Cursor hoặc limit không hợp lệ.",
    content: problemContent,
  })
  @ApiResponse({
    status: 401,
    description: "Access token hoặc phiên hiện tại không hợp lệ.",
    content: problemContent,
  })
  async list(
    @Query() query: SessionListQueryDto,
    @CurrentUser() user: VerifiedAccessToken,
  ): Promise<SessionListResponse> {
    return this.sessions.listForSubject(
      subjectTypeFor(user),
      user.sub,
      user.sid,
      query,
    );
  }

  @Delete(":sessionId")
  @HttpCode(204)
  @AllowRevokedSession()
  @ApiParam({
    name: "sessionId",
    description: "Public session family id nhận từ GET /auth/sessions.",
    schema: { type: "string", format: "uuid" },
  })
  @ApiResponse({ status: 204, description: "Session family đã được thu hồi." })
  @ApiResponse({
    status: 401,
    description: "Access token hoặc phiên hiện tại không hợp lệ.",
    content: problemContent,
  })
  @ApiResponse({
    status: 404,
    description: "Family không tồn tại hoặc không thuộc subject hiện tại.",
    content: problemContent,
  })
  @ApiResponse({
    status: 503,
    description: "Không thể thu hồi fail-closed khi session cache không khả dụng.",
    content: problemContent,
  })
  async revoke(
    @Param("sessionId") sessionId: string,
    @CurrentUser() user: VerifiedAccessToken,
  ): Promise<void> {
    await this.sessions.revokeOwnedFamily(
      subjectTypeFor(user),
      user.sub,
      sessionId,
      user.sid,
    );
  }
}

/** JWT đã qua TokenService nên role/scope luôn thuộc tập hợp hợp lệ; vẫn map tường minh 3→4 loại. */
function subjectTypeFor(user: VerifiedAccessToken): SubjectType {
  if (user.scope === "passenger") {
    return SubjectType.PASSENGER;
  }
  if (user.scope === "platform") {
    return SubjectType.PLATFORM;
  }
  return isOperatorOwnerRole(user.role)
    ? SubjectType.OPERATOR
    : SubjectType.EMPLOYEE;
}
