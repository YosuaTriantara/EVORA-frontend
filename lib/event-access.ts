// MODIFIED: 2025-01-11 - Unified Sidebar Implementation
// - Removed duplicate ManagedEvent type definition
// - Added helper functions: getEventRole, assertEventRole, canAccessEvent
// - Updated getEventAccess to support optional managedEvents parameter

/**
 * Event Access Control Helper - Client Side Only
 *
 * Provides client-side functions to check event access.
 * For server-side functions, use lib/event-access-server.ts
 */

import { apiGet } from "@/lib/admin-api";
// MODIFIED: Import ManagedEvent from services to avoid duplicate type definition
import { 
  ManagedEvent, 
  getManagedEvents 
} from "@/services/event-management-service";
import { UserProfile } from "@/lib/auth";

// Types for event access
export type EventRole = "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";

export interface EventAccessResult {
  hasAccess: boolean;
  role: EventRole | null;
  isSuperAdmin: boolean;
}

export interface ClientEventAccessResult {
  hasAccess: boolean;
  role: EventRole | null;
}

// REMOVED: Duplicate ManagedEvent interface (now imported from services)
// The imported ManagedEvent has shape: { role, meta_data, event }

/**
 * Helper: Get user's role in a specific event
 * Returns null if user has no role in the event
 * 
 * NOTE: Uses loose equality (==) to handle type mismatch between
 * string (URL param) and number (API response) event IDs
 */
export function getEventRole(
  managedEvents: ManagedEvent[],
  eventId: string
): ManagedEvent["role"] | null {
  // FIX: Use loose equality (==) to handle string vs number type mismatch
  const eventAccess = managedEvents.find((e) => e.event.id == eventId);
  return eventAccess?.role ?? null;
}

/**
 * Helper: Check if user has one of the allowed roles in a specific event
 */
export function assertEventRole(
  managedEvents: ManagedEvent[],
  eventId: string,
  allowedRoles: ManagedEvent["role"][]
): boolean {
  const role = getEventRole(managedEvents, eventId);
  return role !== null && allowedRoles.includes(role);
}

/**
 * Helper: Check if user can access an event
 * SUPER_ADMIN bypass or user must have any role in the event
 */
export function canAccessEvent(
  user: UserProfile,
  managedEvents: ManagedEvent[],
  eventId: string
): boolean {
  // SUPER_ADMIN bypass
  if (user.role === "SUPER_ADMIN") return true;
  
  // Check if user has any role in this event
  return getEventRole(managedEvents, eventId) !== null;
}

/**
 * Client-side function to check event access
 * Uses the /events/my-managed endpoint directly
 * 
 * MODIFIED: Added optional managedEvents parameter for Context-based usage
 * If managedEvents is provided, uses it instead of fetching
 */
export async function getEventAccess(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<ClientEventAccessResult> {
  try {
    // If managedEvents is provided (from Context), use it directly
    const events = managedEvents ?? await getManagedEvents();
    
    // FIX: Use loose equality (==) to handle string vs number type mismatch
    // eventId from URL is string, but API returns number
    const eventAccess = events.find((e: ManagedEvent) => e.event.id == eventId);

    if (eventAccess) {
      return {
        hasAccess: true,
        role: eventAccess.role,
      };
    }

    return { hasAccess: false, role: null };
  } catch (error) {
    console.error("Error getting event access:", error);
    return { hasAccess: false, role: null };
  }
}

/**
 * Get user's role in a specific event (client-side)
 * Returns null if user has no role in the event
 * 
 * MODIFIED: Added optional managedEvents parameter
 */
export async function getUserEventRoleClient(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<EventRole | null> {
  const access = await getEventAccess(eventId, managedEvents);
  return access.role;
}

/**
 * Check if user can perform organizer actions on an event (client-side)
 * 
 * MODIFIED: Added optional managedEvents parameter
 */
export async function canOrganizeEventClient(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<boolean> {
  const access = await getEventAccess(eventId, managedEvents);
  return access.hasAccess && access.role === "ORGANIZER";
}

/**
 * Check if user can judge in an event (client-side)
 * 
 * MODIFIED: Added optional managedEvents parameter
 */
export async function canJudgeEventClient(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<boolean> {
  const access = await getEventAccess(eventId, managedEvents);
  return access.hasAccess && (access.role === "JUDGE" || access.role === "ORGANIZER");
}

/**
 * Check if user can tabulate in an event (client-side)
 * 
 * MODIFIED: Added optional managedEvents parameter
 */
export async function canTabulateEventClient(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<boolean> {
  const access = await getEventAccess(eventId, managedEvents);
  return access.hasAccess && (access.role === "TABULATOR" || access.role === "ORGANIZER");
}

/**
 * Check if user is an official team in an event (client-side)
 * 
 * MODIFIED: Added optional managedEvents parameter
 */
export async function isOfficialTeamClient(
  eventId: string,
  managedEvents?: ManagedEvent[]
): Promise<boolean> {
  const access = await getEventAccess(eventId, managedEvents);
  return access.hasAccess && access.role === "OFFICIAL_TEAM";
}