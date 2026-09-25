import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { RouteStatus, RouteStopRole, RoutingMetricsSource } from "../../database/prisma.types";

/** Giới hạn điểm/route: đủ cho tuyến liên tỉnh, chặn payload và số lần gọi Goong (mỗi chặng một lần). */
export const MAX_ROUTE_STOPS = 25;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

const RouteStopInputSchema = z
  .object({
    catalogStopPointId: z.uuid().nullable(),
    stopPointId: z.uuid().nullable(),
    note: optionalText(300),
  })
  .refine(
    (stop) => (stop.catalogStopPointId === null) !== (stop.stopPointId === null),
    "Mỗi điểm chọn đúng một nguồn: catalog hoặc điểm riêng.",
  );

// Không `.default()`: POST và PUT (thay toàn bộ) phải gửi đủ trường. Vai trò điểm suy từ vị trí (Q3).
export const RouteInputSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    status: z.enum(RouteStatus),
    note: optionalText(500),
    stops: z.array(RouteStopInputSchema).min(2).max(MAX_ROUTE_STOPS),
  })
  .superRefine((input, ctx) => {
    // UC-13 bước 5: không vòng lặp — một điểm không xuất hiện hai lần (kéo theo đầu ≠ cuối).
    const seen = new Set<string>();
    input.stops.forEach((stop, index) => {
      const key = stop.catalogStopPointId ? `catalog:${stop.catalogStopPointId}` : `private:${stop.stopPointId}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["stops", index], message: "Điểm bị lặp trong route." });
      }
      seen.add(key);
    });
  });
export type RouteInput = z.infer<typeof RouteInputSchema>;
/** Body tạo/thay toàn bộ route: danh sách điểm theo thứ tự hành trình. */
export class RouteInputDto extends createZodDto(RouteInputSchema) {}

/** Query list route: lọc trạng thái, phân trang cursor theo `id`. */
export class RouteListQueryDto extends createZodDto(
  z.object({
    status: z.enum(RouteStatus).optional(),
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
) {}

const RouteSummaryFields = {
  id: z.uuid(),
  name: z.string(),
  status: z.enum(RouteStatus),
  totalDistanceMeters: z.int(),
  totalDurationSeconds: z.int(),
  metricsSource: z.enum(RoutingMetricsSource),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};

export const RouteListResponseSchema = z.object({
  items: z.array(z.object({ ...RouteSummaryFields, stopCount: z.int() })),
  nextCursor: z.uuid().nullable(),
});
export type RouteListResponse = z.infer<typeof RouteListResponseSchema>;
/** Một trang route (không kèm điểm dừng). */
export class RouteListResponseDto extends createZodDto(RouteListResponseSchema) {}

export const RouteResponseSchema = z.object({
  ...RouteSummaryFields,
  note: z.string().nullable(),
  stops: z.array(
    z.object({
      sequence: z.int(),
      role: z.enum(RouteStopRole),
      catalogStopPointId: z.uuid().nullable(),
      stopPointId: z.uuid().nullable(),
      name: z.string(),
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      note: z.string().nullable(),
      distanceMetersFromPrevious: z.int().nullable(),
      durationSecondsFromPrevious: z.int().nullable(),
    }),
  ),
});
export type RouteResponse = z.infer<typeof RouteResponseSchema>;
/** Chi tiết route kèm điểm dừng theo thứ tự và số liệu từng chặng. */
export class RouteResponseDto extends createZodDto(RouteResponseSchema) {}
