"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { PaymentUploadSection } from "@/components/registration/payment-upload-section";
import { useToast, ToastList } from "@/components/dashboard/ui-components/feedback-toast";
import { getMyTeams } from "@/services/registration-service";
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
  };
  category?: {
    id: string;
    name: string;
    registration_fee: number;
  };
}

export default function UploadPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { setMobileDrawerOpen } = useDashboard();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const teamId = searchParams.get("team_id");

  useEffect(() => {
    if (!teamId) {
      addToast("error", "ID tim tidak ditemukan");
      router.push("/dashboard");
      return;
    }

    loadTeamDetail();
  }, [teamId]);

  const loadTeamDetail = async () => {
    try {
      setIsLoading(true);
      const teams = await getMyTeams();
      const foundTeam = teams.find((t) => t.id === teamId);

      if (foundTeam) {
        // Only allow upload if status is PENDING_PAYMENT
        if (foundTeam.status !== "PENDING_PAYMENT") {
          addToast("success", "Tim ini tidak memerlukan upload bukti pembayaran");
          router.push(`/dashboard/teams/${foundTeam.id}`);
          return;
        }
        setTeam(foundTeam);
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
    // Redirect to team detail page after successful upload
    if (team) {
      router.push(`/dashboard/teams/${team.id}`);
    }
  };

  const handleCancel = () => {
    if (team) {
      router.push(`/dashboard/teams/${team.id}`);
    } else {
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#681212] mx-auto mb-3" />
          <p className="text-slate-600">Memuat data tim...</p>
        </div>
        <ToastList toasts={toasts} remove={removeToast} />
      </div>
    );
  }

  if (!team || !team.category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">Data tim tidak lengkap</p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader
        title="Upload Bukti Pembayaran"
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => setMobileDrawerOpen(true)} />}
        onBackClick={handleCancel}
      />

      <div className="px-4 py-4">
        <PaymentUploadSection
          teamId={team.id}
          teamName={team.name}
          registrationFee={team.category.registration_fee}
          eventTitle={team.event?.title}
          onSuccess={handleUploadSuccess}
          onCancel={handleCancel}
        />
      </div>

      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}
