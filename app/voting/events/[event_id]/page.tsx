import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/services/event-service";
import { getPublicVoteCategories } from "@/services/voting-service";
import { getVotePackages } from "@/services/super-admin/sa-voting-service";
import { PublicVotingView } from "@/components/voting/public-voting-view";
import type { VotePackageWithData } from "@/components/voting/public-voting-view";

interface PageProps {
  params: Promise<{ event_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { event_id } = await params;
  const eventData = await getPublicEvent(event_id);
  const eventInfo = eventData?.event;

  return {
    title: `Voting - ${eventInfo?.title || "Event"} | EVORA`,
    description: `Dukung tim favorit Anda di ${eventInfo?.title} dengan voting online`,
    openGraph: {
      title: `Voting ${eventInfo?.title}`,
      description: `Dukung tim favorit Anda di ${eventInfo?.title}`,
      images: eventInfo?.profil_url ? [eventInfo.profil_url] : [],
    },
  };
}

export default async function VotingPage({ params }: PageProps) {
  const { event_id } = await params;

  // Get event details
  const eventData = await getPublicEvent(event_id);
  if (!eventData || !eventData.event.is_voting_enabled) {
    notFound();
  }

  const eventInfo = eventData.event;

  // Get vote categories
  const categoriesData = await getPublicVoteCategories(event_id);

  // Get vote packages
  const packagesData = await getVotePackages();
  const packages: VotePackageWithData[] = packagesData.data || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold">Voting {eventInfo.title}</h1>
          <p className="text-blue-100 mt-3 text-lg max-w-2xl">
            Pilih kategori dan dukung tim favorit Anda dengan poin voting.
            Setiap poin Anda sangat berarti!
          </p>

          {/* Event Info */}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-blue-100">
            <span>📍 {eventInfo.location}</span>
            <span>📅 {new Date(eventInfo.event_date_start).toLocaleDateString("id-ID")}</span>
            <span>🏆 {categoriesData.categories.length} Kategori Voting</span>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PublicVotingView
          eventId={event_id}
          categories={categoriesData.categories}
          packages={packages}
        />
      </div>
    </div>
  );
}
