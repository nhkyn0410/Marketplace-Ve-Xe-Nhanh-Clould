"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ApiError, apiRequest, ensureCsrf, forgetCsrf, onSessionExpired } from "./api-client";

/** Response `GET /auth/me` (05 API §7.1.2). */
export type AuthMe = {
  subjectId: string;
  scope: "passenger" | "operator" | "platform";
  role: string;
  username: string;
  sessionId: string;
  accessExpiresAt: string;
  mfaVerified: boolean;
  operatorId?: string;
  operatorSlug?: string;
};

export type AuthState =
  | { status: "loading" }
  | { status: "anonymous"; notice?: string }
  | { status: "authenticated"; me: AuthMe }
  /** Không kiểm được phiên do mạng/máy chủ (không phải hết phiên) — UI cho thử lại. */
  | { status: "error" };

type AuthContextValue = {
  state: AuthState;
  /** Gọi sau khi login/MFA cấp phiên cookie: đọc lại `/auth/me` rồi vào app. */
  completeLogin: () => Promise<void>;
  logout: (notice?: string) => Promise<void>;
};

// v1 Operator OS chỉ dành cho Owner (06 UI §4/§7, TASK-IAM-006 Q4). Employee dùng app Nhân viên.
const OPERATOR_OWNER = "OPERATOR_OWNER";
const EMPLOYEE_NOTICE =
  "Tài khoản nhân viên không có dữ liệu trên Trang quản lý nhà xe. Vui lòng dùng ứng dụng Nhân viên.";
const WRONG_PORTAL_NOTICE = "Phiên đăng nhập hiện tại không thuộc Trang quản lý nhà xe. Vui lòng đăng nhập lại.";
const EXPIRED_NOTICE = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * State machine phiên web (06 UI §7): CSRF → `/auth/me` (401 thì refresh single-flight một lần) →
 * chỉ Owner scope `operator` mới được vào; phiên khác bị thu hồi ngay và quay về đăng nhập.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const logout = useCallback(async (notice?: string) => {
    try {
      await apiRequest("/auth/logout", { method: "POST", body: {} });
    } catch {
      // Phiên đã chết/không gọi được API: vẫn về màn đăng nhập; cookie hết hạn tự rơi.
    }
    forgetCsrf();
    setState({ status: "anonymous", notice });
  }, []);

  const loadSession = useCallback(async () => {
    setState((current) => (current.status === "error" ? { status: "loading" } : current));
    try {
      await ensureCsrf();
      const me = await apiRequest<AuthMe>("/auth/me");
      if (me.scope !== "operator") {
        await logout(WRONG_PORTAL_NOTICE);
      } else if (me.role !== OPERATOR_OWNER) {
        // Nhân viên đã bị chặn ở cổng API riêng (TASK-IAM-006); giữ làm lớp phòng thủ thứ hai.
        await logout(EMPLOYEE_NOTICE);
      } else {
        setState({ status: "authenticated", me });
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "AUTH_ORIGIN_FORBIDDEN") {
        // Cookie đang là phiên của cổng khác (Admin): API không cho dùng/thu hồi từ đây → chỉ về đăng nhập.
        setState({ status: "anonymous", notice: WRONG_PORTAL_NOTICE });
      } else if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        // Giữ thông báo hết phiên nếu listener vừa đặt; lần đầu vào trang thì không có thông báo.
        setState((current) => (current.status === "anonymous" ? current : { status: "anonymous" }));
      } else {
        setState({ status: "error" });
      }
    }
  }, [logout]);

  useEffect(() => {
    // Chỉ báo "hết hạn" khi người dùng đang ở trong app; khách mới mở trang thì chỉ thấy form đăng nhập.
    onSessionExpired(() =>
      setState((current) =>
        current.status === "authenticated" ? { status: "anonymous", notice: EXPIRED_NOTICE } : current
      )
    );
    void loadSession();
    return () => onSessionExpired(null);
  }, [loadSession]);

  const value = useMemo(() => ({ state, completeLogin: loadSession, logout }), [state, loadSession, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Truy cập trạng thái phiên và hành động login/logout. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth phải nằm trong <AuthProvider>.");
  }
  return value;
}
