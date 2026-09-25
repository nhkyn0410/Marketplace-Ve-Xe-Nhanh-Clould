import { Inject, Injectable } from "@nestjs/common";
import { PrismaService, type DbTransaction } from "../database/prisma.service";
import { CatalogStatus, type VehicleStatus } from "../database/prisma.types";
import type { Authorization } from "../iam/role/authorization";
import { isPrismaUniqueConflict } from "../iam/user/account.errors";
import type { VehicleInput, VehicleListResponse, VehicleResponse } from "./dto/vehicle.dto";
import { catalogItemUnavailable } from "../catalog/catalog.errors";
import { requireTenant } from "../iam/role/require-tenant";
import { seatMapNotFound, vehicleNotFound, vehiclePlateConflict } from "./vehicle.errors";

const VEHICLE_SELECT = {
  id: true,
  plateNumber: true,
  vehicleTypeId: true,
  seatMapId: true,
  status: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  amenities: { select: { amenityId: true }, orderBy: { amenityId: "asc" } },
} as const;

type VehicleRow = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  seatMapId: string | null;
  status: VehicleStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  amenities: { amenityId: string }[];
};

/**
 * Đội xe của nhà xe (TASK-TRN-001, FR-OPS-01..02). Mọi truy vấn lọc `operatorId` tường minh + chạy
 * trong scope tenant (RLS). Loại xe/tiện ích MỚI gán phải đang `ACTIVE` trong catalog (FK chấp nhận cả
 * INACTIVE); xe cũ giữ nguyên item đã bị vô hiệu hoá vẫn sửa được các trường khác.
 */
@Injectable()
export class VehicleService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Liệt kê xe của nhà xe, lọc trạng thái, phân trang theo `id`. */
  async list(
    authz: Authorization,
    query: { status?: VehicleStatus; cursor?: string; limit: number },
  ): Promise<VehicleListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.vehicle.findMany({
        where: {
          operatorId,
          status: query.status,
          ...(query.cursor ? { id: { gt: query.cursor } } : {}),
        },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        select: VEHICLE_SELECT,
      }),
    );
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(toResponse),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Chi tiết một xe; khác tenant trả 404 như không tồn tại. */
  async get(authz: Authorization, vehicleId: string): Promise<VehicleResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, (tx) =>
      tx.vehicle.findFirst({ where: { id: vehicleId, operatorId }, select: VEHICLE_SELECT }),
    );
    if (!row) {
      throw vehicleNotFound();
    }
    return toResponse(row);
  }

  /** Tạo xe; kiểm catalog và SeatMap cùng tenant trong cùng transaction với lệnh ghi. */
  async create(authz: Authorization, input: VehicleInput): Promise<VehicleResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withPlateConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        await assertReferences(tx, operatorId, input, { vehicleTypeId: null, amenityIds: [] });
        return tx.vehicle.create({
          data: {
            operatorId,
            plateNumber: input.plateNumber,
            vehicleTypeId: input.vehicleTypeId,
            seatMapId: input.seatMapId,
            status: input.status,
            description: input.description,
            amenities: { create: input.amenityIds.map((amenityId) => ({ amenityId })) },
          },
          select: VEHICLE_SELECT,
        });
      }),
    );
    return toResponse(row);
  }

  /** Thay toàn bộ thông tin xe (kể cả danh sách tiện ích) trong một transaction. */
  async update(authz: Authorization, vehicleId: string, input: VehicleInput): Promise<VehicleResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withPlateConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const current = await tx.vehicle.findFirst({
          where: { id: vehicleId, operatorId },
          select: { vehicleTypeId: true, amenities: { select: { amenityId: true } } },
        });
        if (!current) {
          throw vehicleNotFound();
        }
        await assertReferences(tx, operatorId, input, {
          vehicleTypeId: current.vehicleTypeId,
          amenityIds: current.amenities.map((amenity) => amenity.amenityId),
        });
        // Ghi dòng xe TRƯỚC khi đụng tiện ích: lệnh này khoá dòng, nên hai PUT đồng thời trên cùng xe
        // xếp hàng ở đây; `deleteMany` của lệnh sau thấy tiện ích lệnh trước đã ghi → bản sau thắng
        // trọn vẹn (A4), không trộn hai danh sách.
        await tx.vehicle.update({
          where: { id_operatorId: { id: vehicleId, operatorId } },
          data: {
            plateNumber: input.plateNumber,
            vehicleTypeId: input.vehicleTypeId,
            seatMapId: input.seatMapId,
            status: input.status,
            description: input.description,
          },
        });
        await tx.vehicleAmenity.deleteMany({ where: { vehicleId, operatorId } });
        await tx.vehicleAmenity.createMany({
          data: input.amenityIds.map((amenityId) => ({ vehicleId, amenityId, operatorId })),
        });
        return tx.vehicle.findFirstOrThrow({ where: { id: vehicleId, operatorId }, select: VEHICLE_SELECT });
      }),
    );
    return toResponse(row);
  }

  private async withPlateConflict<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      // Tiện ích lặp đã bị Zod chặn → unique còn lại chỉ có thể là biển số trong tenant.
      if (isPrismaUniqueConflict(error)) {
        throw vehiclePlateConflict();
      }
      throw error;
    }
  }
}

/**
 * Loại xe/tiện ích MỚI phải đang ACTIVE; SeatMap phải thuộc đúng tenant (FK ghép cũng chặn, nhưng
 * kiểm trước để trả 404 rõ ràng thay vì lỗi FK). `kept` = item xe đang có, được giữ dù đã INACTIVE.
 */
async function assertReferences(
  tx: DbTransaction,
  operatorId: string,
  input: VehicleInput,
  kept: { vehicleTypeId: string | null; amenityIds: string[] },
): Promise<void> {
  if (input.vehicleTypeId !== kept.vehicleTypeId) {
    const type = await tx.vehicleType.findFirst({
      where: { id: input.vehicleTypeId, status: CatalogStatus.ACTIVE },
      select: { id: true },
    });
    if (!type) {
      throw catalogItemUnavailable();
    }
  }
  const added = input.amenityIds.filter((id) => !kept.amenityIds.includes(id));
  if (added.length > 0) {
    const active = await tx.amenity.count({ where: { id: { in: added }, status: CatalogStatus.ACTIVE } });
    if (active !== added.length) {
      throw catalogItemUnavailable();
    }
  }
  if (input.seatMapId) {
    const seatMap = await tx.seatMap.findFirst({ where: { id: input.seatMapId, operatorId }, select: { id: true } });
    if (!seatMap) {
      throw seatMapNotFound();
    }
  }
}

function toResponse(row: VehicleRow): VehicleResponse {
  const { amenities, ...vehicle } = row;
  return {
    ...vehicle,
    amenityIds: amenities.map((amenity) => amenity.amenityId),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
