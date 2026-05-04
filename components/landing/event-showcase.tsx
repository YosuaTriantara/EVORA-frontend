import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";

export async function EventShowcase() {
  const events = await getEvents();

  return (
    <section id="events" className="py-10 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header Minimalis */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Event Sedang <span className="text-red-900">Berlangsung</span>
            </h2>
            <p className="text-slate-600 max-w-xl text-lg">
              Daftarkan pasukanmu di kompetisi yang sedang berlangsung. Jangan lewatkan kesempatan untuk menunjukkan kemampuan terbaikmu dan raih kemenangan!
            </p>
          </div>

          <Button
            variant="ghost"
            className="hidden md:flex text-red-900 font-bold hover:bg-red-50 hover:text-red-800"
            asChild
          >
            <Link href="/events">
              Jelajahi Semua Event <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card
              key={event.id}
              className="group border-0 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl overflow-hidden flex flex-col h-full"
            >
              {/* Image Area */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={event.profil_url ?? event.banner_url ?? ""}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content Area */}
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="mb-2">
                  <p className="text-xs font-bold text-red-900 uppercase tracking-wider mb-1">
                    {event.organizer}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-red-900 transition-colors">
                    {event.title}
                  </h3>
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center text-sm text-slate-500 font-medium">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                    {event.event_date_start} - {event.event_date_end}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {event.location ?? ""}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  asChild
                  className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl group-hover:bg-red-900 transition-colors"
                >
                  <Link href={`/events/${event.slug}`}>Daftar Sekarang</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-8 md:hidden text-center">
          <Button
            variant="outline"
            className="w-full rounded-xl h-12 border-slate-300"
            asChild
          >
            <Link href="/events">Jelajahi Semua Event</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
