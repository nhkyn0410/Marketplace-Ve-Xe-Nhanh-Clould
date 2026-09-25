import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  SeatMapInputDto,
  SeatMapListQueryDto,
  SeatMapListResponseDto,
  type SeatMapListResponse,
  SeatMapResponseDto,
  type SeatMapResponse,
} from "./dto/seat-map.dto";
import { SeatMapService } from "./seat-map.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`vehicle:manage`, quyết định Q3); tenant lấy từ JWT, không từ body/path.
@ApiTags("operator-seat-maps")
@Controller("operator/seat-maps")
/** API quản lý sơ đồ ghế do nhà xe tự cấu hình. */
export class SeatMapController {
  constructor(@Inject(SeatMapService) private readonly seatMaps: SeatMapService) {}

  /** Trả một trang SeatMap của nhà xe. */
  @Get()
  @Authorize("vehicle:manage")
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "SeatMap của nhà xe (không kèm ghế).", type: SeatMapListResponseDto })
  @ApiResponse({ status: 400, description: "Cursor/limit không hợp lệ.", content: problemContent })
  list(@Authz() authz: Authorization, @Query() query: SeatMapListQueryDto): Promise<SeatMapListResponse> {
    return this.seatMaps.list(authz, query);
  }

  /** Trả chi tiết một SeatMap kèm ghế. */
  @Get(":seatMapId")
  @Authorize("vehicle:manage")
  @ApiParam({ name: "seatMapId", type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Chi tiết SeatMap kèm ghế.", type: SeatMapResponseDto })
  @ApiResponse({ status: 404, description: "`SEAT_MAP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  get(@Authz() authz: Authorization, @Param("seatMapId") seatMapId: string): Promise<SeatMapResponse> {
    return this.seatMaps.get(authz, seatMapId);
  }

  /** Tạo SeatMap mới (cũng là cách tạo bản sao tùy chỉnh cho một xe). */
  @Post()
  @HttpCode(201)
  @Authorize("vehicle:manage")
  @ApiBody({ type: SeatMapInputDto })
  @ZodResponse({ status: 201, description: "SeatMap đã tạo.", type: SeatMapResponseDto })
  @ApiResponse({ status: 400, description: "Bố cục/ghế không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 409, description: "`SEAT_MAP_NAME_CONFLICT`.", content: problemContent })
  create(@Authz() authz: Authorization, @Body() input: SeatMapInputDto): Promise<SeatMapResponse> {
    return this.seatMaps.create(authz, input);
  }

  /** Thay toàn bộ tên, bố cục và ghế của SeatMap. */
  @Put(":seatMapId")
  @Authorize("vehicle:manage")
  @ApiParam({ name: "seatMapId", type: String, format: "uuid" })
  @ApiBody({ type: SeatMapInputDto })
  @ZodResponse({ status: 200, description: "SeatMap sau khi thay.", type: SeatMapResponseDto })
  @ApiResponse({ status: 400, description: "Bố cục/ghế không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`SEAT_MAP_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({ status: 409, description: "`SEAT_MAP_NAME_CONFLICT`.", content: problemContent })
  update(
    @Authz() authz: Authorization,
    @Param("seatMapId") seatMapId: string,
    @Body() input: SeatMapInputDto,
  ): Promise<SeatMapResponse> {
    return this.seatMaps.update(authz, seatMapId, input);
  }
}
