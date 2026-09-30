import { execSync } from "node:child_process";
import { resolve } from "node:path";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/v1";

/**
 * Kiểm API đang chạy rồi seed bộ tài khoản E2E mới (mật khẩu ngẫu nhiên) qua script của API.
 * Tài khoản chỉ nằm trong biến môi trường của tiến trình test — không ghi ra file.
 */
export default async function globalSetup(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/health`);
  } catch {
    throw new Error(`API chưa chạy ở ${API_BASE_URL} — bật API trước (IAM-006-guide §3).`);
  }
  const output = execSync("pnpm --filter @vexenhanh/api exec tsx prisma/e2e-web-auth-seed.ts", {
    cwd: resolve(__dirname, "../../.."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
  const json = output.trim().split("\n").at(-1) ?? "";
  JSON.parse(json);
  process.env.E2E_WEB_AUTH_ACCOUNTS = json;
}
