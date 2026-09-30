import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string().datetime()
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const PostgresHealthResponseSchema = HealthResponseSchema.extend({
  service: z.literal("postgres")
});

export type PostgresHealthResponse = z.infer<typeof PostgresHealthResponseSchema>;

export const MongoHealthResponseSchema = HealthResponseSchema.extend({
  service: z.literal("mongo")
});

export type MongoHealthResponse = z.infer<typeof MongoHealthResponseSchema>;

export const RedisHealthResponseSchema = HealthResponseSchema.extend({
  service: z.literal("redis")
});

export type RedisHealthResponse = z.infer<typeof RedisHealthResponseSchema>;

export const QueueHealthResponseSchema = z.object({
  status: z.literal("ok"),
  queues: z.array(
    z.object({
      name: z.string(),
      counts: z.record(z.string(), z.number().int().nonnegative())
    })
  ),
  timestamp: z.string().datetime()
});

export type QueueHealthResponse = z.infer<typeof QueueHealthResponseSchema>;

export const ProblemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string(),
  instance: z.string(),
  code: z.string(),
  /** Member mở rộng RFC 7807: mọi nguyên nhân khi một lỗi có nhiều (vd điều kiện mở bán chưa đạt — API §6.2). */
  reasons: z.array(z.string()).optional(),
  requestId: z.string().optional(),
  traceId: z.string().optional()
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
