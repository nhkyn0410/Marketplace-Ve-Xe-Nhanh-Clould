"use client";

import { Button } from "@vexenhanh/ui/components/button";
import type { ReactNode } from "react";

import { useAuth } from "../../lib/auth/auth-context";
import { LoginFlow } from "./login-flow";

/**
 * Chặn mọi màn Admin cho tới khi có phiên Platform hợp lệ (06 UI §9). Đăng nhập hiển thị ngay tại URL
 * đang mở nên sau khi vào được app người dùng ở lại đúng trang — không có tham số redirect để lạm dụng.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { state, completeLogin } = useAuth();

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-5 animate-spin rounded-full border-2 border-vxn-teal-500 border-t-transparent" />
          Đang kiểm tra phiên đăng nhập…
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
        <p className="text-sm text-vxn-fg-2">Không kết nối được máy chủ để kiểm tra phiên đăng nhập.</p>
        <Button onClick={() => void completeLogin()}>Thử lại</Button>
      </div>
    );
  }
  if (state.status === "anonymous") {
    // `key`: thông báo mới (hết phiên, sai cổng…) phải dựng lại luồng từ bước đầu để hiển thị.
    return <LoginFlow key={state.notice ?? ""} notice={state.notice} onAuthenticated={completeLogin} />;
  }
  return children;
}
