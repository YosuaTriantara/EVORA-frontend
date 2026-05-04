// lib/api/error-handler.ts
// Error normalization utilities for API client
// Reference: Frontend Implementation Guide Section 6.2

import { AdminApiError } from "@/lib/admin-api";

// Re-export AdminApiError for convenience
export { AdminApiError } from "@/lib/admin-api";

/**
 * Pydantic validation error item structure from FastAPI
 */
interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Extract validation errors from 422 response (Pydantic validation)
 * Returns a map of field names to error messages
 *
 * Usage:
 * const errors = extractValidationErrors(error);
 * // errors = { "name": "Nama tim minimal 3 karakter", "members": "Minimal 1 anggota" }
 *
 * @param error - The AdminApiError from API call
 * @returns Record<string, string> - Map of field names to error messages
 */
export function extractValidationErrors(
  error: AdminApiError
): Record<string, string> {
  if (error.status !== 422) return {};

  // detail bisa berupa array [{loc, msg, type}] atau string
  if (Array.isArray(error.detail)) {
    return error.detail.reduce((acc, item: ValidationErrorItem) => {
      const field = String(item.loc[item.loc.length - 1]);
      acc[field] = item.msg;
      return acc;
    }, {} as Record<string, string>);
  }

  // If detail is a string, return as root error
  if (typeof error.detail === "string") {
    return { _root: error.detail };
  }

  return {};
}

/**
 * Normalizes various error scenarios into a consistent AdminApiError.
 * Handles: HTTP error responses, JSON parse failures, and network errors.
 *
 * @param response - The fetch Response object
 * @returns Promise<AdminApiError> - Always returns an AdminApiError (never throws)
 */
export async function normalizeError(response: Response): Promise<AdminApiError> {
  // Case 1: HTTP error response (not ok)
  if (!response.ok) {
    let detail: string;

    try {
      const body = await response.json();
      detail =
        typeof body === "object" && body !== null && "detail" in body
          ? String(body.detail)
          : `HTTP ${response.status}`;
    } catch {
      // JSON parse failed, use status text
      detail = response.statusText || `HTTP ${response.status}`;
    }

    return new AdminApiError(response.status, detail);
  }

  // Case 2: Response is ok but we still need to handle edge cases
  // This shouldn't happen in normal flow, but handle defensively
  try {
    // Attempt to verify response can be parsed
    await response.clone().json();
    // If we get here, response is actually valid
    // Return generic error since this is an unexpected path
    return new AdminApiError(500, "Unexpected error in error normalization");
  } catch {
    // JSON parse failed on what was thought to be ok response
    return new AdminApiError(
      response.status,
      `HTTP ${response.status}: Invalid JSON response`
    );
  }
}
