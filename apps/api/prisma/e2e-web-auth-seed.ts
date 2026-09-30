import { randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CredentialService } from "../src/iam/auth/credential.service";

/**
 * Seed cho E2E web auth (TASK-IAM-006, TC-SEC-008): mỗi lần chạy tạo bộ tài khoản MỚI với mật khẩu
 * ngẫu nhiên — Owner mật khẩu tạm + Employee DRIVER trong một nhà xe mới, và một Platform admin chưa
 * bật TOTP. In JSON ra stdout cho global-setup của Playwright; KHÔNG ghi file, KHÔNG chạy ở production.
 */
function loadEnv(): void {
  const nodeEnv = process.env.NODE_ENV?.trim() || "development";
  for (const file of [".env", `.env.${nodeEnv}`]) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) {
      process.loadEnvFile(path);
    }
  }
}

function password(): string {
  return `E2e-${randomBytes(12).toString("base64url")}`;
}

async function main(): Promise<void> {
  loadEnv();
  if (process.env.NODE_ENV === "production") {
    throw new Error("Không seed E2E ở production.");
  }
  // Ghi bảng tenant (RLS) → chạy bằng owner như migrate (TASK-IAM-003).
  const connectionString = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("MIGRATION_DATABASE_URL (hoặc DATABASE_URL) is required to seed.");
  }
  // Script tạo PLATFORM_ADMIN chưa bật TOTP: chỉ cho DB trên máy local, kể cả khi NODE_ENV bị đặt sai.
  const host = new URL(connectionString).hostname;
  if (!["localhost", "127.0.0.1", "[::1]", "::1"].includes(host)) {
    throw new Error(`E2E seed chỉ chạy với DB local — từ chối host "${host}".`);
  }

  const tag = randomUUID().slice(0, 8);
  const operatorSlug = `e2e-${tag}`;
  const accounts = {
    operatorSlug,
    owner: { username: `owner-${tag}`, temporaryPassword: password(), newPassword: password() },
    employee: { username: `nv.driver-${tag}`, password: password() },
    platform: { username: `e2e-${tag}`, password: password() }
  };

  const credentials = new CredentialService();
  const [ownerHash, employeeHash, platformHash] = await Promise.all([
    credentials.hash(accounts.owner.temporaryPassword),
    credentials.hash(accounts.employee.password),
    credentials.hash(accounts.platform.password)
  ]);

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.scope', 'system', true)`;
      const operator = await tx.operatorProfile.create({
        data: { operatorSlug, displayName: `E2E ${tag}`, status: "ACTIVE" }
      });
      await tx.operatorAccount.create({
        data: {
          operatorId: operator.id,
          operatorSlug,
          username: accounts.owner.username,
          contactEmail: `owner-${tag}@example.com`,
          passwordHash: ownerHash,
          passwordChangeRequired: true,
          temporaryPasswordExpiresAt: new Date(Date.now() + 60 * 60_000)
        }
      });
      await tx.employeeAccount.create({
        data: { operatorId: operator.id, username: accounts.employee.username, passwordHash: employeeHash, role: "DRIVER" }
      });
    });
    await prisma.platformAccount.create({
      data: { username: accounts.platform.username, passwordHash: platformHash, role: "PLATFORM_ADMIN" }
    });
  } finally {
    await prisma.$disconnect();
  }

  process.stdout.write(`${JSON.stringify(accounts)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
