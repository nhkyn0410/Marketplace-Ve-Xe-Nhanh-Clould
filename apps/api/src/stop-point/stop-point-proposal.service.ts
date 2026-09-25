import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { StopPointProposalStatus } from "../database/prisma.types";
import type { Authorization } from "../iam/role/authorization";
import { requireTenant } from "../iam/role/require-tenant";
import type {
  StopPointProposalInput,
  StopPointProposalListResponse,
  StopPointProposalResponse,
} from "./dto/stop-point.dto";
import { stopPointProposalNotFound, stopPointProposalStateInvalid } from "./stop-point.errors";
import { assertActiveLocation, withIsoDates } from "./stop-point.service";

const PROPOSAL_SELECT = {
  id: true,
  name: true,
  type: true,
  address: true,
  provinceId: true,
  wardId: true,
  latitude: true,
  longitude: true,
  description: true,
  status: true,
  rejectionReason: true,
  catalogStopPointId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Đề xuất đưa điểm vào catalog chuẩn (FR-OPS-05, UC-13 bước 7–8, Q1). Operator chỉ tạo bản `PENDING` và
 * sửa-gửi-lại bản `REJECTED`; duyệt/từ chối là việc của Admin (ADM-001). RLS của bảng cũng khoá đúng các
 * chuyển trạng thái này cho scope tenant — service có bug cũng không tự duyệt được.
 */
@Injectable()
export class StopPointProposalService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Liệt kê đề xuất của nhà xe, lọc trạng thái, phân trang theo `id`. */
  async list(
    authz: Authorization,
    query: { status?: StopPointProposalStatus; cursor?: string; limit: number },
  ): Promise<StopPointProposalListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.stopPointProposal.findMany({
        where: { operatorId, status: query.status, ...(query.cursor ? { id: { gt: query.cursor } } : {}) },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        select: PROPOSAL_SELECT,
      }),
    );
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(withIsoDates),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Gửi đề xuất mới ở trạng thái `PENDING`. */
  async create(authz: Authorization, input: StopPointProposalInput): Promise<StopPointProposalResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, async (tx) => {
      await assertActiveLocation(tx, input);
      return tx.stopPointProposal.create({
        data: { ...toData(input), operatorId, status: StopPointProposalStatus.PENDING },
        select: PROPOSAL_SELECT,
      });
    });
    return withIsoDates(row);
  }

  /** Sửa và gửi lại đề xuất bị từ chối: `REJECTED` → `PENDING`, xoá lý do cũ; trạng thái khác → 409. */
  async resubmit(
    authz: Authorization,
    proposalId: string,
    input: StopPointProposalInput,
  ): Promise<StopPointProposalResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, async (tx) => {
      await assertActiveLocation(tx, input);
      // Điều kiện trạng thái nằm trong câu UPDATE (compare-and-set): hai lần gửi lại đồng thời chỉ một lần thắng.
      const updated = await tx.stopPointProposal.updateMany({
        where: { id: proposalId, operatorId, status: StopPointProposalStatus.REJECTED },
        data: { ...toData(input), status: StopPointProposalStatus.PENDING, rejectionReason: null },
      });
      if (updated.count === 0) {
        const exists = await tx.stopPointProposal.findFirst({ where: { id: proposalId, operatorId }, select: { id: true } });
        throw exists ? stopPointProposalStateInvalid() : stopPointProposalNotFound();
      }
      return tx.stopPointProposal.findFirstOrThrow({ where: { id: proposalId, operatorId }, select: PROPOSAL_SELECT });
    });
    return withIsoDates(row);
  }
}

// Liệt kê từng field: client không đặt được `status`, `catalogStopPointId`, `rejectionReason`, `operatorId`.
function toData(input: StopPointProposalInput) {
  return {
    name: input.name,
    type: input.type,
    address: input.address,
    provinceId: input.provinceId,
    wardId: input.wardId,
    latitude: input.latitude,
    longitude: input.longitude,
    description: input.description,
  };
}
