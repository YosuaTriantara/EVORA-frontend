import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";

export async function EventShowcase() {
  const events = await getEvents();

  return (
    <section id="events" className="py-16 bg-slate-50">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-14">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Event Sedang <br />
              <span className="text-red-900">Berlangsung</span>
            </h2>
          </div>

          <Link
            href="/events"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-900 transition-colors duration-200 mt-4 md:mt-0"
          >
            Jelajahi Semua Event
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-red-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={event.profil_url ?? event.banner_url ?? ""}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-1">
                  {event.organizer}
                </p>
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-4 group-hover:text-red-900 transition-colors duration-200">
                  {event.title}
                </h3>

                <div className="space-y-1.5 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{event.event_date_start} — {event.event_date_end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{event.location ?? "–"}</span>
                  </div>
                </div>

                {/* CTA inline */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
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