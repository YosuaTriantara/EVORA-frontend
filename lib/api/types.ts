// lib/api/types.ts
// Type definitions for the base API client

import { AdminApiError } from "@/lib/admin-api";

// Re-export AdminApiError from existing implementation
export { AdminApiError };

/**
 * Configuration for an API request
 */
export interface RequestConfig {
  endpoint: string;
  method: string;
  body?: unknown;
  headers?: HeadersInit;
}

/**
 * Standard API response wrapper with optional pagination metadata
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    skip?: number;
    limit?: number;
  };
}
