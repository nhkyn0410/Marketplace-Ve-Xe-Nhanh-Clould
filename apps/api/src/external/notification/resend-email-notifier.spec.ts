import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResendEmailNotifier } from "./resend-email-notifier";

describe("ResendEmailNotifier temporary password", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the secret only in the provider body and never logs it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const error = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    const secret = "A<&secret'\"";

    try {
      await new ResendEmailNotifier("api-key", "noreply@example.com").sendTemporaryPassword({
        email: "employee@example.com",
        temporaryPassword: secret,
        loginIdentifier: "operator/user<1>",
        expiresAt: new Date("2026-09-23T00:00:00.000Z"),
      });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { html: string };
      expect(body.html).toContain("A&lt;&amp;secret&#39;&quot;");
      expect(body.html).not.toContain(secret);
      expect(JSON.stringify(error.mock.calls)).not.toContain(secret);
    } finally {
      error.mockRestore();
    }
  });

  it("masks the email and omits the secret when Resend rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const error = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    const secret = "do-not-log-this";

    try {
      await expect(
        new ResendEmailNotifier("api-key", "noreply@example.com").sendTemporaryPassword({
          email: "employee@example.com",
          temporaryPassword: secret,
          loginIdentifier: "operator/user",
          expiresAt: new Date("2026-09-23T00:00:00.000Z"),
        }),
      ).rejects.toThrow(/503/);
      const logged = JSON.stringify(error.mock.calls);
      expect(logged).toContain("e***@example.com");
      expect(logged).not.toContain("employee@example.com");
      expect(logged).not.toContain(secret);
    } finally {
      error.mockRestore();
    }
  });
});

