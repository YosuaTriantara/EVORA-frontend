"use client";

import { TransactionStatus } from "@/lib/validation/schemas/transaction.schema";

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<TransactionStatus, { 
  label: string; 
  bgColor: string; 
  textColor: string;
  icon?: string;
}> = {
  PENDING: {
    label: "Menunggu Verifikasi",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: "⏳",
  },
  PAID: {
    label: "Terverifikasi",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "✓",
  },
  FAILED: {
    label: "Ditolak",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: "✕",
  },
  REFUNDED: {
    label: "Dikembalikan",
    bgColor: "bg-slate-100",
    textColor: "text-slate-800",
    icon: "↩",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: "⌛",
  },
};

export function TransactionStatusBadge({ 
  status, 
  size = "md" 
}: TransactionStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      {config.icon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
