"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Trophy,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CreditCard,
  Clock,
  CheckCircle2,
  FileText,
  Hash,
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { MobileCard } from "@/components/ui/mobile-optimized/mobile-card";
import { StatusBadge } from "@/components/ui/mobile-optimized/status-badge";
import { useToast, ToastList } from "@/components/dashboard/ui-components/feedback-toast";
import { getMyTeams } from "@/services/registration-service";
import { getEvents } from "@/services/event-service";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Team {
  id: string;
  event_id: string;
  category_id: string;
  name: string;
  status: "PENDING_PAYMENT" | "PENDING_VERIFICATION" | "REGISTERED" | "CANCELLED" | "DISQUALIFIED" | "REJECTED";
  lot_number: number | null;
  event?: {
    id: string;
    title: string;
    slug: string;
    event_date_start: string;
    event_date_end: string;
    organizer: string;
  };
  category?: {
    id: string;
    name: string;
    registration_fee: number;
  };
}

interface Event {
  id: string;
  title: string;
  slug: string;
}

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    variant: "secondary" as const,
    icon: Clock,
  },
  PENDING_VERIFICATION: {
    label: "Menunggu Verifikasi",
    variant: "default" as const,
    icon: FileText,
  },
  REGISTERED: {
    label: "Terverifikasi",
    variant: "default" as const,
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "outline" as const,
    icon: AlertCircle,
  },
  DISQUALIFIED: {
    label: "Diskualifikasi",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
  REJECTED: {
    label: "Ditolak",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
};

export default function MyTeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { setMobileDrawerOpen } = useDashboard();

  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Get event_id from URL query param
  const urlEventId = searchParams.get("event_id");

  useEffect(() => {
    loadData();
  }, []);

  // Set initial filter from URL
  useEffect(() => {
    if (urlEventId) {
      setSelectedEventId(urlEventId);
    }
  }, [urlEventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teamsData, eventsData] = await Promise.all([
        getMyTeams(),
        getEvents(),
      ]);
      setTeams(teamsData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Failed to load teams:", error);
      addToast("error", "Gagal memuat data tim");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teams based on search and event filter
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesEvent =
        selectedEventId === "all" || team.event_id === selectedEventId;
      return matchesSearch && matchesEvent;
    });
  }, [teams, searchQuery, selectedEventId]);

  // Group teams by event for display
  const groupedTeams = useMemo(() => {
    const grouped: Record<string, { event: Event | null; teams: Team[] }> = {};

    filteredTeams.forEach((team) => {
      const eventId = team.event_id;
      if (!grouped[eventId]) {
        grouped[eventId] = {
          event: team.event || events.find((e) => e.id === eventId) || null,
          teams: [],
        };
      }
      grouped[eventId].teams.push(team);
    });

    return grouped;
  }, [filteredTeams, events]);

  const handleTeamClick = (teamId: string, eventId: string) => {
    router.push(`/dashboard/teams/${teamId}?event_id=${eventId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#681212] mx-auto mb-3" />
          <p className="text-slate-600">Memuat tim...</p>
        </div>
        <ToastList toasts={toasts} remove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader
        title="Tim Saya"
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => setMobileDrawerOpen(true)} />}
        onBackClick={() => router.push("/dashboard")}
      />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Link - Desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Tim Saya
            </h1>
            <p className="text-slate-500 mt-1">
              {teams.length} tim terdaftar • {filteredTeams.length} ditampilkan
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari nama tim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Event Filter */}
              <div className="relative md:w-72">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full h-10 pl-10 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="all">Semua Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Content */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tim</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Belum ada tim</p>
                <p className="text-sm text-slate-400">
                  {searchQuery || selectedEventId !== "all"
                    ? "Coba ubah filter pencarian"
                    : "Anda belum mendaftarkan tim di event manapun"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Tim</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>No. Undian</TableHead>
                        <TableHead className="text-right">Biaya</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeams.map((team) => {
                        const status = STATUS_CONFIG[team.status];
                        const event = team.event || events.find((e) => e.id === team.event_id);
                        return (
                          <TableRow
                            key={team.id}
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => handleTeamClick(team.id, team.event_id)}
                          >
                            <TableCell>
                              <p className="font-medium">{team.name}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#681212]" />
                                <span className="text-sm">{event?.title || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>{team.category?.name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>
                              {team.lot_number ? (
                                <span className="flex items-center gap-1">
                                  <Hash className="w-4 h-4 text-slate-400" />
                                  {team.lot_number}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {team.category?.registration_fee ? (
                                <span className="text-sm text-slate-600">
                                  {formatCurrency(team.category.registration_fee)}
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile: Card View */}
                <div className="md:hidden space-y-6">
                  {Object.entries(groupedTeams).map(([eventId, { event, teams }]) => (
                    <div key={eventId} className="space-y-3">
                      {/* Event Header */}
                      {event && (
                        <div className="flex items-center gap-2 px-1">
                          <Trophy className="w-4 h-4 text-[#681212]" />
                          <h2 className="font-semibold text-slate-900">{event.title}</h2>
                        </div>
                      )}

                      {/* Team Cards */}
                      <div className="grid gap-3">
                        {teams.map((team) => {
                          const status = STATUS_CONFIG[team.status];
                          const StatusIcon = status.icon;

                          return (
                            <MobileCard
                              key={team.id}
                              onClick={() => handleTeamClick(team.id, team.event_id)}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  {/* Team Name */}
                                  <h3 className="font-semibold text-slate-900 mb-1 truncate">
                                    {team.name}
                                  </h3>

                                  {/* Category */}
                                  {team.category && (
                                    <p className="text-sm text-slate-500 mb-2">
                                      {team.category.name}
                                    </p>
                                  )}

                                  {/* Status Badge */}
                                  <div className="flex items-center gap-2">
                                    <StatusBadge
                                      status={team.status}
                                      size="sm"
                                      showIcon={false}
                                    />

                                    {/* Lot Number */}
                                    {team.lot_number && (
                                      <span className="text-xs text-slate-500">
                                        No. {team.lot_number}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Arrow & Fee */}
                                <div className="flex flex-col items-end gap-2 ml-3">
                                  <ChevronRight className="w-5 h-5 text-slate-400" />
                                  {team.category?.registration_fee && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <CreditCard className="w-3 h-3" />
                                      {formatCurrency(team.category.registration_fee)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </MobileCard>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}
