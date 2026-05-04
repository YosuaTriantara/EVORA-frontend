import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, BarChart3 } from "lucide-react";

export async function VotingTeaser() {
  const allEvents = await getEvents();
  // Filter event yang aktif votingnya
  const activeVotingEvents = allEvents
    .filter((e) => e.is_voting_live)
    .slice(0, 2);

  if (activeVotingEvents.length === 0) return null;

  return (
    <section id="voting" className="py-10 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header Section - Minimalis & Elegan */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Dukung Kandidat <span className="text-red-900">FavoritMu</span>
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Berikan suaramu dan untuk pasukan favoritmu di kompetisi yang sedang berlangsung. Jadilah bagian dari keseruan dan bantu mereka meraih kemenangan!
            </p>
          </div>

          <Button
            variant="ghost"
            className="hidden md:flex text-slate-600 hover:text-red-900 font-medium group"
            asChild
          >
            <Link href="/voting">
              Lihat Leaderboard Lengkap
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Card Grid - Style Clean & Professional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeVotingEvents.map((event) => (
            <div
              key={event.id}
              className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch"
            >
              {/* Image Area - Square Rounded */}
              <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={event.profil_url ?? event.banner_url ?? ""}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Info Area */}
              <div className="flex-1 w-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant="outline"
                      className="text-red-900 border-red-200 bg-red-50 text-[10px] font-bold tracking-wider"
                    >
                      VOTING OPEN
                    </Badge>
                    <span className="text-xs font-medium text-slate-400">
                      Ends in 2 days
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1 group-hover:text-red-900 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {event.organizer}
                  </p>
                </div>

                {/* Stats & Action */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Total Votes
                    </span>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-yellow-500" />
                      <span className="text-lg font-bold text-slate-900">
                        1,250
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-slate-900 text-white hover:bg-red-900 transition-colors rounded-lg px-6 font-bold"
                    asChild
                  >
                    <Link href={`/voting/${event.slug}`}>Vote Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Link */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href="/voting"
            className="text-sm font-bold text-red-900 hover:underline"
          >
            Lihat Semua Voting →
          </Link>
        </div>
      </div>
    </section>
  );
}
