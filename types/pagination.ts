// Pagination Types - Shared pagination types for API responses
// Reference: Frontend Implementation Guide Section 3.4

/**
 * PaginatedResponse - Standard pagination response from backend
 *
 * Backend returns: { total, skip, limit, data }
 */
export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}

/**
 * PaginationParams - Standard pagination request parameters
 */
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

/**
 * PaginationState - Client-side pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Calculate skip from page and pageSize
 */
export function calculateSkip(page: number, pageSize: number): number {
  return page * pageSize;
}

/**
 * Calculate total pages from total and pageSize
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
