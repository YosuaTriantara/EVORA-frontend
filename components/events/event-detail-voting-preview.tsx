import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import type { EventDetailVoting } from "@/types/event";

interface Props {
  voting: EventDetailVoting;
  eventSlug: string;
}

export function EventDetailVotingPreview({ voting, eventSlug }: Props) {
  const firstCategory = voting.data[0];
  if (!firstCategory) return null;

  const previews = firstCategory.candidates.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-red-900 px-5 py-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-white text-sm font-bold">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          {firstCategory.category_name}
        </span>
        <Link
          href={`/voting/${eventSlug}`}
          className="flex items-center gap-1 text-white/80 hover:text-white text-xs font-bold transition-colors"
        >
          Semua Kandidat <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 p-5">
        {previews.map((candidate, i) => (
          <div key={i} className="text-center">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
              {candidate.image_url ? (
                <Image
                  src={candidate.image_url}
                  alt={candidate.candidate_name}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">
                  {candidate.candidate_name.charAt(0)}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">
              {candidate.candidate_name}
            </p>
            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
              {candidate.team_name}
            </p>
            {candidate.current_votes !== undefined && (
              <p className="text-[10px] font-bold text-red-900 mt-1">
                {candidate.current_votes.toLocaleString("id-ID")} votes
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <Link
          href={`/voting/${eventSlug}`}
          className="flex items-center justify-center gap-2 w-full bg-red-900 hover:bg-red-800 text-white text-sm font-bold py-3 rounded-full transition-colors"
        >
          <Star className="w-4 h-4 fill-white" />
          Vote Favorit Sekarang
        </Link>
      </div>
    </div>
  );
}