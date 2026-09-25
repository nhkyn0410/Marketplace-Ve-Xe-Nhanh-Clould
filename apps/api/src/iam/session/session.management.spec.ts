import { HttpException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { AuditService } from "../../audit/audit.service";
import type { AppConfig } from "../../config/env.config";
import type { PrismaService } from "../../database/prisma.service";
import { SubjectType } from "../../database/prisma.types";
import type { VerifiedAccessToken } from "../auth/token.service";
import { SessionController } from "./session.controller";
import { RefreshTokenService } from "./refresh-token.service";
import type { SessionCache } from "./session-cache";
import {
  decodeSessionCursor,
  encodeSessionCursor,
  SessionListQuerySchema,
} from "./session.dto";
import {
  deviceLabel,
  maskIpAddress,
  SessionService,
} from "./session.service";

const config = {
  JWT_ACCESS_TTL_SECONDS: 900,
  REFRESH_TOKEN_TTL_SECONDS: 2_592_000,
} as AppConfig;
const audit = { recordAuditEvent: vi.fn().mockResolvedValue(undefined) };
const cache = {
  lookup: vi.fn(),
  markActive: vi.fn(),
  markRevoked: vi.fn(),
  grantReauth: vi.fn(),
  hasReauth: vi.fn(),
};

function serviceWith(prisma: object): SessionService {
  return new SessionService(
    config,
    prisma as PrismaService,
    new RefreshTokenService(),
    audit as unknown as AuditService,
    cache as unknown as SessionCache,
  );
}

async function errorCode(promise: Promise<unknown>): Promise<string | undefined> {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return ((error as HttpException).getResponse() as { code?: string }).code;
  }
}

