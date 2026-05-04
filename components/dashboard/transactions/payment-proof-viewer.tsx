"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentProof } from "@/services/event-management/transactions-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileImage, Download, AlertCircle, X } from "lucide-react";
import type { Transaction } from "@/lib/validation/schemas/transaction.schema";

interface PaymentProofViewerProps {
  transaction: Transaction;
  eventId: string;
  onClose: () => void;
}

export function PaymentProofViewer({
  transaction,
  eventId,
  onClose,
}: PaymentProofViewerProps) {
  const [imageError, setImageError] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-proof", eventId, transaction.id],
    queryFn: () => getPaymentProof(eventId, transaction.id),
    enabled: !!transaction.payment_proof_url,
    staleTime: 5 * 60 * 1000, // 5 minutes - URL is signed/temporary
  });

  const handleDownload = () => {
    if (data?.proof_url) {
      const link = document.createElement("a");
      link.href = data.proof_url;
      link.download = data.filename || `payment-proof-${transaction.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Bukti Pembayaran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Tim:</span>
                <p className="font-medium text-slate-900">{transaction.team_name}</p>
              </div>
              <div>
                <span className="text-slate-500">Jumlah:</span>
                <p className="font-medium text-slate-900">
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Kategori:</span>
                <p className="font-medium text-slate-900">{transaction.category_name}</p>
              </div>
              <div>
                <span className="text-slate-500">Tanggal Upload:</span>
                <p className="font-medium text-slate-900">
                  {data?.uploaded_at
                    ? new Date(data.uploaded_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Proof Content */}
          <div className="border rounded-lg overflow-hidden bg-slate-50 min-h-[300px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Memuat bukti pembayaran...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 text-red-600 p-6 text-center">
                <AlertCircle className="w-10 h-10" />
                <p>Gagal memuat bukti pembayaran</p>
                <p className="text-sm text-red-500">{(error as Error).message}</p>
              </div>
            ) : !transaction.payment_proof_url ? (
              <div className="flex flex-col items-center gap-3 text-slate-500 p-6 text-center">
                <X className="w-10 h-10" />
                <p>Tidak ada bukti pembayaran untuk transaksi ini</p>
              </div>
            ) : imageError ? (
              <div className="flex flex-col items-center gap-3 text-slate-500 p-6 text-center">
                <FileImage className="w-10 h-10" />
                <p>Gagal memuat gambar</p>
                <Button variant="outline" onClick={() => setImageError(false)}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="w-full h-full">
                <img
                  src={data?.proof_url}
                  alt="Bukti Pembayaran"
                  className="w-full h-auto max-h-[500px] object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>

          {/* File Info & Actions */}
          {data && !isLoading && !error && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                <span className="font-medium">{data.filename}</span>
                <span className="mx-2">•</span>
                <span>{formatFileSize(data.file_size)}</span>
                <span className="mx-2">•</span>
                <span className="text-amber-600">
                  Expires: {new Date(data.expires_at).toLocaleString("id-ID")}
                </span>
              </div>
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="secondary">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
