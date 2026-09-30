import "@vexenhanh/ui/globals.css";

import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "../components/app-shell";
import { AuthGate } from "../components/auth/auth-gate";
import { AuthProvider } from "../lib/auth/auth-context";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap"
});

export const metadata: Metadata = {
  title: { default: "Trang quản lý nhà xe | Vé Xe Nhanh", template: "%s | Trang quản lý nhà xe" },
  // Cổng nội bộ sau đăng nhập — không cho công cụ tìm kiếm index.
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body>
        <AuthProvider>
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
