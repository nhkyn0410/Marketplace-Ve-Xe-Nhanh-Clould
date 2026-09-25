import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { Express, Request } from "express";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { configureTrustProxy } from "./trust-proxy";
import { resolveTrustedClientIp } from "./trusted-client-ip";

@Module({})
class ProxyTestModule {}

const CLIENT_IP = "203.0.113.10";
const CLOUDFLARE_IP = "198.51.100.20";
const RENDER_IP = "10.24.8.245";
const HTTP_TEST_TIMEOUT_MS = 15_000;

describe("configureTrustProxy", () => {
  it("ignores X-Forwarded-For when no proxy is trusted", async () => {
    const result = await resolveIp(0, CLIENT_IP);

    expect(result.ip).not.toBe(CLIENT_IP);
    expect(result.ips).toEqual([]);
  }, HTTP_TEST_TIMEOUT_MS);

  it("resolves the client through the observed Cloudflare and Render path", async () => {
    const result = await resolveIp(3, `${CLIENT_IP}, ${CLOUDFLARE_IP}, ${RENDER_IP}`);

    expect(result.ip).toBe(CLIENT_IP);
  }, HTTP_TEST_TIMEOUT_MS);

  it("ignores an address spoofed to the left of the trusted path", async () => {
    const spoofedIp = "192.0.2.99";
    const result = await resolveIp(
      3,
      `${spoofedIp}, ${CLIENT_IP}, ${CLOUDFLARE_IP}, ${RENDER_IP}`
    );

    expect(result.ip).toBe(CLIENT_IP);
  }, HTTP_TEST_TIMEOUT_MS);

  it("still resolves the socket address when no forwarded header is present", async () => {
    const result = await resolveIp(3);

    expect(result.ip).toBeTruthy();
    expect(result.ips).toEqual([]);
  }, HTTP_TEST_TIMEOUT_MS);
});

describe("resolveTrustedClientIp", () => {
  it("uses the direct Express IP outside production", () => {
    expect(resolveTrustedClientIp(requestWith("127.0.0.1"), "development")).toBe(
      "127.0.0.1"
    );
  });

  it("accepts a valid production IP confirmed by Cloudflare", () => {
    const request = requestWith(CLIENT_IP, CLIENT_IP);

    expect(resolveTrustedClientIp(request, "production")).toBe(CLIENT_IP);
  });

  it("accepts a matching IPv6 address", () => {
    const clientIp = "2001:db8::1";

    expect(resolveTrustedClientIp(requestWith(clientIp, clientIp), "production")).toBe(
      clientIp
    );
  });

  it("rejects a production IP when Cloudflare reports a different address", () => {
    const request = requestWith("192.0.2.99", CLIENT_IP);

    expect(resolveTrustedClientIp(request, "production")).toBeUndefined();
  });

  it("rejects missing, repeated, or malformed Cloudflare headers in production", () => {
    expect(resolveTrustedClientIp(requestWith(CLIENT_IP), "production")).toBeUndefined();
    expect(
      resolveTrustedClientIp(
        requestWith(CLIENT_IP, [CLIENT_IP, "192.0.2.99"]),
        "production"
      )
    ).toBeUndefined();
    expect(
      resolveTrustedClientIp(requestWith(CLIENT_IP, "not-an-ip"), "production")
    ).toBeUndefined();
  });
});

async function resolveIp(
  trustedProxyHops: number,
  forwardedFor?: string
): Promise<{ ip?: string; ips: string[] }> {
  const app = await NestFactory.create<NestExpressApplication>(ProxyTestModule, {
    logger: false
  });

  try {
    configureTrustProxy(app, trustedProxyHops);
    const expressApp = app.getHttpAdapter().getInstance() as Express;
    expressApp.get("/ip", (request, response) => {
      response.json({ ip: request.ip, ips: request.ips });
    });

    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address() as AddressInfo;
    const headers = forwardedFor ? { "x-forwarded-for": forwardedFor } : undefined;
    const response = await fetch(`http://127.0.0.1:${address.port}/ip`, { headers });

    expect(response.ok).toBe(true);
    return await response.json() as { ip?: string; ips: string[] };
  } finally {
    await app.close();
  }
}

function requestWith(
  ip: string,
  cfConnectingIp?: string | string[]
): Pick<Request, "headers" | "ip"> {
  return {
    ip,
    headers: {
      ...(cfConnectingIp === undefined ? {} : { "cf-connecting-ip": cfConnectingIp }),
      "cf-ray": "test-ray-SIN",
      "user-agent": "vitest"
    }
  } as Pick<Request, "headers" | "ip">;
}
