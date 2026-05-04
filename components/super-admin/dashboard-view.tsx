"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  Banknote,
  Clock,
  Trophy,
  Package,
  TrendingUp,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { getDashboardStats } from "@/services/super-admin-service";
import type { DashboardStats, EventStats } from "@/types/admin";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRupiahFull(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────
// KPI STAT CARD
// ─────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red" | "purple" | "slate";
  urgent?: boolean;
}

const COLOR_MAP: Record<StatCardProps["color"], { bg: string; icon: string; border: string }> = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600 bg-blue-100",   border: "border-blue-100" },
  green:  { bg: "bg-green-50",  icon: "text-green-600 bg-green-100", border: "border-green-100" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600 bg-yellow-100", border: "border-yellow-100" },
  red:    { bg: "bg-red-50",    icon: "text-red-600 bg-red-100",     border: "border-red-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600 bg-purple-100", border: "border-purple-100" },
  slate:  { bg: "bg-slate-50",  icon: "text-slate-600 bg-slate-100", border: "border-slate-100" },
};

function StatCard({ label, value, sub, icon, color, urgent }: StatCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      className={`relative bg-white rounded-xl border ${
        urgent ? "border-yellow-300 shadow-yellow-100" : "border-slate-200"
      } shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow`}
    >
      {urgent && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </span>
      )}

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-none">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS MINI PILL
// ─────────────────────────────────────────────

