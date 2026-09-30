import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RouteStopRole, SeatType, TripSeatStatus, TripStatus } from "../../database/prisma.types";
import { MAX_ROUTE_STOPS } from "../../route/dto/route.dto";

/** Một chuyến dài tối đa 7 ngày — chặn gõ nhầm năm làm xe "bận" cả năm (BR-14 chặn chồng giờ). */
export const MAX_TRIP_DURATION_MS = 7 * 24 * 3_600_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

// Nhận ISO 8601 có múi giờ (vd `+07:00`) hoặc `Z`; lưu UTC. Chặn năm UTC > 9999 (vd `9999-12-31T23:00-07:00`):
// `toISOString()` khi đó ra `+010000-…`, response schema từ chối → GET/list của tenant trả 500.
/** Giờ vào API: ISO 8601 có múi giờ → `Date` UTC, năm ≤ 9999 (dùng chung cho trip và fare). */
export const InstantSchema = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value))
  .refine((date) => date.getUTCFullYear() <= 9999, "Năm phải từ 9999 trở xuống.");
const instant = InstantSchema;

// Không `.default()`: POST và PUT (thay toàn bộ) phải gửi đủ trường. Trạng thái không nằm trong body —
// TRN-003 chỉ tạo/sửa chuyến `DRAFT`; mở bán/khoá/huỷ thuộc TRN-006.
export const TripInputSchema = z
  .object({
    routeId: z.uuid(),
    /** Để trống khi chưa gắn xe (Q3); bắt buộc lúc mở bán (TRN-006). */
    vehicleId: z.uuid().nullable(),
    departureAt: instant,
    arrivalAt: instant,
    /**
     * Giờ dự kiến tại từng điểm theo thứ tự route. `null` = tự chia khoảng [giờ đi, giờ đến] theo tỉ lệ
     * thời gian chặng đã lưu của route. Nếu gửi: điểm đầu = giờ đi, điểm cuối = giờ đến, không giảm dần.
     */
    stopTimes: z.array(instant).min(2).max(MAX_ROUTE_STOPS).nullable(),
    note: optionalText(500),
  })
  .superRefine((input, ctx) => {
    // Zod 4 vẫn chạy refine khi một field datetime sai định dạng (giá trị còn là chuỗi, chưa transform) —
    // lỗi định dạng đã được báo, bỏ qua phần so sánh giờ.
    const times = input.stopTimes;
    if (!(input.departureAt instanceof Date) || !(input.arrivalAt instanceof Date)) {
      return;
    }
    const departure = input.departureAt.getTime();
    const arrival = input.arrivalAt.getTime();
    if (departure <= Date.now()) {
      ctx.addIssue({ code: "custom", path: ["departureAt"], message: "Giờ khởi hành phải ở tương lai." });
    }
    if (arrival <= departure) {
      ctx.addIssue({ code: "custom", path: ["arrivalAt"], message: "Giờ đến phải sau giờ khởi hành." });
    } else if (arrival - departure > MAX_TRIP_DURATION_MS) {
      ctx.addIssue({ code: "custom", path: ["arrivalAt"], message: "Chuyến dài quá 7 ngày." });
    }
    if (times && times.every((time) => time instanceof Date)) {
      if (times[0]!.getTime() !== departure || times[times.length - 1]!.getTime() !== arrival) {
        ctx.addIssue({ code: "custom", path: ["stopTimes"], message: "Điểm đầu/cuối phải trùng giờ đi/giờ đến." });
      }
      times.forEach((time, index) => {
        if (index > 0 && time.getTime() < times[index - 1]!.getTime()) {
          ctx.addIssue({ code: "custom", path: ["stopTimes", index], message: "Giờ tại các điểm không được giảm dần." });
        }
      });
    }
  });
export type TripInput = z.infer<typeof TripInputSchema>;
/** Body tạo/thay toàn bộ chuyến `DRAFT`: route, xe (tuỳ chọn), giờ đi/đến, giờ từng điểm (tuỳ chọn). */
export class TripInputDto extends createZodDto(TripInputSchema) {}

/** Query list chuyến: lọc route/xe/trạng thái/khoảng giờ đi, sắp theo giờ đi, cursor = id chuyến cuối trang. */
export class TripListQueryDto extends createZodDto(
  z.object({
    routeId: z.uuid().optional(),
    vehicleId: z.uuid().optional(),
    status: z.enum(TripStatus).optional(),
    departureFrom: instant.optional(),
    departureTo: instant.optional(),
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

const TripSummaryFields = {
  id: z.uuid(),
  routeId: z.uuid(),
  routeName: z.string(),
  vehicleId: z.uuid().nullable(),
  vehiclePlateNumber: z.string().nullable(),
  departureAt: z.iso.datetime(),
  arrivalAt: z.iso.datetime(),
  status: z.enum(TripStatus),
  seatCount: z.int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export const TripListResponseSchema = z.object({
  items: z.array(z.object(TripSummaryFields)),
  nextCursor: z.uuid().nullable(),
});
export type TripListResponse = z.infer<typeof TripListResponseSchema>;
/** Một trang chuyến (không kèm điểm dừng và ghế). */
export class TripListResponseDto extends createZodDto(TripListResponseSchema) {}

export const TripResponseSchema = z.object({
  ...TripSummaryFields,
  note: z.string().nullable(),
  stops: z.array(
    z.object({
      sequence: z.int(),
      role: z.enum(RouteStopRole),
      catalogStopPointId: z.uuid().nullable(),
      stopPointId: z.uuid().nullable(),
      name: z.string(),
      address: z.string(),
      plannedAt: z.iso.datetime(),
      note: z.string().nullable(),
    }),
  ),
  seats: z.array(
    z.object({
      code: z.string(),
      deck: z.int(),
      row: z.int(),
      column: z.int(),
      type: z.enum(SeatType),
      status: z.enum(TripSeatStatus),
      /** Giá (VND, số nguyên đồng) theo bảng giá của tuyến + loại xe đang gắn; `null` khi chưa xác định (TRN-005). */
      price: z.int().nullable(),
    }),
  ),
});
export type TripResponse = z.infer<typeof TripResponseSchema>;
/** Chi tiết chuyến kèm điểm dừng (giờ dự kiến) và ghế theo chuyến. */
export class TripResponseDto extends createZodDto(TripResponseSchema) {}
