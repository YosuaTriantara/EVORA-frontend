import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { verifyEventAccess } from "./lib/api/event-auth";

// Routes that require authentication (any role)
const USER_PROTECTED_PREFIXES = ["/dashboard"];

// Routes that require SUPER_ADMIN role
const ADMIN_PROTECTED_PREFIXES = [
  "/super-admin/dashboard",
  "/super-admin/events",
  "/super-admin/users",
  "/super-admin/transactions",
  "/super-admin/vote-packages",
];

// Event-scoped roles that can access /dashboard/events/*
const EVENT_SCOPED_ROLES = ["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"];

// Pattern to match /dashboard/events/[event_id] and its sub-routes
const EVENT_DETAIL_PATTERN = /^\/dashboard\/events\/([^\/]+)/;

/**
 * IMPORTANT: Role Source for Security Decisions
 * =============================================
 * The 'evora_role' cookie is NON-HttpOnly and readable by JavaScript.
 * It is intentionally set for CLIENT-SIDE UI rendering purposes only
 * (e.g. conditionally showing admin UI elements in React components).
 *
 * For ALL security and routing decisions in this middleware, the role
 * is decoded from the 'evora_session' HttpOnly JWT cookie instead.
 *
 * NEVER use evora_role for access control decisions.
 * NEVER trust evora_role as a source of truth for permissions.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // ✅ Skip API routes - they handle their own auth
  // This prevents middleware from interfering with API calls
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  
  const sessionCookie = req.cookies.get("evora_session");

  const sessionToken = sessionCookie?.value ?? "";
  const isAuthenticated = !!sessionToken;

  // Decode role from JWT payload (HttpOnly cookie) for security decisions
  let role = "";
  if (sessionToken) {
    try {
      const payload = decodeJwt(sessionToken);
      role = typeof payload.role === "string" ? payload.role : "";
    } catch {
      // Invalid/expired JWT — treat as unauthenticated, role stays ''
      role = "";
    }
  }

  // ── Protect super-admin pages ─────────────────────────────────────────────
  if (ADMIN_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
    if (role && role !== "SUPER_ADMIN") {
      // Wrong role — redirect to generic login and clear cookies
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("evora_session");
      res.cookies.delete("evora_role");
      return res;
    }
    return NextResponse.next();
  }

  // ── Protect user dashboard pages ──────────────────────────────────────────
  if (USER_PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ── Event-scoped access control for /dashboard/events/[event_id] ─────────
    const eventMatch = pathname.match(EVENT_DETAIL_PATTERN);

    if (eventMatch) {
      const eventId = eventMatch[1];

      // SUPER_ADMIN bypasses event-scoped checks
      if (role === "SUPER_ADMIN") {
        return NextResponse.next();
      }

      // Verify user has access to this specific event
      const hasAccess = await verifyEventAccess(eventId, sessionToken);

      if (!hasAccess) {
        // User doesn't have access to this event — redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Allow access (either not an event detail page, or user has access)
    return NextResponse.next();
  }

  // ── Redirect already-authenticated users away from login pages ────────────
  if (isAuthenticated) {
    if (pathname === "/login") {
      // SUPER_ADMIN goes to super-admin dashboard
      // Event-scoped roles (ORGANIZER, JUDGE, etc.) and USER go to user dashboard
      const dest = role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    // /super-admin is the super admin login page — redirect if already logged in as SUPER_ADMIN
    if (pathname === "/super-admin" && role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin/dashboard", req.url));
    }
    // If user with event-scoped role tries to access /super-admin, redirect to dashboard
    if (pathname === "/super-admin" && EVENT_SCOPED_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path+", // :path+ requires at least one segment (excludes /super-admin itself)
    "/super-admin",
    "/login",
  ],
};
