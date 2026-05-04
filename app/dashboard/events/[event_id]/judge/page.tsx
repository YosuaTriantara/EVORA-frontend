// JUDGE Role - Redirect to Scoring Page
// Juri diarahkan ke halaman scoring dengan akses terbatas

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getManagedEvents } from "@/services/event-management-service";

interface Props {
  params: Promise<{ event_id: string }>;
}

export default async function JudgePage({ params }: Props) {
  const { event_id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("evora_session")?.value;

  if (!token) {
    redirect("/login");
  }

  // Verify user has JUDGE role for this event
  const managedEvents = await getManagedEvents(token);
  console.log('[judge/page.tsx] event_id:', event_id, 'managedEvents count:', managedEvents.length);
  
  // FIX: Use loose equality (==) to handle type mismatch
  const managedEvent = managedEvents.find((m) => m.event.id == event_id);
  console.log('[judge/page.tsx] managedEvent found:', !!managedEvent, 'role:', managedEvent?.role);

  if (!managedEvent || managedEvent.role !== "JUDGE") {
    console.log('[judge/page.tsx] Redirecting to dashboard - not JUDGE role');
    redirect("/dashboard");
  }

  // Redirect to scoring page with judge context
  // Scoring page akan menampilkan UI yang sesuai untuk juri
  redirect(`/dashboard/events/${event_id}/scoring`);
}
