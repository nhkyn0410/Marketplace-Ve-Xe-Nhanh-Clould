import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { getRequestId } from "../common/observability/request-context";
import { getCurrentTraceId } from "../common/observability/tracing";
import { AUDIT_EVENT_MODEL, type AuditEvent, type AuditEventDocument } from "./audit-event.schema";
import { SYSTEM_LOG_MODEL, type SystemLog, type SystemLogDocument } from "./system-log.schema";

export type AuditEventInput = Omit<AuditEvent, "schemaVersion" | "createdAt"> & {
  createdAt?: Date;
};

export type SystemLogInput = Omit<SystemLog, "schemaVersion" | "createdAt"> & {
  createdAt?: Date;
};

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AUDIT_EVENT_MODEL)
    private readonly auditEventModel: Model<AuditEventDocument>,
    @InjectModel(SYSTEM_LOG_MODEL)
    private readonly systemLogModel: Model<SystemLogDocument>
  ) {}

  async recordAuditEvent(input: AuditEventInput): Promise<void> {
    await this.auditEventModel.create({
      ...withCorrelation(input),
      schemaVersion: 1,
      createdAt: input.createdAt ?? new Date()
    });
  }

  /**
   * Đọc audit event của một đối tượng trong một tenant, mới nhất trước — dùng cho lịch sử hiển thị (vd lịch sử giá,
   * BR-40). Chỉ đọc; nơi gọi phải kiểm đối tượng thuộc tenant trước (Mongo không có RLS).
   */
  async listAuditEvents(query: {
    targetType: string;
    targetId: string;
    operatorId: string;
    before?: Date;
    limit: number;
  }): Promise<AuditEvent[]> {
    return this.auditEventModel
      .find({
        targetType: query.targetType,
        targetId: query.targetId,
        operatorId: query.operatorId,
        ...(query.before ? { createdAt: { $lt: query.before } } : {}),
      })
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .lean<AuditEvent[]>()
      .exec();
  }

  async recordSystemLog(input: SystemLogInput): Promise<void> {
    await this.systemLogModel.create({
      ...withCorrelation(input),
      schemaVersion: 1,
      createdAt: input.createdAt ?? new Date()
    });
  }
}

function withCorrelation<T extends { requestId?: string; traceId?: string }>(input: T): T {
  return {
    ...input,
    requestId: input.requestId ?? getRequestId(),
    traceId: input.traceId ?? getCurrentTraceId()
  };
}
