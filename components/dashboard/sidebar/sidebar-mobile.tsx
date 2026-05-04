// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Mobile sidebar (drawer pattern)

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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";

interface SidebarMobileProps {
  currentEventId?: string;
}

interface SidebarMobileTriggerProps {
  onClick?: () => void;
}

/**
 * Standalone trigger button for mobile sidebar
 * Use this inside MobileHeader or other components (NOT fixed positioned)
 * NOTE: This button needs to be wrapped in a Sheet component or use onClick to control the sheet
 */
export function SidebarMobileTrigger({ onClick }: SidebarMobileTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-lg"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );
}

export function SidebarMobile({ currentEventId: currentEventIdProp }: SidebarMobileProps) {
  const { user, mobileDrawerOpen, setMobileDrawerOpen, getEventById } = useDashboard();
  const { event: contextEvent, role: contextRole } = useEventContext();
  
  // Use prop as primary source (from URL), fallback to context
  const currentEventId = currentEventIdProp || null;
  
  // Get event data from managedEvents using currentEventId
  const currentManagedEvent = currentEventId ? getEventById(currentEventId) : undefined;
  const event = currentManagedEvent?.event || contextEvent;
  const role = currentManagedEvent?.role || contextRole;

  const handleClose = () => setMobileDrawerOpen(false);

  return (
    <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
      <SheetContent side="left" className="w-80 p-0 sm:w-80">
        <div className="flex flex-col h-full bg-white">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b flex-none">
            <Link href="/dashboard" className="flex items-center gap-2 h-10" onClick={handleClose}>
              <img
                src="/evora-logo-2026.png"
                alt="Evora Logo"
                className="w-9 h-9 object-contain drop-shadow-md shrink-0"
              />
              <span className="font-semibold text-lg tracking-tight">Evora</span>
            </Link>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-10 w-10 rounded-lg hover:bg-accent"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button> */}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-6">
              {/* Base Menu */}
              <SidebarSection>
                {BASE_MENU.map((item) => (
                  <SidebarMenuItem key={item.label} item={item} onClick={handleClose} />
                ))}
              </SidebarSection>

              {/* Event Context Menu - hanya jika di event detail page */}
              {currentEventId && role && ROLE_MENUS[role] && (
                <>
                  <Separator className="bg-border/50" />
                  <SidebarSection 
                    title={event?.title || "Event"}
                    className="max-w-[280px]"
                  >
                    {/* Back to event list */}
                    <SidebarMenuItem 
                      item={BACK_TO_EVENT_LIST_MENU} 
                      onClick={handleClose} 
                    />
                    
                    {/* Role-specific menus */}
                    {ROLE_MENUS[role].map((item) => (
                      <SidebarMenuItem 
                        key={item.label} 
                        item={item} 
                        eventId={currentEventId}
                        onClick={handleClose}
                      />
                    ))}
                  </SidebarSection>
                </>
              )}

              {/* Account Section */}
              <Separator className="bg-border/50" />
              <SidebarSection title="Akun">
                {ACCOUNT_MENU.map((item) => (
                  <SidebarMenuItem key={item.label} item={item} onClick={handleClose} />
                ))}
                <SidebarMenuItem item={LOGOUT_MENU} onClick={handleClose} />
              </SidebarSection>
            </div>
          </div>

          {/* User info footer - Fixed */}
          <div className="flex-none p-4 border-t bg-background">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-11">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-base font-semibold text-primary">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
