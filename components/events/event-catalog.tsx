"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EventPreview } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";

// Derive a status badge from EventPreview's boolean flags
const getStatusBadge = (event: EventPreview) => {
  if (event.is_voting_live) {
    return (
      <Badge className="bg-red-600 hover:bg-red-700 animate-pulse">
        Voting Live
      </Badge>
    );
  }
  if (event.is_registration_open) {
    return (
      <Badge className="bg-green-600 hover:bg-green-700">
        Pendaftaran Buka
      </Badge>
    );
  }
  return <Badge variant="outline">Selesai</Badge>;
};

export function EventCatalog({
  initialEvents,
}: {
  initialEvents: EventPreview[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "OPEN" | "VOTING">(
    "ALL",
  );

  // Filter logic
  const filteredEvents = initialEvents.filter((event) => {
    // 1. Text filter (title or location)
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Tab filter
    let matchesType = true;
    if (filterType === "OPEN") {
      matchesType = event.is_registration_open === true;
    } else if (filterType === "VOTING") {
      matchesType = event.is_voting_live === true;
    }

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        {/* Tab Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          {(["ALL", "OPEN", "VOTING"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                filterType === type
                  ? "bg-white text-red-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {type === "ALL" && "Semua Event"}
              {type === "OPEN" && "Buka Pendaftaran"}
              {type === "VOTING" && "Live Voting"}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari event atau kota..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-red-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Tidak ada event ditemukan
          </h3>
          <p className="text-slate-500">Coba ubah kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="group border-slate-200 hover:border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image & Badge */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <Image
                  src={event.profil_url ?? "/placeholder.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Status badge (top-left) */}
                <div className="absolute top-4 left-4">
                  {getStatusBadge(event)}
                </div>

                {/* Voting Live badge (top-right) */}
                {event.is_voting_live && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 border-0 font-bold">
                      🔥 Voting Live
                    </Badge>
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
                    {event.organizer}
                  </p>
                  <h3 className="text-xl font-bold leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                </div>
              </div>

              {/* Details */}
              <CardContent className="flex-1 pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-slate-600 gap-2">
                    <CalendarDays className="w-4 h-4 text-red-900 shrink-0" />
                    <span className="truncate">
                      {event.event_date_start ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-600 gap-2">
                    <MapPin className="w-4 h-4 text-red-900 shrink-0" />
                    <span className="truncate">{event.location ?? "—"}</span>
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <CardFooter className="pt-0 gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/events/${event.slug}`}>Detail</Link>
                </Button>

                {event.is_registration_open ? (
                  <Button
                    className="flex-1 bg-red-900 hover:bg-red-800"
                    asChild
                  >
                    <Link href={`/events/${event.slug}`}>
                      Daftar <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                ) : event.is_voting_live ? (
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    asChild
                  >
                    <Link href={`/voting/${event.slug}`}>Vote Now</Link>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-slate-200 text-slate-400"
                  >
                    Ditutup
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
