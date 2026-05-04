import Link from "next/link";
import { getEvents } from "@/services/event-service";
import { EventPreview } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header"; // Import Header
import { SiteFooter } from "@/components/site-footer"; // Import Footer
import { CalendarDays, MapPin, ArrowRight, Flame } from "lucide-react";
import Image from "next/image";

export default async function VotingLobbyPage() {
  const allEvents: EventPreview[] = await getEvents();
  // Filter hanya yang votingnya aktif
  const activeEvents = allEvents.filter((e) => e.is_voting_live);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* HEADER SECTION */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Dukung  
              <span className="text-red-900"> JagoanMu</span>
            </h1> 
            <p className="text-lg text-slate-600">
              Pilih kompetisi yang sedang berlangsung di bawah ini dan berikan
              suara Anda untuk menentukan Juara Favorit.
            </p>
          </div>

          {/* EVENT GRID */}
          {activeEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-medium">
                Belum ada voting yang aktif saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {activeEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden border-slate-200 hover:border-red-200 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="w-full sm:w-48 h-48 relative bg-slate-200 shrink-0">
                      <Image
                        src={event.profil_url ?? "/placeholder.jpg"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600 border-0 font-bold px-2 py-0.5 text-[10px]">
                            SEDANG BERLANGSUNG
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-red-900 transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-500">
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {event.location}
                            </div>
                          )}
                          {event.event_date_start && (
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-slate-400" />
                              {event.event_date_start}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {event.organizer}
                        </span>
                        <Button
                          size="sm"
                          className="bg-red-900 hover:bg-red-800 rounded-full px-6"
                          asChild
                        >
                          <Link href={`/voting/${event.slug}`}>
                            Vote Sekarang{" "}
                            <ArrowRight className="ml-2 w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
