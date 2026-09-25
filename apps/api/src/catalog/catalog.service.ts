import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CatalogStatus } from "../database/prisma.types";
import type {
  AmenityListResponse,
  ProvinceListResponse,
  StopPointListQuery,
  StopPointListResponse,
  VehicleTypeListResponse,
  WardListResponse,
} from "./dto/catalog.dto";

const ACTIVE = CatalogStatus.ACTIVE;

/**
 * Đọc catalog chuẩn Platform cho API công khai (TASK-CAT-001). Chỉ trả item `ACTIVE`.
 * Đọc không cần ngữ cảnh RLS: bảng catalog có policy `public_read`; ghi thuộc ADM-001 (scope platform).
 */
@Injectable()
export class CatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Liệt kê tỉnh/thành đang hoạt động, theo mã. */
  async listProvinces(): Promise<ProvinceListResponse> {
    const items = await this.prisma.province.findMany({
      where: { status: ACTIVE },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    });
    return { items };
  }

  /** Liệt kê phường/xã đang hoạt động của một tỉnh, theo mã. */
  async listWards(provinceId: string): Promise<WardListResponse> {
    const items = await this.prisma.ward.findMany({
      // Tỉnh bị vô hiệu hoá thì ẩn luôn phường của nó (UC-24 bước 6).
      where: { provinceId, status: ACTIVE, province: { status: ACTIVE } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, provinceId: true },
    });
    return { items };
  }

  /**
   * Một trang điểm đón/trả chuẩn đang hoạt động. Cursor = `id` cuối trang trước, lọc `id > cursor`
   * thay vì `cursor`+`skip` của Prisma: `skip: 1` bỏ nhầm một item thật nếu dòng cursor đã bị vô
   * hiệu hoá giữa hai lần gọi.
   */
  async listStopPoints(query: StopPointListQuery): Promise<StopPointListResponse> {
    const rows = await this.prisma.stopPointCatalog.findMany({
      where: {
        status: ACTIVE,
        // Phường/tỉnh bị vô hiệu hoá thì ẩn luôn điểm thuộc nó (UC-24 bước 6).
        ward: { status: ACTIVE, province: { status: ACTIVE } },
        provinceId: query.provinceId,
        wardId: query.wardId,
        type: query.type,
        ...(query.cursor ? { id: { gt: query.cursor } } : {}),
      },
      orderBy: { id: "asc" },
      take: query.limit + 1,
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        provinceId: true,
        wardId: true,
        latitude: true,
        longitude: true,
        description: true,
      },
    });
    const items = rows.slice(0, query.limit);
    const nextCursor = rows.length > query.limit ? items[items.length - 1]!.id : null;
    return { items, nextCursor };
  }

  /** Liệt kê loại phương tiện đang hoạt động, theo mã. */
  async listVehicleTypes(): Promise<VehicleTypeListResponse> {
    const items = await this.prisma.vehicleType.findMany({
      where: { status: ACTIVE },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, description: true },
    });
    return { items };
  }

  /** Liệt kê tiện ích đang hoạt động, theo mã. */
  async listAmenities(): Promise<AmenityListResponse> {
    const items = await this.prisma.amenity.findMany({
      where: { status: ACTIVE },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    });
    return { items };
  }
}
