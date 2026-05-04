// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Pure data configuration for sidebar menus
// No logic here, only data structures

import {
  LayoutDashboard,
  Home,
  Calendar,
  Vote,
  UserCircle,
  LogOut,
  Tag,
  Users,
  CreditCard,
  Trophy,
  BarChart3,
  ClipboardList,
  CheckCircle,
  Monitor,
  FileSpreadsheet,
  ArrowLeft,
  Settings,
  List,
  Receipt,
  PlusCircle,
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { ManagedEvent } from "@/services/event-management-service";

// Types
export interface SidebarMenuItem {
  label: string;
  href: string | ((eventId: string) => string);
  icon: LucideIcon;
  exactMatch?: boolean; // untuk active state matching
}

// Konstanta
export const SIDEBAR_EVENT_LIMIT = 10;

// Role badge color mapping
export const ROLE_BADGE_CONFIG: Record<
  ManagedEvent["role"],
  { label: string; className: string }
> = {
  ORGANIZER: {
    label: "Organizer",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  JUDGE: {
    label: "Juri",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  TABULATOR: {
    label: "Tabulator",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  OFFICIAL_TEAM: {
    label: "Tim",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
};

// Role-specific menus - Restructured for better UX
export const ROLE_MENUS: Record<ManagedEvent["role"], SidebarMenuItem[]> = {
  ORGANIZER: [
    {
      label: "Overview",
      href: (eventId) => `/dashboard/events/${eventId}/overview`,
      icon: LayoutDashboard,
      exactMatch: true,
    },
    {
      label: "Tim",
      href: (eventId) => `/dashboard/events/${eventId}/teams`,
      icon: Users,
    },
    {
      label: "Transaksi",
      href: (eventId) => `/dashboard/events/${eventId}/transactions`,
      icon: CreditCard,
    },
    {
      label: "Voting",
      href: (eventId) => `/dashboard/events/${eventId}/voting`,
      icon: Vote,
    },
    {
      label: "Penilaian",
      href: (eventId) => `/dashboard/events/${eventId}/scoring`,
      icon: Trophy,
    },
    {
      label: "Peringkat",
      href: (eventId) => `/dashboard/events/${eventId}/rankings`,
      icon: BarChart3,
    },
    {
      label: "Analitik",
      href: (eventId) => `/dashboard/events/${eventId}/analytics`,
      icon: PieChart,
    },
  ],
  JUDGE: [
    {
      label: "Form Rubrik",
      href: (eventId) => `/dashboard/events/${eventId}/rubrics`,
      icon: ClipboardList,
    },
    {
      label: "Status Penilaian",
      href: (eventId) => `/dashboard/events/${eventId}/scoring-status`,
      icon: CheckCircle,
    },
  ],
  TABULATOR: [
    {
      label: "Monitoring",
      href: (eventId) => `/dashboard/events/${eventId}/monitoring`,
      icon: Monitor,
    },
    {
      label: "Scoring Sheets",
      href: (eventId) => `/dashboard/events/${eventId}/scoring-sheets`,
      icon: FileSpreadsheet,
    },
    {
      label: "Rankings",
      href: (eventId) => `/dashboard/events/${eventId}/rankings`,
      icon: BarChart3,
    },
  ],
  OFFICIAL_TEAM: [
    {
      label: "Detail Tim",
      href: (eventId) => `/dashboard/events/${eventId}/team`,
      icon: Users,
      exactMatch: true,
    },
    {
      label: "Anggota",
      href: (eventId) => `/dashboard/events/${eventId}/members`,
      icon: Users,
    },
    {
      label: "Upload Bayar",
      href: (eventId) => `/dashboard/events/${eventId}/payment`,
      icon: CreditCard,
    },
    {
      label: "Nilai Tim",
      href: (eventId) => `/dashboard/events/${eventId}/scores`,
      icon: Trophy,
    },
  ],
};

// Base menu untuk semua user (simplified - Phase 11)
export const BASE_MENU: SidebarMenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    exactMatch: true,
  },
  {
    label: "Kelola Event",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    label: "Voting",
    href: "/voting",
    icon: Vote,
  },
];

// Account menu (simplified - Phase 11)
export const ACCOUNT_MENU: SidebarMenuItem[] = [
  {
    label: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// Back to dashboard menu (untuk event context)
export const BACK_TO_DASHBOARD_MENU: SidebarMenuItem = {
  label: "Kembali ke Dashboard",
  href: "/dashboard",
  icon: ArrowLeft,
};

// Back to event list menu (untuk event context - Phase 11)
export const BACK_TO_EVENT_LIST_MENU: SidebarMenuItem = {
  label: "Kembali ke Daftar Event",
  href: "/dashboard/events",
  icon: ArrowLeft,
};

// Logout menu item
export const LOGOUT_MENU: SidebarMenuItem = {
  label: "Keluar",
  href: "/logout",
  icon: LogOut,
};

// Role display names untuk UI
export const ROLE_DISPLAY_NAMES: Record<ManagedEvent["role"], string> = {
  ORGANIZER: "Organizer",
  TABULATOR: "Tabulator",
  JUDGE: "Juri",
  OFFICIAL_TEAM: "Tim Official",
};

// NOTE: ORGANIZER_MENU (aggregate cross-event navigation) telah dihapus
// karena melanggar prinsip event-scoped access.
// Organizer hanya dapat mengakses event yang mereka miliki akses.
// Semua navigasi event-specific sekarang melalui /dashboard/events/[event_id]
