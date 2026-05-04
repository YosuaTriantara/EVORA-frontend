"use client";

import { useState } from "react";
import Link from "next/link";
import { EventPreview } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Search, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { Users } from "lucide-react";

const statusBadge = (event: EventPreview) => {
  
  if (event.is_registration_open)
    return (
      <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
        Pendaftaran Buka
      </span>
    );
  return (
    <span className="absolute top-3 right-3 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200">
      Selesai
    </span>
  );
};

export function EventCatalog({ initialEvents }: { initialEvents: EventPreview[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "OPEN" | "VOTING">("ALL");

  const filteredEvents = initialEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "ALL" ||
      (filterType === "OPEN" && event.is_registration_open);
    return matchesSearch && matchesType;
  });

  const ctaHref = (event: EventPreview) =>
    `/events/${event.slug}`;

  const ctaLabel = (event: EventPreview) => {
    if (event.is_registration_open) return "Daftar sekarang";
    return "Pendaftaran ditutup";
  };

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full shrink-0">
          {(["ALL", "OPEN", "VOTING"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? "bg-white text-red-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {type === "ALL" && "Semua event"}
              {type === "OPEN" && "Buka pendaftaran"}
              {type === "VOTING" && "Live voting"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari event atau kota..."
            className="pl-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-red-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada event ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1">Coba ubah kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const isClosed = !event.is_registration_open && !event.is_voting_live;
            const href = ctaHref(event);

            return (
              <Link
                key={event.id}
                href={href}
                className={`group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden
                  hover:border-red-200 hover:shadow-md transition-all duration-300
                  ${isClosed ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={event.profil_url ?? "/placeholder.jpg"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Status badge */}
                  {statusBadge(event)}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 gap-3">

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-red-900 transition-colors duration-200">
                    {event.title}
                  </h3>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{event.organizer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>
                        {event.event_date_start ?? "—"}
                        {event.event_date_end && ` — ${event.event_date_end}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{event.location ?? "—"}</span>
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* CTA footer — sama persis dengan EventShowcase */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-semibold transition-colors duration-200 ${isClosed ? "text-slate-400" : "text-slate-900 group-hover:text-red-900"}`}>
                      {ctaLabel(event)}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-900 flex items-center justify-center transition-colors duration-200">
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors duration-200" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}