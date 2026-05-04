"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Users, 
  Trophy,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
  BookOpen,
  HelpCircle,
  Calendar,
  Vote,
  Settings
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileCard, MobileListItem } from "@/components/ui/mobile-optimized/mobile-card";
import { StickyCTA, StickyCTAContainer } from "@/components/ui/mobile-optimized/sticky-cta";
import { cn } from "@/lib/utils";
import { getMyTeams } from "@/services/registration-service";
import { useToast, ToastList } from "@/components/dashboard/ui-components/feedback-toast";
import { useDashboard } from "@/context/dashboard-context";
import { ROLE_DISPLAY_NAMES } from "@/config/sidebar-menu-config";

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

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { managedEvents, hasAnyEventRole } = useDashboard();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await getMyTeams();
      setTeams(data);
    } catch (error) {
      console.error("Failed to load teams:", error);
      addToast("error", "Gagal memuat data tim. Silakan refresh halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Team["status"]) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          label: "Menunggu Pembayaran",
          variant: "warning" as const,
          icon: Clock,
          description: "Silakan upload bukti pembayaran",
        };
      case "PENDING_VERIFICATION":
        return {
          label: "Menunggu Verifikasi",
          variant: "info" as const,
          icon: FileText,
          description: "Bukti pembayaran sedang diverifikasi",
        };
      case "REGISTERED":
        return {
          label: "Terverifikasi",
          variant: "success" as const,
          icon: CheckCircle2,
          description: "Pendaftaran berhasil",
        };
      case "CANCELLED":
        return {
          label: "Dibatalkan",
          variant: "error" as const,
          icon: AlertCircle,
          description: "Pendaftaran dibatalkan",
        };
      case "DISQUALIFIED":
        return {
          label: "Diskualifikasi",
          variant: "error" as const,
          icon: AlertCircle,
          description: "Tim didiskualifikasi",
        };
      default:
        return {
          label: status,
          variant: "default" as const,
          icon: AlertCircle,
          description: "",
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const formatEventDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="Dashboard"
        showBack={false}
        rightActions={
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <Trophy className="w-5 h-5 text-slate-600" />
          </button>
        }
      />

      <StickyCTAContainer>
        {/* Welcome Section */}
        <div className="px-4 py-6 bg-gradient-to-br from-primary to-primary/80">
          <h1 className="text-xl font-bold text-primary-foreground mb-1">
            Dashboard Peserta
          </h1>
          <p className="text-sm text-primary-foreground/80">
            Kelola pendaftaran dan tim Anda
          </p>
        </div>

        {/* Stats Overview */}
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-3 gap-3">
            <MobileCard className="text-center py-4">
              <div className="text-2xl font-bold text-primary">
                {teams.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Tim</div>
            </MobileCard>
            <MobileCard className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">
                {teams.filter(t => t.status === "REGISTERED").length}
              </div>
              <div className="text-xs text-muted-foreground">Terverifikasi</div>
            </MobileCard>
            <MobileCard className="text-center py-4">
              <div className="text-2xl font-bold text-amber-600">
                {teams.filter(t => t.status === "PENDING_PAYMENT" || t.status === "PENDING_VERIFICATION").length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </MobileCard>
          </div>
        </div>

        {/* Event Management Section - hanya jika ada event roles */}
        {hasAnyEventRole && (
          <div className="px-4 py-4">
            <MobileCard
              onClick={() => router.push("/dashboard/events")}
              showArrow
              className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    Kelola Event
                  </h3>
                  <p className="text-sm text-slate-500">
                    {managedEvents.length} event sebagai {managedEvents.length > 0 ? ROLE_DISPLAY_NAMES[managedEvents[0].role] : "organizer"}
                  </p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* My Teams Section */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Tim Saya</h2>
            {teams.length > 0 && (
              <span className="text-sm text-slate-500">{teams.length} tim</span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <MobileCard key={i} className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </MobileCard>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <MobileCard className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">
                Belum Ada Tim
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Daftarkan tim Anda di event yang tersedia
              </p>
              <button
                onClick={() => router.push("/")}
                className="text-primary font-medium text-sm hover:underline"
              >
                Jelajahi Event
              </button>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => {
                const status = getStatusConfig(team.status);
                const StatusIcon = status.icon;

                return (
                  <MobileCard
                    key={team.id}
                    onClick={() => {
                      if (team.status === "PENDING_PAYMENT") {
                        router.push(`/dashboard/teams/${team.id}?action=upload`);
                      } else {
                        router.push(`/dashboard/teams/${team.id}`);
                      }
                    }}
                    showArrow
                  >
                    <div className="space-y-2">
                      {/* Team Name & Event */}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {team.name}
                        </h3>
                        {team.event && (
                          <p className="text-sm text-slate-500">
                            {team.event.title}
                          </p>
                        )}
                      </div>

                      {/* Category & Date */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {team.category && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            {team.category.name}
                          </span>
                        )}
                        {team.event && (
                          <span>
                            {formatDate(team.event.event_date_start)} - {formatDate(team.event.event_date_end)}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 pt-1">
                        <StatusIcon className="w-4 h-4" />
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                          team.status === "REGISTERED" && "bg-green-100 text-green-700",
                          team.status === "PENDING_PAYMENT" && "bg-amber-100 text-amber-700",
                          team.status === "PENDING_VERIFICATION" && "bg-blue-100 text-blue-700",
                          (team.status === "CANCELLED" || team.status === "DISQUALIFIED") && "bg-red-100 text-red-700"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      {/* Action hint for pending payment */}
                      {team.status === "PENDING_PAYMENT" && (
                        <p className="text-xs text-amber-600 font-medium">
                          Tap untuk upload bukti pembayaran
                        </p>
                      )}
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <h2 className="font-semibold text-slate-900 mb-3">Menu Cepat</h2>
          <div className="space-y-2">
            <MobileListItem
              icon={<Search className="w-5 h-5 text-slate-500" />}
              title="Cari Event"
              subtitle="Temukan event yang tersedia"
              onClick={() => router.push("/")}
              rightContent={<ChevronRight className="w-5 h-5 text-slate-400" />}
            />
            <MobileListItem
              icon={<Vote className="w-5 h-5 text-slate-500" />}
              title="Voting"
              subtitle="Lihat voting yang tersedia"
              onClick={() => router.push("/voting")}
              rightContent={<ChevronRight className="w-5 h-5 text-slate-400" />}
            />
            <MobileListItem
              icon={<BookOpen className="w-5 h-5 text-slate-500" />}
              title="Panduan Pendaftaran"
              subtitle="Pelajari cara mendaftar"
              onClick={() => router.push("/guide")}
              rightContent={<ChevronRight className="w-5 h-5 text-slate-400" />}
            />
            <MobileListItem
              icon={<HelpCircle className="w-5 h-5 text-slate-500" />}
              title="Hubungi Support"
              subtitle="Bantuan dan pertanyaan"
              onClick={() => router.push("/support")}
              rightContent={<ChevronRight className="w-5 h-5 text-slate-400" />}
            />
          </div>
        </div>
      </StickyCTAContainer>

      {/* Sticky CTA */}
      <StickyCTA onClick={() => router.push("/")}>
        <Plus className="w-5 h-5 mr-2" />
        Daftar Event Baru
      </StickyCTA>

      {/* Toast Notifications */}
      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}