// CREATED: 2025-04-17 - Event Header Component for Event Context Navigation
// Displays event title, role badge, and back button

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
// Minimal event interface for header display - accepts any event-like object
interface EventHeaderProps {
  event: {
    id?: string;
    title?: string;
    slug?: string;
    location?: string | null;
    profil_url?: string | null;
    event_date_start?: string;
    event_date_end?: string;
  } | null;
  role: string;
  loading?: boolean;
}

const ROLE_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  ORGANIZER: {
    label: "Organizer",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  JUDGE: {
    label: "Juri",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  TABULATOR: {
    label: "Tabulator",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  OFFICIAL_TEAM: {
    label: "Tim Resmi",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

export function EventHeader({ event, role, loading = false }: EventHeaderProps) {
  const router = useRouter();
  const roleConfig = ROLE_BADGE_CONFIG[role] || {
    label: role,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <EventHeaderSkeleton />;
  }

  if (!event) {
    return (
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/events")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <span className="text-slate-500">Event tidak ditemukan</span>
          </div>
        </div>
      </div>
    );
  }

  const dateRange = event.event_date_start && event.event_date_end
    ? `${formatDate(event.event_date_start)} - ${formatDate(event.event_date_end)}`
    : event.event_date_start
      ? formatDate(event.event_date_start)
      : null;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/events")}
          className="gap-2 mb-3 -ml-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kembali ke Daftar Event</span>
          <span className="sm:hidden">Kembali</span>
        </Button>

        {/* Event Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {event.title}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium px-2 py-0.5 shrink-0",
                  roleConfig.className
                )}
              >
                {roleConfig.label}
              </Badge>
            </div>

            {/* Event Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
              {dateRange && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateRange}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">
                    {event.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event Image (small) */}
          {event.profil_url && (
            <div className="shrink-0 hidden sm:block">
              <img
                src={event.profil_url}
                alt={event.title}
                className="w-12 h-12 rounded-lg object-cover bg-slate-100"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Skeleton className="h-8 w-32 mb-3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-4 mt-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
