import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVoteCategories } from "@/services/super-admin/sa-voting-service";
import { canOrganizeEvent } from "@/lib/event-access-server";
import { VotingClientView } from "./voting-client-view";

export const metadata: Metadata = {
  title: "Manajemen Voting - EVORA",
  description: "Kelola kategori dan kandidat voting",
};

interface PageProps {
  params: Promise<{ event_id: string }>;
}

export default async function VotingPage({ params }: PageProps) {
  const { event_id } = await params;

  // Check access - only ORGANIZER can access
  const hasAccess = await canOrganizeEvent(event_id);
  if (!hasAccess) notFound();

  // Fetch data on server
  const categoriesResponse = await getVoteCategories(event_id, { limit: 100 });
  const categories = categoriesResponse.data;

  // Calculate stats
  const stats = {
    total_votes: categories.reduce((sum, cat) => sum + (cat.candidate_count || 0), 0),
    total_categories: categories.length,
    active_categories: categories.filter((cat) => cat.is_active).length,
  };

  return (
    <VotingClientView
      eventId={event_id}
      initialCategories={categories}
      initialStats={stats}
    />
  );
}
