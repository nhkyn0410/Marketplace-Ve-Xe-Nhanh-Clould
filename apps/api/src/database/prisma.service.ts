import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";
import { APP_CONFIG, type AppConfig } from "../config/env.config";
import { type DbScope, platformScope, systemScope, tenantScope } from "./db-scope";

export type { DbScope } from "./db-scope";

export type DbTransaction = Prisma.TransactionClient;

/**
 * Bảng đã bật + ÉP RLS (migration `add_tenant_rls`). Thêm bảng tenant mới (vehicles, bookings...) thì
 * thêm tên vào đây — kiểm tra lúc khởi động (`rlsProblems`) sẽ đòi bảng đó có FORCE RLS.
 */
export const RLS_TABLES = [
  "operator_profiles",
  "operator_accounts",
  "employee_accounts",
  "operator_login_names",
  "auth_sessions",
  "mfa_credentials",
  "mfa_backup_codes",
] as const;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    const connectionString = config.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required to initialize PrismaService.");
    }

    // Prisma 7: dùng driver adapter (pg) thay query-engine binary → hợp distroless (không libssl).
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    if (this.config.NODE_ENV !== "production") {
      return;
    }
    // Production: RLS không có hiệu lực thì mọi policy chỉ là trang trí — thà không khởi động còn hơn
    // chạy "an toàn giả". Ca hay gặp: DATABASE_URL trên Render vẫn là owner (DB-PRIN-01).
    const problems = await this.rlsProblems();
    if (problems.length > 0) {
      throw new Error(`RLS không có hiệu lực — từ chối khởi động: ${problems.join("; ")}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Những lý do khiến RLS không chặn được gì với kết nối hiện tại. Rỗng = ổn.
   * Superuser/BYPASSRLS bỏ qua mọi policy; owner (hoặc thành viên role owner) thì tắt được RLS.
   */
  async rlsProblems(): Promise<string[]> {
    const tables = [...RLS_TABLES];
    const [role] = await this.$queryRaw<
      { user: string; rolsuper: boolean; rolbypassrls: boolean; owns: boolean }[]
    >`
      SELECT current_user AS "user", r.rolsuper, r.rolbypassrls,
        EXISTS (
          SELECT 1 FROM pg_tables t
          WHERE t.schemaname = current_schema() AND t.tablename = ANY(${tables}::text[])
            AND pg_has_role(current_user, t.tableowner, 'USAGE')
        ) AS owns
      FROM pg_roles r WHERE r.rolname = current_user`;
    const forced = await this.$queryRaw<{ relname: string }[]>`
      SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = current_schema() AND c.relname = ANY(${tables}::text[])
        AND c.relrowsecurity AND c.relforcerowsecurity`;

    const problems: string[] = [];
    if (!role) {
      return ["không đọc được thông tin role hiện tại"];
    }
    if (role.rolsuper) problems.push(`role "${role.user}" là SUPERUSER`);
    if (role.rolbypassrls) problems.push(`role "${role.user}" có BYPASSRLS`);
    if (role.owns) problems.push(`role "${role.user}" là owner (hoặc thành viên role owner) của bảng tenant`);
    const forcedNames = new Set(forced.map((row) => row.relname));
    const missing = tables.filter((table) => !forcedNames.has(table));
    if (missing.length > 0) problems.push(`chưa ENABLE+FORCE RLS: ${missing.join(", ")}`);
    return problems;
  }

  /**
   * Chạy `work` trong MỘT transaction đã gắn ngữ cảnh RLS. `set_config(..., true)` là
   * transaction-local: hết transaction là mất, kết nối trả về pool không mang ngữ cảnh sang
   * request khác. Chỉ có tác dụng khi app chạy bằng role KHÔNG superuser/BYPASSRLS/owner
   * (`scripts/db-app-role.mjs`, DB-PRIN-01).
   *
   * RLS là lớp chặn cuối, KHÔNG thay bộ lọc: policy không dùng được index, query vẫn phải lọc
   * `operator_id` tường minh. Module nghiệp vụ chỉ gọi `withScope(authz.db, ...)` với scope guard trao.
   * Chi phí: mỗi lần gọi là BEGIN + set_config + query + COMMIT, và chịu giới hạn transaction tương
   * tác của Prisma (chờ ≤2s, chạy ≤5s) — gom query vào một lần gọi thay vì gọi lẻ từng câu.
   */
  async withScope<T>(scope: DbScope, work: (tx: DbTransaction) => Promise<T>): Promise<T> {
    const operatorId = scope.kind === "tenant" ? scope.operatorId : "";
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.scope', ${scope.kind}, true), set_config('app.operator_id', ${operatorId}, true)`;
      return work(tx);
    });
  }

  async withTenant<T>(operatorId: string, work: (tx: DbTransaction) => Promise<T>): Promise<T> {
    return this.withScope(tenantScope(operatorId), work);
  }

  async withPlatform<T>(work: (tx: DbTransaction) => Promise<T>): Promise<T> {
    return this.withScope(platformScope(), work);
  }

  /** Vượt ranh giới tenant cho auth/session/cron. ESLint chỉ cho gọi trong `iam/auth`, `iam/session`. */
  async withSystem<T>(work: (tx: DbTransaction) => Promise<T>): Promise<T> {
    return this.withScope(systemScope(), work);
  }
}
