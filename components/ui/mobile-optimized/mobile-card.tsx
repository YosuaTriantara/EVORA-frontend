// components/ui/mobile-optimized/mobile-card.tsx
// Mobile-optimized card components with touch-friendly interactions

"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  children: ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function MobileCard({
  children,
  onClick,
  showArrow = false,
  className,
  padding = "md",
}: MobileCardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200",
        paddingClasses[padding],
        onClick && "active:scale-[0.98] transition-transform cursor-pointer",
        showArrow && "flex items-center justify-between gap-3",
        className
      )}
    >
      <div className={cn("flex-1", showArrow && "min-w-0")}>{children}</div>
      {showArrow && (
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      )}
    </div>
  );
}

interface ProgressCardProps {
  title: string;
  current: number;
  max: number;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ProgressCard({
  title,
  current,
  max,
  label,
  onClick,
  disabled = false,
}: ProgressCardProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isFull = current >= max;

  return (
    <div
      onClick={!disabled && !isFull ? onClick : undefined}
      className={cn(
        "bg-white rounded-xl border p-4",
        disabled || isFull
          ? "border-slate-200 opacity-60 cursor-not-allowed"
          : "border-slate-200 active:scale-[0.98] transition-transform cursor-pointer hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isFull ? "bg-red-500" : "bg-green-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">
          {current}/{max}
        </span>
      </div>

      {isFull && (
        <p className="text-xs text-red-600 mt-2">Kuota penuh</p>
      )}
    </div>
  );
}

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}

export function InfoCard({
  icon,
  title,
  value,
  subtitle,
  onClick,
}: InfoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3",
        onClick && "active:scale-[0.98] transition-transform cursor-pointer"
      )}
    >
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500">{title}</p>
        <p className="font-medium text-slate-900 truncate">{value}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

interface MobileListItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  onClick?: () => void;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger";
}

export function MobileListItem({
  icon,
  title,
  subtitle,
  rightContent,
  onClick,
  badge,
  badgeVariant = "default",
}: MobileListItemProps) {
  const badgeStyles = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200",
        onClick && "active:scale-[0.98] transition-transform cursor-pointer hover:border-slate-300"
      )}
    >
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 truncate">{title}</p>
          {badge && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full", badgeStyles[badgeVariant])}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
      </div>
      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </div>
  );
}

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
}

export function ActionCard({
  icon,
  title,
  description,
  onClick,
  variant = "default",
}: ActionCardProps) {
  const variantStyles = {
    default: "bg-white border-slate-200 hover:border-slate-300",
    primary: "bg-[#681212] border-[#681212] text-white",
    danger: "bg-red-50 border-red-200 text-red-900",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer",
        variantStyles[variant]
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          variant === "default" && "bg-slate-100",
          variant === "primary" && "bg-white/20",
          variant === "danger" && "bg-red-100"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn("font-medium", variant === "primary" && "text-white")}>
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-sm",
              variant === "default" && "text-slate-500",
              variant === "primary" && "text-white/80",
              variant === "danger" && "text-red-700"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <ChevronRight
        className={cn(
          "w-5 h-5 flex-shrink-0",
          variant === "default" && "text-slate-400",
          variant === "primary" && "text-white/70",
          variant === "danger" && "text-red-400"
        )}
      />
    </div>
  );
}
