import { cookies } from "next/headers";
import { API_URL } from "@/lib/env";
import {
  getManagedEvents,
  getMyTeamsServer,
} from "@/services/event-management-service";
import { redirect } from "next/navigation";

// Re-export types for use in this page
export type { ManagedEvent, MyTeam } from "@/services/event-management-service";

interface Props {
  params: Promise<{ event_id: string }>;
}

export type UserRole = "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";

/**
 * Dashboard Event Detail Page - Role-based Router
 * 
 * NOTE: Access control is handled by middleware (middleware.ts) which verifies
 * event access via verifyEventAccess(). This page only handles role-based routing.
 * 
 * The middleware ensures user has access before reaching this page, so we can
 * trust that the user has at least one valid role for this event.
 */
export default async function DashboardEventDetailPage({ params }: Props) {
  const { event_id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const BACKEND_URL = API_URL.replace(/\/+$/, "");

  let userRole: UserRole | null = null;
  let isSuperAdmin = false;

  // Fetch user profile + managed events in parallel
  const [meResult, managedEvents] = await Promise.all([
    fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    getManagedEvents(token),
  ]);

  if (meResult) {
    isSuperAdmin = meResult.role === "SUPER_ADMIN";
  }

  // Super admin gets ORGANIZER access to all events
  if (isSuperAdmin) {
    userRole = "ORGANIZER";
  }

  // Check managed events (ORGANIZER / JUDGE / TABULATOR)
  if (!userRole) {
    // FIX: Use loose equality (==) to handle type mismatch between string (URL param) and number (API response)
    const managedEvent = managedEvents.find((m) => m.event.id == event_id);
    if (managedEvent) {
      userRole = managedEvent.role as UserRole;
    }
  }

  // Check OFFICIAL_TEAM via my-teams
  if (!userRole) {
    try {
      const myTeams = await getMyTeamsServer(token, event_id);
      if (myTeams.length > 0) {
        userRole = "OFFICIAL_TEAM";
      }
    } catch {
      // If getMyTeamsServer fails, user is not an OFFICIAL_TEAM
      // Continue to redirect to dashboard
    }
  }

  // Role-based routing to appropriate page
  // Middleware already verified access, so userRole should never be null here
  // But we keep the fallback redirect just in case
  switch (userRole) {
    case "ORGANIZER":
      redirect(`/dashboard/events/${event_id}/overview`);
    case "JUDGE":
      redirect(`/dashboard/events/${event_id}/judge`);
    case "TABULATOR":
      redirect(`/dashboard/events/${event_id}/tabulator`);
    case "OFFICIAL_TEAM":
      redirect(`/dashboard/events/${event_id}/team`);
    default:
      // This should not happen if middleware is working correctly
      // But we redirect to dashboard as a safety measure
      redirect("/dashboard");
  }
}
