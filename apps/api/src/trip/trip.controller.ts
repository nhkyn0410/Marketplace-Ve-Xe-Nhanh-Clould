import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { TripStatus } from "../database/prisma.types";
import { CurrentUser } from "../iam/auth/current-user.decorator";
import type { VerifiedAccessToken } from "../iam/auth/token.service";
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
  TripSeatStatusInputDto,
  TripStatusInputDto,
} from "./dto/trip.dto";
import { TripService } from "./trip.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`trip:manage`, Q5); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-trips")
@Controller("operator/trips")
/** API quản lý chuyến của nhà xe (chuyến nháp — TASK-TRN-003; trạng thái bán + khóa ghế — TASK-TRN-006). */
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
    description:
      "`TRIP_NOT_EDITABLE` (không còn nháp) / `VEHICLE_SCHEDULE_CONFLICT` / `TRIP_BLOCKED_SEATS_MISSING` (xe mới thiếu ghế đang khóa).",
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

  /** Đổi trạng thái bán: mở bán / khóa (tạm dừng) / mở lại / thu hồi về nháp / hủy (chuyến chưa có vé). */
  @Put(":tripId/status")
  @Authorize("trip:manage")
  @ApiParam({ name: "tripId", type: String, format: "uuid" })
  @ApiBody({ type: TripStatusInputDto })
  @ZodResponse({ status: 200, description: "Chuyến sau khi đổi trạng thái.", type: TripResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ (vd hủy thiếu lý do).", content: problemContent })
  @ApiResponse({ status: 404, description: "`TRIP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({
    status: 409,
    description: "`TRIP_STATUS_TRANSITION_INVALID` (chuyển sai bảng, hoặc thu hồi nháp / hủy khi đã có vé).",
    content: problemContent,
  })
  @ApiResponse({
    status: 422,
    description: "`TRIP_NOT_READY_FOR_SALE` — `reasons` liệt kê mọi điều kiện mở bán chưa đạt (BR-39).",
    content: problemContent,
  })
  @ApiResponse({ status: 503, description: "Chưa ghi được lịch sử — chuyến không đổi, thử lại.", content: problemContent })
  changeStatus(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Param("tripId") tripId: string,
    @Body() input: TripStatusInputDto,
  ): Promise<TripResponse> {
    return this.trips.changeStatus(actor, authz, tripId, input);
  }

  /** Khóa / mở ghế thủ công theo lô (bán ngoài Platform — BR-42). */
  @Put(":tripId/seats/status")
  @Authorize("trip:manage")
  @ApiParam({ name: "tripId", type: String, format: "uuid" })
  @ApiBody({ type: TripSeatStatusInputDto })
  @ZodResponse({ status: 200, description: "Chuyến sau khi khóa / mở ghế.", type: TripResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ (vd trùng mã ghế).", content: problemContent })
  @ApiResponse({ status: 404, description: "`TRIP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({
    status: 409,
    description: "`TRIP_SEAT_NOT_AVAILABLE` (ghế đang giữ / đã bán) / `TRIP_NOT_EDITABLE` (chuyến đã hủy / khởi hành).",
    content: problemContent,
  })
  @ApiResponse({ status: 422, description: "`TRIP_SEAT_UNKNOWN` (mã ghế không thuộc chuyến).", content: problemContent })
  setSeatStatus(
    @CurrentUser() actor: VerifiedAccessToken,
    @Authz() authz: Authorization,
    @Param("tripId") tripId: string,
    @Body() input: TripSeatStatusInputDto,
  ): Promise<TripResponse> {
    return this.trips.setSeatStatus(actor, authz, tripId, input);
  }
}
