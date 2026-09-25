import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { type AuditEventInput, AuditService } from "../../audit/audit.service";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { type DbTransaction, PrismaService } from "../../database/prisma.service";
import {
  type AuthSession,
  SessionRevokeReason,
  SubjectType,
} from "../../database/prisma.types";
import type { RequestContext } from "../auth/auth.service";
import type { VerifiedAccessToken } from "../auth/token.service";
import { RefreshTokenService } from "./refresh-token.service";
import { SessionCache } from "./session-cache";
import {
  decodeSessionCursor,
  encodeSessionCursor,
  type SessionListQuery,
  type SessionListResponse,
} from "./session.dto";
import { sessionExpired, sessionNotFound } from "./session.errors";
import { userRefOf } from "./subject-type";

export type SessionSubject = {
  type: SubjectType;
  id: string;
  operatorId?: string;
  /** Account version captured at login; old versions remain invalid if post-mutation Redis revoke fails. */
  authEpoch?: number;
  /** Session chỉ được đánh dấu sau khi TOTP/backup-code hợp lệ; không nhận từ client. */
  mfaVerified?: boolean;
};

export type IssuedSession = {
  session: AuthSession;
  /** Token thô — trả cho client đúng một lần. */
  refreshToken: string;
};

type SessionListRow = {
  familyId: string;
  sortMicros: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
  current: boolean;
};

/** Thua race rotate — ném bên TRONG transaction để Prisma rollback row con. */
class LostRotationRace extends Error {}

/** Chừa cho lệch đồng hồ + độ trễ giữa lúc tạo phiên và lúc ký access token. */
const ACCESS_TOKEN_SKEW_SECONDS = 60;

/** Trần an toàn cho vòng revoke — thực tế dừng ở vòng 2 (xem `revoke`). */
const MAX_REVOKE_ROUNDS = 5;

type RevokeTarget = { familyId: string } | { userRef: string };

