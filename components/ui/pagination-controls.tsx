// PaginationControls Component - Reusable pagination controls
// Reference: Frontend Implementation Guide Section 5.1

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  /** Total number of items */
  total: number;
  /** Current skip (offset) */
  skip: number;
  /** Items per page */
  limit: number;
  /** Callback when page changes */
  onPageChange: (skip: number) => void;
  /** Optional: Show page numbers (default: true) */
  showPageNumbers?: boolean;
  /** Optional: Maximum page numbers to show (default: 5) */
  maxPageNumbers?: number;
}

/**
 * PaginationControls - Reusable pagination component
 *
 * Usage:
 * <PaginationControls
 *   total={100}
 *   skip={0}
 *   limit={20}
 *   onPageChange={(skip) => setSkip(skip)}
 * />
 */
export function PaginationControls({
  total,
  skip,
  limit,
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
}: PaginationControlsProps) {
  const currentPage = Math.floor(skip / limit);
  const totalPages = Math.ceil(total / limit);

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(skip - limit);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(skip + limit);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page * limit);
  };

  // Calculate page numbers to show
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    let startPage = Math.max(0, currentPage - Math.floor(maxPageNumbers / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageNumbers - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(0, endPage - maxPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Info text */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {skip + 1}-{Math.min(skip + limit, total)} dari {total} data
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sebelumnya
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {/* First page + ellipsis if needed */}
            {pageNumbers[0] > 0 && (
              <>
                <Button
                  variant={currentPage === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(0)}
                  className="min-w-[40px]"
                >
                  1
                </Button>
                {pageNumbers[0] > 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </>
            )}

            {/* Page numbers */}
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(page)}
                className="min-w-[40px]"
              >
                {page + 1}
              </Button>
            ))}

            {/* Last page + ellipsis if needed */}
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === totalPages - 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageClick(totalPages - 1)}
                  className="min-w-[40px]"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
