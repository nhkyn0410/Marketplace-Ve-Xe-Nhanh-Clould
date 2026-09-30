import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { FareStatus, SeatType } from "../../database/prisma.types";
import { InstantSchema } from "../../trip/dto/trip.dto";

/** Trần kỹ thuật một giá ghế (VND) — chặn gõ nhầm thêm số 0; không phải khung giá pháp lý (OQ-17 → ADM-001). */
export const MAX_FARE_PRICE = 100_000_000;
/** Số rule tối đa một bảng giá — đủ cho loại xe × loại chỗ × các dịp trong năm, chặn payload lớn. */
export const MAX_FARE_RULES = 200;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

const FareRuleInputSchema = z
  .object({
    /** `null` = mọi loại xe. */
    vehicleTypeId: z.uuid().nullable(),
    /** `null` = mọi loại chỗ. */
    seatType: z.enum(SeatType).nullable(),
    /** Khung giờ khởi hành `[validFrom, validTo)`; bỏ trống cả hai = giá thường. */
    validFrom: InstantSchema.nullable(),
    validTo: InstantSchema.nullable(),
    /** VND, số nguyên đồng (API §4). */
    price: z.int().min(0).max(MAX_FARE_PRICE),
  })
  .superRefine((rule, ctx) => {
    if ((rule.validFrom === null) !== (rule.validTo === null)) {
      ctx.addIssue({ code: "custom", path: ["validTo"], message: "Khung giờ phải có đủ giờ bắt đầu và giờ kết thúc." });
    } else if (
      rule.validFrom instanceof Date &&
      rule.validTo instanceof Date &&
      rule.validTo.getTime() <= rule.validFrom.getTime()
    ) {
      ctx.addIssue({ code: "custom", path: ["validTo"], message: "Giờ kết thúc phải sau giờ bắt đầu." });
    }
  });
export type FareRuleInput = z.infer<typeof FareRuleInputSchema>;

// Không `.default()`: POST và PUT (thay toàn bộ) phải gửi đủ trường. Trùng phạm vi giữa các rule kiểm ở service để
// trả mã lỗi riêng `FARE_RULES_OVERLAP` (DB EXCLUDE là chốt chặn cuối).
export const FareUpdateInputSchema = z.object({
  status: z.enum(FareStatus),
  note: optionalText(500),
  rules: z.array(FareRuleInputSchema).max(MAX_FARE_RULES),
});
export type FareUpdateInput = z.infer<typeof FareUpdateInputSchema>;
/** Body thay toàn bộ bảng giá (không đổi tuyến). */
export class FareUpdateInputDto extends createZodDto(FareUpdateInputSchema) {}

export const FareCreateInputSchema = FareUpdateInputSchema.extend({ routeId: z.uuid() });
export type FareCreateInput = z.infer<typeof FareCreateInputSchema>;
/** Body tạo bảng giá cho một tuyến (mỗi tuyến một bảng giá). */
export class FareCreateInputDto extends createZodDto(FareCreateInputSchema) {}

/** Query list bảng giá: lọc tuyến/trạng thái, phân trang cursor theo `id`. */
export class FareListQueryDto extends createZodDto(
  z.object({
    routeId: z.uuid().optional(),
    status: z.enum(FareStatus).optional(),
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

/** Query lịch sử giá: mới nhất trước, `cursor` = `createdAt` của dòng cuối trang trước. */
export class FareRevisionQueryDto extends createZodDto(
  z.object({
    cursor: InstantSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

export const FareRuleResponseSchema = z.object({
  vehicleTypeId: z.uuid().nullable(),
  seatType: z.enum(SeatType).nullable(),
  validFrom: z.iso.datetime().nullable(),
  validTo: z.iso.datetime().nullable(),
  price: z.int(),
});
export type FareRuleResponse = z.infer<typeof FareRuleResponseSchema>;

const FareSummaryFields = {
  id: z.uuid(),
  routeId: z.uuid(),
  routeName: z.string(),
  status: z.enum(FareStatus),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export const FareListResponseSchema = z.object({
  items: z.array(z.object({ ...FareSummaryFields, ruleCount: z.int() })),
  nextCursor: z.uuid().nullable(),
});
export type FareListResponse = z.infer<typeof FareListResponseSchema>;
/** Một trang bảng giá (không kèm rule). */
export class FareListResponseDto extends createZodDto(FareListResponseSchema) {}

export const FareResponseSchema = z.object({
  ...FareSummaryFields,
  note: z.string().nullable(),
  rules: z.array(FareRuleResponseSchema),
});
export type FareResponse = z.infer<typeof FareResponseSchema>;
/** Chi tiết bảng giá kèm toàn bộ rule. */
export class FareResponseDto extends createZodDto(FareResponseSchema) {}

/** Bản chụp bảng giá lưu trong audit (lịch sử giá, BR-40). */
export const FareSnapshotSchema = z.object({
  routeId: z.uuid(),
  status: z.enum(FareStatus),
  note: z.string().nullable(),
  rules: z.array(FareRuleResponseSchema),
});
export type FareSnapshot = z.infer<typeof FareSnapshotSchema>;

export const FareRevisionListResponseSchema = z.object({
  items: z.array(
    z.object({
      action: z.enum(["fare.create", "fare.update"]),
      actorId: z.string().nullable(),
      createdAt: z.iso.datetime(),
      before: FareSnapshotSchema.nullable(),
      after: FareSnapshotSchema,
    }),
  ),
  nextCursor: z.iso.datetime().nullable(),
});
export type FareRevisionListResponse = z.infer<typeof FareRevisionListResponseSchema>;
/** Một trang lịch sử thay đổi bảng giá (mới nhất trước). */
export class FareRevisionListResponseDto extends createZodDto(FareRevisionListResponseSchema) {}
