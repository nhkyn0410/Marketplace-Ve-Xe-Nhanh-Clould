import { Inject, Injectable } from "@nestjs/common";
import { PrismaService, type DbTransaction } from "../database/prisma.service";
import type { Authorization } from "../iam/role/authorization";
import { isPrismaUniqueConflict } from "../iam/user/account.errors";
import type {
  SeatMapInput,
  SeatMapLayout,
  SeatMapListResponse,
  SeatMapResponse,
} from "./dto/seat-map.dto";
import { requireTenant } from "../iam/role/require-tenant";
import { seatMapNameConflict, seatMapNotFound } from "./vehicle.errors";

const SUMMARY_SELECT = { id: true, name: true, seatCount: true, createdAt: true, updatedAt: true } as const;
const SEAT_SELECT = { code: true, deck: true, row: true, column: true, type: true } as const;
const SEAT_ORDER = [{ deck: "asc" }, { row: "asc" }, { column: "asc" }] as const;

type SummaryRow = { id: string; name: string; seatCount: number; createdAt: Date; updatedAt: Date };
type DetailRow = SummaryRow & {
  layout: unknown;
  seats: SeatMapResponse["seats"];
};

/**
 * Sơ đồ ghế do nhà xe tự cấu hình (TASK-TRN-001, Q1): mẫu dùng chung cho nhiều xe; tùy chỉnh cho một
 * xe = tạo SeatMap mới từ bản sao. Mọi truy vấn lọc `operatorId` tường minh + chạy trong scope tenant (RLS).
 */
@Injectable()
export class SeatMapService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Liệt kê SeatMap của nhà xe (không kèm ghế), phân trang theo `id`. */
  async list(authz: Authorization, query: { cursor?: string; limit: number }): Promise<SeatMapListResponse> {
    const { db, operatorId } = requireTenant(authz);
    const rows = await this.prisma.withScope(db, (tx) =>
      tx.seatMap.findMany({
        where: { operatorId, ...(query.cursor ? { id: { gt: query.cursor } } : {}) },
        orderBy: { id: "asc" },
        take: query.limit + 1,
        select: SUMMARY_SELECT,
      }),
    );
    const page = rows.slice(0, query.limit);
    return {
      items: page.map(toSummary),
      nextCursor: rows.length > query.limit ? page[page.length - 1]!.id : null,
    };
  }

  /** Chi tiết một SeatMap kèm ghế; khác tenant trả 404 như không tồn tại. */
  async get(authz: Authorization, seatMapId: string): Promise<SeatMapResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.prisma.withScope(db, (tx) => findDetail(tx, operatorId, seatMapId));
    if (!row) {
      throw seatMapNotFound();
    }
    return toDetail(row);
  }

  /** Tạo SeatMap; bố cục đã được Zod kiểm (trong lưới, không trùng mã/vị trí). */
  async create(authz: Authorization, input: SeatMapInput): Promise<SeatMapResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withNameConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const created = await tx.seatMap.create({
          data: { operatorId, name: input.name, layout: input.layout, seatCount: input.seats.length },
          select: { id: true },
        });
        await tx.seat.createMany({ data: seatRows(input, operatorId, created.id) });
        // Đọc lại trong CÙNG transaction: lỗi đọc sau commit sẽ báo 500 cho lệnh ghi đã thành công.
        return findDetail(tx, operatorId, created.id);
      }),
    );
    return toDetail(row!);
  }

  /**
   * Thay toàn bộ tên, bố cục và ghế trong MỘT transaction: lỗi giữa chừng thì ghế cũ còn nguyên.
   * TRN-003 phải chặn thao tác này khi SeatMap đã được chuyến dùng (UC-12 A3).
   */
  async update(authz: Authorization, seatMapId: string, input: SeatMapInput): Promise<SeatMapResponse> {
    const { db, operatorId } = requireTenant(authz);
    const row = await this.withNameConflict(() =>
      this.prisma.withScope(db, async (tx) => {
        const updated = await tx.seatMap.updateMany({
          where: { id: seatMapId, operatorId },
          data: { name: input.name, layout: input.layout, seatCount: input.seats.length },
        });
        if (updated.count === 0) {
          throw seatMapNotFound();
        }
        await tx.seat.deleteMany({ where: { seatMapId, operatorId } });
        await tx.seat.createMany({ data: seatRows(input, operatorId, seatMapId) });
        return findDetail(tx, operatorId, seatMapId);
      }),
    );
    return toDetail(row!);
  }

  private async withNameConflict<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      // Ghế trùng mã/vị trí đã bị Zod chặn → unique còn lại chỉ có thể là tên trong tenant.
      if (isPrismaUniqueConflict(error)) {
        throw seatMapNameConflict();
      }
      throw error;
    }
  }
}

function findDetail(tx: DbTransaction, operatorId: string, seatMapId: string) {
  return tx.seatMap.findFirst({
    where: { id: seatMapId, operatorId },
    select: { ...SUMMARY_SELECT, layout: true, seats: { select: SEAT_SELECT, orderBy: [...SEAT_ORDER] } },
  });
}

// Liệt kê từng field thay vì `...seat`: không phụ thuộc Zod strip để chặn client chèn `id`/`operatorId`.
function seatRows(input: SeatMapInput, operatorId: string, seatMapId: string) {
  return input.seats.map(({ code, deck, row, column, type }) => ({
    operatorId,
    seatMapId,
    code,
    deck,
    row,
    column,
    type,
  }));
}

function toSummary(row: SummaryRow) {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

function toDetail(row: DetailRow): SeatMapResponse {
  return { ...toSummary(row), layout: row.layout as SeatMapLayout, seats: row.seats };
}
