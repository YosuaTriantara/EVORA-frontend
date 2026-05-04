// CREATED: 2025-04-17 - Event Card Component for Event List Page
// Displays event information with role badge and stats

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ManagedEvent } from "@/services/event-management-service";

interface EventCardProps {
  managedEvent: ManagedEvent;
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

export function EventCard({ managedEvent }: EventCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { event, role } = managedEvent;
  const roleConfig = ROLE_BADGE_CONFIG[role] || {
    label: role,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  // Format date range
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const dateRange = event.event_date_start && event.event_date_end
    ? `${formatDate(event.event_date_start)} - ${formatDate(event.event_date_end)}`
    : event.event_date_start
      ? formatDate(event.event_date_start)
      : "Tanggal belum ditentukan";

  // Check if event is active (simple check based on date)
  const isActive = event.is_active && (
    !event.event_date_end || new Date(event.event_date_end) >= new Date()
  );

  const handleClick = () => {
    if (isNavigating) return; // Prevent double clicks
    setIsNavigating(true);
    router.push(`/dashboard/events/${event.id}/overview`);
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 relative",
        "hover:shadow-md hover:border-primary/30",
        "border-2 border-transparent",
        "active:scale-[0.99]",
        isNavigating && "opacity-70 pointer-events-none"
      )}
      onClick={handleClick}
    >
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Event Image */}
          <div className="relative shrink-0">
            {event.profil_url ? (
              <img
                src={event.profil_url}
                alt={event.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary/60" />
              </div>
            )}
            {/* Active indicator */}
            {isActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                  {event.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {event.organizer || "Penyelenggara belum ditentukan"}
                </p>
              </div>
              {isNavigating ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              )}
            </div>

            {/* Role Badge */}
            <Badge
              variant="outline"
              className={cn(
                "mt-2 text-xs font-medium px-2 py-0.5",
                roleConfig.className
              )}
            >
              {roleConfig.label}
            </Badge>

            {/* Event Details */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{dateRange}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>45 tim</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>12 pending</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
