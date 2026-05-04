// UPDATED: 2025-04-17 - Integrated EventRoleProvider for React Query architecture
// Layout now wraps children with EventRoleProvider for role-based access control
// Supports all roles: ORGANIZER, JUDGE, TABULATOR, OFFICIAL_TEAM

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDashboard } from "@/context/dashboard-context";
import { EventRoleProvider } from "@/context/event-role-context";
import { EventHeader } from "@/components/dashboard/event-navigation/event-header";
import { EventTabNav } from "@/components/dashboard/event-navigation/event-tab-nav";
import {
  getManagedEvents,
  getMyTeams,
} from "@/services/event-management-service";
import { getEvents } from "@/services/event-service";
import { EventPreview } from "@/types/event";
import { EventReadFull, StaffRole } from "@/types/admin";

// Minimal event interface for layout context
interface EventContextData {
  id: string;
  title: string;
  slug: string;
  location?: string | null;
  profil_url?: string | null;
  event_date_start?: string;
  event_date_end?: string;
}

// Extended type to support both managed events and official team
interface EventContext {
  event: EventContextData;
  role: StaffRole | "OFFICIAL_TEAM";
  meta_data?: Record<string, unknown> | null;
}

// Helper to convert EventReadFull to EventContextData
function toEventContextData(event: EventReadFull | EventPreview): EventContextData {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    location: event.location,
    profil_url: event.profil_url,
    event_date_start: event.event_date_start,
    event_date_end: event.event_date_end,
  };
}

interface EventLayoutProps {
  children: React.ReactNode;
}

function EventLayoutInner({ children }: EventLayoutProps) {
  const params = useParams();
  const eventId = params.event_id as string;
  const { setCurrentEventId } = useDashboard();

  const [eventContext, setEventContext] = useState<EventContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set current event ID untuk context dan fetch event data
  useEffect(() => {
    setCurrentEventId(eventId);

    async function fetchEventData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch managed events, my teams, and all events in parallel
        const [managedEvents, myTeams, allEvents] = await Promise.all([
          getManagedEvents(),
          getMyTeams(eventId),
          getEvents(),
        ]);

        // Check managed events first (ORGANIZER, JUDGE, TABULATOR)
        // FIX: Use loose equality (==) to handle type mismatch
        const managedEvent = managedEvents.find((e) => e.event.id == eventId);

        if (managedEvent) {
          setEventContext({
            event: toEventContextData(managedEvent.event),
            role: managedEvent.role,
            meta_data: managedEvent.meta_data,
          });
          setLoading(false);
          return;
        }

        // Check official team (via my-teams)
        const myTeam = myTeams.find((t) => t.event_id == eventId);

        if (myTeam) {
          const event = allEvents.find((e) => e.id == eventId);
          if (event) {
            setEventContext({
              event: toEventContextData(event),
              role: "OFFICIAL_TEAM",
            });
            setLoading(false);
            return;
          }
        }

        // No access found
        setError("Event tidak ditemukan atau Anda tidak memiliki akses");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();

    // Cleanup saat unmount
    return () => {
      setCurrentEventId(null);
    };
  }, [eventId, setCurrentEventId]);

  // Access control is enforced by the Server Component page.tsx which reads
  // the JWT directly and calls redirect() if the user has no role.
  // The layout's job is to set the event context and render header + navigation.

  // Wrap children with EventRoleProvider when event context is available
  const wrappedChildren = eventContext ? (
    <EventRoleProvider
      eventId={eventId}
      role={eventContext.role === "OFFICIAL_TEAM" ? null : eventContext.role}
      isSuperAdmin={false} // Super admin check is done at middleware/layout level
    >
      {children}
    </EventRoleProvider>
  ) : (
    children
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Event Header with Back Button and Title */}
      <EventHeader
        event={eventContext?.event || null}
        role={eventContext?.role || "ORGANIZER"}
        loading={loading}
      />

      {/* Tab Navigation - only show if we have event data */}
      {!loading && eventContext && (
        <EventTabNav eventId={eventId} role={eventContext.role} />
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {wrappedChildren}
      </div>
    </div>
  );
}

export default function EventLayout({ children }: EventLayoutProps) {
  return <EventLayoutInner>{children}</EventLayoutInner>;
}
