"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, RefreshCw, Search, Filter, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { useToast } from "@/components/dashboard/ui-components/feedback-toast";
import { getAllTransactions, verifyTransaction, type Transaction } from "@/services/super-admin/transactions-service";
import { PaymentProofViewer } from "@/components/dashboard/transactions/payment-proof-viewer";
import { exportToCSV } from "@/lib/export/csv-export";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  PAID: { label: "Lunas", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  FAILED: { label: "Gagal", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  REFUNDED: { label: "Refund", className: "bg-slate-100 text-slate-800 hover:bg-slate-100" },
};

export default function SuperAdminTransactionsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [proofViewerOpen, setProofViewerOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllTransactions({
        limit: 100,
        status: statusFilter || undefined,
      });
      setTransactions(result.data);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, addToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleVerify = async (transactionId: string, isApproved: boolean) => {
    setVerifyingId(transactionId);
    try {
      await verifyTransaction(transactionId, { is_approved: isApproved });
      addToast("success", isApproved ? "Transaksi disetujui" : "Transaksi ditolak");
      loadTransactions();
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal verifikasi");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleViewProof = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setProofViewerOpen(true);
  };

  const handleExportCSV = () => {
    const data = filteredTransactions.map((t) => ({
      id: t.id,
      team: t.meta_data?.team_id || "-",
      institution: "-",
      amount: t.amount || 0,
      status: t.status || "-",
      created_at: t.created_at,
      verified_by: t.verified_by || "-",
    }));

    exportToCSV(
      data,
      [
        { key: "id", header: "ID" },
        { key: "team", header: "Tim" },
        { key: "institution", header: "Institusi" },
        { key: "amount", header: "Jumlah" },
        { key: "status", header: "Status" },
        { key: "created_at", header: "Tanggal" },
        { key: "verified_by", header: "Diverifikasi Oleh" },
      ],
      `transaksi-${new Date().toISOString().split("T")[0]}.csv`
    );

    addToast("success", "Data berhasil diekspor");
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.team?.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.team?.institution_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "PENDING").length,
    paid: transactions.filter((t) => t.status === "PAID").length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.status === "PAID" ? t.amount : 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Transaksi</h1>
          <p className="text-slate-500">Kelola semua transaksi platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={loadTransactions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Lunas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              Rp {stats.totalAmount.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari tim, institusi, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Lunas</option>
            <option value="FAILED">Gagal</option>
            <option value="REFUNDED">Refund</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <DataTableSkeleton rows={5} columns={6} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tim</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Institusi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada transaksi
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{transaction.team?.team_name || "-"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{transaction.team?.institution_name || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        Rp {transaction.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_CONFIG[transaction.status].className}>
                          {STATUS_CONFIG[transaction.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(transaction.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {transaction.payment_proof_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProof(transaction)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {transaction.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleVerify(transaction.id, true)}
                                disabled={verifyingId === transaction.id}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleVerify(transaction.id, false)}
                                disabled={verifyingId === transaction.id}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment Proof Dialog */}
      {proofViewerOpen && selectedTransaction?.payment_proof_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Bukti Pembayaran</h3>
              <Button variant="ghost" size="sm" onClick={() => setProofViewerOpen(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <img
                src={selectedTransaction.payment_proof_url}
                alt="Bukti Pembayaran"
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProofViewerOpen(false)}>
                  Tutup
                </Button>
                <Button asChild>
                  <a href={selectedTransaction.payment_proof_url} download target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
