import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { StopPointProposalStatus, StopPointStatus, StopPointType } from "../../database/prisma.types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

// Không `.default()`: cùng schema cho POST và PUT (thay toàn bộ) — thiếu trường là 400 (bài học TRN-001).
const LocationFields = {
  name: z.string().trim().min(1).max(150),
  type: z.enum(StopPointType),
  address: z.string().trim().min(1).max(300),
  provinceId: z.uuid(),
  wardId: z.uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: optionalText(500),
};

export const StopPointInputSchema = z.object({ ...LocationFields, status: z.enum(StopPointStatus) });
export type StopPointInput = z.infer<typeof StopPointInputSchema>;
// Tên class có tiền tố `Operator`: OpenAPI đặt tên schema theo tên class, trùng với DTO catalog công khai
// (`StopPointListResponseDto`) sẽ ghi đè schema của `/catalog/stop-points` (openapi.spec.ts chặn trùng).
/** Body tạo/thay toàn bộ điểm đón/trả riêng của nhà xe. */
export class OperatorStopPointInputDto extends createZodDto(StopPointInputSchema) {}

export const StopPointProposalInputSchema = z.object(LocationFields);
export type StopPointProposalInput = z.infer<typeof StopPointProposalInputSchema>;
/** Body gửi / sửa-gửi-lại đề xuất đưa điểm vào catalog chuẩn. */
export class StopPointProposalInputDto extends createZodDto(StopPointProposalInputSchema) {}

const pageFields = {
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
/** Query list điểm riêng: lọc trạng thái, phân trang cursor theo `id`. */
export class OperatorStopPointListQueryDto extends createZodDto(
  z.object({ status: z.enum(StopPointStatus).optional(), ...pageFields }),
) {}
/** Query list đề xuất: lọc trạng thái, phân trang cursor theo `id`. */
export class StopPointProposalListQueryDto extends createZodDto(
  z.object({ status: z.enum(StopPointProposalStatus).optional(), ...pageFields }),
) {}

const LocationResponseFields = {
  id: z.uuid(),
  name: z.string(),
  type: z.enum(StopPointType),
  address: z.string(),
  provinceId: z.uuid(),
  wardId: z.uuid(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export const StopPointResponseSchema = z.object({ ...LocationResponseFields, status: z.enum(StopPointStatus) });
export type StopPointResponse = z.infer<typeof StopPointResponseSchema>;
/** Một điểm đón/trả riêng của nhà xe. */
export class OperatorStopPointResponseDto extends createZodDto(StopPointResponseSchema) {}

export const StopPointListResponseSchema = z.object({
  items: z.array(StopPointResponseSchema),
  nextCursor: z.uuid().nullable(),
});
export type StopPointListResponse = z.infer<typeof StopPointListResponseSchema>;
/** Một trang điểm riêng của nhà xe. */
export class OperatorStopPointListResponseDto extends createZodDto(StopPointListResponseSchema) {}

export const StopPointProposalResponseSchema = z.object({
  ...LocationResponseFields,
  status: z.enum(StopPointProposalStatus),
  rejectionReason: z.string().nullable(),
  catalogStopPointId: z.uuid().nullable(),
});
export type StopPointProposalResponse = z.infer<typeof StopPointProposalResponseSchema>;
/** Một đề xuất điểm đón/trả của nhà xe. */
export class StopPointProposalResponseDto extends createZodDto(StopPointProposalResponseSchema) {}

export const StopPointProposalListResponseSchema = z.object({
  items: z.array(StopPointProposalResponseSchema),
  nextCursor: z.uuid().nullable(),
});
export type StopPointProposalListResponse = z.infer<typeof StopPointProposalListResponseSchema>;
/** Một trang đề xuất của nhà xe. */
export class StopPointProposalListResponseDto extends createZodDto(StopPointProposalListResponseSchema) {}
