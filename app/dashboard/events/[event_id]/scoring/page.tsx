import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventScoresheets } from "@/services/event-management/scoring-service";
import { getEventCategories } from "@/services/event-management/categories-service";
import { canOrganizeEvent } from "@/lib/event-access-server";
import { ScoringClientView } from "./scoring-client-view";

export const metadata: Metadata = {
  title: "Manajemen Penilaian - EVORA",
  description: "Kelola score sheet dan peringkat",
};

interface PageProps {
  params: Promise<{ event_id: string }>;
}

export default async function ScoringPage({ params }: PageProps) {
  const { event_id } = await params;

  // Check access - only ORGANIZER can access
  const hasAccess = await canOrganizeEvent(event_id);
  if (!hasAccess) notFound();

  // Fetch initial data on server
  const [categories, scoresheets] = await Promise.all([
    getEventCategories(event_id),
    getEventScoresheets(event_id),
  ]);

  // Calculate stats
  const totalSheets = scoresheets.length;
  const lockedSheets = scoresheets.filter((s) => s.is_locked).length;
  const pendingSheets = totalSheets - lockedSheets;

  const stats = {
    totalSheets,
    lockedSheets,
    pendingSheets,
  };

  return (
    <ScoringClientView
      eventId={event_id}
      initialCategories={categories}
      initialScoresheets={scoresheets}
      initialStats={stats}
    />
  );
}
