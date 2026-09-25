import { randomUUID } from "node:crypto";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import type { AuditService } from "../../audit/audit.service";
import { parseAppConfig } from "../../config/env.config";
import { type DbTransaction, PrismaService } from "../../database/prisma.service";
import { SubjectType } from "../../database/prisma.types";
import { RefreshTokenService } from "./refresh-token.service";
import type { SessionCache } from "./session-cache";
import { deleteExpiredSessions } from "./session-cleanup";
import { SessionService } from "./session.service";
import { HttpException, Logger } from "@nestjs/common";

const url = process.env.DATABASE_URL;
// CI job `db-integration` đặt REQUIRE_DB_TESTS=1: thiếu DB thì ĐỎ thay vì lặng lẽ bỏ qua (xanh giả).
const requireDb = process.env.REQUIRE_DB_TESTS === "1";

/**
 * `auth_sessions` có RLS (TASK-IAM-003): test đọc/ghi thẳng bảng thì phải qua ngữ cảnh system,
 * giống code thật. Proxy giữ nguyên cú pháp `sessionsTable.findMany(...)`.
 */
function systemSessions(prisma: PrismaService): DbTransaction["authSession"] {
  return new Proxy({} as DbTransaction["authSession"], {
    // `then` phải là undefined — nếu không Proxy bị coi là Promise khi lỡ `await`.
    get: (_target, operation: string) =>
      operation === "then"
        ? undefined
        : (args: unknown) =>
      prisma.withSystem((tx) =>
        (
          tx.authSession as unknown as Record<
            string,
            (args: unknown) => Promise<unknown>
          >
        )[operation]!(args),
      ),
  });
}

const audit = { recordAuditEvent: vi.fn() };

function actions(): string[] {
  return audit.recordAuditEvent.mock.calls.map(
    ([event]) => (event as { action: string }).action,
  );
}

async function errorCode(
  promise: Promise<unknown>,
): Promise<string | undefined> {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return ((error as HttpException).getResponse() as { code?: string }).code;
  }
}

