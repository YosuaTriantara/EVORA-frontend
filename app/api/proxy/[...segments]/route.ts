import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/env";
import { voteRatelimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/logger";

const BACKEND_URL = API_URL.replace(/\/+$/, "");

type RouteContext = { params: Promise<{ segments: string[] }> };

// Event-scoped API paths that don't require SUPER_ADMIN role
const EVENT_SCOPED_PATHS = [
  "events/",           // GET /events/{id}, PATCH /events/{id}/customize
  "registration/",     // GET /registration/my-teams, POST /registration/{id}/proof, etc.
  "scoring/",          // POST /scoring/submit
  "voting/",           // POST /voting/cast
];

// SUPER_ADMIN-only paths — defense in depth layer
const SUPERADMIN_PATHS = [
  "superadmin/",
  "admin/users",
  "admin/roles",
];

// Check if path is event-scoped (accessible by ORGANIZER, JUDGE, TABULATOR, OFFICIAL_TEAM)
function isEventScopedPath(path: string): boolean {
  return EVENT_SCOPED_PATHS.some(prefix => path.startsWith(prefix));
}

// Check if path requires SUPER_ADMIN role
function isSuperAdminPath(path: string): boolean {
  return SUPERADMIN_PATHS.some(prefix => path.startsWith(prefix));
}

// High-security paths that require audit logging
const AUDIT_PATHS = [
  "verify",           // Payment verification
  "scoring",          // Score submission
  "superadmin",       // Admin operations
  "voting/cast",      // Vote casting
  "lock",             // Score sheet lock/unlock
  "unlock",           // Score sheet lock/unlock
];

// Check if path requires audit logging
function isAuditPath(path: string): boolean {
  return AUDIT_PATHS.some(prefix => path.includes(prefix));
}

async function handler(req: NextRequest, ctx: RouteContext) {
  const { segments } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;
  const role = cookieStore.get("evora_role")?.value;

  const path = segments.join("/");
  const fullPath = `/api/v1/${path}`;

  // ── AUDIT LOG: Request start ──
  auditLog("info", "BFFProxy", `${req.method} ${fullPath}`, {
    method: req.method,
    path: fullPath,
    role: role || "none",
  });

  // ── RATE LIMITING: Vote casting ──
  if (req.method === "POST" && path.includes("voting/cast")) {
    try {
      const ip =
        req.headers.get("x-forwarded-for") ??
        req.headers.get("x-real-ip") ??
        "127.0.0.1";
      const { success, reset } = await voteRatelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          { detail: "Too many vote requests. Please slow down." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        );
      }
    } catch (rateLimitError) {
      console.error(
        "[RateLimit] Upstash error on vote cast, allowing through:",
        rateLimitError
      );
    }
  }

  // ── TAMBAHAN 1: Block superadmin paths untuk non-SUPER_ADMIN ──
  if (isSuperAdminPath(path) && role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden", code: "INSUFFICIENT_ROLE" },
      { status: 403 }
    );
  }

  // ── TAMBAHAN 2: Audit log untuk superadmin paths yang LOLOS ──
  if (isSuperAdminPath(path) && role === "SUPER_ADMIN") {
    auditLog("audit", "BFFProxy", `SUPER_ADMIN access: ${req.method} ${fullPath}`, {
      method: req.method,
      path: fullPath,
      role: "SUPER_ADMIN",
    });
  }

  // ── AUDIT LOG: High-security paths ──
  if (isAuditPath(path)) {
    auditLog("audit", "BFFProxy", `High-security request: ${req.method} ${fullPath}`, {
      method: req.method,
      path: fullPath,
      role: role || "none",
    });
  }

  const targetUrl = `${BACKEND_URL}/api/v1/${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Log for debugging event-scoped access
  if (isEventScopedPath(path)) {
    console.log(`[PROXY] Event-scoped request: ${req.method} ${path}, role: ${role || 'none'}`);
  }

  const contentType = req.headers.get("content-type") ?? "";
  let body: BodyInit | null = null;

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      // For file uploads, pass FormData as-is (don't set Content-Type; let fetch set it with boundary)
      body = await req.formData();
    } else {
      headers["Content-Type"] = contentType || "application/json";
      body = await req.text();
    }
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for proxy

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Server backend terlalu lama merespons. Silakan coba lagi."
        : "Tidak dapat terhubung ke server backend.";
    return NextResponse.json({ detail: message }, { status: 503 });
  }

  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const responseData: unknown = await backendRes.json().catch(() => ({}));

  // ── AUDIT LOG: Response ──
  if (backendRes.ok) {
    auditLog("audit", "BFFProxy", `RESPONSE ${backendRes.status} ${fullPath}`, {
      method: req.method,
      path: fullPath,
      status: backendRes.status,
    });
  } else {
    auditLog("error", "BFFProxy", `ERROR ${backendRes.status} ${fullPath}`, {
      method: req.method,
      path: fullPath,
      status: backendRes.status,
      error: typeof responseData === "object" && responseData !== null && "detail" in responseData
        ? (responseData as { detail?: string }).detail
        : "Unknown error",
    });
  }

  if (!backendRes.ok && backendRes.status >= 500) {
    return NextResponse.json(
      { detail: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi." },
      { status: backendRes.status }
    );
  }

  return NextResponse.json(responseData, { status: backendRes.status });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
