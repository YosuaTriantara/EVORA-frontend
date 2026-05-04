"use client";

import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
  showActions?: boolean;
}

/**
 * Skeleton loading state for data tables
 * Use this while fetching table data to prevent blank screens
 * 
 * @example
 * ```tsx
 * {isLoading ? (
 *   <DataTableSkeleton rows={5} columns={4} showHeader showActions />
 * ) : (
 *   <DataTable data={data} />
 * )}
 * ```
 */
export function DataTableSkeleton({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
  showActions = false,
}: DataTableSkeletonProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Header row */}
      {showHeader && (
        <div className="flex gap-3 pb-2 border-b border-slate-200">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className={cn(
                "h-4 bg-slate-200 rounded animate-pulse",
                i === columns - 1 && showActions ? "w-20" : "flex-1"
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      )}

      {/* Data rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex gap-3 items-center"
            style={{ animationDelay: `${rowIndex * 100}ms` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "h-10 bg-slate-100 rounded-lg animate-pulse",
                  colIndex === 0 ? "flex-1" : 
                  colIndex === columns - 1 && showActions ? "w-24" : "flex-1"
                )}
                style={{ 
                  animationDelay: `${(rowIndex * columns + colIndex) * 30}ms`,
                  opacity: 1 - (rowIndex * 0.1) // Fade effect for deeper rows
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Optional: Pagination skeleton */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
          <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact card skeleton for mobile views
 */
interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          {/* Content */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Stats card skeleton for dashboard stats
 */
interface StatsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
          <div className="h-8 bg-slate-100 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-full" />
        </div>
      ))}
    </div>
  );
}
