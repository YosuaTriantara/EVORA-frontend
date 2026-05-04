// lib/api/client.ts
// Base API client instance with standard HTTP methods
// Uses BFF pattern - auth handled automatically via HttpOnly cookie

import { normalizeError } from "./error-handler";

const BASE_URL = "/api/proxy";

/**
 * Core fetch wrapper that handles the BFF proxy pattern.
 * Auth is automatic via HttpOnly cookie - no manual header attachment needed.
 */
async function fetchWithErrorHandling<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await normalizeError(response);
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw AdminApiError as-is
    if (error instanceof Error && error.name === "AdminApiError") {
      throw error;
    }
    // Wrap network/unexpected errors
    throw new (await import("@/lib/admin-api")).AdminApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

/**
 * API client instance with standard HTTP methods.
 * All methods use the BFF proxy at /api/proxy.
 * Authentication is automatic via HttpOnly cookie.
 */
export const apiClient = {
  /**
   * Perform a GET request
   * @param endpoint - API endpoint path (e.g., "/events/by-id/123")
   * @returns Promise with typed response data
   */
  get<T>(endpoint: string): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: "GET",
    });
  },

  /**
   * Perform a POST request
   * @param endpoint - API endpoint path
   * @param body - Request body object
   * @returns Promise with typed response data
   */
  post<T>(endpoint: string, body: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Perform a PUT request
   * @param endpoint - API endpoint path
   * @param body - Request body object
   * @returns Promise with typed response data
   */
  put<T>(endpoint: string, body: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /**
   * Perform a DELETE request
   * @param endpoint - API endpoint path
   * @returns Promise with typed response data (often void)
   */
  delete<T>(endpoint: string): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: "DELETE",
    });
  },

  /**
   * Perform a PATCH request (for partial updates)
   * @param endpoint - API endpoint path
   * @param body - Request body object
   * @returns Promise with typed response data
   */
  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * Perform a POST request with FormData (for file uploads)
   * Content-Type is set automatically by browser with boundary
   * @param endpoint - API endpoint path
   * @param formData - FormData object containing files and fields
   * @returns Promise with typed response data
   */
  postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return fetchWithFormData<T>(endpoint, formData, "POST");
  },

  /**
   * Perform a PATCH request with FormData (for file uploads)
   * Content-Type is set automatically by browser with boundary
   * @param endpoint - API endpoint path
   * @param formData - FormData object containing files and fields
   * @returns Promise with typed response data
   */
  patchFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return fetchWithFormData<T>(endpoint, formData, "PATCH");
  },
};

/**
 * Internal fetch wrapper for FormData requests (multipart/form-data)
 * Does NOT set Content-Type header - browser sets it with correct boundary
 */
async function fetchWithFormData<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PATCH"
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      body: formData,
      // No Content-Type header - browser sets it with boundary
    });

    if (!response.ok) {
      const error = await normalizeError(response);
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw AdminApiError as-is
    if (error instanceof Error && error.name === "AdminApiError") {
      throw error;
    }
    // Wrap network/unexpected errors
    throw new (await import("@/lib/admin-api")).AdminApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}