describe("Session management", () => {
  it.each([
    [SubjectType.OPERATOR, "OPERATOR_OWNER"],
    [SubjectType.EMPLOYEE, "DRIVER"],
  ])("chặn phiên %s khi account đang chờ gửi mật khẩu", async (subjectType, role) => {
    const sid = randomUUID();
    const sub = randomUUID();
    const operatorId = randomUUID();
    const tx = {
      authSession: { findUnique: vi.fn().mockResolvedValue({
        subjectType, subjectId: sub, operatorId, authEpoch: 0, revokedAt: null,
      }) },
      operatorAccount: { findUnique: vi.fn().mockResolvedValue({
        id: sub, operatorId, authEpoch: 0, role, status: "ACTIVE",
        credentialDeliveryPending: true, passwordChangeRequired: false,
        operator: { status: "ACTIVE", operatorSlug: "nhaxe" },
      }) },
      employeeAccount: { findUnique: vi.fn().mockResolvedValue({
        id: sub, operatorId, authEpoch: 0, role, status: "ACTIVE",
        credentialDeliveryPending: true, passwordChangeRequired: false,
        operator: { status: "ACTIVE", operatorSlug: "nhaxe" },
      }) },
    };
    const prisma = { withSystem: vi.fn((work: (db: typeof tx) => unknown) => work(tx)) };
    const service = serviceWith(prisma);

    expect(await errorCode(service.assertOperatorAccountCurrent({
      sid, sub, scope: "operator", role, operatorId, operatorSlug: "nhaxe",
    } as VerifiedAccessToken))).toBe("AUTH_SESSION_EXPIRED");
  });

  it("controller maps all authenticated namespaces to the four persisted subject types", async () => {
    const listForSubject = vi.fn().mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    const controller = new SessionController({
      listForSubject,
    } as unknown as SessionService);
    const base = { sub: randomUUID(), sid: randomUUID() };
    const actors = [
      { scope: "passenger", role: "PASSENGER", type: SubjectType.PASSENGER },
      { scope: "operator", role: "OPERATOR_OWNER", type: SubjectType.OPERATOR },
      { scope: "operator", role: "DRIVER", type: SubjectType.EMPLOYEE },
      { scope: "platform", role: "PLATFORM_ADMIN", type: SubjectType.PLATFORM },
    ] as const;

    for (const actor of actors) {
      await controller.list(
        { limit: 20 },
        { ...base, scope: actor.scope, role: actor.role } as VerifiedAccessToken,
      );
      expect(listForSubject).toHaveBeenLastCalledWith(
        actor.type,
        base.sub,
        base.sid,
        { limit: 20 },
      );
    }
  });

  it("query defaults limit=20, rejects values outside 1..100, and cursor round-trips", () => {
    expect(SessionListQuerySchema.parse({})).toEqual({ limit: 20 });
    expect(SessionListQuerySchema.parse({ limit: "100" })).toEqual({
      limit: 100,
    });
    expect(SessionListQuerySchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(SessionListQuerySchema.safeParse({ limit: 101 }).success).toBe(false);

    const value = {
      sortMicros: "1789951234567890",
      sessionId: randomUUID(),
    };
    expect(decodeSessionCursor(encodeSessionCursor(value))).toEqual({
      v: 1,
      ...value,
    });
    expect(decodeSessionCursor("khong-phai-cursor")).toBeNull();
    const overflow = Buffer.from(JSON.stringify({
      v: 1,
      sortMicros: "9223372036854775808",
      sessionId: randomUUID(),
    })).toString("base64url");
    expect(decodeSessionCursor(overflow)).toBeNull();
  });

  it("maps one family/page, masks metadata, and never exposes sid/hash/raw user-agent", async () => {
    const firstFamily = randomUUID();
    const secondFamily = randomUUID();
    const now = Date.now();
    const queryRaw = vi.fn().mockResolvedValue([
      {
        familyId: firstFamily,
        sortMicros: "1789951234567890",
        current: true,
        createdAt: new Date(now - 10_000),
        lastUsedAt: new Date(now - 1_000),
        expiresAt: new Date(now + 60_000),
        ip: "203.0.113.42",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0) AppleWebKit Chrome/130.0 secret-fragment",
      },
      {
        familyId: secondFamily,
        sortMicros: "1789951234567000",
        current: false,
        createdAt: new Date(now - 20_000),
        lastUsedAt: new Date(now - 2_000),
        expiresAt: new Date(now + 50_000),
        ip: null,
        userAgent: null,
      },
    ]);
    const prisma = {
      withSystem: vi.fn((work) => work({ $queryRaw: queryRaw })),
    };
    const sessions = serviceWith(prisma);
    const subjectId = randomUUID();
    const currentSid = randomUUID();

    const result = await sessions.listForSubject(
      SubjectType.PASSENGER,
      subjectId,
      currentSid,
      { limit: 1 },
    );

    expect(result.items).toEqual([
      expect.objectContaining({
        sessionId: firstFamily,
        current: true,
        deviceLabel: "Chrome on Windows",
        ipAddress: "203.0.113.*",
      }),
    ]);
    expect(result.nextCursor).not.toBeNull();
    expect(decodeSessionCursor(result.nextCursor ?? undefined)?.sessionId).toBe(
      firstFamily,
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(currentSid);
    expect(serialized).not.toContain("secret-fragment");
    expect(serialized).not.toContain("refreshTokenHash");

    // Tagged query nhận đủ owner tuple + sid; không list theo subjectId trần.
    const values = queryRaw.mock.calls[0]!.slice(1);
    expect(values).toEqual(
      expect.arrayContaining([
        `passenger:${subjectId}`,
        SubjectType.PASSENGER,
        subjectId,
        currentSid,
      ]),
    );
  });

  it("rejects a malformed cursor before querying Postgres", async () => {
    const prisma = { withSystem: vi.fn() };
    const sessions = serviceWith(prisma);

    await expect(
      sessions.listForSubject(
        SubjectType.PASSENGER,
        randomUUID(),
        randomUUID(),
        { cursor: "bad", limit: 20 },
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(prisma.withSystem).not.toHaveBeenCalled();
  });

  it("checks family ownership in-query; owned/already-revoked is idempotent, foreign/missing is 404", async () => {
    const familyId = randomUUID();
    const subjectId = randomUUID();
    const currentSid = randomUUID();
    const findMany = vi
      .fn()
      .mockResolvedValueOnce([
        { id: currentSid, familyId, revokedAt: null },
      ])
      .mockResolvedValueOnce([
        { id: currentSid, familyId, revokedAt: new Date() },
      ])
      .mockResolvedValueOnce([
        { id: currentSid, familyId, revokedAt: null },
      ]);
    const prisma = {
      withSystem: vi.fn((work) => work({ authSession: { findMany } })),
    };
    const sessions = serviceWith(prisma);
    const revoke = vi.spyOn(sessions, "revokeFamily").mockResolvedValue(0);
    cache.lookup.mockResolvedValueOnce("active").mockResolvedValueOnce("revoked");

    await sessions.revokeOwnedFamily(
      SubjectType.EMPLOYEE,
      subjectId,
      familyId,
      currentSid,
    );
    await sessions.revokeOwnedFamily(
      SubjectType.EMPLOYEE,
      subjectId,
      familyId,
      currentSid,
    );
    expect(revoke).toHaveBeenCalledTimes(2);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        subjectType: SubjectType.EMPLOYEE,
        subjectId,
        userRef: `employee:${subjectId}`,
        OR: [{ familyId }, { id: currentSid }],
      },
      select: { id: true, familyId: true, revokedAt: true },
    });

    expect(
      await errorCode(
        sessions.revokeOwnedFamily(
          SubjectType.EMPLOYEE,
          subjectId,
          randomUUID(),
          currentSid,
        ),
      ),
    ).toBe("AUTH_SESSION_NOT_FOUND");
  });

  it("a revoked caller may retry its own family but cannot revoke another device", async () => {
    const ownFamily = randomUUID();
    const otherFamily = randomUUID();
    const currentSid = randomUUID();
    cache.lookup.mockResolvedValue("revoked");
    const prisma = {
      withSystem: vi.fn((work) =>
        work({
          authSession: {
            findMany: vi.fn().mockResolvedValue([
              { id: currentSid, familyId: ownFamily, revokedAt: new Date() },
              { id: randomUUID(), familyId: otherFamily, revokedAt: null },
            ]),
          },
        }),
      ),
    };
    const sessions = serviceWith(prisma);
    vi.spyOn(sessions, "revokeFamily").mockResolvedValue(0);

    expect(
      await errorCode(
        sessions.revokeOwnedFamily(
          SubjectType.PASSENGER,
          randomUUID(),
          otherFamily,
          currentSid,
        ),
      ),
    ).toBe("AUTH_SESSION_EXPIRED");
  });

  it("derives only coarse device labels and masks IPv4/IPv6 without echoing malformed values", () => {
    expect(deviceLabel("Dart/3.9 (dart:io) Android")).toBe(
      "Mobile app on Android",
    );
    expect(deviceLabel("attacker-controlled-value")).toBe("Device");
    expect(maskIpAddress("198.51.100.77")).toBe("198.51.100.*");
    expect(maskIpAddress("2001:db8:abcd:12::1")).toBe("2001:db8:*");
    expect(maskIpAddress("::ffff:192.0.2.9")).toBe("::ffff:192.0.2.*");
    expect(maskIpAddress("not-an-ip")).toBeNull();
  });
});
