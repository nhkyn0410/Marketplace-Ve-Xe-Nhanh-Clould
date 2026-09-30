import { Schema, type HydratedDocument } from "mongoose";
import { applyAppendOnlyGuard } from "./append-only.schema";

export const AUDIT_EVENT_MODEL = "AuditEvent";
export const AUDIT_EVENT_COLLECTION = "audit_event";

export type AuditSnapshot = Record<string, unknown>;

export type AuditEvent = {
  schemaVersion: number;
  actorId?: string;
  actorRole?: string;
  action: string;
  targetType: string;
  targetId: string;
  operatorId?: string;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  reason?: string;
  requestId?: string;
  traceId?: string;
  createdAt: Date;
};

export type AuditEventDocument = HydratedDocument<AuditEvent>;

export const AuditEventSchema = new Schema<AuditEvent>(
  {
    schemaVersion: { type: Number, required: true, default: 1, immutable: true },
    actorId: { type: String, trim: true, immutable: true },
    actorRole: { type: String, trim: true, immutable: true },
    action: { type: String, required: true, trim: true, immutable: true },
    targetType: { type: String, required: true, trim: true, immutable: true },
    targetId: { type: String, required: true, trim: true, immutable: true },
    operatorId: { type: String, trim: true, immutable: true },
    before: { type: Schema.Types.Mixed, immutable: true },
    after: { type: Schema.Types.Mixed, immutable: true },
    reason: { type: String, trim: true, immutable: true },
    requestId: { type: String, trim: true, immutable: true },
    traceId: { type: String, trim: true, immutable: true },
    createdAt: { type: Date, required: true, default: Date.now, immutable: true }
  },
  {
    collection: AUDIT_EVENT_COLLECTION,
    strict: "throw",
    versionKey: false,
    timeseries: { timeField: "createdAt", granularity: "seconds" }
  }
);

AuditEventSchema.index({ actorId: 1, createdAt: -1 });
// Kèm `createdAt` để đọc lịch sử một đối tượng mới nhất trước không phải sort trong bộ nhớ (lịch sử giá TRN-005).
AuditEventSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AuditEventSchema.index({ operatorId: 1, createdAt: -1 });
applyAppendOnlyGuard(AuditEventSchema);
