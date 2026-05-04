"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StickyCTAProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function StickyCTA({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "default",
  className,
}: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 safe-area-bottom">
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        variant={variant}
        className={cn(
          "w-full h-14 text-base font-semibold rounded-xl",
          variant === "default" && "bg-[#681212] hover:bg-[#8a1a1a] text-white",
          className
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Memuat...</span>
          </div>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}

// Container untuk konten dengan padding bottom agar tidak tertutup CTA
export function StickyCTAContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pb-24", className)}>
      {children}
    </div>
  );
}
