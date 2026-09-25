import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiExtraModels, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { StopPointType } from "../database/prisma.types";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import { CatalogService } from "./catalog.service";
import {
  AmenityListResponseDto,
  type AmenityListResponse,
  ProvinceListResponseDto,
  type ProvinceListResponse,
  StopPointListQueryDto,
  StopPointListResponseDto,
  type StopPointListResponse,
  VehicleTypeListResponseDto,
  type VehicleTypeListResponse,
  WardListQueryDto,
  WardListResponseDto,
  type WardListResponse,
} from "./dto/catalog.dto";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// CÔNG KHAI (API §7.6, quyết định Q1 TASK-CAT-001): Guest dùng cho tìm chuyến, Operator OS dùng khi cấu
// hình xe/tuyến. Không `@Authorize` vì decorator đó đòi token trước tiên. Ghi catalog thuộc
// `/admin/catalog/*` (TASK-ADM-001).
@ApiTags("catalog")
@ApiExtraModels(ProblemDetailsDto)
@Controller("catalog")
/** API đọc catalog chuẩn (tỉnh, xã, điểm đón/trả, loại xe, tiện ích) cho mọi người dùng. */
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalog: CatalogService) {}

  /** Trả danh sách tỉnh/thành đang hoạt động. */
  @Get("provinces")
  @ZodResponse({ status: 200, description: "Tỉnh/thành đang hoạt động.", type: ProvinceListResponseDto })
  listProvinces(): Promise<ProvinceListResponse> {
    return this.catalog.listProvinces();
  }

  /** Trả danh sách phường/xã đang hoạt động của một tỉnh. */
  @Get("wards")
  @ApiQuery({ name: "provinceId", required: true, type: String, format: "uuid" })
  @ZodResponse({ status: 200, description: "Phường/xã đang hoạt động của tỉnh.", type: WardListResponseDto })
  @ApiResponse({ status: 400, description: "Thiếu hoặc sai `provinceId`.", content: problemContent })
  listWards(@Query() query: WardListQueryDto): Promise<WardListResponse> {
    return this.catalog.listWards(query.provinceId);
  }

  /** Trả một trang điểm đón/trả chuẩn đang hoạt động. */
  @Get("stop-points")
  @ApiQuery({ name: "provinceId", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "wardId", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "type", required: false, enum: Object.values(StopPointType) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Điểm đón/trả chuẩn đang hoạt động.", type: StopPointListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  listStopPoints(@Query() query: StopPointListQueryDto): Promise<StopPointListResponse> {
    return this.catalog.listStopPoints(query);
  }

  /** Trả danh sách loại phương tiện đang hoạt động. */
  @Get("vehicle-types")
  @ZodResponse({ status: 200, description: "Loại phương tiện đang hoạt động.", type: VehicleTypeListResponseDto })
  listVehicleTypes(): Promise<VehicleTypeListResponse> {
    return this.catalog.listVehicleTypes();
  }

  /** Trả danh sách tiện ích đang hoạt động. */
  @Get("amenities")
  @ZodResponse({ status: 200, description: "Tiện ích đang hoạt động.", type: AmenityListResponseDto })
  listAmenities(): Promise<AmenityListResponse> {
    return this.catalog.listAmenities();
  }
}
