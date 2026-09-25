import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { StopPointStatus } from "../database/prisma.types";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  OperatorStopPointInputDto,
  OperatorStopPointListQueryDto,
  OperatorStopPointListResponseDto,
  type StopPointListResponse,
  OperatorStopPointResponseDto,
  type StopPointResponse,
} from "./dto/stop-point.dto";
import { StopPointService } from "./stop-point.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`route:manage`, Q6); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-stop-points")
@Controller("operator/stop-points")
/** API quản lý điểm đón/trả riêng của nhà xe. */
export class StopPointController {
  constructor(@Inject(StopPointService) private readonly stopPoints: StopPointService) {}

  /** Trả một trang điểm riêng của nhà xe. */
  @Get()
  @Authorize("route:manage")
  @ApiQuery({ name: "status", required: false, enum: Object.values(StopPointStatus) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Điểm riêng của nhà xe.", type: OperatorStopPointListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: OperatorStopPointListQueryDto): Promise<StopPointListResponse> {
    return this.stopPoints.list(authz, query);
  }

  /** Trả chi tiết một điểm riêng. */
  @Get(":stopPointId")
  @Authorize("route:manage")
  @ApiParam({ name: "stopPointId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết điểm riêng.", type: OperatorStopPointResponseDto })
  @ApiResponse({ status: 404, description: "`STOP_POINT_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("stopPointId") stopPointId: string): Promise<StopPointResponse> {
    return this.stopPoints.get(authz, stopPointId);
  }

  /** Tạo điểm riêng — dùng ngay trong route của nhà xe. */
  @Post()
  @HttpCode(201)
  @Authorize("route:manage")
  @ApiBody({ type: OperatorStopPointInputDto })
  @ZodResponse({ status: 201, description: "Điểm riêng đã tạo.", type: OperatorStopPointResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 409, description: "`STOP_POINT_NAME_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE` (tỉnh/phường).", content: problemContent })
  create(@Authz() authz: Authorization, @Body() input: OperatorStopPointInputDto): Promise<StopPointResponse> {
    return this.stopPoints.create(authz, input);
  }

  /** Thay toàn bộ điểm riêng. */
  @Put(":stopPointId")
  @Authorize("route:manage")
  @ApiParam({ name: "stopPointId", type: String, format: "uuid" })
  @ApiBody({ type: OperatorStopPointInputDto })
  @ZodResponse({ status: 200, description: "Điểm riêng sau khi thay.", type: OperatorStopPointResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`STOP_POINT_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({ status: 409, description: "`STOP_POINT_NAME_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE` (tỉnh/phường).", content: problemContent })
  update(
    @Authz() authz: Authorization,
    @Param("stopPointId") stopPointId: string,
    @Body() input: OperatorStopPointInputDto,
  ): Promise<StopPointResponse> {
    return this.stopPoints.update(authz, stopPointId, input);
  }
}