function MiniPill({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${color}`}>
      <span>{count}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// EVENT ROW
// ─────────────────────────────────────────────

function EventRow({ ev, idx }: { ev: EventStats; idx: number }) {
  const registrationRate =
    ev.total_teams > 0
      ? Math.round((ev.registered_teams / ev.total_teams) * 100)
      : 0;

  const hasPending =
    ev.pending_payment_teams > 0 || ev.pending_verification_teams > 0;

  return (
    <tr
      className={`group border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
      }`}
    >
      {/* Event title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 line-clamp-1">
              {ev.event_title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {ev.slug}
            </span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {ev.is_active ? (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            Nonaktif
          </span>
        )}
      </td>

      {/* Teams */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">
              {ev.registered_teams}/{ev.total_teams} tim
            </span>
            <span className="text-slate-400">{registrationRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(registrationRate, 100)}%` }}
            />
          </div>
        </div>
      </td>

      {/* Pending */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {ev.pending_payment_teams > 0 && (
            <MiniPill
              count={ev.pending_payment_teams}
              label="bayar"
              color="bg-orange-100 text-orange-700"
            />
          )}
          {ev.pending_verification_teams > 0 && (
            <MiniPill
              count={ev.pending_verification_teams}
              label="verif"
              color="bg-yellow-100 text-yellow-700"
            />
          )}
          {ev.cancelled_teams > 0 && (
            <MiniPill
              count={ev.cancelled_teams}
              label="batal"
              color="bg-red-100 text-red-700"
            />
          )}
          {!hasPending && ev.cancelled_teams === 0 && (
            <span className="text-[11px] text-slate-400 italic">Bersih</span>
          )}
        </div>
      </td>

      {/* Revenue */}
      <td className="px-4 py-3">
        <span className="text-sm font-bold text-slate-900">
          {formatRupiah(ev.total_revenue_idr)}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <Link
          href={`/super-admin/events/${ev.event_id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-900 hover:text-red-700 hover:underline transition-colors"
        >
          Kelola
          <ExternalLink className="w-3 h-3" />
        </Link>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="h-7 bg-slate-200 rounded w-16" />
        <div className="h-2.5 bg-slate-200 rounded w-32" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD VIEW
// ─────────────────────────────────────────────

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await getDashboardStats();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchStats(true), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Error state ──────────────────────────────
  if (!loading && error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Gagal Memuat Dashboard
          </h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── PAGE HEADER ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan performa platform secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && !loading && (
            <p className="text-xs text-slate-400">
              Diperbarui:{" "}
              {lastRefresh.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI STAT CARDS ──────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Statistik Platform
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Pengguna"
              value={stats.total_users.toLocaleString("id-ID")}
              sub={`${stats.total_active_users.toLocaleString("id-ID")} akun aktif`}
              icon={<Users className="w-5 h-5" />}
              color="blue"
            />

            <StatCard
              label="Total Event"
              value={stats.total_events.toLocaleString("id-ID")}
              sub={`${stats.total_active_events} event aktif / publik`}
              icon={<CalendarDays className="w-5 h-5" />}
              color="purple"
            />

            <StatCard
              label="Total Tim"
              value={stats.total_teams.toLocaleString("id-ID")}
              sub={`${stats.total_registered_teams.toLocaleString("id-ID")} sudah REGISTERED`}
              icon={<Trophy className="w-5 h-5" />}
              color="green"
            />

            <StatCard
              label="Total Pendapatan"
              value={formatRupiah(stats.total_revenue_idr)}
              sub={formatRupiahFull(stats.total_revenue_idr)}
              icon={<Banknote className="w-5 h-5" />}
              color="green"
            />

            <StatCard
              label="Transaksi Pending"
              value={stats.total_pending_transactions}
              sub="Butuh verifikasi segera"
              icon={<Clock className="w-5 h-5" />}
              color="yellow"
              urgent={stats.total_pending_transactions > 0}
            />

            <StatCard
              label="Paket Vote Terjual"
              value={stats.total_vote_packages_sold.toLocaleString("id-ID")}
              sub="Total transaksi voting terbayar"
              icon={<Package className="w-5 h-5" />}
              color="slate"
            />

            <StatCard
              label="Rate Registrasi"
              value={
                stats.total_teams > 0
                  ? `${Math.round((stats.total_registered_teams / stats.total_teams) * 100)}%`
                  : "—"
              }
              sub="Tim registered / total tim"
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />

            <StatCard
              label="Event Aktif"
              value={stats.total_active_events}
              sub={`dari ${stats.total_events} event total`}
              icon={<BarChart3 className="w-5 h-5" />}
              color="red"
            />
          </div>
        ) : null}
      </section>

      {/* ── QUICK ACTIONS ───────────────────────── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/super-admin/users", label: "Kelola User", icon: <Users className="w-5 h-5" />, color: "hover:border-blue-300 hover:bg-blue-50" },
            { href: "/super-admin/events", label: "Kelola Event", icon: <CalendarDays className="w-5 h-5" />, color: "hover:border-purple-300 hover:bg-purple-50" },
            { href: "/super-admin/transactions", label: "Verifikasi Pembayaran", icon: <Clock className="w-5 h-5" />, color: "hover:border-yellow-300 hover:bg-yellow-50", badge: stats?.total_pending_transactions },
            { href: "/super-admin/vote-packages", label: "Paket Voting", icon: <Package className="w-5 h-5" />, color: "hover:border-slate-300 hover:bg-slate-50" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`relative bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all shadow-sm ${action.color} group`}
            >
              {action.badge != null && action.badge > 0 && (
                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {action.badge > 9 ? "9+" : action.badge}
                </span>
              )}
              <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                {action.icon}
              </span>
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PER-EVENT BREAKDOWN ─────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Breakdown per Event
          </h2>
          <Link
            href="/super-admin/events"
            className="text-xs font-bold text-red-900 hover:text-red-700 hover:underline transition-colors"
          >
            Lihat semua →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Registrasi
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pendapatan
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  : stats?.events.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarDays className="w-8 h-8 text-slate-300" />
                          <p className="text-slate-400 text-sm font-medium">
                            Belum ada event terdaftar.
                          </p>
                          <Link
                            href="/super-admin/events"
                            className="text-xs font-bold text-red-900 hover:underline"
                          >
                            Buat event pertama →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                  : stats?.events.map((ev, idx) => (
                    <EventRow key={ev.event_id} ev={ev} idx={idx} />
                  ))}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          {!loading && stats && stats.events.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>
                <span className="font-bold text-slate-700">{stats.events.length}</span> event ditampilkan
              </span>
              <span>
                Total pendapatan:{" "}
                <span className="font-bold text-slate-700">
                  {formatRupiahFull(stats.total_revenue_idr)}
                </span>
              </span>
              <span>
                Pending transaksi:{" "}
                <span className={`font-bold ${stats.total_pending_transactions > 0 ? "text-yellow-600" : "text-slate-700"}`}>
                  {stats.total_pending_transactions}
                </span>
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