/** Chạy sau khi token hợp lệ, TRƯỚC khi ghi row mới — chỗ gắn rate limit theo family. */
export type BeforeRotate = (current: AuthSession) => Promise<void>;

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly audit: AuditService,
    private readonly cache: SessionCache,
  ) {}

  /**
   * Mọi truy vấn `auth_sessions` đi qua ngữ cảnh `system` (TASK-IAM-003): phiên là hạ tầng auth,
   * tra theo hash/sid TRƯỚC khi biết tenant và revoke xuyên tenant. Bảng có RLS — gọi thẳng
   * `this.prisma.authSession` sẽ nhận 0 row.
   */
  private system<T>(work: (sessions: DbTransaction["authSession"]) => Promise<T>): Promise<T> {
    return this.prisma.withSystem((tx) => work(tx.authSession));
  }

  private refreshExpiry(from: Date): Date {
    return new Date(
      from.getTime() + this.config.REFRESH_TOKEN_TTL_SECONDS * 1000,
    );
  }

  async create(
    subject: SessionSubject,
    ctx: RequestContext,
  ): Promise<IssuedSession> {
    const { token, hash } = this.refreshTokens.mint();
    const session = await this.system((sessions) =>
      sessions.create({
        data: {
          subjectType: subject.type,
          subjectId: subject.id,
          userRef: userRefOf(subject.type, subject.id),
          familyId: randomUUID(),
          refreshTokenHash: hash,
          authEpoch: subject.authEpoch ?? 0,
          expiresAt: this.refreshExpiry(new Date()),
          operatorId: subject.operatorId,
          mfaVerifiedAt: subject.mfaVerified ? new Date() : undefined,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
        },
      }),
    );
    this.recordEvent(
      subjectEvent(session, "auth.session.issued", {
        after: { familyId: session.familyId },
      }),
    );
    return { session, refreshToken: token };
  }

  async rotate(
    rawToken: string,
    ctx: RequestContext,
    beforeRotate?: BeforeRotate,
  ): Promise<IssuedSession> {
    const current = await this.system((sessions) =>
      sessions.findUnique({
        where: { refreshTokenHash: this.refreshTokens.hash(rawToken) },
      }),
    );

    if (!current || current.expiresAt <= new Date() || current.revokedAt) {
      throw sessionExpired();
    }
    // Token đã rotate rồi mà vẫn được gửi lên = dùng lại = tín hiệu tấn công.
    if (current.rotatedAt) {
      await this.handleReuse(current);
      throw sessionExpired();
    }
    await beforeRotate?.(current);

    const { token, hash } = this.refreshTokens.mint();
    const now = new Date();

    let next: AuthSession;
    try {
      // withSystem = một transaction READ COMMITTED như `$transaction` trước đây, chỉ thêm ngữ cảnh RLS.
      next = await this.prisma.withSystem(async (tx) => {
        const created = await tx.authSession.create({
          data: {
            subjectType: current.subjectType,
            subjectId: current.subjectId,
            userRef: current.userRef,
            familyId: current.familyId,
            refreshTokenHash: hash,
            authEpoch: current.authEpoch,
            expiresAt: this.refreshExpiry(now),
            operatorId: current.operatorId,
            mfaVerifiedAt: current.mfaVerifiedAt,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
          },
        });
        // Điều kiện `rotatedAt: null` nằm TRONG câu UPDATE, không nằm ở `if` phía
        // trên. Postgres READ COMMITTED: UPDATE thứ hai chờ khoá dòng, và khi được
        // chạy thì đánh giá lại WHERE trên phiên bản dòng mới — thấy `rotated_at`
        // đã có giá trị nên cập nhật 0 dòng. Kiểm bằng `if` thì hai request cùng lọt.
        const claimed = await tx.authSession.updateManyAndReturn({
          where: { id: current.id, rotatedAt: null, revokedAt: null },
          data: { rotatedAt: now, replacedById: created.id, lastUsedAt: now },
        });
        // PHẢI ném, không được `return null`: return là transaction COMMIT, và
        // row con vừa tạo sống sót thành một refresh token hợp lệ thứ hai.
        if (claimed.length === 0) throw new LostRotationRace();
        return created;
      });
    } catch (error) {
      if (error instanceof LostRotationRace) {
        await this.handleReuse(current);
        throw sessionExpired();
      }
      throw error;
    }

    this.recordEvent(
      subjectEvent(next, "auth.session.rotated", {
        after: { previousSessionId: current.id, familyId: next.familyId },
      }),
    );
    return { session: next, refreshToken: token };
  }

  /**
   * Hot path của guard: phiên của access token còn sống không. Cache-aside — Redis trả lời được thì
   * không chạm Postgres; miss thì hỏi Postgres rồi ghi lại. Cache được ghi LÚC MISS chứ không phải
   * lúc login/refresh: ghi lúc refresh mà Redis lỗi SAU KHI Postgres đã rotate thì client mất refresh
   * token mới, lần sau gửi token cũ bị coi là reuse và bị đá ra oan.
   */
  async assertActive(sid: string): Promise<void> {
    const cached = await this.cache.lookup(sid);
    if (cached === "revoked") {
      throw sessionExpired();
    }
    if (cached === "active") {
      return;
    }
    const session = await this.system((sessions) =>
      sessions.findUnique({ where: { id: sid }, select: { revokedAt: true } }),
    );
    if (!session || session.revokedAt) {
      throw sessionExpired();
    }
    await this.cache.markActive(sid);
  }

  /**
   * Defense-in-depth for internal accounts: account mutation increments auth_epoch in Postgres.
   * Check on every request, even when Redis cached the sid as active. A failed post-mutation
   * Redis revoke can therefore never revive an older JWT after Redis recovers.
   */
  async assertOperatorAccountCurrent(claims: VerifiedAccessToken): Promise<void> {
    if (claims.scope !== "operator" || !claims.operatorId) {
      return;
    }
    const valid = await this.prisma.withSystem(async (tx) => {
      const session = await tx.authSession.findUnique({
        where: { id: claims.sid },
        select: {
          subjectType: true,
          subjectId: true,
          operatorId: true,
          authEpoch: true,
          revokedAt: true,
        },
      });
      if (
        !session ||
        session.revokedAt ||
        session.subjectId !== claims.sub ||
        session.operatorId !== claims.operatorId
      ) {
        return false;
      }
      if (session.subjectType === SubjectType.OPERATOR) {
        const account = await tx.operatorAccount.findUnique({
          where: { id: claims.sub },
          include: { operator: true },
        });
        return Boolean(
          account &&
          account.operatorId === claims.operatorId &&
          account.authEpoch === session.authEpoch &&
          account.role === claims.role &&
          account.status === "ACTIVE" &&
          account.operator.status === "ACTIVE" &&
          !account.credentialDeliveryPending &&
          !account.passwordChangeRequired &&
          account.operator.operatorSlug === claims.operatorSlug
        );
      }
      if (session.subjectType === SubjectType.EMPLOYEE) {
        const account = await tx.employeeAccount.findUnique({
          where: { id: claims.sub },
          include: { operator: true },
        });
        return Boolean(
          account &&
          account.operatorId === claims.operatorId &&
          account.authEpoch === session.authEpoch &&
          account.role === claims.role &&
          account.status === "ACTIVE" &&
          account.operator.status === "ACTIVE" &&
          !account.credentialDeliveryPending &&
          !account.passwordChangeRequired &&
          account.operator.operatorSlug === claims.operatorSlug
        );
      }
      return false;
    });
    if (!valid) {
      throw sessionExpired();
    }
  }

  async findById(sid: string): Promise<AuthSession | null> {
    return this.system((sessions) => sessions.findUnique({ where: { id: sid } }));
  }

  /**
   * Một item đại diện một login/device family. CTE giữ lịch sử rotation để lấy thời điểm login gốc,
   * nhưng chỉ xuất leaf refresh token còn hoạt động. Public response/cursor tuyệt đối không chứa row
   * id (`sid`), refresh hash hoặc raw user-agent.
   */
  async listForSubject(
    subjectType: SubjectType,
    subjectId: string,
    currentSid: string,
    query: SessionListQuery,
  ): Promise<SessionListResponse> {
    const cursor = decodeSessionCursor(query.cursor);
    if (query.cursor && !cursor) {
      throw new BadRequestException("Cursor phiên đăng nhập không hợp lệ.");
    }
    const cursorSortMicros = cursor?.sortMicros ?? null;
    const cursorFamilyId = cursor?.sessionId ?? null;
    const take = query.limit + 1;
    const userRef = userRefOf(subjectType, subjectId);

    const rows = await this.prisma.withSystem((tx) =>
      tx.$queryRaw<SessionListRow[]>`
        WITH family_rows AS (
          SELECT
            id,
            family_id,
            issued_at,
            expires_at,
            last_used_at,
            replaced_by_id,
            rotated_at,
            revoked_at,
            ip,
            user_agent,
            MIN(issued_at) OVER (PARTITION BY family_id) AS created_at,
            MAX(GREATEST(issued_at, COALESCE(last_used_at, issued_at)))
              OVER (PARTITION BY family_id) AS family_last_used_at
          FROM auth_sessions
          WHERE user_ref = ${userRef}
            AND subject_type::text = ${subjectType}
            AND subject_id = ${subjectId}
        ),
        active_families AS (
          SELECT DISTINCT ON (family_id)
            id,
            family_id,
            created_at,
            family_last_used_at,
            expires_at,
            ip,
            user_agent
          FROM family_rows
          WHERE replaced_by_id IS NULL
            AND rotated_at IS NULL
            AND revoked_at IS NULL
            AND expires_at > NOW()
          ORDER BY family_id, issued_at DESC, id DESC
        )
        SELECT
          family_id AS "familyId",
          ((EXTRACT(EPOCH FROM created_at) * 1000000)::bigint)::text
            AS "sortMicros",
          created_at AS "createdAt",
          family_last_used_at AS "lastUsedAt",
          expires_at AS "expiresAt",
          ip,
          user_agent AS "userAgent",
          COALESCE(
            family_id = (
              SELECT family_id FROM family_rows WHERE id = ${currentSid} LIMIT 1
            ),
            FALSE
          ) AS "current"
        FROM active_families
        WHERE (
          ${cursorSortMicros}::bigint IS NULL
          OR (
            (EXTRACT(EPOCH FROM created_at) * 1000000)::bigint,
            family_id
          ) < (
            ${cursorSortMicros}::bigint,
            ${cursorFamilyId}::text
          )
        )
        ORDER BY created_at DESC, family_id DESC
        LIMIT ${take}
      `,
    );

    const page = rows.slice(0, query.limit);
    const last = page.at(-1);
    return {
      items: page.map((row) => ({
        sessionId: row.familyId,
        current: row.current,
        deviceLabel: deviceLabel(row.userAgent),
        ipAddress: maskIpAddress(row.ip),
        createdAt: row.createdAt.toISOString(),
        lastUsedAt: row.lastUsedAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
      })),
      nextCursor:
        rows.length > query.limit && last
          ? encodeSessionCursor({
              sortMicros: last.sortMicros,
              sessionId: last.familyId,
            })
          : null,
    };
  }

  /**
   * Ownership nằm ngay trong query. Row lịch sử được giữ sau revoke nên cùng subject gọi lại vẫn
   * 204; family của subject khác và id giả đều nhận cùng AUTH_SESSION_NOT_FOUND.
   */
  async revokeOwnedFamily(
    subjectType: SubjectType,
    subjectId: string,
    familyId: string,
    currentSid: string,
  ): Promise<void> {
    // DELETE cho phép token vừa tự revoke đi qua guard để retry được 204. Vì vậy service phải phân
    // biệt: caller còn active được revoke mọi device của mình; caller đã revoked chỉ được retry đúng
    // family của chính sid đó, không được dùng token chết để DoS các device khác.
    const cached = await this.cache.lookup(currentSid);
    const rows = await this.system((sessions) =>
      sessions.findMany({
        where: {
          subjectType,
          subjectId,
          userRef: userRefOf(subjectType, subjectId),
          OR: [{ familyId }, { id: currentSid }],
        },
        select: { id: true, familyId: true, revokedAt: true },
      }),
    );
    const caller = rows.find((row) => row.id === currentSid);
    if (!caller) {
      throw sessionExpired();
    }
    const callerActive = cached !== "revoked" && caller.revokedAt === null;
    if (!callerActive && caller.familyId !== familyId) {
      throw sessionExpired();
    }
    const owned = rows.find((row) => row.familyId === familyId);
    if (!owned) {
      throw sessionNotFound();
    }
    await this.revokeFamily(owned.familyId, SessionRevokeReason.LOGOUT);
  }

  /**
   * Logout = thu hồi cả family của lần đăng nhập này. Idempotent: gọi lại vẫn không lỗi. Chỉ ghi
   * audit khi thật sự thu hồi được gì — không thì mỗi lần gọi lại (access token còn 15 phút) là một
   * bản ghi append-only không xoá được.
   */
  async logout(sid: string): Promise<void> {
    const session = await this.findById(sid);
    if (!session) {
      await this.cache.markRevoked([sid]);
      return;
    }
    const revoked = await this.revokeFamily(session.familyId, SessionRevokeReason.LOGOUT);
    if (revoked > 0) {
      this.recordEvent(subjectEvent(session, "auth.logout"));
    }
  }

  /** FR-IAM-16. Tra theo `family_id` — lý do `.2` thêm index riêng cho cột này. */
  async revokeFamily(
    familyId: string,
    reason: SessionRevokeReason,
  ): Promise<number> {
    const count = await this.revoke({ familyId }, reason);
    this.recordRevoked("auth_session_family", familyId, reason, count);
    return count;
  }

  /** FR-IAM-16. Tra theo `user_ref` — dùng index `(user_ref, family_id)` của DB §7. */
  async revokeAllForSubject(
    type: SubjectType,
    id: string,
    reason: SessionRevokeReason,
  ): Promise<number> {
    const userRef = userRefOf(type, id);
    const count = await this.revoke({ userRef }, reason);
    this.recordRevoked("auth_subject", userRef, reason, count);
    return count;
  }

  async grantReauth(sid: string): Promise<void> {
    await this.cache.grantReauth(sid);
  }

  async hasRecentReauth(sid: string): Promise<boolean> {
    return this.cache.hasReauth(sid);
  }

  /**
   * Audit best-effort và KHÔNG chờ: Mongo chết hoặc CHẬM không được làm hỏng hay kéo dài
   * refresh/logout. Chờ ở đây thì refresh treo tới ~10 giây (timeout chọn server của Mongoose) SAU
   * KHI token cũ đã bị tiêu — client bỏ cuộc, gửi lại token cũ và bị coi là reuse, cả family chết oan.
   * `requestId`/`traceId` được đọc đồng bộ ngay lúc gọi nên không mất ngữ cảnh.
   */
  recordEvent(event: AuditEventInput): void {
    this.audit.recordAuditEvent(event).catch((error: unknown) => {
      this.logger.error(`Ghi audit ${event.action} thất bại: ${String(error)}`);
    });
  }

  /**
   * Thứ tự có chủ ý:
   *
   * 1. **Redis trước Postgres.** Redis lỗi thì dừng khi Postgres chưa đổi gì — lần gọi lại chạy lại
   *    trọn vẹn. Làm ngược lại thì Postgres đã revoke, `rotate` từ chối token sớm và không bao giờ
   *    ghi lại khoá Redis: cache `session:{sid}` "active" cũ tiếp tục cho access token đi qua.
   * 2. **UPDATE lặp tới khi 0 row.** READ COMMITTED: một `rotate` đang giữ khoá row cha khiến UPDATE
   *    của ta chờ, nhưng row con nó vừa INSERT commit SAU snapshot của ta nên bị bỏ sót — kẻ trộm
   *    đang refresh sẽ giữ được một token sống. Câu UPDATE sau có snapshot mới và bắt được row con.
   *    Dừng khi một câu UPDATE đổi 0 row: nếu còn `rotate` nào đang giữ khoá một row chưa revoke,
   *    câu đó đã phải chờ nó và đổi ít nhất một row.
   * 3. **Đánh dấu Redis lần nữa** cho các row con vừa bắt được (access token của chúng mới được ký).
   */
  private async revoke(target: RevokeTarget, reason: SessionRevokeReason): Promise<number> {
    await this.blockLiveAccessTokens(target);
    let total = 0;
    for (let round = 0; round < MAX_REVOKE_ROUNDS; round++) {
      // Mỗi vòng là một transaction riêng → snapshot mới, đúng điều vòng lặp cần.
      const { count } = await this.system((sessions) =>
        sessions.updateMany({
          where: { ...target, revokedAt: null },
          data: { revokedAt: new Date(), revokedReason: reason },
        }),
      );
      total += count;
      if (count === 0) {
        break;
      }
    }
    if (total > 0) {
      await this.blockLiveAccessTokens(target);
    }
    return total;
  }

  /**
   * Revoke trong Postgres không giết được access token đang còn hạn (JWT stateless) — phải đánh dấu
   * trên Redis. Chỉ phiên phát trong một TTL access gần nhất mới còn access token sống, nên chỉ đánh
   * dấu những phiên đó (một family 30 ngày có thể có hàng nghìn row đã rotate). Chọn theo mốc thời
   * gian chứ KHÔNG theo "row vừa đổi": gọi lại sau khi Redis lỗi thì updateMany trả 0 row, nhưng khoá
   * Redis vẫn phải được ghi.
   */
  private async blockLiveAccessTokens(where: RevokeTarget): Promise<void> {
    const cutoff = new Date(
      Date.now() -
        (this.config.JWT_ACCESS_TTL_SECONDS + ACCESS_TOKEN_SKEW_SECONDS) * 1000,
    );
    const live = await this.system((sessions) =>
      sessions.findMany({
        where: { ...where, issuedAt: { gte: cutoff } },
        select: { id: true },
      }),
    );
    await this.cache.markRevoked(live.map((session) => session.id));
  }

  private recordRevoked(
    targetType: string,
    targetId: string,
    reason: SessionRevokeReason,
    count: number,
  ): void {
    if (count === 0) {
      return;
    }
    this.recordEvent({
      action: "auth.session.revoked",
      targetType,
      targetId,
      reason,
      after: { count },
    });
  }

  /** Phát audit TRƯỚC khi revoke: revoke có thể 503 (Redis) và dấu vết tấn công không được mất theo. */
  private async handleReuse(session: AuthSession): Promise<void> {
    this.recordEvent(
      subjectEvent(session, "auth.token.reuse_detected", {
        reason: `family ${session.familyId}`,
      }),
    );
    await this.revokeFamily(
      session.familyId,
      SessionRevokeReason.REUSE_DETECTED,
    );
  }
}

