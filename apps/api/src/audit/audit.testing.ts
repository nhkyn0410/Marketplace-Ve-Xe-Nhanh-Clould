import { createConnection, type Model } from "mongoose";
import { AUDIT_EVENT_MODEL, type AuditEventDocument, AuditEventSchema } from "./audit-event.schema";
import { AuditService } from "./audit.service";
import { SYSTEM_LOG_MODEL, type SystemLogDocument, SystemLogSchema } from "./system-log.schema";

/**
 * Dựng `AuditService` nối Mongo THẬT cho test tích hợp ở module khác — luật ESLint chỉ cho import Mongoose trong
 * `audit/` và `database/`, kể cả file test. Trả kèm hàm đóng kết nối.
 */
export async function connectAuditForTest(uri: string): Promise<{ audit: AuditService; close: () => Promise<void> }> {
  const connection = await createConnection(uri).asPromise();
  // Nest `@InjectModel` khai `Model<…Document>`; model dựng tay từ schema cùng loại → ép kiểu cho khớp chữ ký.
  const audit = new AuditService(
    connection.model(AUDIT_EVENT_MODEL, AuditEventSchema) as unknown as Model<AuditEventDocument>,
    connection.model(SYSTEM_LOG_MODEL, SystemLogSchema) as unknown as Model<SystemLogDocument>,
  );
  return { audit, close: () => connection.close() };
}
