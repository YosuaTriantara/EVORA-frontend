// REFACTORED: 2025-04-17 - Server Component pattern for Overview page
// Server Component fetches initial data, passes to Client Component for interactivity
// FIX: Added role-based access control - only ORGANIZER and SUPER_ADMIN can access

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/env";
import {
  getEventDetails,
  getEventCategories,
  getEventStaff,
  getManagedEvents,
  getMyTeamsServer,
} from "@/services/event-management-service";
import { OverviewClientView } from "./overview-client-view";

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function OverviewPage({ params }: Props) {
  const { event_id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const BACKEND_URL = API_URL.replace(/\/+$/, "");

  // Verify authentication and get user role
  const [meRes, managedEvents] = await Promise.all([
    fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    getManagedEvents(token),
  ]);

  if (!meRes.ok) {
    redirect("/login");
  }

  const meData = await meRes.json();
  const isSuperAdmin = meData.role === "SUPER_ADMIN";

  // Check if user has ORGANIZER role for this event
  const managedEvent = managedEvents.find((m) => m.event.id == event_id);
  const isOrganizer = managedEvent?.role === "ORGANIZER";

  // Only ORGANIZER or SUPER_ADMIN can access overview page
  if (!isSuperAdmin && !isOrganizer) {
    // Check other roles and redirect accordingly
    if (managedEvent?.role === "JUDGE") {
      redirect(`/dashboard/events/${event_id}/judge`);
    }
    if (managedEvent?.role === "TABULATOR") {
      redirect(`/dashboard/events/${event_id}/tabulator`);
    }

    // Check if user is OFFICIAL_TEAM
    const myTeams = await getMyTeamsServer(token, event_id);
    if (myTeams.length > 0) {
      redirect(`/dashboard/events/${event_id}/team`);
    }

    // No valid role found
    redirect("/dashboard");
  }

  // Fetch initial data in parallel
  const [event, categories, staff] = await Promise.all([
    getEventDetails(event_id, token),
    getEventCategories(event_id, token),
    getEventStaff(event_id, token),
  ]);

  return (
    <OverviewClientView
      eventId={event_id}
      initialEvent={event}
      initialCategories={categories}
      initialStaff={staff}
    />
  );
}
