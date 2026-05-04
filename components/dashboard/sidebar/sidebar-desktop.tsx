// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Desktop sidebar (fixed, left side)

"use client";

import { useDashboard, useEventContext } from "@/context/dashboard-context";
import {
  BASE_MENU,
  ACCOUNT_MENU,
  ROLE_MENUS,
  LOGOUT_MENU,
  BACK_TO_EVENT_LIST_MENU,
} from "@/config/sidebar-menu-config";
import { SidebarMenuItem } from "./sidebar-menu-item";
import { SidebarSection } from "./sidebar-section";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface SidebarDesktopProps {
  currentEventId?: string;
}

export function SidebarDesktop({ currentEventId: currentEventIdProp }: SidebarDesktopProps) {
  const { user, getEventById } = useDashboard();
  const { event: contextEvent, role: contextRole } = useEventContext();
  
  // Use prop as primary source (from URL), fallback to context
  const currentEventId = currentEventIdProp || null;
  
  // Get event data from managedEvents using currentEventId
  const currentManagedEvent = currentEventId ? getEventById(currentEventId) : undefined;
  const event = currentManagedEvent?.event || contextEvent;
  const role = currentManagedEvent?.role || contextRole;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-background z-40">
      {/* Header - Fixed */}
      <div className="flex-none p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 h-10">
          <img
            src="/evora-logo-2026.png"
            alt="Evora Logo"
            className="w-9 h-9 object-contain drop-shadow-md shrink-0"
          />
          <span className="font-semibold text-lg tracking-tight">Evora</span>
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-6">
          {/* Base Menu */}
          <SidebarSection>
            {BASE_MENU.map((item) => (
              <SidebarMenuItem key={item.label} item={item} />
            ))}
          </SidebarSection>

          {/* Event Context Menu - hanya jika di event detail page */}
          {currentEventId && role && ROLE_MENUS[role] && (
            <>
              <Separator className="bg-border/50" />
              <SidebarSection 
                title={event?.title || "Event"}
                className="max-w-[220px]"
              >
                {/* Back to event list */}
                <SidebarMenuItem 
                  item={BACK_TO_EVENT_LIST_MENU} 
                  onClick={() => {}} 
                />
                
                {/* Role-specific menus */}
                {ROLE_MENUS[role].map((item) => (
                  <SidebarMenuItem 
                    key={item.label} 
                    item={item} 
                    eventId={currentEventId} 
                  />
                ))}
              </SidebarSection>
            </>
          )}

          {/* Account Section */}
          <Separator className="bg-border/50" />
          <SidebarSection title="Akun">
            {ACCOUNT_MENU.map((item) => (
              <SidebarMenuItem key={item.label} item={item} />
            ))}
            <SidebarMenuItem item={LOGOUT_MENU} />
          </SidebarSection>
        </div>
      </div>

      {/* User info footer - Fixed */}
      <div className="flex-none p-4 border-t bg-background">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">
              {user.full_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate leading-tight">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
