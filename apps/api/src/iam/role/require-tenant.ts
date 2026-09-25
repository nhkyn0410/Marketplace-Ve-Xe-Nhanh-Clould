import type { DbScope } from "../../database/db-scope";
import type { Authorization } from "./authorization";
import { tenantScopeViolation } from "./authorization.errors";

/**
 * Lấy ngữ cảnh tenant do `TenantGuard` trao cho module Operator-owned (vehicle, route, stop-point).
 * Guard đã chặn, nhưng service kiểm lại (defense-in-depth): mọi truy vấn phải chạy trong scope tenant
 * và lọc đúng `operatorId` đó.
 */
export function requireTenant(authz: Authorization): { db: DbScope; operatorId: string } {
  // Chỉ grant phạm vi `tenant`: TenantGuard đổi grant `assigned` (Employee) thành scope cả tenant, mà
  // các module này chưa lọc theo phân công (EMP-001) → lỡ cho Employee vào sẽ lộ dữ liệu cả nhà xe.
  if (authz.scope !== "tenant" || authz.db?.kind !== "tenant") {
    throw tenantScopeViolation();
  }
  return { db: authz.db, operatorId: authz.db.operatorId };
}
