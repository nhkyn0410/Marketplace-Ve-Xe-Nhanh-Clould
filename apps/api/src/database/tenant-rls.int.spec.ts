import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseAppConfig } from "../config/env.config";
import { PrismaService } from "./prisma.service";

/**
 * Test bắt buộc tenant-RLS (ADR-025, TC-SEC-001, TASK-IAM-003) — Postgres THẬT, role APP.
 * Mọi query dưới đây CỐ Ý không lọc theo `operator_id`: chứng minh Postgres chặn cả khi code quên.
 */
const url = process.env.DATABASE_URL;
const ownerUrl = process.env.MIGRATION_DATABASE_URL;
// CI job `db-integration` đặt REQUIRE_DB_TESTS=1: thiếu DB thì ĐỎ thay vì lặng lẽ bỏ qua (xanh giả).
const requireDb = process.env.REQUIRE_DB_TESTS === "1";


async function rejectionText(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return "";
  } catch (error) {
    // Adapter pg có thể để message rỗng; mã/SQLSTATE nằm trong cause/meta — gom hết lại để so.
    return JSON.stringify(error, Object.getOwnPropertyNames(error)) + String(error);
  }
}

describe.skipIf(!url && !requireDb)("Tenant RLS — Postgres thật, role app", () => {
  let prisma: PrismaService;
  const tag = randomUUID().slice(0, 8);
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  const employeeA = randomUUID();
  const employeeB = randomUUID();
  const sessionA = randomUUID();
  const sessionB = randomUUID();
  const sessionPassenger = randomUUID();
  const employees = [employeeA, employeeB];
  const sessions = [sessionA, sessionB, sessionPassenger];
  let ready = false;

  function sessionRow(id: string, operatorId: string | null) {
    const subjectId = `rls_${id}`;
    return {
      id,
      subjectType: operatorId ? ("EMPLOYEE" as const) : ("PASSENGER" as const),
      subjectId,
      userRef: `${operatorId ? "employee" : "passenger"}:${subjectId}`,
      familyId: randomUUID(),
      refreshTokenHash: `rls_${id}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      operatorId,
    };
  }

  beforeAll(async () => {
    prisma = new PrismaService(parseAppConfig({ DATABASE_URL: url }));
    const [role] = await prisma.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    // Chống XANH GIẢ: superuser/BYPASSRLS bỏ qua mọi policy, test nào dưới đây cũng sẽ "pass".
    if (!role || role.rolsuper || role.rolbypassrls) {
      throw new Error(
        "DATABASE_URL đang là superuser hoặc có BYPASSRLS — RLS không có hiệu lực, test này vô nghĩa. " +
          "Dùng role app (doc/task-propreties/IAM-003-guide.md §1).",
      );
    }

    // operator_profiles: ai cũng đọc được, chỉ platform/system được ghi.
    await prisma.withSystem(async (tx) => {
      await tx.operatorProfile.createMany({
        data: [
          { id: tenantA, operatorSlug: `rls-a-${tag}`, displayName: "RLS A" },
          { id: tenantB, operatorSlug: `rls-b-${tag}`, displayName: "RLS B" },
        ],
      });
      await tx.employeeAccount.createMany({
        data: [
          { id: employeeA, operatorId: tenantA, username: `nv.a-${tag}`, passwordHash: "x", role: "DRIVER" },
          { id: employeeB, operatorId: tenantB, username: `nv.b-${tag}`, passwordHash: "x", role: "DRIVER" },
        ],
      });
      await tx.authSession.createMany({
        data: [
          sessionRow(sessionA, tenantA),
          sessionRow(sessionB, tenantB),
          sessionRow(sessionPassenger, null),
        ],
      });
    });
    ready = true;
  });

  afterAll(async () => {
    if (ready) {
      await prisma.withSystem(async (tx) => {
        await tx.authSession.deleteMany({ where: { id: { in: sessions } } });
        await tx.employeeAccount.deleteMany({ where: { id: { in: employees } } });
        await tx.operatorProfile.deleteMany({ where: { id: { in: [tenantA, tenantB] } } });
      });
    }
    await prisma?.$disconnect();
  });

  it("không ngữ cảnh → 0 row (fail-closed), kể cả khi biết đúng id", async () => {
    expect(await prisma.employeeAccount.findMany({ where: { id: { in: employees } } })).toEqual([]);
    expect(await prisma.authSession.findMany({ where: { id: { in: sessions } } })).toEqual([]);
  });

  it("⭐ TC-SEC-001: ngữ cảnh tenant A chỉ thấy row của A — query không hề lọc operator_id", async () => {
    const seen = await prisma.withTenant(tenantA, async (tx) => ({
      employees: await tx.employeeAccount.findMany({ where: { id: { in: employees } }, select: { id: true } }),
      sessions: await tx.authSession.findMany({ where: { id: { in: sessions } }, select: { id: true } }),
    }));
    expect(seen.employees).toEqual([{ id: employeeA }]);
    // Phiên passenger (operator_id NULL) cũng không hiện trong ngữ cảnh tenant.
    expect(seen.sessions).toEqual([{ id: sessionA }]);
  });

  it("UPDATE/DELETE row tenant B từ ngữ cảnh A → 0 row, dữ liệu B nguyên vẹn", async () => {
    const [updated, deleted] = await prisma.withTenant(tenantA, async (tx) => [
      await tx.employeeAccount.updateMany({ where: { id: employeeB }, data: { username: "nv.hacked" } }),
      await tx.authSession.deleteMany({ where: { id: sessionB } }),
    ]);
    expect(updated.count).toBe(0);
    expect(deleted.count).toBe(0);

    const intact = await prisma.withSystem(async (tx) => ({
      employee: await tx.employeeAccount.findUnique({ where: { id: employeeB } }),
      session: await tx.authSession.findUnique({ where: { id: sessionB } }),
    }));
    expect(intact.employee?.username).toBe(`nv.b-${tag}`);
    expect(intact.session).not.toBeNull();
  });

  it("INSERT gắn operator_id tenant B từ ngữ cảnh A → Postgres từ chối (WITH CHECK)", async () => {
    const text = await rejectionText(
      prisma.withTenant(tenantA, (tx) =>
        tx.employeeAccount.create({
          data: { operatorId: tenantB, username: `nv.smuggled-${tag}`, passwordHash: "x", role: "DRIVER" },
        }),
      ),
    );
    // Chỉ khớp lỗi RLS — "permission denied for table" (thiếu GRANT) cũng là 42501, không được tính.
    expect(text).toMatch(/row-level security/i);
  });

  it("UPDATE chuyển row của A sang tenant B → Postgres từ chối (WITH CHECK)", async () => {
    const text = await rejectionText(
      prisma.withTenant(tenantA, (tx) =>
        tx.employeeAccount.update({ where: { id: employeeA }, data: { operatorId: tenantB } }),
      ),
    );
    expect(text).toMatch(/row-level security/i);
  });

  it("auth_sessions: tenant chỉ ĐỌC — không sửa/tạo được phiên, kể cả phiên của chính mình", async () => {
    // Nếu tenant sửa được `subject_type` thì refresh ra token PLATFORM (audit M2).
    const updated = await prisma.withTenant(tenantA, (tx) =>
      tx.authSession.updateMany({ where: { id: sessionA }, data: { subjectType: "PLATFORM" } }),
    );
    expect(updated.count).toBe(0);
    const text = await rejectionText(
      prisma.withTenant(tenantA, (tx) =>
        tx.authSession.create({ data: sessionRow(randomUUID(), tenantA) }),
      ),
    );
    expect(text).toMatch(/row-level security/i);
  });

  it("auth_sessions: phiên phía Operator bắt buộc có operator_id, phiên passenger/platform thì không", async () => {
    const bad = { ...sessionRow(randomUUID(), tenantA), operatorId: null };
    const text = await rejectionText(prisma.withSystem((tx) => tx.authSession.create({ data: bad })));
    expect(text).toMatch(/auth_sessions_operator_matches_subject/);
  });

  it("operator_profiles: ai cũng ĐỌC được, nhưng tenant/không ngữ cảnh không sửa/xoá được tenant nào", async () => {
    expect(await prisma.operatorProfile.count({ where: { id: { in: [tenantA, tenantB] } } })).toBe(2);

    const [renamed, removed] = await prisma.withTenant(tenantA, async (tx) => [
      await tx.operatorProfile.updateMany({ where: { id: tenantB }, data: { status: "SUSPENDED" } }),
      await tx.operatorProfile.deleteMany({ where: { id: tenantA } }),
    ]);
    expect(renamed.count).toBe(0);
    expect(removed.count).toBe(0);
    // Không tự "mở khoá" được chính mình (status là việc của Platform).
    const selfUpdate = await prisma.withTenant(tenantA, (tx) =>
      tx.operatorProfile.updateMany({ where: { id: tenantA }, data: { status: "ACTIVE" } }),
    );
    expect(selfUpdate.count).toBe(0);
  });

  it("xoá operator_profiles còn account → bị chặn (FK RESTRICT; CASCADE sẽ vượt RLS)", async () => {
    const text = await rejectionText(
      prisma.withSystem((tx) => tx.operatorProfile.delete({ where: { id: tenantB } })),
    );
    expect(text).toMatch(/foreign key|employee_accounts_operator_id_fkey|P2003/i);
  });

  it("slug tenant phải là chữ thường (hai tenant không được chỉ khác hoa/thường)", async () => {
    const text = await rejectionText(
      prisma.withSystem((tx) =>
        tx.operatorProfile.create({ data: { operatorSlug: `Rls-Upper-${tag}`, displayName: "x" } }),
      ),
    );
    expect(text).toMatch(/operator_profiles_slug_lowercase/);
  });

  it("rlsProblems(): role app → rỗng; kết nối bằng owner → liệt kê lý do", async () => {
    expect(await prisma.rlsProblems()).toEqual([]);
    if (!ownerUrl) {
      return;
    }
    const owner = new PrismaService(parseAppConfig({ DATABASE_URL: ownerUrl }));
    try {
      expect((await owner.rlsProblems()).length).toBeGreaterThan(0);
    } finally {
      await owner.$disconnect();
    }
  });

  it("ngữ cảnh platform thấy mọi tenant", async () => {
    const rows = await prisma.withPlatform((tx) =>
      tx.employeeAccount.findMany({ where: { id: { in: employees } }, select: { id: true } }),
    );
    expect(rows.map((row) => row.id).sort()).toEqual([...employees].sort());
  });

  it("ngữ cảnh không rò: cùng kết nối, sau transaction không còn app.scope", async () => {
    // Pool có thể trao kết nối khác — lặp tới khi bắt được ĐÚNG kết nối vừa chạy withTenant.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const [inside] = await prisma.withTenant(tenantA, (tx) =>
        tx.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`,
      );
      const [after] = await prisma.$queryRaw<{ pid: number; scope: string | null }[]>`
        SELECT pg_backend_pid() AS pid, current_setting('app.scope', true) AS scope`;
      if (inside?.pid === after?.pid) {
        expect(after?.scope ?? "").toBe("");
        expect(await prisma.employeeAccount.count({ where: { id: { in: employees } } })).toBe(0);
        return;
      }
    }
    throw new Error("Không bắt được cùng một kết nối sau 20 lần — không kết luận được.");
  });

  it("withScope(tenant) thiếu operatorId → lỗi lập trình, không lặng lẽ thành 'không thấy gì'", async () => {
    await expect(prisma.withTenant("", async () => 1)).rejects.toThrow(/operatorId/);
  });
});
