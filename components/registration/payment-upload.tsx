"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileImage, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadPaymentProof } from "@/services/registration-service";
import { useToast } from "@/components/dashboard/ui-components/feedback-toast";
import { validateUploadFile } from "@/lib/validation/file-validation";

interface PaymentUploadProps {
  teamId: string;
  teamName: string;
  registrationFee: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Validation options for payment proof uploads
const VALIDATION_OPTIONS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
};

export function PaymentUpload({
  teamId,
  teamName,
  registrationFee,
  onSuccess,
  onCancel,
}: PaymentUploadProps) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const result = validateUploadFile(file, VALIDATION_OPTIONS);
    if (!result.valid) {
      addToast("error", result.error ?? "Invalid file");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Payment Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileImage className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm">
              {teamName}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Biaya pendaftaran: <span className="font-semibold text-slate-900">{formatCurrency(registrationFee)}</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Silakan transfer ke rekening yang tertera dan upload bukti pembayaran
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            "min-h-[200px] flex flex-col items-center justify-center",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleInputChange}
            data-testid="file-upload-input"
            className="hidden"
          />
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
            <Upload className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 mb-1">
            Tap untuk pilih file
          </p>
          <p className="text-sm text-slate-500">
            atau drag & drop file di sini
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Accepted formats: JPG, PNG, PDF. Maximum size: 5 MB.
          </p>
        </div>
      ) : (
        /* Preview Area */
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="relative">
            {/* Image Preview */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview bukti pembayaran"
                className="w-full h-48 object-cover"
              />
            )}
            
            {/* Remove Button */}
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            {/* File Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-white/80 text-xs">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 flex gap-2">
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Ganti File
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-[2] py-2.5 px-4 bg-[#681212] hover:bg-[#8a1a1a] active:bg-[#500f0f] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
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

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Tips upload yang baik:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Pastikan bukti transfer terbaca jelas</li>
              <li>Sertakan nomor transaksi/referensi</li>
              <li>Upload dalam format landscape untuk hasil terbaik</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
