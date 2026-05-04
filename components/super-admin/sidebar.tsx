"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Package,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trophy,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/super-admin/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        href: "/super-admin/users",
        label: "Manajemen User",
        icon: <Users className="w-4 h-4" />,
      },
      {
        href: "/super-admin/events",
        label: "Manajemen Event",
        icon: <CalendarDays className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Keuangan",
    items: [
      {
        href: "/super-admin/transactions",
        label: "Transaksi",
        icon: <CreditCard className="w-4 h-4" />,
        badge: "!",
      },
    ],
  },
  {
    title: "Voting",
    items: [
      {
        href: "/super-admin/vote-packages",
        label: "Paket Vote",
        icon: <Package className="w-4 h-4" />,
      },
    ],
  },
];

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative
        ${
          isActive
            ? "bg-red-900 text-white shadow-md shadow-red-900/20"
            : "text-slate-900 hover:text-slate-950 hover:bg-slate-100"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <span className="shrink-0">{item.icon}</span>

      {!collapsed && <span className="truncate flex-1">{item.label}</span>}

      {!collapsed && item.badge && (
        <span className="ml-auto bg-yellow-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0">
          {item.badge}
        </span>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
          {item.label}
          {item.badge && (
            <span className="ml-1 text-yellow-400">{item.badge}</span>
          )}
        </div>
      )}
    </Link>
  );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/super-admin";
  }

  return (
    <aside
      className={`
        hidden md:flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-200 shrink-0 ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <img
          src="/evora-logo-2026.png"
          alt="Evora Logo"
          className="w-8 h-8 object-contain drop-shadow-md shrink-0"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-slate-900 font-bold text-sm leading-tight truncate">
              EVORA
            </p>
            <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest truncate">
              Super Admin
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {group.title}
              </p>
            )}
            {collapsed && <div className="border-t border-slate-200 mb-2" />}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="shrink-0 border-t border-slate-200 p-2 space-y-1">
        {/* Shield badge */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-700 shrink-0" />
            <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
              Privileged Access
            </span>
          </div>
        )}

        {/* Trophy / Ranking shortcut */}
        <Link
          href="/super-admin/events"
          title={collapsed ? "Rankings" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 hover:text-slate-950 hover:bg-slate-100 transition-all group relative ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Rankings</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              Rankings
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Keluar" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 hover:text-red-700 hover:bg-red-50 transition-all group relative ${collapsed ? "justify-center px-2" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
              Keluar
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all ${collapsed ? "justify-center px-2" : ""}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Perkecil</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function MobileSidebar() {
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/super-admin";
  }

  return (
    <>
      {/* Mobile top bar trigger */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/evora-logo-2026.png"
            alt="Evora Logo"
            className="w-7 h-7 object-contain drop-shadow-md shrink-0"
          />
          <div>
            <p className="text-slate-900 font-bold text-sm leading-none">EVORA</p>
            <p className="text-red-400 text-[9px] font-bold uppercase tracking-widest">
              Super Admin
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-700 hover:text-slate-950 p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col transform transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/evora-logo-2026.png"
              alt="Evora Logo"
              className="w-7 h-7 object-contain drop-shadow-md shrink-0"
            />
            <div>
              <p className="text-slate-900 font-bold text-sm leading-none">EVORA</p>
              <p className="text-red-400 text-[9px] font-bold uppercase tracking-widest">
                Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-700 hover:text-slate-950 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    collapsed={false}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 border-t border-slate-200 p-2 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-red-700 shrink-0" />
            <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
              Privileged Access
            </span>
          </div>

          <Link
            href="/super-admin/events"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 hover:text-slate-950 hover:bg-slate-100 transition-all"
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Rankings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-900 hover:text-red-700 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function SuperAdminSidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
