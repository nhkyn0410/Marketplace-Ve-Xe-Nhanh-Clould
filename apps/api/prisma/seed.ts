import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CredentialService } from "../src/iam/auth/credential.service";

/**
 * Seed IAM-001 — tài khoản tối thiểu để test login 3 namespace (provisioning đầy đủ = IAM-005).
 * Upsert refresh credential mỗi lần chạy (đổi mật khẩu qua SEED_*_PASSWORD env). Hash qua
 * CredentialService (1 nguồn format scrypt, tránh drift). Chạy: pnpm --filter @vexenhanh/api db:seed
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

/**
 * Mật khẩu seed PHẢI đến từ env. Để mặc định hardcode trong repo nghĩa là bất kỳ ai đọc GitHub
 * cũng biết mật khẩu platform-admin — chỉ cần một lần chạy nhầm DATABASE_URL là mất quyền.
 */
function requirePassword(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required to seed (không có mật khẩu mặc định).`);
  }
  return value;
}

async function main(): Promise<void> {
  loadEnv();

  // Chặn cứng: seed reset credential + mở khoá account, chạy nhầm ở production là chiếm quyền.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Không seed ở production — script này reset mật khẩu và trạng thái tài khoản.");
  }

  // Seed ghi thẳng bảng tenant (có RLS) → chạy bằng owner như migrate (TASK-IAM-003).
  const connectionString = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("MIGRATION_DATABASE_URL (hoặc DATABASE_URL) is required to seed.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const credentials = new CredentialService();
  try {
    const platformHash = await credentials.hash(requirePassword("SEED_PLATFORM_PASSWORD"));
    await prisma.platformAccount.upsert({
      where: { username: "khanh" },
      update: { passwordHash: platformHash },
      create: { username: "khanh", passwordHash: platformHash, role: "PLATFORM_ADMIN", status: "ACTIVE" }
    });

    const ownerHash = await credentials.hash(requirePassword("SEED_OPERATOR_PASSWORD"));
    const driverHash = await credentials.hash(requirePassword("SEED_EMPLOYEE_PASSWORD"));
    // operator_profiles + bảng account có RLS (TASK-IAM-003, FORCE áp cả owner không phải superuser)
    // → ghi trong ngữ cảnh system. Hash tính TRƯỚC: scrypt chậm, không để transaction mở lâu.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.scope', 'system', true)`;
      const operator = await tx.operatorProfile.upsert({
        where: { operatorSlug: "phuongtrang" },
        update: { displayName: "Phương Trang", status: "ACTIVE" },
        create: { operatorSlug: "phuongtrang", displayName: "Phương Trang", status: "ACTIVE" }
      });

      await tx.operatorAccount.upsert({
        where: { operatorSlug_username: { operatorSlug: "phuongtrang", username: "owner01" } },
        update: { passwordHash: ownerHash },
        create: {
          operatorId: operator.id,
          operatorSlug: "phuongtrang",
          username: "owner01",
          passwordHash: ownerHash,
          role: "OPERATOR_OWNER",
          status: "ACTIVE"
        }
      });

      // TASK-IAM-006: nhân viên dùng tiền tố `nv.` và cổng `/auth/employee/login`.
      await tx.employeeAccount.upsert({
        where: { operatorId_username: { operatorId: operator.id, username: "nv.driver042" } },
        update: { passwordHash: driverHash },
        create: {
          operatorId: operator.id,
          username: "nv.driver042",
          passwordHash: driverHash,
          role: "DRIVER",
          status: "ACTIVE"
        }
      });
    });

    console.log("Seed IAM done: platform/khanh, phuongtrang/owner01, phuongtrang/nv.driver042 (cổng nhân viên)");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
