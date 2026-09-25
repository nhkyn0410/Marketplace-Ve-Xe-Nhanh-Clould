import { EventEmitter } from "node:events";
import type { Request, Response } from "express";
import type { Logger } from "pino";
import { describe, expect, it, vi } from "vitest";
import { createAppLogger, createHttpLoggerMiddleware, createNestLogger } from "./logger";
import { createRequestContextMiddleware } from "./request-context";

describe("auth monitoring log shape", () => {
  it("puts Nest auth event fields under data for Render log queries", () => {
    const warn = vi.fn();
    const logger = createNestLogger({ warn } as unknown as Logger);

    logger.warn({
      event: "auth.proxy_ip_untrusted",
      cfRay: "test-ray-SIN"
    });

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { event: "auth.proxy_ip_untrusted", cfRay: "test-ray-SIN" }
      }),
      "auth.proxy_ip_untrusted"
    );
  });

  it("redacts secrets in Nest object logs without losing the event message", () => {
    const chunks: string[] = [];
    const write = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      chunks.push(String(chunk));
      return true;
    });

    try {
      const logger = createAppLogger(
        { LOG_LEVEL: "info", NODE_ENV: "production", OTEL_SERVICE_NAME: "test-api" },
        "api"
      );
      createNestLogger(logger).log({
        event: "auth.otp.delivery_disabled",
        otp: "otp-secret",
        password: "password-secret",
        passwordChangeToken: "change-token-secret",
        newPassword: "new-password-secret",
        temporaryPassword: "temporary-password-secret",
        token: "token-secret",
        accessToken: "access-secret",
        refreshToken: "refresh-secret",
        apiKey: "api-key-secret",
        mfaCode: "mfa-code-secret",
        challengeToken: "challenge-secret",
        otpAuthUri: "otpauth-secret",
        backupCodes: ["backup-secret"]
      });
    } finally {
      write.mockRestore();
    }

    const raw = chunks.join("");
    for (const secret of [
      "otp-secret", "password-secret", "change-token-secret", "new-password-secret",
      "temporary-password-secret", "token-secret", "access-secret", "refresh-secret", "api-key-secret",
      "mfa-code-secret", "challenge-secret", "otpauth-secret", "backup-secret"
    ]) {
      expect(raw).not.toContain(secret);
    }
    const record = JSON.parse(raw) as { data: Record<string, string>; msg: string };
    expect(record.msg).toBe("auth.otp.delivery_disabled");
    for (const key of [
      "otp", "password", "passwordChangeToken", "newPassword", "temporaryPassword",
      "token", "accessToken", "refreshToken", "apiKey",
      "mfaCode", "challengeToken", "otpAuthUri", "backupCodes"
    ]) {
      expect(record.data[key]).toBe("[Redacted]");
    }
  });

  it("redacts session cookies from HTTP response headers", () => {
    const chunks: string[] = [];
    const write = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      chunks.push(String(chunk));
      return true;
    });

    try {
      const logger = createAppLogger(
        { LOG_LEVEL: "info", NODE_ENV: "production", OTEL_SERVICE_NAME: "test-api" },
        "api"
      );
      logger.info({ res: { headers: { "set-cookie": ["session=secret-cookie; HttpOnly"] } } }, "request completed");
    } finally {
      write.mockRestore();
    }

    const raw = chunks.join("");
    expect(raw).not.toContain("secret-cookie");
    const record = JSON.parse(raw) as { res: { headers: Record<string, string> } };
    expect(record.res.headers["set-cookie"]).toBe("[Redacted]");
  });

  it("writes requestId only once in a raw HTTP log line", () => {
    const chunks: string[] = [];
    const write = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      chunks.push(String(chunk));
      return true;
    });

    try {
      const requestId = "test-request-id-123";
      const headers = { "x-request-id": requestId };
      const request = {
        method: "GET",
        url: "/v1/health",
        headers,
        ip: "127.0.0.1",
        socket: { remoteAddress: "127.0.0.1", remotePort: 12345 },
        header: (name: string) => headers[name as keyof typeof headers]
      } as unknown as Request;
      const responseHeaders: Record<string, string> = {};
      const response = Object.assign(new EventEmitter(), {
        statusCode: 200,
        headersSent: true,
        setHeader: (name: string, value: string) => { responseHeaders[name] = value; },
        getHeaders: () => responseHeaders
      }) as unknown as Response;
      const logger = createAppLogger(
        { LOG_LEVEL: "info", NODE_ENV: "production", OTEL_SERVICE_NAME: "test-api" },
        "api"
      );

      createRequestContextMiddleware()(request, response, () => {
        createHttpLoggerMiddleware(logger)(request, response, () => response.emit("finish"));
      });
    } finally {
      write.mockRestore();
    }

    const raw = chunks.join("");
    expect(raw.match(/"requestId":/g)).toHaveLength(1);
    const record = JSON.parse(raw) as { requestId: string };
    expect(record.requestId).toBe("test-request-id-123");
  });
});
