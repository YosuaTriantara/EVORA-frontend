"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { getMe } from "@/lib/admin-api";
import { Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Middleware already enforces that only authenticated SUPER_ADMINs reach
// /super-admin/* pages. This component only:
//   • Renders the login page as-is (no wrapper)
//   • Fetches the user profile for the header display on admin pages
function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage =
    pathname === "/super-admin" || pathname === "/super-admin/login";

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);

  useEffect(() => {
    // No need to fetch profile on the login page
    if (isLoginPage) return;

    getMe()
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        // Middleware will redirect on the next navigation; nothing to do here
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoginPage]);

  // ── Login page — no chrome, just the page content ─────────────────────────
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ── Loading while fetching user info ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-red-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          <p className="text-slate-500 text-sm">Memverifikasi sesi…</p>
        </div>
      </div>
    );
  }

  // ── Authenticated admin layout ────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Super Admin Panel
            </span>
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                  {user.role.replace("_", " ")}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}

// ─── Layout Root ──────────────────────────────────────────────────────────────
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
