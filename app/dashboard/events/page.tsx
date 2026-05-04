// CREATED: 2025-04-17 - Event List Page for ORGANIZER UX Refactor
// Displays all managed events with filtering by role and status

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Filter, Search, Plus, AlertCircle, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventCard } from "@/components/dashboard/event-list/event-card";
import { getManagedEvents, ManagedEvent } from "@/services/event-management-service";
import { cn } from "@/lib/utils";

type RoleFilter = "ALL" | "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";
type StatusFilter = "ACTIVE" | "CLOSED";

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "ORGANIZER", label: "Organizer" },
  { value: "JUDGE", label: "Juri" },
  { value: "TABULATOR", label: "Tabulator" },
  { value: "OFFICIAL_TEAM", label: "Tim" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "CLOSED", label: "Tutup" },
];

// Empty State Component
interface EmptyStateProps {
  hasFilters: boolean;
  totalEvents: number;
  activeFilter: StatusFilter;
  roleFilter: RoleFilter;
  onClearFilters: () => void;
  onShowClosed: () => void;
}

function EmptyState({
  hasFilters,
  totalEvents,
  activeFilter,
  roleFilter,
  onClearFilters,
  onShowClosed,
}: EmptyStateProps) {
  // Case 1: User has events but all are filtered out
  if (totalEvents > 0 && !hasFilters && activeFilter === "ACTIVE") {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <History className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Event sudah berakhir
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
            Anda memiliki {totalEvents} event, tetapi semuanya sudah berakhir atau tidak aktif.
            Event yang sudah berakhir tetap dapat diakses untuk melihat data historis.
          </p>
          <Button onClick={onShowClosed} variant="outline" className="gap-2">
            <History className="w-4 h-4" />
            Lihat Event Berakhir
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Case 2: User has events but filters are hiding them
  if (totalEvents > 0 && hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Tidak ada event yang cocok
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            {totalEvents} event ditemukan, tetapi tidak ada yang cocok dengan filter saat ini.
            Coba ubah filter atau kata kunci pencarian.
          </p>
          <Button onClick={onClearFilters} variant="outline" className="gap-2">
            <X className="w-4 h-4" />
            Hapus Filter
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Case 3: User has no events at all
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Belum ada event
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Anda belum terdaftar di event apapun. Event yang Anda ikuti akan muncul di sini.
        </p>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function EventsListSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>

        {/* Event Cards Skeleton */}
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch managed events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const data = await getManagedEvents();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...events];

    // Filter by role
    if (roleFilter !== "ALL") {
      result = result.filter((e) => e.role === roleFilter);
    }

    // Filter by status
    if (statusFilter === "ACTIVE") {
      result = result.filter((e) => {
        const event = e.event;
        // Event is active if is_active is not false (null/true) and either no end date or end date is in future
        // is_active bisa null (default), kita anggap aktif kecuali explicitly false
        const isActive = event.is_active !== false;
        return (
          isActive &&
          (!event.event_date_end || new Date(event.event_date_end) >= new Date())
        );
      });
    } else {
      // CLOSED - event is explicitly inactive or end date has passed
      result = result.filter((e) => {
        const event = e.event;
        const isExplicitlyInactive = event.is_active === false;
        const hasEnded = event.event_date_end && new Date(event.event_date_end) < new Date();
        return isExplicitlyInactive || hasEnded;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.event.title.toLowerCase().includes(query) ||
          (e.event.organizer && e.event.organizer.toLowerCase().includes(query)) ||
          (e.event.location && e.event.location.toLowerCase().includes(query))
      );
    }

    setFilteredEvents(result);
  }, [events, roleFilter, statusFilter, searchQuery]);

  // Stats
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (e) => {
      // is_active bisa null (default), kita anggap aktif kecuali explicitly false
      const isActive = e.event.is_active !== false;
      return isActive && (!e.event.event_date_end || new Date(e.event.event_date_end) >= new Date());
    }
  ).length;
  const organizerEvents = events.filter((e) => e.role === "ORGANIZER").length;

  if (loading) {
    return <EventsListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Manajemen Event
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola semua event yang Anda ikuti
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {totalEvents} Total Event
            </Badge>
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100"
            >
              {activeEvents} Event Aktif
            </Badge>
            <Badge
              variant="secondary"
              className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100"
            >
              {organizerEvents} Sebagai Organizer
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari event berdasarkan nama, penyelenggara, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_FILTERS.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={roleFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRoleFilter(filter.value)}
                      className={cn(
                        "text-xs h-8",
                        roleFilter === filter.value && "bg-primary text-white"
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="flex gap-1.5">
                  {STATUS_FILTERS.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={statusFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        "text-xs h-8",
                        statusFilter === filter.value && "bg-primary text-white"
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-4">
            {filteredEvents.map((managedEvent) => (
              <EventCard key={managedEvent.event.id} managedEvent={managedEvent} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <EmptyState
            hasFilters={searchQuery !== "" || roleFilter !== "ALL" || statusFilter !== "ACTIVE"}
            totalEvents={events.length}
            activeFilter={statusFilter}
            roleFilter={roleFilter}
            onClearFilters={() => {
              setSearchQuery("");
              setRoleFilter("ALL");
              setStatusFilter("ACTIVE");
            }}
            onShowClosed={() => setStatusFilter("CLOSED")}
          />
        )}
      </div>
    </div>
  );
}
