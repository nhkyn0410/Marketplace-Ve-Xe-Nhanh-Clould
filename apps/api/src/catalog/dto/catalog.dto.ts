import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { StopPointType } from "../../database/prisma.types";

/** Query `GET /catalog/wards`: phường/xã phải thuộc một tỉnh cụ thể. */
export class WardListQueryDto extends createZodDto(z.object({ provinceId: z.uuid() })) {}

export const StopPointListQuerySchema = z.object({
  provinceId: z.uuid().optional(),
  wardId: z.uuid().optional(),
  type: z.enum(StopPointType).optional(),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type StopPointListQuery = z.infer<typeof StopPointListQuerySchema>;
/** Query `GET /catalog/stop-points`: lọc theo tỉnh/phường/loại, phân trang cursor theo `id`. */
export class StopPointListQueryDto extends createZodDto(StopPointListQuerySchema) {}

// Response chỉ chứa field công khai (Security §6 "Public catalog"): không status, không timestamp.
// ZodSerializerInterceptor cắt field thừa nếu service lỡ trả thêm.

export const ProvinceListResponseSchema = z.object({
  items: z.array(z.object({ id: z.uuid(), code: z.string(), name: z.string() })),
});
export type ProvinceListResponse = z.infer<typeof ProvinceListResponseSchema>;
/** Danh sách tỉnh/thành công khai. */
export class ProvinceListResponseDto extends createZodDto(ProvinceListResponseSchema) {}

export const WardListResponseSchema = z.object({
  items: z.array(
    z.object({ id: z.uuid(), code: z.string(), name: z.string(), provinceId: z.uuid() }),
  ),
});
export type WardListResponse = z.infer<typeof WardListResponseSchema>;
/** Danh sách phường/xã công khai của một tỉnh. */
export class WardListResponseDto extends createZodDto(WardListResponseSchema) {}

export const StopPointListResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      type: z.enum(StopPointType),
      address: z.string(),
      provinceId: z.uuid(),
      wardId: z.uuid(),
      latitude: z.number(),
      longitude: z.number(),
      description: z.string().nullable(),
    }),
  ),
  nextCursor: z.uuid().nullable(),
});
export type StopPointListResponse = z.infer<typeof StopPointListResponseSchema>;
/** Một trang điểm đón/trả chuẩn công khai. */
export class StopPointListResponseDto extends createZodDto(StopPointListResponseSchema) {}

export const VehicleTypeListResponseSchema = z.object({
  items: z.array(
    z.object({ id: z.uuid(), code: z.string(), name: z.string(), description: z.string().nullable() }),
  ),
});
export type VehicleTypeListResponse = z.infer<typeof VehicleTypeListResponseSchema>;
/** Danh sách loại phương tiện chuẩn công khai. */
export class VehicleTypeListResponseDto extends createZodDto(VehicleTypeListResponseSchema) {}

export const AmenityListResponseSchema = z.object({
  items: z.array(z.object({ id: z.uuid(), code: z.string(), name: z.string() })),
});
export type AmenityListResponse = z.infer<typeof AmenityListResponseSchema>;
/** Danh sách tiện ích chuẩn công khai. */
export class AmenityListResponseDto extends createZodDto(AmenityListResponseSchema) {}
