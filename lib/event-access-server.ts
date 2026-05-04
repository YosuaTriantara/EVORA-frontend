/**
 * Event Access Control Helper - Server Side Only
 *
 * Provides server-side functions to verify event access.
 * These functions can only be used in Server Components.
 */

import { cookies } from "next/headers";

// Types for event access
export type EventRole = "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";

export interface ManagedEvent {
  event: {
    id: string;
    title: string;
    slug: string;
  };
  role: EventRole;
}

export interface EventAccessResult {
  hasAccess: boolean;
  role: EventRole | null;
  isSuperAdmin: boolean;
}

/**
 * Fetch user's managed events from the API
 * Uses the /events/my-managed endpoint
 */
export async function getManagedEvents(token: string): Promise<ManagedEvent[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("API base URL not configured");
    }

    const response = await fetch(`${baseUrl}/api/v1/events/my-managed`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to fetch managed events: ${response.status}`);
    }

    const data = await response.json();
    // API returns array directly, not { data: [...] }
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching managed events:", error);
    return [];
  }
}

/**
 * Verify if user has access to a specific event
 * Checks both event-scoped roles and super admin status
 */
export async function verifyEventAccess(
  eventId: string,
  token?: string,
): Promise<EventAccessResult> {
  // If no token provided, try to get from cookies (server-side only)
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("evora_session")?.value;
    } catch {
      // Cookies not available
      return { hasAccess: false, role: null, isSuperAdmin: false };
    }
  }

  if (!token) {
    return { hasAccess: false, role: null, isSuperAdmin: false };
  }

  try {
    // Check if user is super admin
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const meResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      return { hasAccess: false, role: null, isSuperAdmin: false };
    }

    const meData = await meResponse.json();
    const isSuperAdmin = meData.role === "SUPER_ADMIN";

    // Super admin has access to all events
    if (isSuperAdmin) {
      return { hasAccess: true, role: "ORGANIZER", isSuperAdmin: true };
    }

    // Check event-scoped roles
    const managedEvents = await getManagedEvents(token);
    const eventAccess = managedEvents.find((e) => e.event.id === eventId);

    if (eventAccess) {
      return {
        hasAccess: true,
        role: eventAccess.role,
        isSuperAdmin: false,
      };
    }

    // No access to this event
    return { hasAccess: false, role: null, isSuperAdmin: false };
  } catch (error) {
    console.error("Error verifying event access:", error);
    return { hasAccess: false, role: null, isSuperAdmin: false };
  }
}

/**
 * Get user's role in a specific event
 * Returns null if user has no role in the event
 */
export async function getUserEventRole(
  eventId: string,
  token?: string,
): Promise<EventRole | null> {
  const access = await verifyEventAccess(eventId, token);
  return access.role;
}

/**
 * Check if user can perform organizer actions on an event
 */
export async function canOrganizeEvent(
  eventId: string,
  token?: string,
): Promise<boolean> {
  const access = await verifyEventAccess(eventId, token);
  return access.hasAccess && (access.role === "ORGANIZER" || access.isSuperAdmin);
}

/**
 * Check if user can judge in an event
 */
export async function canJudgeEvent(
  eventId: string,
  token?: string,
): Promise<boolean> {
  const access = await verifyEventAccess(eventId, token);
  return access.hasAccess && (access.role === "JUDGE" || access.role === "ORGANIZER" || access.isSuperAdmin);
}

/**
 * Check if user can tabulate in an event
 */
export async function canTabulateEvent(
  eventId: string,
  token?: string,
): Promise<boolean> {
  const access = await verifyEventAccess(eventId, token);
  return access.hasAccess && (access.role === "TABULATOR" || access.role === "ORGANIZER" || access.isSuperAdmin);
}

/**
 * Check if user is an official team in an event
 */
export async function isOfficialTeam(
  eventId: string,
  token?: string,
): Promise<boolean> {
  const access = await verifyEventAccess(eventId, token);
  return access.hasAccess && access.role === "OFFICIAL_TEAM";
}