/** Chỉ ghi id phiên/family — KHÔNG bao giờ token thô hay hash của nó. */
function subjectEvent(
  session: AuthSession,
  action: string,
  extra: Pick<AuditEventInput, "after" | "reason"> = {},
): AuditEventInput {
  return {
    actorId: session.subjectId,
    actorRole: session.subjectType,
    action,
    targetType: "auth_session",
    targetId: session.id,
    operatorId: session.operatorId ?? undefined,
    ...extra,
  };
}

/** Chỉ suy nhãn từ tập token biết trước; không bao giờ nối raw user-agent vào response. */
export function deviceLabel(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown device";
  }
  const browser = /Edg\//i.test(userAgent)
    ? "Edge"
    : /OPR\//i.test(userAgent)
      ? "Opera"
      : /(Chrome|CriOS)\//i.test(userAgent)
        ? "Chrome"
        : /(Firefox|FxiOS)\//i.test(userAgent)
          ? "Firefox"
          : /Safari\//i.test(userAgent) && /Version\//i.test(userAgent)
            ? "Safari"
            : /(Dart\/|okhttp\/)/i.test(userAgent)
              ? "Mobile app"
              : "Device";
  const os = /Windows/i.test(userAgent)
    ? "Windows"
    : /Android/i.test(userAgent)
      ? "Android"
      : /(iPhone|iPad|iPod)/i.test(userAgent)
        ? "iOS"
        : /Mac OS X/i.test(userAgent)
          ? "macOS"
          : /Linux/i.test(userAgent)
            ? "Linux"
            : null;
  return os ? `${browser} on ${os}` : browser;
}

export function maskIpAddress(ip: string | null): string | null {
  if (!ip) {
    return null;
  }
  const version = isIP(ip);
  if (version === 4) {
    const octets = ip.split(".");
    return `${octets[0]}.${octets[1]}.${octets[2]}.*`;
  }
  if (version !== 6) {
    return null;
  }
  const mappedV4 = ip.slice(ip.lastIndexOf(":") + 1);
  if (isIP(mappedV4) === 4) {
    return `::ffff:${maskIpAddress(mappedV4)}`;
  }
  const prefix = ip
    .split(":")
    .filter(Boolean)
    .slice(0, 2)
    .join(":");
  return prefix ? `${prefix}:*` : "IPv6:*";
}
