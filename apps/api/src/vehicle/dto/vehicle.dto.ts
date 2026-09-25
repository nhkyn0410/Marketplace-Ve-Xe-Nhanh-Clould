import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { VehicleStatus } from "../../database/prisma.types";

/**
 * Biển số chuẩn hoá trước khi lưu và so trùng (giả định A1): `51b-123.45` → `51B12345`. Nhờ vậy cách
 * gõ khác nhau không lọt qua unique `(operator_id, plate_number)`. `pipe` để OpenAPI chỉ công bố phía
 * input (chuỗi ≤ 20), không công bố regex dạng đã chuẩn hoá — client sinh từ spec vẫn gửi được `51B-123.45`.
 */
export const PlateNumberSchema = z
  .string()
  .max(20)
  .transform((value) => value.toUpperCase().replace(/[\s.-]/g, ""))
  .pipe(z.string().regex(/^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/, "Biển số không hợp lệ (ví dụ 51B-123.45)."));

// Không `.default()`: cùng schema cho POST và PUT (thay toàn bộ) — client bỏ sót trường thì 400, thay vì
// lặng lẽ đưa xe MAINTENANCE về ACTIVE, gỡ SeatMap hay xoá hết tiện ích.
export const VehicleInputSchema = z.object({
  plateNumber: PlateNumberSchema,
  vehicleTypeId: z.uuid(),
  seatMapId: z.uuid().nullable(),
  amenityIds: z
    .array(z.uuid())
    .max(30)
    .refine((ids) => new Set(ids).size === ids.length, "Tiện ích bị lặp."),
  status: z.enum(VehicleStatus),
  description: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .transform((value) => value || null),
});
export type VehicleInput = z.infer<typeof VehicleInputSchema>;
/** Body tạo/thay toàn bộ Vehicle. */
export class VehicleInputDto extends createZodDto(VehicleInputSchema) {}

/** Query list Vehicle: lọc trạng thái, phân trang cursor theo `id`. */
export class VehicleListQueryDto extends createZodDto(
  z.object({
    status: z.enum(VehicleStatus).optional(),
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

export const VehicleResponseSchema = z.object({
  id: z.uuid(),
  plateNumber: z.string(),
  vehicleTypeId: z.uuid(),
  seatMapId: z.uuid().nullable(),
  amenityIds: z.array(z.uuid()),
  status: z.enum(VehicleStatus),
  description: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type VehicleResponse = z.infer<typeof VehicleResponseSchema>;
/** Một Vehicle của nhà xe. */
export class VehicleResponseDto extends createZodDto(VehicleResponseSchema) {}

export const VehicleListResponseSchema = z.object({
  items: z.array(VehicleResponseSchema),
  nextCursor: z.uuid().nullable(),
});
export type VehicleListResponse = z.infer<typeof VehicleListResponseSchema>;
/** Một trang Vehicle của nhà xe. */
export class VehicleListResponseDto extends createZodDto(VehicleListResponseSchema) {}
