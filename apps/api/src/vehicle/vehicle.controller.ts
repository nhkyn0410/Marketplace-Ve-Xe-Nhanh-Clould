import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { VehicleStatus } from "../database/prisma.types";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  VehicleInputDto,
  VehicleListQueryDto,
  VehicleListResponseDto,
  type VehicleListResponse,
  VehicleResponseDto,
  type VehicleResponse,
} from "./dto/vehicle.dto";
import { VehicleService } from "./vehicle.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`vehicle:manage`, quyết định Q3). Không dùng `vehicle:read`: grant `assigned`
// của Employee chưa có dữ liệu phân công để lọc (TASK-EMP-001) → sẽ lộ cả đội xe.
@ApiTags("operator-vehicles")
@Controller("operator/vehicles")
/** API quản lý đội xe của nhà xe. */
export class VehicleController {
  constructor(@Inject(VehicleService) private readonly vehicles: VehicleService) {}

  /** Trả một trang xe của nhà xe. */
  @Get()
  @Authorize("vehicle:manage")
  @ApiQuery({ name: "status", required: false, enum: Object.values(VehicleStatus) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Xe của nhà xe.", type: VehicleListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: VehicleListQueryDto): Promise<VehicleListResponse> {
    return this.vehicles.list(authz, query);
  }

  /** Trả chi tiết một xe. */
  @Get(":vehicleId")
  @Authorize("vehicle:manage")
  @ApiParam({ name: "vehicleId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết xe.", type: VehicleResponseDto })
  @ApiResponse({ status: 404, description: "`VEHICLE_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("vehicleId") vehicleId: string): Promise<VehicleResponse> {
    return this.vehicles.get(authz, vehicleId);
  }

  /** Tạo xe mới. */
  @Post()
  @HttpCode(201)
  @Authorize("vehicle:manage")
  @ApiBody({ type: VehicleInputDto })
  @ZodResponse({ status: 201, description: "Xe đã tạo.", type: VehicleResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ (biển số, id...).", content: problemContent })
  @ApiResponse({ status: 404, description: "`SEAT_MAP_NOT_FOUND`.", content: problemContent })
  @ApiResponse({ status: 409, description: "`VEHICLE_PLATE_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE`.", content: problemContent })
  create(@Authz() authz: Authorization, @Body() input: VehicleInputDto): Promise<VehicleResponse> {
    return this.vehicles.create(authz, input);
  }

  /** Thay toàn bộ thông tin xe. */
  @Put(":vehicleId")
  @Authorize("vehicle:manage")
  @ApiParam({ name: "vehicleId", type: String, format: "uuid" })
  @ApiBody({ type: VehicleInputDto })
  @ZodResponse({ status: 200, description: "Xe sau khi thay.", type: VehicleResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`VEHICLE_NOT_FOUND` / `SEAT_MAP_NOT_FOUND`.", content: problemContent })
  @ApiResponse({ status: 409, description: "`VEHICLE_PLATE_CONFLICT`.", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE`.", content: problemContent })
  update(
    @Authz() authz: Authorization,
    @Param("vehicleId") vehicleId: string,
    @Body() input: VehicleInputDto,
  ): Promise<VehicleResponse> {
    return this.vehicles.update(authz, vehicleId, input);
  }
}
