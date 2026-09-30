import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { TripStatus } from "../database/prisma.types";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  TripInputDto,
  TripListQueryDto,
  TripListResponseDto,
  type TripListResponse,
  TripResponseDto,
  type TripResponse,
} from "./dto/trip.dto";
import { TripService } from "./trip.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`trip:manage`, Q5); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-trips")
@Controller("operator/trips")
/** API quản lý chuyến của nhà xe (chuyến nháp — TASK-TRN-003). */
export class TripController {
  constructor(@Inject(TripService) private readonly trips: TripService) {}

  /** Trả một trang chuyến của nhà xe, sắp theo giờ đi. */
  @Get()
  @Authorize("trip:manage")
  @ApiQuery({ name: "routeId", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "vehicleId", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "status", required: false, enum: Object.values(TripStatus) })
  @ApiQuery({ name: "departureFrom", required: false, type: String, format: "date-time" })
  @ApiQuery({ name: "departureTo", required: false, type: String, format: "date-time" })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Chuyến của nhà xe (không kèm điểm dừng, ghế).", type: TripListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: TripListQueryDto): Promise<TripListResponse> {
    return this.trips.list(authz, query);
  }

  /** Trả chi tiết chuyến kèm điểm dừng và ghế. */
  @Get(":tripId")
  @Authorize("trip:manage")
  @ApiParam({ name: "tripId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết chuyến kèm điểm dừng và ghế.", type: TripResponseDto })
  @ApiResponse({ status: 404, description: "`TRIP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("tripId") tripId: string): Promise<TripResponse> {
    return this.trips.get(authz, tripId);
  }

  /** Tạo chuyến nháp từ route, giờ đi/đến và xe (tuỳ chọn). */
  @Post()
  @HttpCode(201)
  @Authorize("trip:manage")
  @ApiBody({ type: TripInputDto })
  @ZodResponse({ status: 201, description: "Chuyến đã tạo (`DRAFT`).", type: TripResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ (giờ đến trước giờ đi...).", content: problemContent })
  @ApiResponse({ status: 409, description: "`VEHICLE_SCHEDULE_CONFLICT`.", content: problemContent })
  @ApiResponse({
    status: 422,
    description: "`ROUTE_UNAVAILABLE` / `VEHICLE_UNAVAILABLE` / `TRIP_STOP_TIMES_INVALID`.",
    content: problemContent,
  })
  create(@Authz() authz: Authorization, @Body() input: TripInputDto): Promise<TripResponse> {
    return this.trips.create(authz, input);
  }

  /** Thay toàn bộ chuyến còn `DRAFT`. */
  @Put(":tripId")
  @Authorize("trip:manage")
  @ApiParam({ name: "tripId", type: String, format: "uuid" })
  @ApiBody({ type: TripInputDto })
  @ZodResponse({ status: 200, description: "Chuyến sau khi thay.", type: TripResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`TRIP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({
    status: 409,
    description: "`TRIP_NOT_EDITABLE` (không còn nháp) / `VEHICLE_SCHEDULE_CONFLICT`.",
    content: problemContent,
  })
  @ApiResponse({
    status: 422,
    description: "`ROUTE_UNAVAILABLE` / `VEHICLE_UNAVAILABLE` / `TRIP_STOP_TIMES_INVALID`.",
    content: problemContent,
  })
  update(
    @Authz() authz: Authorization,
    @Param("tripId") tripId: string,
    @Body() input: TripInputDto,
  ): Promise<TripResponse> {
    return this.trips.update(authz, tripId, input);
  }
}
