"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { verifyTransaction, getPaymentProof } from "@/services/event-management/transactions-service";
import type { Transaction } from "@/lib/validation/schemas/transaction.schema";

interface VerifyPaymentDialogProps {
  transaction: Transaction;
  onClose: () => void;
  onVerified: () => void;
}

export function VerifyPaymentDialog({ 
  transaction, 
  onClose, 
  onVerified 
}: VerifyPaymentDialogProps) {
  const [adminNote, setAdminNote] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isLoadingProof, setIsLoadingProof] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Load payment proof on mount
  useEffect(() => {
    const eventId = transaction.meta_data?.event_id;
    if (eventId) {
      setIsLoadingProof(true);
      getPaymentProof(eventId, transaction.id)
        .then((proof) => setProofUrl(proof.proof_url))
        .catch(() => setImageError(true))
        .finally(() => setIsLoadingProof(false));
    }
  }, [transaction]);

  const verifyMutation = useMutation({
    mutationFn: (isApproved: boolean) => {
      const eventId = transaction.meta_data?.event_id;
      if (!eventId) throw new Error("Event ID not found");
      return verifyTransaction(eventId, transaction.id, {
        is_approved: isApproved,
        admin_note: isApproved ? undefined : adminNote,
      });
    },
    onSuccess: () => {
      onVerified();
    },
    onError: (error: Error) => {
      alert(`Gagal memverifikasi: ${error.message}`);
    },
  });

  const handleReject = () => {
    if (adminNote.length < 10) {
      alert("Catatan penolakan wajib diisi minimal 10 karakter");
      return;
    }
    verifyMutation.mutate(false);
  };

  const eventId = transaction.meta_data?.event_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Verifikasi Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Details Card */}
          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Detail Transaksi</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-slate-500 block mb-1">Nama Tim</label>
                <p className="font-medium text-slate-900">{transaction.team_name || "-"}</p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Jumlah Pembayaran</label>
                <p className="font-medium text-slate-900 text-lg">
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Email Pengirim</label>
                <p className="font-medium text-slate-900">{transaction.user_email || "-"}</p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Kategori</label>
                <p className="font-medium text-slate-900">{transaction.category_name || "-"}</p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Tanggal Upload</label>
                <p className="font-medium text-slate-900">
                  {new Date(transaction.created_at).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <label className="text-slate-500 block mb-1">ID Transaksi</label>
                <p className="font-mono text-slate-600 text-xs">{transaction.id}</p>
              </div>
            </div>
          </div>

          {/* Payment Proof Viewer */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Bukti Pembayaran</h3>
            {isLoadingProof ? (
              <div className="h-80 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
                <span className="text-slate-400">Memuat bukti pembayaran...</span>
              </div>
            ) : imageError || !proofUrl ? (
              <div className="h-80 bg-red-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Gagal memuat bukti pembayaran</p>
                  <p className="text-red-500 text-sm mt-1">Silakan refresh halaman atau coba lagi</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proofUrl}
                  alt="Bukti pembayaran"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={() => setImageError(true)}
                />
                <div className="p-3 bg-white border-t flex justify-between items-center text-sm">
                  <span className="text-slate-500">Klik gambar untuk zoom</span>
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Buka di Tab Baru ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Rejection Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Catatan Verifikasi
              <span className="text-red-500">*</span>
              <span className="text-slate-500 font-normal"> (wajib untuk penolakan, min 10 karakter)</span>
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Contoh: Nominal transfer tidak sesuai, bukti blur tidak terbaca, dll..."
              className="w-full border rounded-lg px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={adminNote.length < 10 ? "text-red-500" : "text-green-600"}>
                {adminNote.length} / 10 karakter
              </span>
              <span className="text-slate-400">{adminNote.length > 0 && adminNote.length < 10 ? "Terlalu pendek" : ""}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={verifyMutation.isPending}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleReject}
              disabled={adminNote.length < 10 || verifyMutation.isPending}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {verifyMutation.isPending && verifyMutation.variables === false
                ? "Memproses..."
                : "✕ Tolak Pembayaran"}
            </button>
            <button
              onClick={() => verifyMutation.mutate(true)}
              disabled={verifyMutation.isPending}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {verifyMutation.isPending && verifyMutation.variables === true
                ? "Memproses..."
                : "✓ Verifikasi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
