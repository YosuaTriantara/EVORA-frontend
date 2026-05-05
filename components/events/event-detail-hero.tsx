import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { EventDetailInfo } from "@/types/event";

interface Props {
  event: EventDetailInfo;
  isVotingLive: boolean;
  isRegistrationOpen: boolean;
}

export function EventDetailHero({ event, isVotingLive, isRegistrationOpen }: Props) {
  const bannerUrl =
    event.content_data?.hero?.banner_url ??
    event.banner_url ??
    event.profil_url ??
    "/placeholder.jpg";

  return (
    <div className="relative h-[420px] md:h-[480px] overflow-hidden rounded-2xl mt-4">
      <img
        src={bannerUrl}
        alt={event.title}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-7">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
          {event.organizer}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          {event.title}
        </h1>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap mb-5">
          {isVotingLive && (
            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse inline-block" />
              Voting Live
            </span>
          )}
          {isRegistrationOpen && (
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Pendaftaran Buka
            </span>
          )}
          {!isVotingLive && !isRegistrationOpen && (
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
              Selesai
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3 flex-wrap">
          {isVotingLive && (
            <Link
              href={`/voting/${event.slug}`}
              className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
            >
              <Star className="w-4 h-4 fill-white" />
              Vote Sekarang
            </Link>
          )}
          {isRegistrationOpen && (
            <Link
              href="#categories"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-5 py-2.5 rounded-full border border-white/40 backdrop-blur-sm transition-colors"
            >
              Daftar Tim
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}