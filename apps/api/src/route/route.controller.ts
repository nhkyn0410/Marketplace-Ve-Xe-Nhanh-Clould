import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { RouteStatus } from "../database/prisma.types";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  RouteInputDto,
  RouteListQueryDto,
  RouteListResponseDto,
  type RouteListResponse,
  RouteResponseDto,
  type RouteResponse,
} from "./dto/route.dto";
import { RouteService } from "./route.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`route:manage`, Q6); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-routes")
@Controller("operator/routes")
/** API quản lý tuyến của nhà xe. */
export class RouteController {
  constructor(@Inject(RouteService) private readonly routes: RouteService) {}

  /** Trả một trang route của nhà xe. */
  @Get()
  @Authorize("route:manage")
  @ApiQuery({ name: "status", required: false, enum: Object.values(RouteStatus) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Route của nhà xe (không kèm điểm).", type: RouteListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: RouteListQueryDto): Promise<RouteListResponse> {
    return this.routes.list(authz, query);
  }

  /** Trả chi tiết route kèm điểm dừng. */
  @Get(":routeId")
  @Authorize("route:manage")
  @ApiParam({ name: "routeId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết route kèm điểm dừng.", type: RouteResponseDto })
  @ApiResponse({ status: 404, description: "`ROUTE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("routeId") routeId: string): Promise<RouteResponse> {
    return this.routes.get(authz, routeId);
  }

  /** Tạo route và tính khoảng cách/thời gian từng chặng. */
  @Post()
  @HttpCode(201)
  @Authorize("route:manage")
  @ApiBody({ type: RouteInputDto })
  @ZodResponse({ status: 201, description: "Route đã tạo.", type: RouteResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ (dưới 2 điểm, điểm lặp...).", content: problemContent })
  @ApiResponse({ status: 409, description: "`ROUTE_NAME_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`STOP_POINT_UNAVAILABLE`.", content: problemContent })
  @ApiResponse({ status: 503, description: "`ROUTING_PROVIDER_UNAVAILABLE` — không lưu gì.", content: problemContent })
  create(@Authz() authz: Authorization, @Body() input: RouteInputDto): Promise<RouteResponse> {
    return this.routes.create(authz, input);
  }

  /** Thay toàn bộ route; chỉ tính lại khi chuỗi toạ độ đổi. */
  @Put(":routeId")
  @Authorize("route:manage")
  @ApiParam({ name: "routeId", type: String, format: "uuid" })
  @ApiBody({ type: RouteInputDto })
  @ZodResponse({ status: 200, description: "Route sau khi thay.", type: RouteResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`ROUTE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({ status: 409, description: "`ROUTE_NAME_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`STOP_POINT_UNAVAILABLE`.", content: problemContent })
  @ApiResponse({ status: 503, description: "`ROUTING_PROVIDER_UNAVAILABLE` — không đổi gì.", content: problemContent })
  update(
    @Authz() authz: Authorization,
    @Param("routeId") routeId: string,
    @Body() input: RouteInputDto,
  ): Promise<RouteResponse> {
    return this.routes.update(authz, routeId, input);
  }
}
