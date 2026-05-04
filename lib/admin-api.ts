// lib/admin-api.ts
// Centralized API client for Super Admin — proxies all requests through the
// Next.js BFF layer (/api/proxy/*) so the HttpOnly session cookie is used
// automatically. No tokens are stored client-side.

import { auditLog } from "@/lib/logger";

// ─────────────────────────────────────────────
// ERROR CLASS
// ─────────────────────────────────────────────

export class AdminApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "AdminApiError";
    this.status = status;
    this.detail = detail;
  }
}

// ─────────────────────────────────────────────
// BASE FETCHER — routes through /api/proxy
// ─────────────────────────────────────────────

interface AdminFetchOptions extends RequestInit {
  token?: string;
}

async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  // All admin API calls go through the BFF proxy which reads the HttpOnly cookie
  const { token, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // If token is provided (server-side usage), add Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add timeout to prevent infinite loading
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const res = await fetch(`/api/proxy${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: "include", // ✅ Ensure cookies are sent with the request
    });
    clearTimeout(timeoutId);

    // Handle no-content responses (204)
    if (res.status === 204) {
      return undefined as unknown as T;
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new AdminApiError(res.status, `HTTP ${res.status}: Empty response`);
    }

    if (!res.ok) {
      const detail =
        typeof body === "object" && body !== null && "detail" in body
          ? String((body as { detail: unknown }).detail)
          : `HTTP ${res.status}`;
      throw new AdminApiError(res.status, detail);
    }

    return body as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof AdminApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AdminApiError(408, "Request timeout. Silakan coba lagi.");
    }
    throw new AdminApiError(500, "Gagal terhubung ke server.");
  }
}

// ─────────────────────────────────────────────
// MULTIPART FETCHER — for file uploads
// ─────────────────────────────────────────────

export async function adminFetchFormData<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  // Don't set Content-Type here — browser sets it with the correct boundary
  const res = await fetch(`/api/proxy${path}`, {
    method,
    body: formData,
    credentials: "include", // ✅ Ensure cookies are sent with the request
  });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new AdminApiError(res.status, `HTTP ${res.status}: Empty response`);
  }

  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `HTTP ${res.status}`;
    throw new AdminApiError(res.status, detail);
  }

  return body as T;
}

// ─────────────────────────────────────────────
// CONVENIENCE METHODS
// ─────────────────────────────────────────────

export function apiGet<T>(path: string, options?: { token?: string }): Promise<T> {
  return adminFetch<T>(path, { method: "GET", ...options });
}

export function apiPost<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  return adminFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function apiPatch<T>(path: string, body: unknown, options?: { token?: string }): Promise<T> {
  return adminFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
}

export function apiDelete<T>(path: string, options?: { token?: string }): Promise<T> {
  return adminFetch<T>(path, { method: "DELETE", ...options });
}

// ─────────────────────────────────────────────
// AUTH — Login via BFF
// ─────────────────────────────────────────────

export interface AdminLoginResult {
  id: string;
  email: string;
  full_name: string;
  role: string;
  point_balance: number;
  is_active: boolean;
}

/**
 * Login via the BFF POST /api/auth/login route.
 * Sets HttpOnly session cookie and returns user profile.
 */
export async function login(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AdminApiError(res.status, "Login failed: invalid response");
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Login gagal. Periksa email dan password Anda.";
    throw new AdminApiError(res.status, detail);
  }

  return data as AdminLoginResult;
}

/**
 * Logout — clears HttpOnly session cookie via BFF.
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<AdminLoginResult> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AdminApiError(res.status, "Failed to fetch profile");
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `HTTP ${res.status}`;
    throw new AdminApiError(res.status, detail);
  }

  return data as AdminLoginResult;
}

// ─────────────────────────────────────────────
// LOGGER UTILITY
// ─────────────────────────────────────────────

// Re-export auditLog from lib/logger for backward compatibility
export { auditLog } from "@/lib/logger";

// Legacy adminLog function - DEPRECATED, use auditLog instead
// Kept for backward compatibility with existing code
export function adminLog(
  level: "info" | "warn" | "error" | "success",
  module: string,
  action: string,
  data?: unknown,
): void {
  // Map legacy levels to auditLog levels
  const levelMap: Record<string, "info" | "warn" | "error" | "audit"> = {
    info: "info",
    warn: "warn",
    error: "error",
    success: "audit",
  };

  auditLog(levelMap[level] ?? "info", module, action, { data });
}
