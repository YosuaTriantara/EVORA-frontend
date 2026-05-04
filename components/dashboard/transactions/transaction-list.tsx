"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEventTransactions } from "@/services/event-management/transactions-service";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { VerifyPaymentDialog } from "./verify-payment-dialog";
import { PaymentProofViewer } from "./payment-proof-viewer";
import { FileImage } from "lucide-react";
import type { Transaction, TransactionStatus } from "@/lib/validation/schemas/transaction.schema";

interface TransactionListProps {
  eventId: string;
}

export function TransactionList({ eventId }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewingProofTransaction, setViewingProofTransaction] = useState<Transaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "">("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", eventId, filterStatus, page],
    queryFn: () => getEventTransactions(eventId, { 
      status: filterStatus || undefined,
      skip: page * limit,
      limit,
    }),
  });

  if (isLoading) return <TransactionListSkeleton />;
  if (error) return <TransactionListError error={error} onRetry={refetch} />;

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as TransactionStatus | "");
            setPage(0);
          }}
          className="border rounded-lg px-3 py-2 bg-white"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">⏳ Menunggu Verifikasi</option>
          <option value="PAID">✓ Terverifikasi</option>
          <option value="FAILED">✕ Ditolak</option>
          <option value="REFUNDED">↩ Dikembalikan</option>
        </select>

        <div className="text-sm text-slate-500">
          Total: {data?.total || 0} transaksi
        </div>
      </div>

      {/* Transaction Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tim</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Jumlah</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.data.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{transaction.team_name}</div>
                  <div className="text-sm text-slate-500">{transaction.user_email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{transaction.category_name}</td>
                <td className="px-4 py-3 font-medium">
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <TransactionStatusBadge status={transaction.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {transaction.payment_proof_url && (
                      <button
                        onClick={() => setViewingProofTransaction(transaction)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 text-sm font-medium"
                        title="Lihat Bukti Pembayaran"
                      >
                        <FileImage className="w-4 h-4" />
                        <span className="hidden sm:inline">Lihat Bukti</span>
                      </button>
                    )}
                    {transaction.status === "PENDING" && (
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Verifikasi →
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {data?.data.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Tidak ada transaksi {filterStatus && `dengan status "${filterStatus}"`}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-slate-500">
            Halaman {page + 1} dari {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Verify Dialog */}
      {selectedTransaction && (
        <VerifyPaymentDialog
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onVerified={() => {
            setSelectedTransaction(null);
            refetch();
          }}
        />
      )}

      {/* Payment Proof Viewer */}
      {viewingProofTransaction && (
        <PaymentProofViewer
          transaction={viewingProofTransaction}
          eventId={eventId}
          onClose={() => setViewingProofTransaction(null)}
        />
      )}
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-48" />
      <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
    </div>
  );
}

function TransactionListError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="p-8 text-center">
      <p className="text-red-600 mb-4">Gagal memuat transaksi: {error.message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
