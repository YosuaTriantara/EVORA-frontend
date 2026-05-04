"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  CreditCard,
  Copy,
  Check,
  Smartphone,
  Camera,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadPaymentProof } from "@/services/registration-service";
import { useToast } from "@/components/dashboard/ui-components/feedback-toast";
import { validateUploadFile } from "@/lib/validation/file-validation";

// Bank account information from event payment config
export interface BankAccountInfo {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

interface PaymentUploadSectionProps {
  teamId: string;
  teamName: string;
  registrationFee: number;
  eventTitle?: string;
  bankAccounts?: BankAccountInfo[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

// File validation options using centralized validation
const FILE_VALIDATION_OPTIONS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
};

export function PaymentUploadSection({
  teamId,
  teamName,
  registrationFee,
  eventTitle,
  bankAccounts,
  onSuccess,
  onCancel,
}: PaymentUploadSectionProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateUploadFile(file, FILE_VALIDATION_OPTIONS);
    if (!validation.valid) {
      addToast("error", validation.error || "File tidak valid");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [addToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast("error", "Pilih file bukti pembayaran terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadPaymentProof(teamId, selectedFile);
      addToast("success", "Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.");
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengupload bukti pembayaran.";
      addToast("error", message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(bank);
    addToast("success", `Nomor rekening ${bank} berhasil disalin!`);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#681212] to-[#8a1a1a] rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold mb-1">Upload Bukti Pembayaran</h2>
            <p className="text-sm text-white/80">
              {eventTitle || "Kompetisi"}
            </p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Total Pembayaran</span>
                <span className="text-xl font-bold">{formatCurrency(registrationFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Information */}
      {bankAccounts && bankAccounts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#681212]" />
            Rekening Pembayaran
          </h3>
          <p className="text-sm text-slate-600">
            Transfer ke rekening berikut sesuai nominal yang tertera:
          </p>
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.account_number}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    🏦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{account.bank_name}</p>
                    <p className="text-sm text-slate-500">{account.account_holder}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-mono text-slate-900">
                        {account.account_number}
                      </code>
                      <button
                        onClick={() => copyToClipboard(account.account_number, account.bank_name)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          copiedAccount === account.bank_name
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                      >
                        {copiedAccount === account.bank_name ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800 font-medium">Informasi Rekening</p>
          <p className="text-sm text-blue-700 mt-1">
            Silakan lihat halaman event untuk informasi rekening pembayaran yang benar,
            atau hubungi panitia.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Instruksi Pembayaran
        </h4>
        <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
          <li>Transfer sesuai nominal <strong>{formatCurrency(registrationFee)}</strong></li>
          <li>Screenshot atau foto bukti transfer</li>
          <li>Pastikan nomor transaksi terlihat jelas</li>
          <li>Upload bukti pembayaran di bawah</li>
        </ol>
      </div>

      {/* Upload Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-[#681212]" />
          Upload Bukti Transfer
        </h3>

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
              "min-h-[220px] flex flex-col items-center justify-center",
              isDragging
                ? "border-[#681212] bg-red-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <Camera className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700 mb-1">
              Tap untuk pilih dari galeri
            </p>
            <p className="text-sm text-slate-500 mb-1">
              atau drag & drop file di sini
            </p>
            <p className="text-xs text-slate-400">
              JPG, PNG (Maks. 5MB)
            </p>

            {/* Mobile-friendly hint */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Ambil foto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileImage className="w-4 h-4" />
                <span>Pilih file</span>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Area */
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="relative">
              {/* Image Preview */}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview bukti pembayaran"
                  className="w-full h-56 object-cover"
                />
              )}

              {/* Remove Button */}
              <button
                onClick={clearSelection}
                disabled={isUploading}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* File Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-white/80 text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex gap-3">
              <button
                onClick={clearSelection}
                disabled={isUploading}
                className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Ganti File
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] py-3 px-4 bg-[#681212] hover:bg-[#8a1a1a] active:bg-[#500f0f] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Upload Bukti
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-2">Tips upload yang baik:</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Pastikan bukti transfer terbaca jelas</li>
              <li>Sertakan nomor transaksi/referensi</li>
              <li>Pastikan pencahayaan cukup terang</li>
              <li>Upload dalam format landscape untuk hasil terbaik</li>
              <li>Pastikan tidak ada bagian yang terpotong</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="w-full py-3 text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors disabled:opacity-50"
        >
          Batal
        </button>
      )}
    </div>
  );
}
