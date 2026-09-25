import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { StopPointProposalStatus } from "../database/prisma.types";
import { Authorize, Authz } from "../iam/role/authorize.decorator";
import type { Authorization } from "../iam/role/authorization";
import { ProblemDetailsDto } from "../openapi/openapi.dto";
import {
  StopPointProposalInputDto,
  StopPointProposalListQueryDto,
  StopPointProposalListResponseDto,
  type StopPointProposalListResponse,
  StopPointProposalResponseDto,
  type StopPointProposalResponse,
} from "./dto/stop-point.dto";
import { StopPointProposalService } from "./stop-point-proposal.service";

const problemContent = {
  "application/problem+json": { schema: { $ref: getSchemaPath(ProblemDetailsDto) } },
};

// API §7.3 — chỉ Owner (`route:manage`, Q6). Duyệt/từ chối ở `/admin/catalog/*` (ADM-001).
@ApiTags("operator-stop-point-proposals")
@Controller("operator/stop-point-proposals")
/** API gửi đề xuất đưa điểm đón/trả vào catalog chuẩn. */
export class StopPointProposalController {
  constructor(@Inject(StopPointProposalService) private readonly proposals: StopPointProposalService) {}

  /** Trả một trang đề xuất của nhà xe. */
  @Get()
  @Authorize("route:manage")
  @ApiQuery({ name: "status", required: false, enum: Object.values(StopPointProposalStatus) })
  @ApiQuery({ name: "cursor", required: false, type: String, format: "uuid" })
  @ApiQuery({ name: "limit", required: false, type: Number, minimum: 1, maximum: 100 })
  @ZodResponse({ status: 200, description: "Đề xuất của nhà xe.", type: StopPointProposalListResponseDto })
  @ApiResponse({ status: 400, description: "Query không hợp lệ.", content: problemContent })
  list(
    @Authz() authz: Authorization,
    @Query() query: StopPointProposalListQueryDto,
  ): Promise<StopPointProposalListResponse> {
    return this.proposals.list(authz, query);
  }

  /** Gửi đề xuất mới (`PENDING`). */
  @Post()
  @HttpCode(201)
  @Authorize("route:manage")
  @ApiBody({ type: StopPointProposalInputDto })
  @ZodResponse({ status: 201, description: "Đề xuất đã gửi (PENDING).", type: StopPointProposalResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE` (tỉnh/phường).", content: problemContent })
  create(@Authz() authz: Authorization, @Body() input: StopPointProposalInputDto): Promise<StopPointProposalResponse> {
    return this.proposals.create(authz, input);
  }

  /** Sửa và gửi lại đề xuất đã bị từ chối. */
  @Put(":proposalId")
  @Authorize("route:manage")
  @ApiParam({ name: "proposalId", type: String, format: "uuid" })
  @ApiBody({ type: StopPointProposalInputDto })
  @ZodResponse({ status: 200, description: "Đề xuất đã gửi lại (PENDING).", type: StopPointProposalResponseDto })
  @ApiResponse({ status: 400, description: "Dữ liệu không hợp lệ.", content: problemContent })
  @ApiResponse({ status: 404, description: "`STOP_POINT_PROPOSAL_NOT_FOUND` (kể cả khác tenant).", content: problemContent })
  @ApiResponse({ status: 409, description: "`STOP_POINT_PROPOSAL_STATE_INVALID` (không phải REJECTED).", content: problemContent })
  @ApiResponse({ status: 422, description: "`CATALOG_ITEM_UNAVAILABLE` (tỉnh/phường).", content: problemContent })
  resubmit(
    @Authz() authz: Authorization,
    @Param("proposalId") proposalId: string,
    @Body() input: StopPointProposalInputDto,
  ): Promise<StopPointProposalResponse> {
    return this.proposals.resubmit(authz, proposalId, input);
  }
}
