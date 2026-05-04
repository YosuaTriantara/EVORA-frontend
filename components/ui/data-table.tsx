// DataTable Component - Reusable data table with pagination
// Reference: Frontend Implementation Guide Section 5.2

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import { PaginationControls } from "./pagination-controls";

/**
 * Column definition for DataTable
 */
export interface ColumnDef<T> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  label: string;
  /** Optional width for the column */
  width?: string;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Optional: accessor function to get value from row */
  accessor?: (row: T) => unknown;
}

/**
 * Pagination configuration for DataTable
 */
export interface PaginationConfig {
  total: number;
  skip: number;
  limit: number;
  onPageChange: (skip: number) => void;
}

/**
 * DataTable props
 */
interface DataTableProps<T> {
  /** Data array to display */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Optional: Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Optional: Empty state message */
  emptyMessage?: string;
  /** Optional: Empty state description */
  emptyDescription?: string;
  /** Optional: Pagination configuration */
  pagination?: PaginationConfig;
  /** Optional: Row click handler */
  onRowClick?: (row: T) => void;
  /** Optional: Row className generator */
  rowClassName?: (row: T) => string;
}

/**
 * DataTable - Reusable data table component with pagination
 *
 * Usage:
 * <DataTable
 *   data={teams}
 *   columns={[
 *     { key: 'name', label: 'Nama Tim' },
 *     { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
 *     { key: 'actions', label: '', render: (_, row) => <Button onClick={() => handleAction(row)} /> }
 *   ]}
 *   isLoading={isLoading}
 *   pagination={{ total, skip, limit, onPageChange }}
 * />
 */
export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  loadingComponent,
  emptyMessage = "Tidak ada data",
  emptyDescription = "Data yang Anda cari tidak ditemukan.",
  pagination,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  // Helper to get cell value
  const getCellValue = (row: T, column: ColumnDef<T>): unknown => {
    if (column.accessor) {
      return column.accessor(row);
    }
    // Default: access by key if row is object
    if (typeof row === "object" && row !== null) {
      return (row as Record<string, unknown>)[column.key];
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={`
                  ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  ${rowClassName ? rowClassName(row) : ""}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = getCellValue(row, column);
                  return (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(value, row)
                        : String(value ?? "")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <PaginationControls
          total={pagination.total}
          skip={pagination.skip}
          limit={pagination.limit}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
