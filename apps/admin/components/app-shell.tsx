"use client";

import { Button } from "@vexenhanh/ui/components/button";
import { DashboardShell } from "@vexenhanh/ui/components/dashboard-shell";
import type { NavGroup } from "@vexenhanh/ui/lib/nav";
import {
  Banknote,
  Building2,
  ChartColumn,
  CreditCard,
  FolderTree,
  History,
  LayoutDashboard,
  LogOut,
  Plug,
  Scale,
  ScrollText,
  TicketPercent,
  Users
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { useAuth } from "../lib/auth/auth-context";

// Theo 06 UI/UX §5 (Information architecture — Admin); path bám resource của 05 API §7.5.
const NAV_GROUPS: NavGroup[] = [
  { items: [{ href: "/", label: "Tổng quan", icon: LayoutDashboard }] },
  {
    label: "Đối tác & người dùng",
    items: [
      { href: "/operators", label: "Nhà xe & KYC", icon: Building2 },
      { href: "/passengers", label: "Hành khách", icon: Users }
    ]
  },
  {
    label: "Cấu hình",
    items: [
      { href: "/catalog", label: "Danh mục", icon: FolderTree },
      { href: "/policies", label: "Chính sách", icon: ScrollText },
      { href: "/promotions", label: "Khuyến mãi", icon: TicketPercent }
    ]
  },
  {
    label: "Tài chính",
    items: [
      { href: "/payments", label: "Thanh toán & hoàn tiền", icon: CreditCard },
      { href: "/payouts", label: "Chi trả nhà xe", icon: Banknote }
    ]
  },
  {
    label: "Giám sát",
    items: [
      { href: "/disputes", label: "Tranh chấp", icon: Scale },
      { href: "/reports", label: "Báo cáo", icon: ChartColumn },
      { href: "/audit-logs", label: "Nhật ký kiểm toán", icon: History },
      { href: "/integrations", label: "Tích hợp", icon: Plug }
    ]
  }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell title="Admin" badge="Hệ thống" navGroups={NAV_GROUPS} account={<AccountMenu />}>
      {children}
    </DashboardShell>
  );
}

/** Tên tài khoản đang đăng nhập + nút đăng xuất (thu hồi phiên, xoá cookie). */
function AccountMenu() {
  const { state, logout } = useAuth();
  const [pending, setPending] = useState(false);
  if (state.status !== "authenticated") {
    return null;
  }
  const identifier = `platform/${state.me.username}`;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden min-w-0 flex-1 truncate text-sm text-vxn-fg-2 lg:block" title={identifier}>
        {identifier}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void logout().finally(() => setPending(false));
        }}
      >
        <LogOut />
        Đăng xuất
      </Button>
    </div>
  );
}
