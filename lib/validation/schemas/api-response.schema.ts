// lib/validation/schemas/api-response.schema.ts
// Generic wrapper untuk semua API response

import { z } from "zod";

// ─────────────────────────────────────────────
// PAGINATION META
// ─────────────────────────────────────────────

export const PaginationMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

// ─────────────────────────────────────────────
// API RESPONSE SCHEMAS
// ─────────────────────────────────────────────

/**
 * Generic API response wrapper untuk single object
 * Bentuk: { data: T }
 */
export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
  });
}

/**
 * Generic API response wrapper untuk paginated array
 * Bentuk: { data: T[], meta: { page, limit, total, total_pages } }
 */
export function PaginatedResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: z.array(dataSchema),
    meta: PaginationMetaSchema,
  });
}

// ─────────────────────────────────────────────
// LEGACY PAGINATION (untuk backward compatibility)
// ─────────────────────────────────────────────

/**
 * Legacy pagination format yang digunakan di beberapa endpoint lama
 * Bentuk: { data: T[], total, skip, limit }
 */
export function LegacyPaginatedResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: z.array(dataSchema),
    total: z.number().int().nonnegative(),
    skip: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
  });
}
