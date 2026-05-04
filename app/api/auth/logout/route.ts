import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auditLog } from "@/lib/logger";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

/**
 * Logout endpoint - clears session cookies server-side
 * POST /api/auth/logout
 * 
 * This handles logout by:
 * 1. Attempting to call backend logout endpoint (if exists)
 * 2. Clearing HttpOnly cookies (evora_session, evora_role)
 * 3. Returning success response
 */
export async function POST() {
  const cookieStore = await cookies();
  
  // Try to get session token for audit log
  const sessionToken = cookieStore.get("evora_session")?.value;
  
  // Attempt to call backend logout endpoint (optional - may not exist)
  try {
    if (sessionToken) {
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });
      // Ignore response - we proceed regardless of backend availability
    }
  } catch {
    // Backend logout endpoint doesn't exist or failed - proceed anyway
    console.log("[Logout] Backend logout endpoint unavailable, proceeding with client-side logout");
  }

  // Clear HttpOnly session cookie (contains JWT)
  cookieStore.delete("evora_session");
  
  // Clear role cookie (non-HttpOnly, used by middleware)
  cookieStore.delete("evora_role");

  // AUDIT LOG: Logout
  auditLog("audit", "Auth", "LOGOUT", {
    hasSession: !!sessionToken,
  });

  return NextResponse.json({ 
    success: true, 
    message: "Logout successful" 
  });
}
