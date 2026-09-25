import type { ExecutionContext } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { RecentReauthGuard } from "./recent-reauth.guard";

function context(user?: { sid: string }): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe("RecentReauthGuard", () => {
  it("cho qua khi proof re-auth còn hiệu lực", async () => {
    const sessions = { hasRecentReauth: vi.fn().mockResolvedValue(true) };
    await expect(
      new RecentReauthGuard(sessions as never).canActivate(context({ sid: "sid-1" })),
    ).resolves.toBe(true);
    expect(sessions.hasRecentReauth).toHaveBeenCalledWith("sid-1");
  });

  it("trả AUTH_REAUTH_REQUIRED khi thiếu proof", async () => {
    const guard = new RecentReauthGuard({ hasRecentReauth: vi.fn().mockResolvedValue(false) } as never);
    await expect(guard.canActivate(context({ sid: "sid-1" }))).rejects.toMatchObject({
      status: 401,
      response: { code: "AUTH_REAUTH_REQUIRED" },
    });
  });
});
