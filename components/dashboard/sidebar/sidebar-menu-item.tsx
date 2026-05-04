// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Single menu item component with active state

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenuItem as SidebarMenuItemType } from "@/config/sidebar-menu-config";

interface SidebarMenuItemProps {
  item: SidebarMenuItemType;
  eventId?: string;
  onClick?: () => void;
}

export function SidebarMenuItem({ item, eventId, onClick }: SidebarMenuItemProps) {
  const pathname = usePathname();
  
  // Resolve href (string or function)
  // Use != null to check for both null and undefined, not just falsy values
  const href = typeof item.href === "function" && eventId != null
    ? item.href(eventId)
    : (item.href as string);
  
  // Check active state
  const isActive = item.exactMatch 
    ? pathname === href
    : pathname.startsWith(href);
  
  const Icon = item.icon;
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        "hover:bg-accent hover:text-accent-foreground",
        isActive 
          ? "bg-accent/80 text-accent-foreground border-l-4 border-primary pl-2" 
          : "text-muted-foreground border-l-4 border-transparent"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-opacity duration-150",
        isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
      )} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
