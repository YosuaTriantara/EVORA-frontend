// lib/auth.ts
// Auth utilities — uses BFF API routes for HttpOnly cookie-based auth.
// No tokens are stored in localStorage or accessible by client-side JS.

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role:
    | "SUPER_ADMIN"
    | "USER"
    | "ORGANIZER"
    | "JUDGE"
    | "TABULATOR"
    | "OFFICIAL_TEAM";
  point_balance: number;
  is_active: boolean;
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// ─────────────────────────────────────────────
// AUTH API CALLS — all via BFF routes
// ─────────────────────────────────────────────

/**
 * Login via BFF route POST /api/auth/login.
 * The BFF sets an HttpOnly session cookie and returns the user profile.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<UserProfile> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AuthError(res.status, "Login gagal: respons tidak valid.");
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Login gagal. Periksa email dan password Anda.";
    throw new AuthError(res.status, detail);
  }

  return data as UserProfile;
}

/**
 * Register a new USER-role account.
 * Uses the proxy so it goes through the BFF layer.
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
): Promise<UserProfile> {
  const res = await fetch("/api/proxy/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AuthError(res.status, "Registrasi gagal: respons tidak valid.");
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Registrasi gagal. Coba lagi.";
    throw new AuthError(res.status, detail);
  }

  return data as UserProfile;
}

/**
 * Get current authenticated user's profile.
 * Reads the session from the HttpOnly cookie via BFF.
 * Includes 10-second timeout to prevent infinite loading.
 */
export async function getMe(): Promise<UserProfile> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch("/api/auth/me", { 
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new AuthError(res.status, "Gagal membaca profil pengguna.");
    }

    if (!res.ok) {
      const detail =
        typeof data === "object" && data !== null && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : "Sesi tidak valid. Silakan login kembali.";
      throw new AuthError(res.status, detail);
    }

    return data as UserProfile;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthError(408, "Request timeout. Silakan coba lagi.");
    }
    throw new AuthError(500, "Gagal terhubung ke server.");
  }
}

/**
 * Logout — clears the HttpOnly session cookie via BFF.
 */
export async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
