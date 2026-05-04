import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventDetails } from "@/services/event-management/events-service";
import { getEventTransactions } from "@/services/event-management/transactions-service";
import { TransactionList } from "@/components/dashboard/transactions/transaction-list";
import { canOrganizeEvent } from "@/lib/event-access-server";

export const metadata: Metadata = {
  title: "Verifikasi Pembayaran - EVORA",
  description: "Verifikasi pembayaran registrasi tim",
};

interface PageProps {
  params: Promise<{ event_id: string }>;
}

export default async function TransactionsPage({ params }: PageProps) {
  const { event_id } = await params;
  
  // Check access - only ORGANIZER can access
  const hasAccess = await canOrganizeEvent(event_id);
  if (!hasAccess) notFound();

  // Get event details and transaction stats in parallel
  const [event, pendingTx, verifiedTx, rejectedTx, allTx] = await Promise.all([
    getEventDetails(event_id),
    getEventTransactions(event_id, { status: "PENDING", limit: 1 }),
    getEventTransactions(event_id, { status: "PAID", limit: 1 }),
    getEventTransactions(event_id, { status: "FAILED", limit: 1 }),
    getEventTransactions(event_id, { limit: 1 }),
  ]);
  
  if (!event) notFound();

  const stats = {
    pending: pendingTx.total,
    verified: verifiedTx.total,
    rejected: rejectedTx.total,
    total: allTx.total,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Verifikasi Pembayaran</h1>
        <p className="text-slate-500 mt-1">
          Kelola dan verifikasi pembayaran registrasi untuk{" "}
          <span className="font-medium text-slate-700">{event.title}</span>
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Menunggu" 
          value={stats.pending} 
          color="yellow" 
        />
        <StatCard 
          label="Terverifikasi" 
          value={stats.verified} 
          color="green" 
        />
        <StatCard 
          label="Ditolak" 
          value={stats.rejected} 
          color="red" 
        />
        <StatCard 
          label="Total" 
          value={stats.total} 
          color="blue" 
        />
      </div>

      {/* Transaction List */}
      <TransactionList eventId={event_id} />
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: "yellow" | "green" | "red" | "blue";
}) {
  const colorClasses = {
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
