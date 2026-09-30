import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { FareStatus } from "../database/prisma.types";
import { CurrentUser } from "../iam/auth/current-user.decorator";
import type { VerifiedAccessToken } from "../iam/auth/token.service";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  FareCreateInputDto,
  FareListQueryDto,
  FareListResponseDto,
  type FareListResponse,
  FareResponseDto,
  type FareResponse,
  FareRevisionListResponseDto,
  type FareRevisionListResponse,
  FareRevisionQueryDto,
  FareUpdateInputDto,
} from "./dto/fare.dto";
import { FareService } from "./fare.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (dùng lại `trip:manage`, Q5); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-fares")
@Controller("operator/fares")
/** API bảng giá theo tuyến của nhà xe (TASK-TRN-005). */
export class FareController {
  constructor(@Inject(FareService) private readonly fares: FareService) {}

  /** Trả một trang bảng giá của nhà xe. */
  @Get()
  @Authorize("trip:manage")
  @ApiQuery({ name: "routeId", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "status", required: false, enum: Object.values(FareStatus) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Bảng giá của nhà xe (không kèm rule).", type: FareListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: FareListQueryDto): Promise<FareListResponse> {
    return this.fares.list(authz, query);
  }

  /** Trả chi tiết bảng giá kèm rule. */
  @Get(":fareId")
  @Authorize("trip:manage")
  @ApiParam({ name: "fareId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết bảng giá kèm rule.", type: FareResponseDto })
  @ApiResponse({ status: 404, description: "`FARE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("fareId") fareId: string): Promise<FareResponse> {
    return this.fares.get(authz, fareId);
  }

  /** Tạo bảng giá cho một tuyến. */
  @Post()
  @HttpCode(201)
  @Authorize("trip:manage")
  @ApiBody({ type: FareCreateInputDto })
  @ZodResponse({ status: 201, description: "Bảng giá đã tạo.", type: FareResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu sai / `FARE_RULES_OVERLAP`.", content: problemContent })
  @ApiResponse({ status: 409, description: "`FARE_ROUTE_CONFLICT` (tuyến đã có bảng giá).", content: problemContent })
  @ApiResponse({
    status: 422,
    description: "`ROUTE_UNAVAILABLE` / `CATALOG_ITEM_UNAVAILABLE`.",
    content: problemContent,
  })
  create(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Body() input: FareCreateInputDto,
  ): Promise<FareResponse> {
    return this.fares.create(actor, authz, input);
  }

  /** Thay toàn bộ trạng thái, ghi chú và rule của bảng giá. */
  @Put(":fareId")
  @Authorize("trip:manage")
  @ApiParam({ name: "fareId", type: String, format: "uuid" })
  @ApiBody({ type: FareUpdateInputDto })
  @ZodResponse({ status: 200, description: "Bảng giá sau khi thay.", type: FareResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu sai / `FARE_RULES_OVERLAP`.", content: problemContent })
  @ApiResponse({ status: 404, description: "`FARE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE`.", content: problemContent })
  update(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Param("fareId") fareId: string,
    @Body() input: FareUpdateInputDto,
  ): Promise<FareResponse> {
    return this.fares.update(actor, authz, fareId, input);
  }

  /** Trả lịch sử thay đổi bảng giá (mới nhất trước). */
  @Get(":fareId/revisions")
  @Authorize("trip:manage")
  @ApiParam({ name: "fareId", type: String, format: "uuid" })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "date-time" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Lịch sử thay đổi bảng giá.", type: FareRevisionListResponseDto })
  @ApiResponse({ status: 404, description: "`FARE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  revisions(
    @Authz() authz: Authorization,
    @Param("fareId") fareId: string,
    @Query() query: FareRevisionQueryDto,
  ): Promise<FareRevisionListResponse> {
    return this.fares.revisions(authz, fareId, query);
  }
}