// Tự bỏ qua khi không có DB — `pnpm test` trong CI không có Postgres.
describe.skipIf(!url && !requireDb)("SessionService — Postgres thật", () => {
  let prisma: PrismaService;
  let sessionsTable: DbTransaction["authSession"];
  let refreshTokens: RefreshTokenService;
  let sessions: SessionService;
  const subjectId = `int_${randomUUID()}`;
  // Redis có spec riêng (session-cache.spec.ts); ở đây chỉ cần biết service đánh dấu ĐÚNG phiên nào.
  const cache = {
    lookup: vi.fn(),
    markActive: vi.fn(),
    markRevoked: vi.fn(),
    grantReauth: vi.fn(),
    hasReauth: vi.fn(),
  };
  let reachable = false;

  beforeAll(async () => {
    const config = parseAppConfig({ DATABASE_URL: url });

    prisma = new PrismaService(config);
    // Prisma 7 + driver adapter kết nối LƯỜI: `$connect()` qua trót lọt dù Postgres tắt,
    // lỗi chỉ nổ ở truy vấn đầu tiên với thông báo RỖNG (`PrismaClientKnownRequestError:`)
    // ngay trong `create()` — nhìn vào không ai đoán ra là DB chưa bật. Hỏi thử một câu.
    try {
      await prisma.$queryRaw`SELECT 1`;
      reachable = true;
    } catch (error) {
      throw new Error(
        "Không kết nối được Postgres — chạy `docker compose up -d` rồi thử lại.",
        { cause: error },
      );
    }
    sessionsTable = systemSessions(prisma);
    refreshTokens = new RefreshTokenService();
    sessions = new SessionService(
      config,
      prisma,
      refreshTokens,
      audit as unknown as AuditService,
      cache as unknown as SessionCache,
    );
  });

  // `audit` và `cache` dùng chung cho cả file. Không xoá lịch sử gọi giữa các test thì lượt
  // handleReuse của test race bị cộng dồn sang test sau → đếm sự kiện đỏ oan.
  beforeEach(() => {
    // Bản thật (Mongoose) luôn trả Promise — mock phải giữ đúng hợp đồng đó.
    audit.recordAuditEvent.mockReset().mockResolvedValue(undefined);
    for (const fn of Object.values(cache)) fn.mockReset();
  });

  afterAll(async () => {
    // DB không lên thì dọn dẹp cũng chỉ ném thêm một ECONNREFUSED che mất lỗi thật.
    if (reachable) {
      await sessionsTable.deleteMany({ where: { subjectId } });
    }
    await prisma.$disconnect();
  });

  it("hai rotate song song cùng một token: đúng một thắng, không sinh row mồ côi", async () => {
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );

    // Ép hai request CHỒNG LÊN NHAU thật: cả hai đọc row cha (thấy chưa rotate) rồi mới đi tiếp.
    // Không có rào này thì request đầu có thể commit xong trước khi request sau kịp đọc — request sau
    // đi nhánh `if (current.rotatedAt)` và câu UPDATE có điều kiện không hề được thử.
    // Hai lần `withSystem` đầu tiên của cuộc đua là hai lượt đọc row cha — giữ chúng lại cho tới
    // khi CẢ HAI đã đọc xong.
    const withSystem = prisma.withSystem.bind(prisma);
    let calls = 0;
    let open!: () => void;
    const barrier = new Promise<void>((resolve) => (open = resolve));
    const spy = vi.spyOn(prisma, "withSystem").mockImplementation((async (
      work: Parameters<typeof withSystem>[0],
    ) => {
      calls += 1;
      const mine = calls;
      const result = await withSystem(work);
      if (mine <= 2) {
        if (mine === 2) open();
        await barrier;
      }
      return result;
    }) as typeof withSystem);
    // `mint()` chỉ chạy khi request đã qua kiểm tra `rotatedAt` và sắp vào transaction.
    const mint = vi.spyOn(refreshTokens, "mint");

    const results = await Promise.allSettled([
      sessions.rotate(first.refreshToken, {}),
      sessions.rotate(first.refreshToken, {}),
    ]);
    spy.mockRestore();
    const mintCount = mint.mock.calls.length;
    mint.mockRestore();

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    // Cả hai đều vào transaction → bên thua bị chặn bởi chính câu UPDATE có điều kiện rồi rollback.
    expect(mintCount).toBe(2);

    // Đúng 2 row trong family: gốc + đúng 1 row con. Row con của bên thua đã rollback.
    const family = await sessionsTable.findMany({
      where: { familyId: first.session.familyId },
    });
    expect(family).toHaveLength(2);
    // Cả hai kiểu xen kẽ đều đi qua handleReuse → cả family phải chết (Q5 strict).
    expect(family.every((s) => s.revokedAt !== null)).toBe(true);
  });

  it("dùng lại token đã rotate: revoke cả family, ghi audit, audit không chứa token", async () => {
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const second = await sessions.rotate(first.refreshToken, {});

    expect(await errorCode(sessions.rotate(first.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );

    const family = await sessionsTable.findMany({
      where: { familyId: first.session.familyId },
    });
    expect(family.every((s) => s.revokedReason === "REUSE_DETECTED")).toBe(
      true,
    );

    // Token mới cũng chết theo — đó là ý nghĩa của family invalidation.
    expect(await errorCode(sessions.rotate(second.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );

    expect(actions()).toEqual(
      expect.arrayContaining(["auth.session.revoked", "auth.token.reuse_detected"]),
    );
    expect(actions().filter((a) => a === "auth.token.reuse_detected")).toHaveLength(1);
    expect(JSON.stringify(audit.recordAuditEvent.mock.calls)).not.toContain(
      first.refreshToken,
    );
  });

  it("rotate hợp lệ: token mới khác token cữ, cùng family, row cũ trở sang row mới", async () => {
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const second = await sessions.rotate(first.refreshToken, {});

    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(second.session.familyId).toBe(first.session.familyId);
    const parent = await sessionsTable.findUniqueOrThrow({
      where: { id: first.session.id },
    });
    expect(parent.rotatedAt).not.toBeNull();
    expect(parent.replacedById).toBe(second.session.id);

    expect(JSON.stringify(parent)).not.toContain(first.refreshToken);
  });

  it("token không tồn tại / hết hạn / đã revoke: cùng AUTH_SESSION_EXPIRED, KHÔNG coi là reuse", async () => {
    expect(await errorCode(sessions.rotate("khong-ton-tai", {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );

    const expired = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    await sessionsTable.update({
      where: { id: expired.session.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await errorCode(sessions.rotate(expired.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    const revoked = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );

    await sessions.revokeFamily(revoked.session.familyId, "LOGOUT");
    expect(await errorCode(sessions.rotate(revoked.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    // Ba ca trên đều là "phiên đã hết", không phải tấn công: không báo reuse, không đổi lý do revoke.
    expect(actions()).not.toContain("auth.token.reuse_detected");
    const row = await sessionsTable.findUniqueOrThrow({
      where: { id: revoked.session.id },
    });
    expect(row.revokedReason).toBe("LOGOUT");
  });
  it("revokeAllForSubject(OPERATOR, id) không đụng EMPLOYEE trùng id (Q2)", async () => {
    const shareId = `share_${randomUUID()}`;
    // Phiên phía Operator luôn mang tenant (CHECK `auth_sessions_operator_matches_subject`, IAM-003).
    const operatorId = randomUUID();
    const operator = await sessions.create(
      { type: SubjectType.OPERATOR, id: shareId, operatorId },
      {},
    );
    const employee = await sessions.create(
      { type: SubjectType.EMPLOYEE, id: shareId, operatorId },
      {},
    );

    expect(
      await sessions.revokeAllForSubject(
        SubjectType.OPERATOR,
        shareId,
        "ACCOUNT_LOCKED",
      ),
    ).toBe(1);
    expect(await errorCode(sessions.rotate(operator.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    const next = await sessions.rotate(employee.refreshToken, {});

    expect(next.session.subjectType).toBe("EMPLOYEE");
    await sessionsTable.deleteMany({ where: { subjectId: shareId } });
  });
  it("logout: revoke cả family, chỉ đánh dấu Redis phiên còn access token sống, gọi lại vẫn êm", async () => {
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const second = await sessions.rotate(first.refreshToken, {});
    // Row gốc phát từ 1 giờ trước: access token của nó (15 phút) đã chết, khỏi ghi Redis.
    await sessionsTable.update({
      where: { id: first.session.id },
      data: { issuedAt: new Date(Date.now() - 60 * 60 * 1000) },
    });

    await sessions.logout(second.session.id);
    await sessions.logout(second.session.id);

    const family = await sessionsTable.findMany({
      where: { familyId: first.session.familyId },
    });
    expect(family.every((s) => s.revokedReason === "LOGOUT")).toBe(true);
    // Lần 1: đánh dấu TRƯỚC khi revoke + sau khi revoke (bắt row con). Lần 2: vẫn đánh dấu trước —
    // đó là đường "gọi lại sau khi Redis lỗi" — nhưng không còn gì để revoke nên không đánh dấu lại.
    expect(cache.markRevoked).toHaveBeenCalledTimes(3);
    for (const [sids] of cache.markRevoked.mock.calls) {
      expect(sids).toEqual([second.session.id]);
    }
    // Lần hai không thu hồi được gì → không ghi thêm audit (chống bơm bản ghi append-only).
    expect(actions().filter((a) => a === "auth.logout")).toHaveLength(1);
    // Lần hai không đổi row nào → không ghi thêm "revoked".
    expect(actions().filter((a) => a === "auth.session.revoked")).toHaveLength(1);
  });

  it("revokeFamily bắt được row con do một rotate commit CHEN GIỮA lúc đang revoke", async () => {
    // Tái hiện đúng kịch bản: kẻ trộm đang rotate (đã INSERT con + khoá row cha, chưa commit) thì
    // nạn nhân kích hoạt revoke. UPDATE đầu chờ khoá, nhưng snapshot của nó không thấy row con.
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let childId = "";
    const rotating = prisma.withSystem(
      async (tx) => {
        const child = await tx.authSession.create({
          data: {
            subjectType: first.session.subjectType,
            subjectId: first.session.subjectId,
            userRef: first.session.userRef,
            familyId: first.session.familyId,
            refreshTokenHash: `race_${randomUUID()}`,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
        await tx.authSession.update({
          where: { id: first.session.id },
          data: { rotatedAt: new Date(), replacedById: child.id },
        });
        childId = child.id;
        await gate;
      },
    );
    await vi.waitUntil(() => childId !== "", { timeout: 5_000 });

    const revoking = sessions.revokeFamily(
      first.session.familyId,
      "REUSE_DETECTED",
    );
    // Cho UPDATE của revoke kịp chạy tới chỗ chờ khoá row cha rồi mới cho rotate commit.
    await new Promise((resolve) => setTimeout(resolve, 300));
    release();
    await rotating;
    await revoking;

    const child = await sessionsTable.findUniqueOrThrow({
      where: { id: childId },
    });
    expect(child.revokedAt).not.toBeNull();
    expect(child.revokedReason).toBe("REUSE_DETECTED");
  });

  it("Redis lỗi khi revoke → Postgres CHƯA đổi gì, gọi lại chạy lại trọn vẹn; audit reuse vẫn được ghi", async () => {
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    await sessions.rotate(first.refreshToken, {});
    cache.markRevoked.mockRejectedValueOnce(
      Object.assign(new Error("503"), { status: 503 }),
    );

    await expect(sessions.rotate(first.refreshToken, {})).rejects.toThrow("503");

    const family = await sessionsTable.findMany({
      where: { familyId: first.session.familyId },
    });
    expect(family.every((s) => s.revokedAt === null)).toBe(true);
    expect(actions()).toContain("auth.token.reuse_detected");

    // Redis lên lại: token cũ gửi lại vẫn kích hoạt reuse (row cha vẫn chỉ "rotated") và lần này xong.
    expect(await errorCode(sessions.rotate(first.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    const after = await sessionsTable.findMany({
      where: { familyId: first.session.familyId },
    });
    expect(after.every((s) => s.revokedAt !== null)).toBe(true);
  });

  it("assertActive: cache trả lời thì không chạm Postgres; miss thì hỏi Postgres rồi ghi cache", async () => {
    const live = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const dead = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    await sessions.revokeFamily(dead.session.familyId, "LOGOUT");
    cache.markActive.mockClear();

    cache.lookup.mockResolvedValue("revoked");
    expect(await errorCode(sessions.assertActive(live.session.id))).toBe(
      "AUTH_SESSION_EXPIRED",
    );

    cache.lookup.mockResolvedValue("active");
    await expect(sessions.assertActive(dead.session.id)).resolves.toBeUndefined();

    cache.lookup.mockResolvedValue("unknown");
    await expect(sessions.assertActive(live.session.id)).resolves.toBeUndefined();
    expect(cache.markActive).toHaveBeenCalledWith(live.session.id);

    cache.markActive.mockClear();
    expect(await errorCode(sessions.assertActive(dead.session.id))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    expect(await errorCode(sessions.assertActive(randomUUID()))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    expect(cache.markActive).not.toHaveBeenCalled();
  });

  it("Mongo chết: rotate vẫn chạy, reuse vẫn trả 401 chứ không 500", async () => {
    audit.recordAuditEvent.mockRejectedValue(new Error("MongoNetworkError"));
    const errorLog = vi
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    onTestFinished(() => errorLog.mockRestore());
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const second = await sessions.rotate(first.refreshToken, {});
    expect(second.refreshToken).toBeTruthy();

    expect(await errorCode(sessions.rotate(first.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
  });

  it("Mongo CHẬM (không bao giờ trả lời): rotate vẫn trả ngay, không treo theo audit", async () => {
    audit.recordAuditEvent.mockImplementation(() => new Promise(() => undefined));
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const started = Date.now();
    const second = await sessions.rotate(first.refreshToken, {});
    expect(second.refreshToken).toBeTruthy();
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("session management: một item/family sau rotation, current theo sid, revoke owned idempotent và không đụng device khác", async () => {
    const managedSubjectId = `int_${randomUUID()}`;
    const foreignSubjectId = `int_${randomUUID()}`;
    onTestFinished(async () => {
      await sessionsTable.deleteMany({
        where: { subjectId: { in: [managedSubjectId, foreignSubjectId] } },
      });
    });
    const first = await sessions.create(
      { type: SubjectType.PASSENGER, id: managedSubjectId },
      {
        ip: "203.0.113.42",
        userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 raw-version",
      },
    );
    const current = await sessions.rotate(first.refreshToken, {
      ip: "203.0.113.43",
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/131.0 raw-version",
    });
    const other = await sessions.create(
      { type: SubjectType.PASSENGER, id: managedSubjectId },
      { ip: "2001:db8::1234", userAgent: "Dart/3.9 Android" },
    );

    const page = await sessions.listForSubject(
      SubjectType.PASSENGER,
      managedSubjectId,
      current.session.id,
      { limit: 20 },
    );
    expect(page.items).toHaveLength(2);
    const rotatedFamily = page.items.find(
      (item) => item.sessionId === first.session.familyId,
    );
    expect(rotatedFamily).toMatchObject({
      current: true,
      deviceLabel: "Chrome on Windows",
      ipAddress: "203.0.113.*",
      createdAt: first.session.issuedAt.toISOString(),
    });
    expect(JSON.stringify(page)).not.toContain(current.session.id);
    expect(JSON.stringify(page)).not.toContain("raw-version");

    await sessions.revokeOwnedFamily(
      SubjectType.PASSENGER,
      managedSubjectId,
      first.session.familyId,
      current.session.id,
    );
    await sessions.revokeOwnedFamily(
      SubjectType.PASSENGER,
      managedSubjectId,
      first.session.familyId,
      current.session.id,
    );
    expect(await errorCode(sessions.rotate(current.refreshToken, {}))).toBe(
      "AUTH_SESSION_EXPIRED",
    );
    await expect(sessions.rotate(other.refreshToken, {})).resolves.toBeDefined();

    const foreign = await sessions.create(
      { type: SubjectType.PASSENGER, id: foreignSubjectId },
      {},
    );
    expect(
      await errorCode(
        sessions.revokeOwnedFamily(
          SubjectType.PASSENGER,
          managedSubjectId,
          foreign.session.familyId,
          other.session.id,
        ),
      ),
    ).toBe("AUTH_SESSION_NOT_FOUND");
    expect(
      await errorCode(
        sessions.revokeOwnedFamily(
          SubjectType.PASSENGER,
          managedSubjectId,
          randomUUID(),
          other.session.id,
        ),
      ),
    ).toBe("AUTH_SESSION_NOT_FOUND");
  });

  it("deleteExpiredSessions: xoá row hết hạn quá 30 ngày, giữ row mới hết hạn để còn điều tra", async () => {
    const old = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const recent = await sessions.create(
      { type: SubjectType.PASSENGER, id: subjectId },
      {},
    );
    const day = 24 * 60 * 60 * 1000;
    await sessionsTable.update({
      where: { id: old.session.id },
      data: { expiresAt: new Date(Date.now() - 31 * day) },
    });
    await sessionsTable.update({
      where: { id: recent.session.id },
      data: { expiresAt: new Date(Date.now() - 1 * day) },
    });

    expect(await deleteExpiredSessions(prisma)).toBeGreaterThanOrEqual(1);

    expect(
      await sessionsTable.findUnique({ where: { id: old.session.id } }),
    ).toBeNull();
    expect(
      await sessionsTable.findUnique({ where: { id: recent.session.id } }),
    ).not.toBeNull();
  });
});
