// CREATED: 2025-04-17 - Tab configuration for ORGANIZER role in event context
// Defines tabs available for ORGANIZER when viewing an event

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  BarChart3,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

export interface EventTab {
  id: string;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  description?: string;
}

// Tabs available for ORGANIZER role
export const ORGANIZER_TABS: EventTab[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    description: "Ringkasan event dan statistik",
  },
  {
    id: "teams",
    label: "Teams",
    href: "/teams",
    icon: Users,
    description: "Kelola tim peserta",
  },
  {
    id: "transactions",
    label: "Transaksi",
    href: "/transactions",
    icon: CreditCard,
    description: "Verifikasi pembayaran",
  },
  {
    id: "voting",
    label: "Voting",
    href: "/voting",
    icon: Trophy,
    description: "Pengaturan voting",
  },
  {
    id: "scoring",
    label: "Penilaian",
    href: "/scoring",
    icon: ClipboardList,
    description: "Kelola penilaian",
  },
  {
    id: "rankings",
    label: "Peringkat",
    href: "/rankings",
    icon: TrendingUp,
    description: "Lihat peringkat",
  },
  {
    id: "analytics",
    label: "Analitik",
    href: "/analytics",
    icon: BarChart3,
    description: "Analisis event",
  },
];

// Get tabs for a specific role
export function getTabsForRole(role: string): EventTab[] {
  switch (role) {
    case "ORGANIZER":
      return ORGANIZER_TABS;
    case "JUDGE":
      // JUDGE only sees scoring and rankings
      return ORGANIZER_TABS.filter((tab) =>
        ["overview", "scoring", "rankings"].includes(tab.id)
      );
    case "TABULATOR":
      // TABULATOR sees overview, scoring, rankings, analytics
      return ORGANIZER_TABS.filter((tab) =>
        ["overview", "scoring", "rankings", "analytics"].includes(tab.id)
      );
    case "OFFICIAL_TEAM":
      // OFFICIAL_TEAM sees overview and their team info
      return [
        {
          id: "overview",
          label: "Overview",
          href: "/overview",
          icon: LayoutDashboard,
          description: "Ringkasan event",
        },
        {
          id: "team",
          label: "Tim Saya",
          href: "/team",
          icon: Users,
          description: "Informasi tim peserta",
        },
      ];
    default:
      return ORGANIZER_TABS;
  }
}

// Get tab by ID
export function getTabById(id: string): EventTab | undefined {
  return ORGANIZER_TABS.find((tab) => tab.id === id);
}

// Check if tab exists for role
export function isTabAvailableForRole(tabId: string, role: string): boolean {
  const tabs = getTabsForRole(role);
  return tabs.some((tab) => tab.id === tabId);
}
