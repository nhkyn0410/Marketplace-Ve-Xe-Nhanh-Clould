import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConnectionStates, type Model } from "mongoose";
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

/** Trường audit trả cho màn lịch sử — không lộ `requestId`, `traceId`, `reason`… của bản ghi gốc. */
export type AuditHistoryItem = Pick<AuditEvent, "action" | "actorId" | "createdAt" | "before" | "after">;

/** Ghi audit có giới hạn thời gian thất bại (Mongo chậm / sập) — bản ghi KHÔNG được lưu; nơi gọi trả 503. */
export class AuditWriteError extends Error {
  constructor(cause: unknown) {
    super("Ghi audit thất bại hoặc quá thời gian.", { cause });
    this.name = "AuditWriteError";
  }
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AUDIT_EVENT_MODEL)
    private readonly auditEventModel: Model<AuditEventDocument>,
    @InjectModel(SYSTEM_LOG_MODEL)
    private readonly systemLogModel: Model<SystemLogDocument>
  ) {}

  /**
   * Ghi một audit event. Có `timeoutMs` (dùng khi ghi TRONG transaction Postgres): quá hạn, Mongo chưa kết nối hoặc
   * lỗi ghi → `AuditWriteError`, và bản ghi KHÔNG xuất hiện "về sau" khi transaction Postgres đã rollback.
   */
  async recordAuditEvent(input: AuditEventInput, options?: { timeoutMs: number }): Promise<void> {
    const document = {
      ...withCorrelation(input),
      schemaVersion: 1,
      createdAt: input.createdAt ?? new Date()
    };
    if (!options) {
      await this.auditEventModel.create(document);
      return;
    }
    // Kiểm schema như `create` (sai schema là lỗi lập trình → ném nguyên, không thành 503).
    const event = new this.auditEventModel(document);
    await event.validate();
    // Chưa kết nối thì Mongoose XẾP HÀNG lệnh (tới 10s) rồi chạy khi Mongo lên lại — lúc đó Postgres có thể đã
    // rollback → dòng lịch sử "ma". Từ chối ngay thay vì xếp hàng.
    if (this.auditEventModel.db.readyState !== ConnectionStates.connected) {
      throw new AuditWriteError(new Error("Mongo audit chưa kết nối."));
    }
    try {
      // `create`/`save` của Mongoose bỏ qua `timeoutMS` và schema chặn `insertMany` (append-only) → ghi thẳng driver.
      // CSOT: driver thôi chờ chọn server / đọc socket VÀ gửi `maxTimeMS` để server tự huỷ lệnh quá hạn.
      await this.auditEventModel.collection.insertOne(event.toObject(), { timeoutMS: options.timeoutMs });
    } catch (error) {
      throw new AuditWriteError(error);
    }
  }

  /**
   * Đọc audit event của một đối tượng trong một tenant, mới nhất trước — dùng cho lịch sử hiển thị (vd lịch sử giá,
   * BR-40). Chỉ đọc các `actions` nơi gọi liệt kê và chỉ trả `AuditHistoryItem`; nơi gọi phải kiểm đối tượng thuộc
   * tenant trước (Mongo không có RLS).
   */
  async listAuditEvents(query: {
    targetType: string;
    targetId: string;
    operatorId: string;
    actions: readonly string[];
    before?: Date;
    limit: number;
  }): Promise<AuditHistoryItem[]> {
    if (!query.operatorId || !query.targetId || query.actions.length === 0) {
      // Bộ lọc rỗng sẽ đọc lịch sử của tenant / đối tượng khác — lỗi lập trình, không phải lỗi người dùng.
      throw new Error("listAuditEvents cần operatorId, targetId và ít nhất một action.");
    }
    return this.auditEventModel
      .find({
        targetType: query.targetType,
        targetId: query.targetId,
        operatorId: query.operatorId,
        action: { $in: query.actions },
        ...(query.before ? { createdAt: { $lt: query.before } } : {}),
      })
      .select({ _id: 0, action: 1, actorId: 1, createdAt: 1, before: 1, after: 1 })
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .lean<AuditHistoryItem[]>()
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
