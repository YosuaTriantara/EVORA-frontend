import { getEvents } from "@/services/event-service";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EventCatalog } from "@/components/events/event-catalog";

export default async function EventsPage() {
  // Fetch data di server (SEO Friendly)
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          {/* Page Header */}
          <div className="mb-10 text-center max-w-3xl mx-auto">
             <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
               Daftarkan <span className="text-red-900"> PasukanMu</span>
             </h1>
             <p className="text-lg text-slate-600">
               Berbagai kompetisi sedang berlangsung. Pilih kategori yang sesuai dan daftarkan pasukanmu sekarang!
             </p>
          </div>

          {/* Interactive Catalog */}
          <EventCatalog initialEvents={events} />

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}