import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const SessionListQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type SessionListQuery = z.infer<typeof SessionListQuerySchema>;
export class SessionListQueryDto extends createZodDto(SessionListQuerySchema) {}

export const SessionItemSchema = z.object({
  /** Public resource id: một login/device family, KHÔNG phải row id (`sid`) của refresh rotation. */
  sessionId: z.uuid(),
  current: z.boolean(),
  deviceLabel: z.string(),
  /** Luôn đã mask; null khi login không có IP hợp lệ. */
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});
export type SessionItem = z.infer<typeof SessionItemSchema>;

export const SessionListResponseSchema = z.object({
  items: z.array(SessionItemSchema),
  nextCursor: z.string().nullable(),
});
export type SessionListResponse = z.infer<typeof SessionListResponseSchema>;
export class SessionListResponseDto extends createZodDto(
  SessionListResponseSchema,
) {}

const SessionCursorSchema = z.object({
  v: z.literal(1),
  /** PostgreSQL timestamp ở độ chính xác microsecond; giữ dạng chuỗi để JS không làm tròn Date. */
  sortMicros: z.string().regex(/^\d{1,19}$/).refine((value) => BigInt(value) <= 9223372036854775807n),
  sessionId: z.uuid(),
});

export type SessionCursor = z.infer<typeof SessionCursorSchema>;

export function encodeSessionCursor(cursor: Omit<SessionCursor, "v">): string {
  return Buffer.from(JSON.stringify({ v: 1, ...cursor }), "utf8").toString(
    "base64url",
  );
}

export function decodeSessionCursor(value: string | undefined): SessionCursor | null {
  if (!value) {
    return null;
  }
  try {
    return SessionCursorSchema.parse(
      JSON.parse(Buffer.from(value, "base64url").toString("utf8")),
    );
  } catch {
    return null;
  }
}
