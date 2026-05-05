import { notFound } from "next/navigation";
import { getPublicEvent } from "@/services/event-service";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EventDetailHero } from "@/components/events/event-detail-hero";
import { EventDetailMeta } from "@/components/events/event-detail-meta";
import { EventDetailCategories } from "@/components/events/event-detail-categories";
import { EventDetailTimeline } from "@/components/events/event-detail-timeline";
import { EventDetailVotingPreview } from "@/components/events/event-detail-voting-preview";
import { EventCtaBanner } from "@/components/events/event-cta-banner";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  try {
    const eventData = await getPublicEvent(slug);

    if (!eventData) {
      notFound();
    }

    const { event, registration, voting } = eventData;
    const isVotingLive = voting.status === "LIVE" || voting.status === "live";;
    const isRegistrationOpen = registration.is_open;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <SiteHeader />

        <main className="flex-1 pt-20 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">

            <EventDetailHero
              event={event}
              isVotingLive={isVotingLive}
              isRegistrationOpen={isRegistrationOpen}
            />

            <EventDetailMeta event={event} />

            {/* Tentang event */}
            <section className="py-8 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-900 mb-2">
                  Tentang event
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  {event.content_data?.hero?.title ?? event.title}
                </h2>
                {event.content_data?.hero?.subtitle && (
                  <p className="text-sm text-slate-400 mb-2">
                    {event.content_data.hero.subtitle}
                  </p>
                )}
                {event.content_data?.sections?.about && (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {event.content_data.sections.about}
                  </p>
                )}
              </div>

              {isRegistrationOpen && (
                <EventCtaBanner
                  title="Daftarkan pasukanmu sekarang"
                  description="Pendaftaran masih buka. Pilih kategori yang sesuai dan daftarkan timmu sekarang."
                  primaryLabel="Lihat Kategori"
                  primaryHref="#categories"
                  secondaryLabel="Lihat Jadwal"
                  secondaryHref="#timeline"
                />
              )}
            </section>

            <div className="border-t border-slate-100" />

            {/* Kategori */}
            <section id="categories" className="py-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-900 mb-2">
                Kategori lomba
              </p>
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                Pilih kategorimu
              </h2>
              <EventDetailCategories
                categories={registration.categories}
                eventId={event.id}
                isRegistrationOpen={isRegistrationOpen}
              />
            </section>

            <div className="border-t border-slate-100" />

            {/* Voting preview */}
            {isVotingLive && voting.data.length > 0 && (
              <>
                <section className="py-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-900 mb-2">
                    Live voting
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mb-5">
                    Dukung favoritmu
                  </h2>
                  <EventDetailVotingPreview
                    voting={voting}
                    eventSlug={slug}
                  />
                </section>
                <div className="border-t border-slate-100" />
              </>
            )}

            {/* Timeline */}
            <section id="timeline" className="py-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-900 mb-2">
                Jadwal kegiatan
              </p>
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                Timeline event
              </h2>
              <EventDetailTimeline
                event={event}
                isRegistrationOpen={isRegistrationOpen}
              />
            </section>

            {/* Closing CTA */}
            <EventCtaBanner
              title="Siap bersaing?"
              description={`Bergabung bersama para peserta terbaik di ${event.title}.`}
              primaryLabel={isRegistrationOpen ? "Daftar Sekarang" : "Vote Favorit"}
              primaryHref={isRegistrationOpen ? "#categories" : `/voting/${slug}`}
              secondaryLabel={isVotingLive ? "Vote Favorit" : undefined}
              secondaryHref={isVotingLive ? `/voting/${slug}` : undefined}
            />

          </div>
        </main>

        <SiteFooter />
      </div>
    );
  } catch (error) {
    notFound();
  }
}