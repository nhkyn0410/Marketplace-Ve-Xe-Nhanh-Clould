import { randomUUID } from "node:crypto";
import type { ExecutionContext, HttpException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppConfig } from "../../config/env.config";
import { sessionExpired } from "../session/session.errors";
import type { SessionService } from "../session/session.service";
import { serviceUnavailable } from "./auth.errors";
import {
  AccessTokenGuard,
  AllowRevokedSession,
  type AuthenticatedRequest,
} from "./access-token.guard";
import { TokenService } from "./token.service";

const config = {
  NODE_ENV: "test",
  JWT_ACCESS_TTL_SECONDS: 900,
  JWT_ISSUER: "vexenhanh-test",
} as AppConfig;

async function problemOf(
  promise: Promise<unknown>,
): Promise<{ status: number; code?: string }> {
  try {
    await promise;
    return { status: 0 };
  } catch (error) {
    const exception = error as HttpException;
    return {
      status: exception.getStatus(),
      code: (exception.getResponse() as { code?: string }).code,
    };
  }
}

class NormalRoute {
  handle(): void {}
}

class LogoutRoute {
  @AllowRevokedSession()
  handle(): void {}
}

function contextWith(authorization?: string, route: object = NormalRoute) {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => (route as typeof NormalRoute).prototype.handle,
    getClass: () => route,
  } as unknown as ExecutionContext;
  return { request, context };
}

describe("AccessTokenGuard", () => {
  const assertActive = vi.fn();
  const assertOperatorAccountCurrent = vi.fn();
  const sessions = { assertActive, assertOperatorAccountCurrent } as unknown as SessionService;
  const sid = randomUUID();
  let guard: AccessTokenGuard;
  let valid: string;

  beforeAll(async () => {
    const tokens = new TokenService(config);
    await tokens.onModuleInit();
    guard = new AccessTokenGuard(tokens, sessions, new Reflector());
    valid = (
      await tokens.mintAccessToken({
        sub: "u-1",
        sid,
        scope: "passenger",
        role: "PASSENGER",
      })
    ).accessToken;
  });

  beforeEach(() => {
    assertActive.mockReset();
    assertActive.mockResolvedValue(undefined);
    assertOperatorAccountCurrent.mockReset();
    assertOperatorAccountCurrent.mockResolvedValue(undefined);
  });

  it("token hợp lệ, phiên còn sống → cho qua và gắn claim vào request", async () => {
    const { request, context } = contextWith(`Bearer ${valid}`);
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user?.sid).toBe(sid);
    expect(assertActive).toHaveBeenCalledWith(sid);
    expect(assertOperatorAccountCurrent).toHaveBeenCalledWith(expect.objectContaining({ sid }));
  });

  it("scheme không phân biệt hoa thường (RFC 7235)", async () => {
    expect(
      await guard.canActivate(contextWith(`bearer ${valid}`).context),
    ).toBe(true);
  });

  it.each([
    [undefined],
    ["Basic abc"],
    ["Bearer"],
    ["Bearer khong-phai-jwt"],
  ])("header %s → 401, không chạm Redis/Postgres", async (header) => {
    expect(
      await problemOf(guard.canActivate(contextWith(header).context)),
    ).toEqual({
      status: 401,
      code: "AUTH_SESSION_EXPIRED",
    });
    expect(assertActive).not.toHaveBeenCalled();
  });

  it("token hợp lệ nhưng phiên đã revoke → 401", async () => {
    assertActive.mockRejectedValue(sessionExpired());
    expect(
      await problemOf(guard.canActivate(contextWith(`Bearer ${valid}`).context)),
    ).toEqual({
      status: 401,
      code: "AUTH_SESSION_EXPIRED",
    });
  });

  it("Redis lỗi → 503, KHÔNG cho qua", async () => {
    assertActive.mockRejectedValue(serviceUnavailable());
    expect(
      await problemOf(guard.canActivate(contextWith(`Bearer ${valid}`).context)),
    ).toEqual({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("route @AllowRevokedSession (logout) bỏ qua kiểm phiên nhưng VẪN đòi token ký hợp lệ", async () => {
    assertActive.mockRejectedValue(sessionExpired());
    expect(
      await guard.canActivate(contextWith(`Bearer ${valid}`, LogoutRoute).context),
    ).toBe(true);
    expect(assertActive).not.toHaveBeenCalled();

    expect(
      await problemOf(
        guard.canActivate(contextWith("Bearer gia-mao", LogoutRoute).context),
      ),
    ).toEqual({ status: 401, code: "AUTH_SESSION_EXPIRED" });
  });
});
