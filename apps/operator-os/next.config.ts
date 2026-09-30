import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `@vexenhanh/ui` xuất thẳng source TSX (không build) → Next phải tự biên dịch.
  transpilePackages: ["@vexenhanh/ui"],
  // TASK-IAM-006 (security L4): trang đăng nhập hiện secret TOTP + backup code → cấm nhúng iframe
  // (clickjacking) và không gửi Referer. CSP đầy đủ (script-src…) vẫn chờ Security §11.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;
