// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Main sidebar component - combines desktop and mobile

"use client";

import { SidebarDesktop } from "./sidebar-desktop";
import { SidebarMobile } from "./sidebar-mobile";

interface UnifiedSidebarProps {
  currentEventId?: string;
}

// Named export untuk backward compatibility
export function UnifiedSidebar({ currentEventId }: UnifiedSidebarProps) {
  return (
    <>
      <SidebarDesktop currentEventId={currentEventId} />
      <SidebarMobile currentEventId={currentEventId} />
    </>
  );
}

// Default export juga
export default UnifiedSidebar;

// Re-export individual components for flexibility
export { SidebarDesktop } from "./sidebar-desktop";
export { SidebarMobile, SidebarMobileTrigger } from "./sidebar-mobile";
export { SidebarMenuItem } from "./sidebar-menu-item";
export { SidebarSection } from "./sidebar-section";
