import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { EventPreview } from "@/types/event";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VotingCatalog } from "@/components/voting/voting-catalog";

export default async function VotingLobbyPage() {
  const allEvents: EventPreview[] = await getEvents();
  const activeEvents = allEvents.filter((e) => e.is_voting_live);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Dukung <span className="text-red-900">JagoanMu</span>
            </h1>
            <p className="text-lg text-slate-600">
              Pilih kompetisi yang sedang berlangsung dan berikan suara Anda
              untuk menentukan Juara Favorit.
            </p>
          </div>

          {/* Interactive Catalog */}
          <VotingCatalog initialEvents={activeEvents} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}