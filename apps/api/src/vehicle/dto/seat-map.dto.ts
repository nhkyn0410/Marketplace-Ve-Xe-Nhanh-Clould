import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { SeatType } from "../../database/prisma.types";

// Giới hạn đủ cho xe khách (tối đa 2 tầng) và chặn payload quá lớn trên route ghi.
export const MAX_DECKS = 2;
export const MAX_ROWS = 30;
export const MAX_COLUMNS = 10;
export const MAX_SEATS = 100;

const DeckSchema = z.object({
  deck: z.int().min(1).max(MAX_DECKS),
  rows: z.int().min(1).max(MAX_ROWS),
  columns: z.int().min(1).max(MAX_COLUMNS),
});

export const SeatMapLayoutSchema = z.object({
  decks: z.array(DeckSchema).min(1).max(MAX_DECKS),
});
export type SeatMapLayout = z.infer<typeof SeatMapLayoutSchema>;

const SeatSchema = z.object({
  // `pipe`: OpenAPI không công bố regex chữ hoa, client gửi `a1` vẫn hợp lệ (server chuẩn hoá).
  code: z
    .string()
    .max(20)
    .transform((value) => value.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{1,8}$/, "Mã ghế chỉ gồm chữ và số, 1–8 ký tự.")),
  deck: z.int().min(1).max(MAX_DECKS),
  row: z.int().min(1).max(MAX_ROWS),
  column: z.int().min(1).max(MAX_COLUMNS),
  type: z.enum(SeatType),
});

export const SeatMapInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    layout: SeatMapLayoutSchema,
    seats: z.array(SeatSchema).min(1).max(MAX_SEATS),
  })
  .superRefine((input, ctx) => {
    // UC-12 bước 5 / A2: tầng liệt kê theo thứ tự 1, 2; ghế nằm trong lưới, không trùng mã/vị trí.
    if (!input.layout.decks.every((deck, index) => deck.deck === index + 1)) {
      ctx.addIssue({ code: "custom", path: ["layout", "decks"], message: "Tầng phải liệt kê theo thứ tự 1, 2." });
      return;
    }
    const decks = new Map(input.layout.decks.map((deck) => [deck.deck, deck]));
    const codes = new Set<string>();
    const positions = new Set<string>();
    input.seats.forEach((seat, index) => {
      const deck = decks.get(seat.deck);
      if (!deck || seat.row > deck.rows || seat.column > deck.columns) {
        ctx.addIssue({ code: "custom", path: ["seats", index], message: "Ghế nằm ngoài bố cục." });
      }
      if (codes.has(seat.code)) {
        ctx.addIssue({ code: "custom", path: ["seats", index, "code"], message: "Trùng mã ghế." });
      }
      const position = `${seat.deck}:${seat.row}:${seat.column}`;
      if (positions.has(position)) {
        ctx.addIssue({ code: "custom", path: ["seats", index], message: "Hai ghế cùng vị trí." });
      }
      codes.add(seat.code);
      positions.add(position);
    });
  });
export type SeatMapInput = z.infer<typeof SeatMapInputSchema>;
/** Body tạo/thay toàn bộ SeatMap do nhà xe tự cấu hình. */
export class SeatMapInputDto extends createZodDto(SeatMapInputSchema) {}

/** Query list SeatMap: phân trang cursor theo `id`. */
export class SeatMapListQueryDto extends createZodDto(
  z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

const SeatMapSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  seatCount: z.int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const SeatMapListResponseSchema = z.object({
  items: z.array(SeatMapSummarySchema),
  nextCursor: z.uuid().nullable(),
});
export type SeatMapListResponse = z.infer<typeof SeatMapListResponseSchema>;
/** Một trang SeatMap (không kèm ghế). */
export class SeatMapListResponseDto extends createZodDto(SeatMapListResponseSchema) {}

export const SeatMapResponseSchema = SeatMapSummarySchema.extend({
  layout: SeatMapLayoutSchema,
  seats: z.array(
    z.object({
      code: z.string(),
      deck: z.int(),
      row: z.int(),
      column: z.int(),
      type: z.enum(SeatType),
    }),
  ),
});
export type SeatMapResponse = z.infer<typeof SeatMapResponseSchema>;
/** Chi tiết SeatMap kèm bố cục và danh sách ghế. */
export class SeatMapResponseDto extends createZodDto(SeatMapResponseSchema) {}
