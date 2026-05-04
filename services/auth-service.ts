// services/auth-service.ts
// Authentication service for login, register, and user profile.
// All calls go through BFF proxy (/api/proxy/*) for auth via HttpOnly cookie.

import type { AuthUser, LoginResponse, RegisterPayload } from "@/types/admin";

/**
 * Login with email and password.
 * POST /api/v1/auth/login
 * 
 * Note: Uses OAuth2 password flow with application/x-www-form-urlencoded.
 * The field is named 'username' but accepts an email address.
 * 
 * @param email - User's email address (sent as 'username')
 * @param password - User's password
 * @returns LoginResponse with access_token
 * @throws Error on invalid credentials (401)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email); // OAuth2 spec uses 'username' field
  formData.append("password", password);

  const res = await fetch("/api/proxy/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Login gagal. Silakan periksa email dan password Anda.";
    throw new Error(detail);
  }

  return data as LoginResponse;
}

/**
 * Register a new user account.
 * POST /api/v1/auth/register
 * Role defaults to 'USER'.
 * 
 * @param payload - Registration data (email, password, full_name)
 * @returns AuthUser with created user details
 * @throws Error on duplicate email (400)
 */
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const res = await fetch("/api/proxy/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Registrasi gagal. Silakan coba lagi.";
    throw new Error(detail);
  }

  return data as AuthUser;
}

/**
 * Get the profile of the currently authenticated user.
 * GET /api/v1/auth/me
 * 
 * @returns AuthUser with current user details
 * @throws Error if not authenticated (401)
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const res = await fetch("/api/proxy/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Gagal mengambil data pengguna.";
    throw new Error(detail);
  }

  return data as AuthUser;
}

/**
 * Logout the current user.
 * POST /api/auth/logout (BFF endpoint)
 * 
 * Clears the session cookies (evora_session, evora_role) server-side.
 * The BFF endpoint handles cookie deletion even if backend logout doesn't exist.
 * 
 * @throws Error if logout fails
 */
export async function logout(): Promise<void> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const data: unknown = await res.json().catch(() => ({}));
      const detail =
        typeof data === "object" && data !== null && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : "Logout gagal. Silakan coba lagi.";
      throw new Error(detail);
    }
  } catch (err) {
    // Network errors or other fetch failures - still allow logout to proceed
    console.error("[Logout] Error during logout:", err);
    // Don't throw - allow logout to proceed gracefully
  }
}
