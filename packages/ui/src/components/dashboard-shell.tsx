"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { isNavItemActive, type NavGroup } from "../lib/nav";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { LogoMark } from "./logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";

type DashboardShellProps = {
  /** Tên cổng, vd "Trang quản lý nhà xe". */
  title: string;
  /** Nhãn phụ màu saffron cạnh tên cổng, vd "Hệ thống". */
  badge?: string;
  navGroups: NavGroup[];
  /** Khối tài khoản (tên + đăng xuất) ở chân sidebar và đầu trang mobile. */
  account?: ReactNode;
  children: ReactNode;
};

/** Khung Operator OS / Admin: sidebar cố định trên desktop, menu trượt trên mobile. */
export function DashboardShell({ title, badge, navGroups, account, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r bg-card lg:flex">
        <Brand title={title} badge={badge} />
        <SidebarNav navGroups={navGroups} />
        {account && <div className="mt-auto border-t p-3">{account}</div>}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-card px-2 lg:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mở menu">
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 overflow-y-auto p-0" aria-describedby={undefined}>
              <SheetTitle className="sr-only">Điều hướng</SheetTitle>
              <Brand title={title} badge={badge} />
              <SidebarNav navGroups={navGroups} onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="truncate text-sm font-semibold text-vxn-ink">{title}</span>
          {account && <div className="ml-auto">{account}</div>}
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

function Brand({ title, badge }: { title: string; badge?: string }) {
  return (
    <Link href="/" className="flex h-[73px] shrink-0 items-center gap-2.5 border-b px-5">
      <LogoMark className="size-9 shrink-0 text-vxn-teal-500" />
      <span className="text-base leading-tight font-semibold text-balance text-vxn-ink">
        {title}
        {badge && (
          <span className="ml-2 text-[11px] font-medium tracking-widest text-vxn-saffron-600 uppercase">
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
}

function SidebarNav({ navGroups, onNavigate }: { navGroups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col p-3">
      {navGroups.map((group, index) => (
        <div key={group.label ?? index}>
          {group.label && (
            <div className="px-3.5 pt-3.5 pb-1.5 text-[10px] font-medium tracking-widest text-vxn-fg-5 uppercase">
              {group.label}
            </div>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isNavItemActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-vxn-fg-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                      active && "bg-accent font-medium text-accent-foreground"
                    )}
                  >
                    <Icon className={cn("size-[18px] shrink-0", !active && "opacity-75")} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
