// TABULATOR Role - Scoring Management Page
// Tabulator bisa input nilai untuk juri, lock/unlock sheets, dan lihat rankings

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getManagedEvents } from "@/services/event-management-service";

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function TabulatorPage({ params }: Props) {
  const { event_id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    redirect("/login");
  }

  // Verify user has TABULATOR role for this event
  const managedEvents = await getManagedEvents(token);
  // FIX: Use loose equality (==) to handle type mismatch
  const managedEvent = managedEvents.find((m) => m.event.id == event_id);

  if (!managedEvent || managedEvent.role !== "TABULATOR") {
    redirect("/dashboard");
  }

  // Redirect to scoring page dengan context tabulator
  // Scoring page akan menampilkan UI lengkap untuk tabulator
  // (input scores, lock/unlock, view all judges)
  redirect(`/dashboard/events/${event_id}/scoring`);
}
