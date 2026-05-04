import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginRatelimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

export async function POST(req: NextRequest) {
  // Rate limiting — MUST be in try/catch: if Upstash is unavailable,
  // ALLOW the login through (never block legitimate users for infra issues)
  try {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";
    const { success, limit, remaining, reset } = await loginRatelimit.limit(
      ip
    );

    if (!success) {
      return NextResponse.json(
        {
          detail: `Too many login attempts. Try again after ${new Date(
            reset
          ).toLocaleTimeString()}.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  } catch (rateLimitError) {
    // Upstash unavailable — log and allow through (fail open for availability)
    console.error(
      "[RateLimit] Upstash error on login, allowing through:",
      rateLimitError
    );
  }

  let email: string, password: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  const formBody = new URLSearchParams();
  formBody.set("username", email);
  formBody.set("password", password);

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });
  } catch {
    return NextResponse.json(
      { detail: "Tidak dapat terhubung ke server. Silakan coba lagi." },
      { status: 503 }
    );
  }

  const data: unknown = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    // AUDIT LOG: Failed login attempt
    auditLog("error", "Auth", "LOGIN_FAILED", {
      email,
      status: backendRes.status,
      reason: typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Invalid credentials",
    });

    if (backendRes.status >= 500) {
      return NextResponse.json(
        { detail: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi." },
        { status: backendRes.status }
      );
    }
    const detail =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : "Login gagal. Periksa email dan password Anda.";
    return NextResponse.json({ detail }, { status: backendRes.status });
  }

  const tokenData = data as { access_token: string; token_type: string };
  const token = tokenData.access_token;

  // Fetch user profile to get role
  let profile: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    point_balance: number;
    is_active: boolean;
  };
  try {
    const meRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) {
      return NextResponse.json({ detail: "Gagal memverifikasi akun." }, { status: 401 });
    }
    profile = await meRes.json();
  } catch {
    return NextResponse.json({ detail: "Gagal memverifikasi akun." }, { status: 503 });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();

  // HttpOnly cookie — the actual JWT (not readable by JS)
  cookieStore.set("evora_session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  // Non-HttpOnly cookie — role only (readable by middleware and client JS for conditional rendering)
  cookieStore.set("evora_role", profile.role, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  // AUDIT LOG: Successful login
  auditLog("audit", "Auth", "LOGIN_SUCCESS", {
    userId: profile.id,
    email: profile.email,
    role: profile.role,
  });

  return NextResponse.json(profile);
}
