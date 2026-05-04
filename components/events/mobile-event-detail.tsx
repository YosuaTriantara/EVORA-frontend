"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Trophy,
  ChevronRight,
  Share2,
  Bookmark,
  Clock,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileHeader } from "@/components/layout/mobile-header";
import { StickyCTA, StickyCTAContainer } from "@/components/ui/mobile-optimized/sticky-cta";
import { MobileCard, ProgressCard } from "@/components/ui/mobile-optimized/mobile-card";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import type { EventDetail, RegistrationCategory } from "@/types/event";

interface MobileEventDetailProps {
  event: EventDetail;
}

export function MobileEventDetail({ event }: MobileEventDetailProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<RegistrationCategory | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleRegister = (category: RegistrationCategory) => {
    if (category.is_full) return;
    setSelectedCategory(category);
    setShowRegistration(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.event.title,
          text: `Daftar sekarang di ${event.event.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  // Registration Wizard View
  if (showRegistration && selectedCategory) {
    return (
      <RegistrationWizard
        event={{
          id: event.event.id,
          title: event.event.title,
          organizer: event.event.organizer,
        }}
        category={selectedCategory}
        onComplete={(teamId) => {
          setShowRegistration(false);
          if (teamId) {
            // Go directly to the team page with upload prompt if still PENDING_PAYMENT
            router.push(`/dashboard/teams/${teamId}?action=upload`);
          } else {
            router.push("/dashboard");
          }
        }}
        onCancel={() => setShowRegistration(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader
        title="Detail Event"
        showBack={true}
        backHref="/"
        rightActions={
          <>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Bookmark
                className={cn(
                  "w-5 h-5 transition-colors",
                  isBookmarked ? "fill-red-600 text-red-600" : "text-slate-600"
                )}
              />
            </button>
          </>
        }
      />

      <StickyCTAContainer>
        {/* Hero Banner */}
        <div className="relative h-48 bg-gradient-to-br from-[#681212] to-[#8a1a1a]">
          {event.event.banner_url ? (
            <Image
              src={event.event.banner_url}
              alt={event.event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Event Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-xl font-bold text-white mb-2">
              {event.event.content_data?.hero?.title || event.event.title}
            </h1>
            <p className="text-sm text-white/80">
              {event.event.content_data?.hero?.subtitle || `Diselenggarakan oleh ${event.event.organizer}`}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {formatDate(event.event.event_date_start)}
              {event.event.event_date_end !== event.event.event_date_start && (
                <> - {formatDate(event.event.event_date_end)}</>
              )}
            </span>
          </div>
          
          {event.event.location && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{event.event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Diselenggarakan oleh {event.event.organizer}</span>
          </div>
        </div>

        {/* Registration Status */}
        {event.registration.is_open ? (
          <div className="px-4 pb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Pendaftaran Dibuka</p>
                <p className="text-sm text-green-700">Daftar sekarang sebelum kuota penuh</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-medium text-slate-700">Pendaftaran Ditutup</p>
                <p className="text-sm text-slate-500">Nantikan event berikutnya</p>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {event.event.content_data?.sections?.about && (
          <div className="px-4 pb-4">
            <MobileCard>
              <h2 className="font-semibold text-slate-900 mb-2">Tentang Event</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {event.event.content_data?.sections?.about}
              </p>
            </MobileCard>
          </div>
        )}

        {/* Categories */}
        {event.registration.is_open && event.registration.categories.length > 0 && (
          <div className="px-4 pb-4">
            <h2 className="font-semibold text-slate-900 mb-3">Kategori Lomba</h2>
            <div className="space-y-3">
              {event.registration.categories.map((category) => (
                <ProgressCard
                  key={category.id}
                  title={category.name}
                  current={category.max_quota - category.available_slots}
                  max={category.max_quota}
                  label={`Rp ${category.fee.toLocaleString("id-ID")}`}
                  onClick={() => handleRegister(category)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Voting Section */}
        {event.voting?.status === "LIVE" && event.event.is_voting_enabled && (
          <div className="px-4 pb-4">
            <MobileCard 
              onClick={() => router.push(`/voting/${event.event.slug}`)}
              showArrow
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">Voting Berlangsung</h3>
                  <p className="text-sm text-slate-500">Dukung tim favorit Anda</p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}
      </StickyCTAContainer>

      {/* Sticky CTA */}
      {event.registration.is_open && (
        <StickyCTA
          onClick={() => {
            const firstAvailable = event.registration.categories.find(c => !c.is_full);
            if (firstAvailable) {
              handleRegister(firstAvailable);
            }
          }}
          disabled={!event.registration.categories.some(c => !c.is_full)}
        >
          {event.registration.categories.some(c => !c.is_full) 
            ? "Daftar Sekarang" 
            : "Semua Kategori Penuh"
          }
        </StickyCTA>
      )}
    </div>
  );
}
