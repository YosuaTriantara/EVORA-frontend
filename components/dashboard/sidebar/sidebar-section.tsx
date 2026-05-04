// CREATED: 2025-01-11 - Unified Sidebar Implementation
// Section wrapper dengan title

import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarSection({ title, children, className }: SidebarSectionProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}
