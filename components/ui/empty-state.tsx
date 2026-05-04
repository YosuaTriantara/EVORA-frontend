// EmptyState Component - Reusable empty state with illustration and CTA
// Reference: Frontend Implementation Guide Section 5.1

"use client";

import { Inbox } from "lucide-react";

interface EmptyStateProps {
  /** Title for empty state */
  title?: string;
  /** Description text */
  description?: string;
  /** Optional icon (default: Inbox) */
  icon?: React.ReactNode;
  /** Optional action button or CTA */
  action?: React.ReactNode;
  /** Optional custom className */
  className?: string;
}

/**
 * EmptyState - Reusable empty state component
 *
 * Usage:
 * <EmptyState
 *   title="Tidak ada data"
 *   description="Data yang Anda cari tidak ditemukan."
 * />
 *
 * With action:
 * <EmptyState
 *   title="Belum ada tim"
 *   description="Mulai dengan mendaftarkan tim pertama Anda."
 *   action={<Button>Daftar Tim</Button>}
 * />
 */
export function EmptyState({
  title = "Tidak ada data",
  description = "Data yang Anda cari tidak ditemukan.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-4 text-center
        ${className}
      `}
    >
      <div className="mb-4 text-muted-foreground">
        {icon ?? (
          <Inbox className="h-12 w-12 mx-auto opacity-50" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
