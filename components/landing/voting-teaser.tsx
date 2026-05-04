import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { ArrowUpRight, BarChart3 } from "lucide-react";

export async function VotingTeaser() {
  const allEvents = await getEvents();
  const activeVotingEvents = allEvents
    .filter((e) => e.is_voting_live)
    .slice(0, 2);

  if (activeVotingEvents.length === 0) return null;

  return (
    <section id="voting" className="py-10 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Dukung Kandidat <span className="text-red-900">FavoritMu</span>
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Berikan suaramu untuk pasukan favoritmu di kompetisi yang sedang berlangsung. Jadilah bagian dari keseruan dan bantu mereka meraih kemenangan!
            </p>
          </div>
          <Link
            href="/voting"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-900 transition-colors duration-200"
          >
            Lihat Leaderboard Lengkap
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeVotingEvents.map((event) => (
            <div
              key={event.id}
              className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-200"
            >
              {/* Accent line — slide in dari kiri saat hover */}
              <div className="absolute top-0 left-0 h-full w-1 bg-red-900 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-l-2xl z-10" />

              {/* Inner layout */}
              <div className="flex flex-row gap-5 p-5 items-stretch">

                {/* Image */}
                <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 self-center">
                  <img
                    src={event.profil_url ?? event.banner_url ?? ""}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Status + organizer */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Voting Open
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-900 transition-colors duration-200 truncate">
                      {event.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      {event.organizer}
                    </p>
                  </div>

                  {/* Stats + CTA */}
                  <div className="flex items-end justify-between mt-4 pt-3.5 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Total Votes
                      </p>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-lg font-bold text-slate-900">
                          1,250
                        </span>
                      </div>
                    </div>

                    {/* Underline CTA — konsisten dengan event showcase */}
                    <Link
                      href={`/voting/${event.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 pb-0.5 border-b border-slate-300 hover:text-red-900 hover:border-red-900 transition-all duration-200 group/cta"
                    >
                      Vote Sekarang
                      <ArrowUpRight className="w-3.5 h-3.5 -translate-x-0.5 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href="/voting"
            className="inline-flex items-center justify-center w-full h-12 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-red-900 hover:text-red-900 transition-colors duration-200"
          >
            Lihat Semua Voting
          </Link>
        </div>
      </div>
    </section>
  );
}