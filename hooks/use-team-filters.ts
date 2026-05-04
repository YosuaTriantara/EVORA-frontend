// useTeamFilters Hook - URL state management for filters & pagination
// Reference: Frontend Implementation Guide Section 4.3

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface UseTeamFiltersResult {
  /** Current status filter */
  status: string;
  /** Current page number (0-based) */
  page: number;
  /** Current search query */
  search: string;
  /** Update filters and reset to page 0 */
  setFilters: (filters: { status?: string; search?: string }) => void;
  /** Update page number */
  setPage: (page: number) => void;
  /** Reset all filters */
  resetFilters: () => void;
}

/**
 * useTeamFilters - Hook untuk mengelola filter tim via URL search params
 *
 * Features:
 * - URL state yang shareable (bisa copy-paste link)
 * - Reset ke page 0 saat filter berubah
 * - Type-safe filter management
 *
 * Usage:
 * const { status, page, search, setFilters, setPage } = useTeamFilters();
 *
 * // Update status filter
 * setFilters({ status: 'verified' });
 *
 * // Change page
 * setPage(2);
 */
export function useTeamFilters(): UseTeamFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current values from URL
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page") || "0");
  const search = searchParams.get("search") || "";

  /**
   * Update URL with new filter values
   */
  const updateUrl = useCallback(
    (updates: { status?: string; page?: number; search?: string }) => {
      const params = new URLSearchParams(searchParams);

      // Update status
      if (updates.status !== undefined) {
        if (updates.status === "all" || updates.status === "") {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      // Update search
      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
      }

      // Update page (reset to 0 if status/search changes, otherwise use provided value)
      if (updates.page !== undefined) {
        if (updates.page === 0) {
          params.delete("page");
        } else {
          params.set("page", String(updates.page));
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  /**
   * Set filters (resets page to 0)
   */
  const setFilters = useCallback(
    (filters: { status?: string; search?: string }) => {
      updateUrl({ ...filters, page: 0 });
    },
    [updateUrl]
  );

  /**
   * Set page number
   */
  const setPage = useCallback(
    (newPage: number) => {
      updateUrl({ page: newPage });
    },
    [updateUrl]
  );

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return {
    status,
    page,
    search,
    setFilters,
    setPage,
    resetFilters,
  };
}
