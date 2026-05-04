"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Users,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Upload,
  CreditCard,
  Calendar,
  Trophy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { MobileCard } from "@/components/ui/mobile-optimized/mobile-card";
import { StickyCTA, StickyCTAContainer } from "@/components/ui/mobile-optimized/sticky-cta";
import { PaymentUploadSection } from "@/components/registration/payment-upload-section";
import { useToast, ToastList } from "@/components/dashboard/ui-components/feedback-toast";
import { getMyTeams } from "@/services/registration-service";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-context";

interface TeamDetail {
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
    location?: string;
    content_data?: {
      payment_config?: {
        manual_instructions?: Array<{
          bank_name: string;
          account_number: string;
          account_holder: string;
        }>;
      };
    };
  };
  category?: {
    id: string;
    name: string;
    registration_fee: number;
  };
}

const STATUS_CONFIG = {
  PENDING_PAYMENT: {
    label: "Menunggu Pembayaran",
    color: "amber",
    icon: Clock,
    description: "Silakan upload bukti pembayaran untuk melanjutkan",
    action: "upload",
  },
  PENDING_VERIFICATION: {
    label: "Menunggu Verifikasi",
    color: "blue",
    icon: FileText,
    description: "Bukti pembayaran sedang diverifikasi oleh admin",
    action: null,
  },
  REGISTERED: {
    label: "Terverifikasi",
    color: "green",
    icon: CheckCircle2,
    description: "Pendaftaran berhasil! Tim Anda sudah terdaftar",
    action: null,
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "red",
    icon: AlertCircle,
    description: "Pendaftaran telah dibatalkan",
    action: null,
  },
  DISQUALIFIED: {
    label: "Diskualifikasi",
    color: "red",
    icon: AlertCircle,
    description: "Tim didiskualifikasi dari kompetisi",
    action: null,
  },
  REJECTED: {
    label: "Ditolak",
    color: "red",
    icon: AlertCircle,
    description: "Bukti pembayaran ditolak. Silakan upload ulang.",
    action: "upload",
  },
};

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { setMobileDrawerOpen } = useDashboard();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "upload">("overview");

  const teamId = params.team_id as string;
  const action = searchParams.get("action");
  const eventId = searchParams.get("event_id");

  useEffect(() => {
    loadTeamDetail();
  }, [teamId]);

  const loadTeamDetail = async () => {
    try {
      setIsLoading(true);
      const teams = await getMyTeams();
      const foundTeam = teams.find((t) => t.id === teamId);
      
      if (foundTeam) {
        setTeam(foundTeam);
        // Auto-switch to upload tab if pending payment or action=upload
        if (foundTeam.status === "PENDING_PAYMENT" || action === "upload") {
          setActiveTab("upload");
        }
      } else {
        addToast("error", "Tim tidak ditemukan");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to load team:", error);
      addToast("error", "Gagal memuat detail tim");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    addToast("success", "Bukti pembayaran berhasil diupload!");
    // Refresh team data to update status
    loadTeamDetail();
    // Switch back to overview tab
    setActiveTab("overview");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#681212] mx-auto mb-3" />
          <p className="text-slate-600">Memuat detail tim...</p>
        </div>
        <ToastList toasts={toasts} remove={removeToast} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">Tim tidak ditemukan</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[#681212] font-medium hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>
        <ToastList toasts={toasts} remove={removeToast} />
      </div>
    );
  }

  const status = STATUS_CONFIG[team.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader
        title="Detail Tim"
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => setMobileDrawerOpen(true)} />}
        onBackClick={() => {
          if (eventId) {
            router.push(`/dashboard/teams?event_id=${eventId}`);
          } else if (team?.event_id) {
            router.push(`/dashboard/teams?event_id=${team.event_id}`);
          } else {
            router.push("/dashboard/teams");
          }
        }}
      />

      <StickyCTAContainer>
        {/* Team Header */}
        <div className="px-4 py-6 bg-gradient-to-br from-[#681212] to-[#8a1a1a]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white mb-1 truncate">
                {team.name}
              </h1>
              {team.event && (
                <p className="text-sm text-white/80">
                  {team.event.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="px-4 -mt-3">
          <MobileCard className={cn(
            "border-l-4",
            status.color === "amber" && "border-l-amber-500 bg-amber-50",
            status.color === "blue" && "border-l-blue-500 bg-blue-50",
            status.color === "green" && "border-l-green-500 bg-green-50",
            status.color === "red" && "border-l-red-500 bg-red-50"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                status.color === "amber" && "bg-amber-100",
                status.color === "blue" && "bg-blue-100",
                status.color === "green" && "bg-green-100",
                status.color === "red" && "bg-red-100"
              )}>
                <StatusIcon className={cn(
                  "w-5 h-5",
                  status.color === "amber" && "text-amber-600",
                  status.color === "blue" && "text-blue-600",
                  status.color === "green" && "text-green-600",
                  status.color === "red" && "text-red-600"
                )} />
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "font-semibold text-sm",
                  status.color === "amber" && "text-amber-900",
                  status.color === "blue" && "text-blue-900",
                  status.color === "green" && "text-green-900",
                  status.color === "red" && "text-red-900"
                )}>
                  {status.label}
                </h3>
                <p className={cn(
                  "text-xs mt-1",
                  status.color === "amber" && "text-amber-700",
                  status.color === "blue" && "text-blue-700",
                  status.color === "green" && "text-green-700",
                  status.color === "red" && "text-red-700"
                )}>
                  {status.description}
                </p>
              </div>
            </div>
          </MobileCard>
        </div>

        {/* Tab Navigation - show for statuses that can upload payment proof */}
        {(team.status === "PENDING_PAYMENT" || team.status === "REJECTED") && (
          <div className="px-4 mt-4">
            <div className="bg-white rounded-lg p-1 flex gap-1 shadow-sm">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "bg-[#681212] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                Ringkasan
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                  activeTab === "upload"
                    ? "bg-[#681212] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Upload className="w-4 h-4" />
                Upload Bukti
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-4">
          {activeTab === "overview" ? (
            <div className="space-y-4">
              {/* Event Info */}
              {team.event && (
                <MobileCard>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#681212]" />
                    Informasi Event
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Event</span>
                      <span className="font-medium text-slate-900 text-right max-w-[60%]">
                        {team.event.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Penyelenggara</span>
                      <span className="font-medium text-slate-900">
                        {team.event.organizer}
                      </span>
                    </div>
                    {team.event.location && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lokasi</span>
                        <span className="font-medium text-slate-900">
                          {team.event.location}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal</span>
                      <span className="font-medium text-slate-900">
                        {formatDate(team.event.event_date_start)}
                        {team.event.event_date_start !== team.event.event_date_end && (
                          <> - {formatDate(team.event.event_date_end)}</>
                        )}
                      </span>
                    </div>
                  </div>
                </MobileCard>
              )}

              {/* Category Info */}
              {team.category && (
                <MobileCard>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#681212]" />
                    Kategori & Biaya
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kategori</span>
                      <span className="font-medium text-slate-900">
                        {team.category.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Biaya Pendaftaran</span>
                      <span className="font-semibold text-[#681212]">
                        {formatCurrency(team.category.registration_fee)}
                      </span>
                    </div>
                    {team.lot_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nomor Lot</span>
                        <span className="font-medium text-slate-900">
                          {team.lot_number}
                        </span>
                      </div>
                    )}
                  </div>
                </MobileCard>
              )}

              {/* Timeline */}
              <MobileCard>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#681212]" />
                  Status Pendaftaran
                </h3>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />
                  
                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {/* Step 1: Registered */}
                    <div className="flex items-start gap-3 relative">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 z-10">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Pendaftaran Berhasil</p>
                        <p className="text-xs text-slate-500">Tim berhasil didaftarkan</p>
                      </div>
                    </div>

                    {/* Step 2: Payment */}
                    <div className="flex items-start gap-3 relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                        team.status === "PENDING_PAYMENT"
                          ? "bg-amber-100"
                          : ["PENDING_VERIFICATION", "REGISTERED"].includes(team.status)
                          ? "bg-green-100"
                          : "bg-slate-100"
                      )}>
                        {team.status === "PENDING_PAYMENT" ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : ["PENDING_VERIFICATION", "REGISTERED"].includes(team.status) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium text-sm",
                          team.status === "PENDING_PAYMENT" ? "text-amber-700" : "text-slate-900"
                        )}>
                          Pembayaran
                        </p>
                        <p className="text-xs text-slate-500">
                          {team.status === "PENDING_PAYMENT"
                            ? "Menunggu bukti pembayaran"
                            : team.status === "PENDING_VERIFICATION"
                            ? "Bukti diupload, menunggu verifikasi"
                            : team.status === "REGISTERED"
                            ? "Pembayaran terverifikasi"
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Verified */}
                    <div className="flex items-start gap-3 relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                        team.status === "REGISTERED"
                          ? "bg-green-100"
                          : "bg-slate-100"
                      )}>
                        {team.status === "REGISTERED" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Trophy className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium text-sm",
                          team.status === "REGISTERED" ? "text-green-700" : "text-slate-500"
                        )}>
                          Terverifikasi
                        </p>
                        <p className="text-xs text-slate-500">
                          Siap berkompetisi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MobileCard>

              {/* Refresh Button */}
              <button
                onClick={loadTeamDetail}
                disabled={isLoading}
                className="w-full py-3 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="text-sm font-medium">Refresh Status</span>
              </button>
            </div>
          ) : (
            /* Upload Tab */
            <PaymentUploadSection
              teamId={team.id}
              teamName={team.name}
              registrationFee={team.category?.registration_fee ?? 0}
              eventTitle={team.event?.title}
              bankAccounts={team.event?.content_data?.payment_config?.manual_instructions ?? []}
              onSuccess={handleUploadSuccess}
              onCancel={() => setActiveTab("overview")}
            />
          )}
        </div>
      </StickyCTAContainer>

      {/* Sticky CTA for Pending Payment or Rejected */}
      {(team.status === "PENDING_PAYMENT" || team.status === "REJECTED") && activeTab === "overview" && (
        <StickyCTA onClick={() => setActiveTab("upload")}>
          <Upload className="w-5 h-5 mr-2" />
          {team.status === "REJECTED" ? "Upload Ulang Bukti" : "Upload Bukti Pembayaran"}
        </StickyCTA>
      )}

      {/* Toast Notifications */}
      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}
