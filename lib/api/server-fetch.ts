/**
 * Server-side API fetch helper
 * 
 * For use in Server Components only.
 * Fetches directly to backend (not through proxy) since Server Components
 * cannot use relative URLs.
 */

import { API_URL } from "@/lib/env";

interface ServerFetchOptions extends RequestInit {
  token?: string;
}

/**
 * Server-side fetch to backend API
 * 
 * @param path - API path (e.g., "/events/my-managed")
 * @param options - Fetch options with optional token
 * @returns Response data
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const baseUrl = API_URL.replace(/\/+$/, "");
  const url = `${baseUrl}/api/v1${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  // Handle no-content responses (204)
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return res.json();
}

/**
 * Convenience methods for server-side API calls
 */
export function serverGet<T>(path: string, options?: { token?: string }): Promise<T> {
  return serverFetch<T>(path, { method: "GET", ...options });
}

export function serverPost<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  return serverFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function serverPatch<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  return serverFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
}
