"use client";

import { cn } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Hourglass,
  type LucideIcon 
} from "lucide-react";

type StatusType = 
  | "PENDING_PAYMENT" 
  | "PENDING_VERIFICATION" 
  | "REGISTERED" 
  | "CANCELLED" 
  | "DISQUALIFIED"
  | "REJECTED"
  | "OPEN"
  | "FULL"
  | "LIVE"
  | "CLOSED";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  icon: LucideIcon;
  colors: string;
}> = {
  PENDING_PAYMENT: {
    label: "Menunggu Bayar",
    icon: Clock,
    colors: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PENDING_VERIFICATION: {
    label: "Menunggu Verifikasi",
    icon: Hourglass,
    colors: "bg-blue-100 text-blue-700 border-blue-200",
  },
  REGISTERED: {
    label: "Terdaftar",
    icon: CheckCircle2,
    colors: "bg-green-100 text-green-700 border-green-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    icon: XCircle,
    colors: "bg-red-100 text-red-700 border-red-200",
  },
  DISQUALIFIED: {
    label: "Didiskualifikasi",
    icon: AlertCircle,
    colors: "bg-red-100 text-red-700 border-red-200",
  },
  REJECTED: {
    label: "Ditolak",
    icon: XCircle,
    colors: "bg-red-100 text-red-700 border-red-200",
  },
  OPEN: {
    label: "Tersedia",
    icon: CheckCircle2,
    colors: "bg-green-100 text-green-700 border-green-200",
  },
  FULL: {
    label: "Penuh",
    icon: AlertCircle,
    colors: "bg-red-100 text-red-700 border-red-200",
  },
  LIVE: {
    label: "Berlangsung",
    icon: Clock,
    colors: "bg-green-100 text-green-700 border-green-200",
  },
  CLOSED: {
    label: "Ditutup",
    icon: XCircle,
    colors: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        sizeClasses[size],
        config.colors,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

// Simplified dot indicator for compact views
export function StatusDot({ 
  status, 
  className 
}: { 
  status: StatusType; 
  className?: string;
}) {
  const dotColors: Record<StatusType, string> = {
    PENDING_PAYMENT: "bg-amber-500",
    PENDING_VERIFICATION: "bg-blue-500",
    REGISTERED: "bg-green-500",
    CANCELLED: "bg-red-500",
    DISQUALIFIED: "bg-red-500",
    REJECTED: "bg-red-500",
    OPEN: "bg-green-500",
    FULL: "bg-red-500",
    LIVE: "bg-green-500",
    CLOSED: "bg-slate-500",
  };

  return (
    <span 
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        dotColors[status],
        className
      )} 
    />
  );
}
