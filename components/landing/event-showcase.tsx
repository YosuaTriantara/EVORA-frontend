import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";

export async function EventShowcase() {
  const events = await getEvents();

  return (
    <section id="events" className="py-10 bg-slate-50 border-b border-slate-100">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Event Sedang <span className="text-red-900">Berlangsung</span>
            </h2>
            <p className="text-slate-500 mt-2 text-lg">
              Jangan lewatkan event-event menarik yang sedang berlangsung dan raih kemenangan bersama pasukanMu!
            </p>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-900 transition-colors duration-200 mt-4 md:mt-0"
          >
            Jelajahi Semua Event
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-300"
            >
              {/* Image — 16/9, lebih tipis */}
              <div className="relative aspect-video overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={event.profil_url ?? event.banner_url ?? ""}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Organizer pill di atas gambar */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-red-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {event.organizer}
                </span>
              </div>

              {/* Content — area lebih besar, lebih bernapas */}
              <div className="flex flex-col flex-1 p-5 gap-3">

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-900 transition-colors duration-200">
                  {event.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{event.event_date_start} — {event.event_date_end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{event.location ?? "–"}</span>
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-red-900 transition-colors duration-200">
                    Daftar Sekarang
                  </span>
                  <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-red-900 flex items-center justify-center transition-colors duration-200">
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors duration-200" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 md:hidden text-center">
          <Link
            href="/events"
            className="inline-flex items-center justify-center w-full h-12 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-red-900 hover:text-red-900 transition-colors duration-200"
          >
            Jelajahi Semua Event
          </Link>
        </div>
      </div>
    </section>
  );
}