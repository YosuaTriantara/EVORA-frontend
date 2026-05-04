// PageLoading Component - Reusable loading state for pages
// Reference: Frontend Implementation Guide Section 8.2

import { Skeleton } from "@/components/ui/skeleton";

interface PageLoadingProps {
  /** Number of skeleton rows to show (default: 5) */
  rows?: number;
  /** Whether to show a header skeleton */
  showHeader?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * PageLoading - Komponen loading state reusable untuk halaman
 *
 * Usage in loading.tsx:
 * export default function Loading() {
 *   return <PageLoading rows={5} showHeader />;
 * }
 */
export function PageLoading({
  rows = 5,
  showHeader = true,
  className = "",
}: PageLoadingProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

/**
 * CardLoading - Loading state untuk card-based layouts
 */
export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-lg" />
      ))}
    </div>
  );
}

/**
 * TableLoading - Loading state untuk tabel
 */
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
