// CREATED: 2025-04-17 - Event Tab Navigation Component
// Horizontal tab navigation for event context (GitHub/Vercel style)

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EventTab, getTabsForRole } from "./organizer-tabs-config";

interface EventTabNavProps {
  eventId: string;
  role: string;
}

export function EventTabNav({ eventId, role }: EventTabNavProps) {
  const pathname = usePathname();
  const tabs = getTabsForRole(role);

  // Get current active tab from pathname
  const getActiveTab = () => {
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart || "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Mobile: Horizontal scrollable */}
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              eventId={eventId}
              isActive={activeTab === tab.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  tab: EventTab;
  eventId: string;
  isActive: boolean;
}

function TabButton({ tab, eventId, isActive }: TabButtonProps) {
  const Icon = tab.icon;
  const href = `/dashboard/events/${eventId}${tab.href}`;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isActive
          ? "bg-primary text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
      <span>{tab.label}</span>
    </Link>
  );
}
