"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { EventPreview } from "@/types/event";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Timer,
  ArrowUpRight,
  Users,
  LayoutGrid,
  CalendarClock,
  Vote,
} from "lucide-react";

// ─── Extend EventPreview dengan field voting-specific ─────────────────────────
// Pastikan field berikut ada di type EventPreview (atau tambahkan di sini):
//   voting_start?: string | null       — tanggal mulai voting, e.g. "12 Mar 2025"
//   voting_end?: string | null         — tanggal tutup voting, e.g. "20 Mar 2025"
//   voting_category_count?: number     — jumlah kategori voting
//   total_votes_cast?: number          — total suara yang sudah masuk
type VotingEvent = EventPreview & {
  voting_start?: string | null;
  voting_end?: string | null;
  voting_category_count?: number | null;
  total_votes_cast?: number | null;
};

// ─── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(targetDateStr: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!targetDateStr) return;

    const calc = () => {
      const diff = new Date(targetDateStr).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Selesai");
        setIsUrgent(false);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setIsUrgent(diff < 86400000);
      if (days > 0) setTimeLeft(`${days}h ${hours}j lagi`);
      else if (hours > 0) setTimeLeft(`${hours}j ${mins}m lagi`);
      else setTimeLeft(`${mins} menit lagi`);
    };

    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return { timeLeft, isUrgent };
}

// ─── Progress bar periode voting ───────────────────────────────────────────────
function VotingProgressBar({
  start,
  end,
}: {
  start?: string | null;
  end?: string | null;
}) {
  const progress = (() => {
    if (!start || !end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const now = Date.now();
    if (now < s) return 0;
    if (now > e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  })();

  if (progress === null) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-slate-400">Mulai</span>
        <span className={progress >= 80 ? "text-red-600 font-bold" : "text-red-900 font-bold"}>
          {progress}% berlalu
        </span>
        <span className="text-slate-400">Berakhir</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress >= 80 ? "bg-red-500" : "bg-red-900"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Voting Card ───────────────────────────────────────────────────────────────
function VotingCard({ event }: { event: VotingEvent }) {
  const { timeLeft, isUrgent } = useCountdown(event.voting_end);
  const isLive = event.is_voting_live;
  const isEnded = !isLive && !event.is_registration_open;
  const isUpcoming = !isLive && event.is_registration_open;

  return (
    <Link
      href={`/voting/${event.slug}`}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300
        ${isLive
          ? "border-2 border-red-200 hover:border-red-400 hover:shadow-lg"
          : "border border-slate-200 hover:border-red-200 hover:shadow-md"
        }
        ${isEnded ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={event.profil_url ?? "/placeholder.jpg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status badge — kiri atas */}
        <div className="absolute top-3 left-3">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 bg-red-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse" />
              Live Voting
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1.5 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200">
              Segera dibuka
            </span>
          )}
          {isEnded && (
            <span className="inline-flex items-center gap-1.5 bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Selesai
            </span>
          )}
        </div>

        {/* Countdown urgency badge — kanan atas, hanya saat &lt; 24 jam */}
        {isLive && isUrgent && timeLeft && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">
              <Timer className="w-3 h-3" />
              {timeLeft}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-900 transition-colors duration-200">
          {event.title}
        </h3>

        {/* Organizer & Lokasi */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{event.organizer ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{event.location ?? "—"}</span>
          </div>
        </div>

        {/* ── Voting info block — pembeda utama dari event card ── */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-3">

          {/* Periode voting */}
          {(event.voting_start || event.voting_end) && (
            <div className="flex items-start gap-2">
              <CalendarClock className="w-3.5 h-3.5 shrink-0 text-red-900 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">
                  Periode voting
                </p>
                <p className="text-xs text-slate-700 font-semibold leading-tight">
                  {event.voting_start ?? "—"} — {event.voting_end ?? "—"}
                </p>
                {/* Countdown non-urgent tampil di sini */}
                {isLive && timeLeft && !isUrgent && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {timeLeft}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Stats row: kategori + total votes */}
          <div className="flex items-center gap-4">
            {event.voting_category_count != null && (
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-800">
                  {event.voting_category_count}
                </span>
                <span className="text-xs text-slate-400">kategori</span>
              </div>
            )}
            {event.total_votes_cast != null && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Vote className="w-3.5 h-3.5 text-red-900 opacity-70" />
                <span className="text-xs font-bold text-slate-800">
                  {event.total_votes_cast.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-slate-400">votes</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <VotingProgressBar start={event.voting_start} end={event.voting_end} />
        </div>

        <div className="flex-1" />

        {/* CTA footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span
            className={`text-xs font-semibold transition-colors duration-200 ${
              isEnded
                ? "text-slate-400"
                : "text-slate-900 group-hover:text-red-900"
            }`}
          >
            {isEnded ? "Voting ditutup" : isUpcoming ? "Lihat detail" : "Vote sekarang"}
          </span>
          <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-900 flex items-center justify-center transition-colors duration-200">
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors duration-200" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Catalog ──────────────────────────────────────────────────────────────
export function VotingCatalog({
  initialEvents,
}: {
  initialEvents: VotingEvent[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "LIVE" | "UPCOMING">("ALL");

  const filteredEvents = initialEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.organizer ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "ALL" ||
      (filterType === "LIVE" && event.is_voting_live) ||
      (filterType === "UPCOMING" && !event.is_voting_live && event.is_registration_open);
    return matchesSearch && matchesType;
  });

  const liveCount = initialEvents.filter((e) => e.is_voting_live).length;
  const upcomingCount = initialEvents.filter(
    (e) => !e.is_voting_live && e.is_registration_open
  ).length;

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full shrink-0">
          {(["ALL", "LIVE", "UPCOMING"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterType === type
                  ? "bg-white text-red-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {type === "ALL" && "Semua voting"}
              {type === "LIVE" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Berlangsung
                  {liveCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {liveCount}
                    </span>
                  )}
                </>
              )}
              {type === "UPCOMING" && (
                <>
                  Segera dibuka
                  {upcomingCount > 0 && (
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {upcomingCount}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari event, kota, atau penyelenggara..."
            className="pl-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-red-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak ada voting ditemukan
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Coba ubah kata kunci atau filter pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <VotingCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}