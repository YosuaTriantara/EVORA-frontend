"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Copy,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Users,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileHeader } from "@/components/layout/mobile-header";
import { StickyCTA, StickyCTAContainer } from "@/components/ui/mobile-optimized/sticky-cta";
import { StatusBadge } from "@/components/ui/mobile-optimized/status-badge";
import { Progress } from "@/components/ui/progress";
import { registerTeam, uploadPaymentProof } from "@/services/registration-service";
import { useToast, ToastList } from "@/components/dashboard/ui-components/feedback-toast";

// Types
interface Event {
  id: string;
  title: string;
  organizer: string;
  content_data?: {
    payment_config?: {
      methods?: string[];
      manual_instructions?: {
        bank_name: string;
        account_number: string;
        account_holder: string;
      };
    };
  };
}

interface RegistrationWizardProps {
  event: Event;
  category: {
    id: string;
    name: string;
    fee: number;
    max_quota: number;
    available_slots: number;
    is_full: boolean;
  };
  onComplete?: (teamId: string) => void;
  onCancel?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

interface FormData {
  team_name: string;
  institution: string;
  agreeToTerms: boolean;
}

export function RegistrationWizard({
  event,
  category,
  onComplete,
  onCancel,
}: RegistrationWizardProps) {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    team_name: "",
    institution: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`registration_${event.id}_${category.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        setCurrentStep(parsed.currentStep || 1);
        if (parsed.teamId) {
          setTeamId(parsed.teamId);
        }
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, [event.id, category.id]);

  // Auto-save progress (hanya untuk step 1, setelah submit tidak auto-save)
  useEffect(() => {
    if (currentStep >= 3) return; // Stop auto-save setelah registrasi berhasil
    
    const timeout = setTimeout(() => {
      localStorage.setItem(
        `registration_${event.id}_${category.id}`,
        JSON.stringify({ formData, currentStep, teamId })
      );
    }, 3000);
    return () => clearTimeout(timeout);
  }, [formData, currentStep, teamId, event.id, category.id]);

  const validateStep = useCallback((step: WizardStep): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.team_name.trim()) {
        newErrors.team_name = "Nama tim wajib diisi";
      } else if (formData.team_name.length < 3) {
        newErrors.team_name = "Nama tim minimal 3 karakter";
      }
      if (!formData.institution.trim()) {
        newErrors.institution = "Nama institusi wajib diisi";
      }
    }

    if (step === 2 && !formData.agreeToTerms) {
      newErrors.agreeToTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 2) {
      // Submit registration
      setIsLoading(true);
      try {
        const result = await registerTeam({
          event_id: event.id,
          category_id: category.id,
          team_name: formData.team_name,
          institution: formData.institution,
        });
        
        // Simpan team_id ke state dan localStorage
        const newTeamId = result.team_id;
        setTeamId(newTeamId);
        
        // Simpan ke localStorage untuk referensi nanti
        localStorage.setItem(
          `registration_${event.id}_${category.id}`,
          JSON.stringify({ 
            formData, 
            currentStep: 3,
            teamId: newTeamId,
            registeredAt: new Date().toISOString()
          })
        );
        
        addToast("success", result.message || "Pendaftaran berhasil! Slot telah diamankan.");
        setCurrentStep(3);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Gagal mendaftar. Silakan coba lagi.";
        addToast("error", errorMessage);
        setErrors({ team_name: errorMessage });
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      // Step 3: User confirms they have paid
      // Update localStorage to mark as paid confirmation
      const saved = localStorage.getItem(`registration_${event.id}_${category.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          localStorage.setItem(
            `registration_${event.id}_${category.id}`,
            JSON.stringify({ ...parsed, paymentConfirmed: true })
          );
        } catch {
          // Ignore parse error
        }
      }
      setCurrentStep(4);
    } else if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    } else {
      onCancel?.();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = ((currentStep - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader
        title={`Langkah ${currentStep}/4`}
        showBack={true}
        onBackClick={handleBack}
      />

      {/* Progress Bar */}
      <div className="px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {currentStep === 1 && "Form Pendaftaran"}
            {currentStep === 2 && "Konfirmasi"}
            {currentStep === 3 && "Instruksi Pembayaran"}
            {currentStep === 4 && "Pendaftaran Berhasil"}
          </span>
          <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <StickyCTAContainer className="px-4 py-6">
        {/* Step 1: Form */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-1">{category.name}</h2>
              <p className="text-sm text-slate-500">{event.title}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-bold text-[#681212]">
                  Rp {category.fee.toLocaleString("id-ID")}
                </span>
                <StatusBadge 
                  status={category.is_full ? "FULL" : "OPEN"} 
                  size="sm" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Tim <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.team_name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, team_name: e.target.value }));
                    if (errors.team_name) setErrors(prev => ({ ...prev, team_name: undefined }));
                  }}
                  placeholder="Contoh: SMAN 5 Jakarta"
                  className={cn(
                    "h-12 text-base",
                    errors.team_name && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.team_name && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.team_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Institusi <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.institution}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, institution: e.target.value }));
                    if (errors.institution) setErrors(prev => ({ ...prev, institution: undefined }));
                  }}
                  placeholder="Contoh: SMA Negeri 5 Jakarta"
                  className={cn(
                    "h-12 text-base",
                    errors.institution && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.institution && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.institution}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Detail Pendaftaran</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori</span>
                  <span className="font-medium text-slate-900">{category.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Tim</span>
                  <span className="font-medium text-slate-900">{formData.team_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institusi</span>
                  <span className="font-medium text-slate-900">{formData.institution}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Biaya</span>
                    <span className="text-lg font-bold text-[#681212]">
                      Rp {category.fee.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <label className={cn(
              "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors",
              formData.agreeToTerms 
                ? "border-[#681212] bg-red-50/50" 
                : "border-slate-200 hover:border-slate-300"
            )}>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }));
                  if (errors.agreeToTerms) setErrors(prev => ({ ...prev, agreeToTerms: undefined }));
                }}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#681212] focus:ring-[#681212]"
              />
              <div className="text-sm">
                <span className="text-slate-700">Saya menyetujui </span>
                <span className="text-[#681212] font-medium">syarat dan ketentuan</span>
                <span className="text-slate-700"> yang berlaku untuk kompetisi ini</span>
              </div>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.agreeToTerms}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Payment Instructions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Menunggu Pembayaran</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Silakan lakukan pembayaran dalam 24 jam untuk mengamankan slot.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Total Pembayaran</h3>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-[#681212]">
                  Rp {category.fee.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {event.content_data?.payment_config?.manual_instructions && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Transfer Bank</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {event.content_data.payment_config.manual_instructions.bank_name}
                      </p>
                      <p className="text-lg font-mono text-slate-700 mt-1">
                        {event.content_data.payment_config.manual_instructions.account_number}
                      </p>
                      <p className="text-sm text-slate-500">
                        a.n. {event.content_data.payment_config.manual_instructions.account_holder}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(event.content_data!.payment_config!.manual_instructions!.account_number)}
                      className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-dashed border-2"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Bukti Bayar
                  </Button>
                </div>
              </div>
            )}

            <Button 
              variant="ghost" 
              className="w-full text-slate-500"
              onClick={() => router.push("/dashboard")}
            >
              Sudah Bayar? Cek Status di Dashboard
            </Button>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-slate-600 mb-8 max-w-xs mx-auto">
              Tim <strong>{formData.team_name}</strong> telah berhasil terdaftar di kategori {category.name}
            </p>

            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-3">Langkah Selanjutnya:</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#681212] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Lakukan pembayaran sesuai instruksi
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#681212] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Upload bukti pembayaran di dashboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#681212] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  Tunggu verifikasi dari panitia
                </li>
              </ol>
            </div>

            <Button 
              onClick={() => {
                localStorage.removeItem(`registration_${event.id}_${category.id}`);
                onComplete?.(teamId ?? '');
              }}
              className="w-full h-12 bg-[#681212] hover:bg-[#8a1a1a] text-white"
            >
              Ke Dashboard
            </Button>
          </div>
        )}
      </StickyCTAContainer>

      {/* Sticky CTA for steps 1-3 */}
      {currentStep < 4 && (
        <StickyCTA
          onClick={handleNext}
          loading={isLoading}
          disabled={currentStep === 2 && !formData.agreeToTerms}
        >
          {currentStep === 1 && "Lanjutkan"}
          {currentStep === 2 && "Konfirmasi Pendaftaran"}
          {currentStep === 3 && "Saya Sudah Bayar"}
        </StickyCTA>
      )}

      {/* Toast Notifications */}
      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}
