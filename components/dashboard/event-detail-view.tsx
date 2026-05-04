"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  X,
  Plus,
  Pencil,
  Trash2,
  Tag,
  UserCog,
  Users,
  Trophy,
  BarChart3,
  Hash,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  Medal,
  Calendar,
  FileText,
} from "lucide-react";
// Event-scoped APIs (for ORGANIZER, JUDGE, TABULATOR roles)
import {
  getEventDetails,
  getEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  getEventStaff,
  addEventStaff,
  removeEventStaff,
  getEventTeamsOrganizer,
  updateTeamStatus,
  updateTeamLot,
  getVoteCategories,
  createVoteCategory,
  updateVoteCategory,
  deleteVoteCategory,
  getVoteCandidates,
  createVoteCandidate,
  updateVoteCandidate,
  deleteVoteCandidate,
  getEventScoresheets,
  lockScoresheet,
  unlockScoresheet,
  getRankings,
  getUsers,
} from "@/services/event-management-service";
import type {
  EventReadFull,
  CategoryRead,
  EventStaffReadWithUser,
  TeamReadFull,
  TeamStatus,
  VoteCategoryRead,
  VoteCandidateRead,
  ScoreSheet,
  StaffRole,
  UserRead,
  RankingsResponse,
} from "@/types/admin";
import { JudgeView } from "@/components/dashboard/judge-view";
import { OfficialTeamView } from "@/components/dashboard/official-team-view";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useDashboard } from "@/context/dashboard-context";

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}
let _tid = 0;

function ToastList({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-xs ${t.type === "success" ? "bg-white border-green-200 text-green-800" : "bg-white border-red-200 text-red-700"}`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_BADGE: Record<TeamStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PENDING_VERIFICATION: "bg-blue-100 text-blue-700 border-blue-200",
  REGISTERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  DISQUALIFIED: "bg-red-100 text-red-700 border-red-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_LABEL: Record<TeamStatus, string> = {
  PENDING_PAYMENT: "Belum Bayar",
  PENDING_VERIFICATION: "Verifikasi",
  REGISTERED: "Terdaftar",
  CANCELLED: "Dibatalkan",
  DISQUALIFIED: "Didiskualifikasi",
  REJECTED: "Ditolak",
};
const STAFF_BADGE: Record<StaffRole, string> = {
  ORGANIZER: "bg-blue-100 text-blue-700",
  JUDGE: "bg-purple-100 text-purple-700",
  TABULATOR: "bg-teal-100 text-teal-700",
  OFFICIAL_TEAM: "bg-orange-100 text-orange-700",
};
const STAFF_LABEL: Record<StaffRole, string> = {
  ORGANIZER: "Organizer",
  JUDGE: "Juri",
  TABULATOR: "Tabulator",
  OFFICIAL_TEAM: "Official Tim",
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function LoadingPane() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-red-800 animate-spin" />
    </div>
  );
}
function ErrorPane({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600 text-center max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
        </button>
      )}
    </div>
  );
}
function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
        {icon}
      </div>
      <p className="text-sm text-slate-400 text-center max-w-xs">{message}</p>
    </div>
  );
}
function Modal({
  open,
  onClose,
  title,
  children,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[width];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${w} bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
const iCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-600 transition-all disabled:bg-slate-50";
const sCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-600 transition-all";
function ErrBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-sm">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      {msg}
    </div>
  );
}
function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const v = {
    primary:
      "bg-red-900 hover:bg-red-800 text-white shadow-sm disabled:bg-slate-200 disabled:text-slate-400",
    outline:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white disabled:opacity-50",
    ghost: "text-slate-600 hover:bg-slate-100 disabled:opacity-50",
    danger:
      "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-50",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all shrink-0 ${sz} ${v} ${className}`}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
function SectionHead({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-800 shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

type TabId = "categories" | "staff" | "teams" | "voting" | "scoring";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "categories", label: "Kategori", icon: <Tag className="w-4 h-4" /> },
  { id: "staff", label: "Staff", icon: <UserCog className="w-4 h-4" /> },
  { id: "teams", label: "Tim", icon: <Users className="w-4 h-4" /> },
  { id: "voting", label: "Voting", icon: <Trophy className="w-4 h-4" /> },
  { id: "scoring", label: "Scoring", icon: <BarChart3 className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1: CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
function CategoriesTab({
  eventId,
  addToast,
}: {
  eventId: string;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryRead | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setCategories(await getEventCategories(eventId));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus kategori ini? Semua data terkait akan ikut terhapus."))
      return;
    setDelId(id);
    try {
      await deleteEventCategory(id);
      setCategories((p) => p.filter((c) => c.id !== id));
      addToast("success", "Kategori berhasil dihapus.");
    } catch (e: unknown) {
      addToast("error", e instanceof Error ? e.message : "Gagal menghapus.");
    } finally {
      setDelId(null);
    }
  }

  return (
    <div>
      <SectionHead
        icon={<Tag className="w-5 h-5" />}
        title="Kategori Kompetisi"
        subtitle="Kelola kategori lomba, kuota, dan biaya pendaftaran."
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Tambah Kategori
          </Btn>
        }
      />
      {loading && <LoadingPane />}
      {!loading && err && <ErrorPane message={err} onRetry={load} />}
      {!loading && !err && categories.length === 0 && (
        <EmptyState
          icon={<Tag className="w-7 h-7" />}
          message="Belum ada kategori. Tambahkan kategori pertama."
        />
      )}
      {!loading && !err && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {c.id.slice(0, 8)}…
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditTarget(c)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={delId === c.id}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Hapus"
                  >
                    {delId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Kuota
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {c.max_quota}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Biaya
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {fmtRupiah(c.registration_fee)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        eventId={eventId}
        onSaved={(c) => {
          setCategories((p) => [...p, c]);
          setShowAdd(false);
          addToast("success", `"${c.name}" berhasil ditambahkan.`);
        }}
      />
      {editTarget && (
        <CategoryModal
          open
          onClose={() => setEditTarget(null)}
          eventId={eventId}
          existing={editTarget}
          onSaved={(c) => {
            setCategories((p) => p.map((x) => (x.id === c.id ? c : x)));
            setEditTarget(null);
            addToast("success", `"${c.name}" diperbarui.`);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  open,
  onClose,
  eventId,
  existing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  existing?: CategoryRead;
  onSaved: (c: CategoryRead) => void;
}) {
  const [name, setName] = useState("");
  const [quota, setQuota] = useState("30");
  const [fee, setFee] = useState("350000");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(existing?.name ?? "");
      setQuota(String(existing?.max_quota ?? 30));
      setFee(String(existing?.registration_fee ?? 350000));
      setErr(null);
    }
  }, [open, existing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const result = existing
        ? await updateEventCategory(existing.id, {
            name,
            max_quota: +quota,
            registration_fee: +fee,
          })
        : await createEventCategory(eventId, {
            name,
            max_quota: +quota,
            registration_fee: +fee,
          });
      onSaved(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Kategori" : "Tambah Kategori"}
      width="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        <FieldRow label="Nama Kategori *">
          <input
            className={iCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth. PBB Variasi"
            required
          />
        </FieldRow>
        <FieldRow
          label="Kuota Maksimal *"
          hint="Jumlah tim yang dapat mendaftar."
        >
          <input
            className={iCls}
            type="number"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            min={1}
            required
          />
        </FieldRow>
        <FieldRow label="Biaya Pendaftaran (IDR) *">
          <input
            className={iCls}
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            min={0}
            step={1000}
            required
          />
        </FieldRow>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading}>
            {existing ? "Simpan Perubahan" : "Tambahkan"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2: STAFF
// ─────────────────────────────────────────────────────────────────────────────
function StaffTab({
  eventId,
  addToast,
}: {
  eventId: string;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [staff, setStaff] = useState<EventStaffReadWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setStaff(await getEventStaff(eventId));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat staff.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(id: string) {
    if (!confirm("Hapus staff ini dari event?")) return;
    setRemoveId(id);
    try {
      await removeEventStaff(eventId, id);
      setStaff((p) => p.filter((s) => s.id !== id));
      addToast("success", "Staff berhasil dihapus dari event.");
    } catch (e: unknown) {
      addToast("error", e instanceof Error ? e.message : "Gagal.");
    } finally {
      setRemoveId(null);
    }
  }

  const roleOrder: StaffRole[] = [
    "ORGANIZER",
    "JUDGE",
    "TABULATOR",
    "OFFICIAL_TEAM",
  ];
  const grouped = staff.reduce<Record<string, EventStaffReadWithUser[]>>((acc, s) => {
    (acc[s.role] = acc[s.role] ?? []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <SectionHead
        icon={<UserCog className="w-5 h-5" />}
        title="Staff Event"
        subtitle="Kelola penugasan peran pengguna dalam event ini."
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Tambah Staff
          </Btn>
        }
      />
      {loading && <LoadingPane />}
      {!loading && err && <ErrorPane message={err} onRetry={load} />}
      {!loading && !err && staff.length === 0 && (
        <EmptyState
          icon={<UserCog className="w-7 h-7" />}
          message="Belum ada staff ditugaskan dalam event ini."
        />
      )}
      {!loading && !err && staff.length > 0 && (
        <div className="space-y-6">
          {roleOrder.map((role) => {
            const members = grouped[role];
            if (!members?.length) return null;
            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STAFF_BADGE[role]}`}
                  >
                    {STAFF_LABEL[role]}
                  </span>
                  <span className="text-xs text-slate-400">
                    {members.length} orang
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {members.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${idx !== members.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                          {(s.user.full_name ?? s.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {s.user.full_name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {s.user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {s.meta_data &&
                              (s.meta_data as Record<string, string>)
                                .judge_code && (
                                <span className="text-[11px] text-purple-600 font-mono bg-purple-50 px-1.5 rounded">
                                  {
                                    (s.meta_data as Record<string, string>)
                                      .judge_code
                                  }
                                </span>
                              )}
                            {s.meta_data &&
                              (s.meta_data as Record<string, string>)
                                .speciality && (
                                <span className="text-[11px] text-slate-400">
                                  {
                                    (s.meta_data as Record<string, string>)
                                      .speciality
                                  }
                                </span>
                              )}
                            <span className="text-[11px] text-slate-400">
                              {fmtDate(s.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(s.id)}
                        disabled={removeId === s.id}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
                        title="Hapus staff"
                      >
                        {removeId === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <AddStaffModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        eventId={eventId}
        onSaved={(s) => {
          setStaff((p) => [...p, s]);
          setShowAdd(false);
          addToast("success", "Staff berhasil ditambahkan.");
        }}
      />
    </div>
  );
}

function AddStaffModal({
  open,
  onClose,
  eventId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  onSaved: (s: EventStaffReadWithUser) => void;
}) {
  const [userId, setUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [role, setRole] = useState<"JUDGE" | "TABULATOR" | "OFFICIAL_TEAM">("JUDGE");
  const [judgeCode, setJudgeCode] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [users, setUsers] = useState<{ id: string; email: string; full_name?: string | null }[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setUsersLoading(true);
    getUsers("", 50)
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      setUserId("");
      setUserSearch("");
      setRole("JUDGE");
      setJudgeCode("");
      setSpeciality("");
      setErr(null);
    }
  }, [open]);

  const selectedUser = users.find((u) => u.id === userId);
  const filtered = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.full_name?.toLowerCase().includes(q) || false) ||
      u.email.toLowerCase().includes(q)
    );
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setErr("Pilih pengguna terlebih dahulu.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const meta: Record<string, string> = {};
      if (judgeCode) meta.judge_code = judgeCode;
      if (speciality) meta.speciality = speciality;
      const result = await addEventStaff(eventId, {
        user_id: userId,
        role,
        meta_data: Object.keys(meta).length ? meta : undefined,
      });
      onSaved(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tambah Staff" width="md">
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        <FieldRow label="Cari Pengguna *">
          <input
            className={iCls}
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              if (userId) setUserId("");
            }}
            placeholder="Ketik nama atau email..."
            autoComplete="off"
          />
          {usersLoading && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Memuat pengguna...
            </p>
          )}
          {!usersLoading && userSearch && !userId && filtered.length > 0 && (
            <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto shadow-lg bg-white">
              {filtered.slice(0, 10).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setUserId(u.id);
                    setUserSearch(u.full_name ?? u.email);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {u.full_name ?? u.email}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {u.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedUser && (
            <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="font-semibold text-green-800">
                {selectedUser.full_name}
              </span>
              <span className="text-green-600 text-xs truncate">
                {selectedUser.email}
              </span>
            </div>
          )}
        </FieldRow>
        <FieldRow label="Role *">
          <select
            className={sCls}
            value={role}
            onChange={(e) => setRole(e.target.value as "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM")}
            required
          >
            <option value="JUDGE">Juri</option>
            <option value="TABULATOR">Tabulator</option>
            <option value="OFFICIAL_TEAM">Official Tim</option>
          </select>
        </FieldRow>
        {role === "JUDGE" && (
          <FieldRow label="Kode Juri" hint="cth. J-01">
            <input
              className={iCls}
              value={judgeCode}
              onChange={(e) => setJudgeCode(e.target.value)}
              placeholder="J-01"
            />
          </FieldRow>
        )}
        <FieldRow label="Spesialisasi (opsional)">
          <input
            className={iCls}
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            placeholder="cth. Baris Berbaris"
          />
        </FieldRow>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading} disabled={!userId}>
            Tambahkan
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3: TEAMS (Mobile-First Design)
// ─────────────────────────────────────────────────────────────────────────────
function TeamsTab({
  eventId,
  categories,
  addToast,
}: {
  eventId: string;
  categories: CategoryRead[];
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [teams, setTeams] = useState<TeamReadFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [lotTarget, setLotTarget] = useState<TeamReadFull | null>(null);
  const [statusTarget, setStatusTarget] = useState<TeamReadFull | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  // P0-06: Payment proof preview state
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofPreviewIsPdf, setProofPreviewIsPdf] = useState(false);
  // P1-02: Auto-assign lot numbers state
  const [autoAssigning, setAutoAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params: { limit: number; status?: TeamStatus; category_id?: string } = {
        limit: 200,
      };
      if (statusFilter) params.status = statusFilter as TeamStatus;
      if (categoryFilter) params.category_id = categoryFilter;
      const res = await getEventTeamsOrganizer(eventId, params);
      setTeams(res.data);
      setTotal(res.total);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat tim.");
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // P1-02: Auto-assign lot numbers handler
  async function handleAutoAssignLots() {
    // Sort REGISTERED teams alphabetically by name
    const registeredTeams = [...teams]
      .filter((t) => t.status === "REGISTERED")
      .sort((a, b) => a.name.localeCompare(b.name, "id"));

    if (registeredTeams.length === 0) {
      addToast("error", "Tidak ada tim berstatus REGISTERED untuk di-assign lot.");
      return;
    }

    setAutoAssigning(true);
    try {
      for (let i = 0; i < registeredTeams.length; i++) {
        await updateTeamLot(registeredTeams[i].id, { lot_number: i + 1 });
      }
      addToast("success", `Berhasil assign lot untuk ${registeredTeams.length} tim.`);
      // Refresh teams list
      await load();
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Gagal auto-assign lot.");
    } finally {
      setAutoAssigning(false);
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Mobile Card Component
  const TeamCard = ({ team }: { team: TeamReadFull }) => {
    const isExpanded = expandedTeam === team.id;
    
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-3 shadow-sm">
        {/* Card Header - Always visible */}
        <div 
          className="p-4 cursor-pointer active:bg-slate-50 transition-colors"
          onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Lot Number */}
              <div className="flex-shrink-0">
                {team.lot_number ? (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-sm shadow-sm">
                    {team.lot_number}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs">
                    —
                  </span>
                )}
              </div>
              
              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-base truncate">
                  {team.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {catMap[team.category_id] ?? (
                    <span className="font-mono text-slate-400">
                      {team.category_id.slice(0, 8)}…
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex-shrink-0">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_BADGE[team.status]}`}
              >
                {STATUS_LABEL[team.status]}
              </span>
            </div>
          </div>
          
          {/* Quick Info Row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {fmtDate(team.created_at)}
            </span>
            <span className="font-mono text-slate-400">
              ID: {team.id.slice(0, 8)}…
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 transition-transform ml-auto ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            {/* P0-06: Show rejection note if exists */}
            {team.status === "PENDING_VERIFICATION" && team.admin_note && (
              <div className="mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700">Catatan:</p>
                <p className="text-xs text-amber-600 mt-0.5">{team.admin_note}</p>
              </div>
            )}
            {/* Action Buttons - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-2">
              <Btn
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e?.stopPropagation?.();
                  setLotTarget(team);
                }}
                className="justify-center"
              >
                <Hash className="w-4 h-4 mr-1.5" /> 
                <span className="text-sm">Atur Lot</span>
              </Btn>
              <Btn
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e?.stopPropagation?.();
                  setStatusTarget(team);
                }}
                className="justify-center"
              >
                <Eye className="w-4 h-4 mr-1.5" /> 
                <span className="text-sm">Ubah Status</span>
              </Btn>
              {/* P0-06: Lihat Bukti button for PENDING_VERIFICATION */}
              {team.status === "PENDING_VERIFICATION" && (team.payment_proof_url || team.last_transaction?.proof_url) && (
                <Btn
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    const url = team.payment_proof_url ?? team.last_transaction?.proof_url ?? null;
                    if (url) {
                      setProofPreviewUrl(url);
                      setProofPreviewIsPdf(url.toLowerCase().endsWith(".pdf"));
                    }
                  }}
                  className="justify-center col-span-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4 mr-1.5" /> 
                  <span className="text-sm">Lihat Bukti Bayar</span>
                </Btn>
              )}
              <Link 
                href={`/dashboard/teams/${team.id}`}
                className="col-span-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Btn 
                  size="sm" 
                  variant="outline"
                  className="w-full justify-center"
                >
                  <Users className="w-4 h-4 mr-1.5" /> 
                  <span className="text-sm">Lihat Detail Tim</span>
                </Btn>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <SectionHead
        icon={<Users className="w-5 h-5" />}
        title="Tim Peserta"
        subtitle={`${total} tim terdaftar dalam event ini.`}
        action={
          <div className="flex items-center gap-2">
            {/* P1-02: Auto-assign Lot button */}
            <Btn
              size="sm"
              variant="outline"
              onClick={handleAutoAssignLots}
              disabled={autoAssigning}
            >
              {autoAssigning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Hash className="w-3.5 h-3.5" />
              )}
              Auto-assign Lot
            </Btn>
            <Btn variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Btn>
          </div>
        }
      />
      
      {/* Filter Bar - Mobile Optimized */}
      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter Tim
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700/20 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="PENDING_PAYMENT">⏳ Belum Bayar</option>
              <option value="PENDING_VERIFICATION">🔍 Verifikasi</option>
              <option value="REGISTERED">✅ Terdaftar</option>
              <option value="CANCELLED">❌ Dibatalkan</option>
              <option value="DISQUALIFIED">🚫 Didiskualifikasi</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700/20 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {(statusFilter || categoryFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setCategoryFilter("");
            }}
            className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Hapus Filter
          </button>
        )}
      </div>

      {loading && <LoadingPane />}
      {!loading && err && <ErrorPane message={err} onRetry={load} />}
      {!loading && !err && teams.length === 0 && (
        <EmptyState
          icon={<Users className="w-12 h-12 text-slate-300" />}
          message={
            statusFilter || categoryFilter
              ? "Tidak ada tim yang cocok dengan filter."
              : "Belum ada tim yang terdaftar dalam event ini."
          }
        />
      )}
      
      {!loading && !err && teams.length > 0 && (
        <>
          {/* Mobile View: Card Layout */}
          <div className="block lg:hidden">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
          
          {/* Desktop View: Table Layout */}
          <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-14">
                      Lot
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Nama Tim
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tgl Daftar
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {team.lot_number ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-700 font-bold text-sm">
                            {team.lot_number}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {team.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {team.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {catMap[team.category_id] ?? (
                            <span className="font-mono text-xs text-slate-400">
                              {team.category_id.slice(0, 8)}…
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[team.status]}`}
                        >
                          {STATUS_LABEL[team.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {fmtDate(team.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* P0-06: Lihat Bukti button for PENDING_VERIFICATION (desktop) */}
                          {team.status === "PENDING_VERIFICATION" && (team.payment_proof_url || team.last_transaction?.proof_url) && (
                            <Btn
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const url = team.payment_proof_url ?? team.last_transaction?.proof_url ?? null;
                                if (url) {
                                  setProofPreviewUrl(url);
                                  setProofPreviewIsPdf(url.toLowerCase().endsWith(".pdf"));
                                }
                              }}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Btn>
                          )}
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => setLotTarget(team)}
                          >
                            <Hash className="w-3.5 h-3.5" />
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => setStatusTarget(team)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Btn>
                          <Link href={`/dashboard/teams/${team.id}`}>
                            <Btn size="sm" variant="outline">
                              <Users className="w-3.5 h-3.5" />
                            </Btn>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Lot Modal */}
      {lotTarget && (
        <LotModal
          team={lotTarget}
          onClose={() => setLotTarget(null)}
          onSaved={(updated) => {
            setTeams((p) =>
              p.map((t) =>
                t.id === updated.team_id
                  ? { ...t, lot_number: updated.lot_number }
                  : t
              )
            );
            setLotTarget(null);
            addToast("success", "Nomor lot berhasil diperbarui.");
          }}
          onError={(msg) => addToast("error", msg)}
        />
      )}

      {/* Status Modal */}
      {statusTarget && (
        <StatusModal
          team={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={(updated) => {
            setTeams((p) =>
              p.map((t) =>
                t.id === updated.team_id
                  ? { ...t, status: updated.new_status as TeamStatus }
                  : t
              )
            );
            setStatusTarget(null);
            addToast("success", "Status tim berhasil diperbarui.");
          }}
          onError={(msg) => addToast("error", msg)}
        />
      )}

      {/* P0-06: Payment Proof Preview Modal */}
      <Modal
        open={!!proofPreviewUrl}
        onClose={() => setProofPreviewUrl(null)}
        title="Bukti Pembayaran"
        width="lg"
      >
        {proofPreviewUrl && (
          <div className="space-y-4">
            {proofPreviewIsPdf ? (
              <div className="flex flex-col items-center gap-4 py-8 bg-slate-50 rounded-xl">
                <FileText className="w-12 h-12 text-slate-400" />
                <p className="text-sm text-slate-600">File PDF — buka di tab baru untuk melihat</p>
                <a
                  href={proofPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 underline"
                >
                  Buka PDF
                </a>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={proofPreviewUrl}
                  alt="Bukti Pembayaran"
                  className="w-full h-auto max-h-[65vh] object-contain"
                />
              </div>
            )}
            <div className="flex justify-between items-center">
              <a
                href={proofPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 underline hover:text-slate-600"
              >
                Buka di tab baru
              </a>
              <button
                onClick={() => setProofPreviewUrl(null)}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function LotModal({
  team,
  onClose,
  onSaved,
  onError,
}: {
  team: TeamReadFull;
  onClose: () => void;
  onSaved: (r: { team_id: string; lot_number: number }) => void;
  onError: (m: string) => void;
}) {
  const [lot, setLot] = useState(String(team.lot_number ?? ""));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await updateTeamLot(team.id, { lot_number: +lot });
      onSaved(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal.";
      setErr(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal open onClose={onClose} title={`Nomor Lot — ${team.name}`} width="sm">
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        <FieldRow
          label="Nomor Lot *"
          hint="Harus unik dalam kategori yang sama."
        >
          <input
            className={iCls}
            type="number"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            min={1}
            required
          />
        </FieldRow>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading}>
            Simpan
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function StatusModal({
  team,
  onClose,
  onSaved,
  onError,
}: {
  team: TeamReadFull;
  onClose: () => void;
  onSaved: (r: { team_id: string; new_status: string }) => void;
  onError: (m: string) => void;
}) {
  const [status, setStatus] = useState<TeamStatus>(team.status);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await updateTeamStatus(team.id, { status });
      onSaved(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal.";
      setErr(msg);
      onError(msg);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={`Ubah Status — ${team.name}`}
      width="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        <FieldRow label="Status Baru *">
          <select
            className={sCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as TeamStatus)}
            required
          >
            <option value="PENDING_PAYMENT">Belum Bayar</option>
            <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
            <option value="REGISTERED">Terdaftar</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="DISQUALIFIED">Didiskualifikasi</option>
          </select>
        </FieldRow>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading}>
            Simpan
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4: VOTING
// ─────────────────────────────────────────────────────────────────────────────
function VotingTab({
  eventId,
  categories,
  addToast,
}: {
  eventId: string;
  categories: CategoryRead[];
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [vCats, setVCats] = useState<VoteCategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<VoteCategoryRead | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setVCats(await getVoteCategories(eventId));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori voting "${name}"?`)) return;
    setDelId(id);
    try {
      await deleteVoteCategory(id);
      setVCats((p) => p.filter((c) => c.id !== id));
      if (expanded === id) setExpanded(null);
      addToast("success", `"${name}" dihapus.`);
    } catch (e: unknown) {
      addToast("error", e instanceof Error ? e.message : "Gagal.");
    } finally {
      setDelId(null);
    }
  }

  return (
    <div>
      <SectionHead
        icon={<Trophy className="w-5 h-5" />}
        title="Kategori Voting"
        subtitle="Kelola kandidat dan kategori voting publik."
        action={
          <Btn onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Tambah Kategori
          </Btn>
        }
      />
      {loading && <LoadingPane />}
      {!loading && err && <ErrorPane message={err} onRetry={load} />}
      {!loading && !err && vCats.length === 0 && (
        <EmptyState
          icon={<Trophy className="w-7 h-7" />}
          message="Belum ada kategori voting. Tambahkan kategori pertama."
        />
      )}
      {!loading && !err && vCats.length > 0 && (
        <div className="space-y-3">
          {vCats.map((vc) => (
            <div
              key={vc.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
            >
              {/* Category header row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => setExpanded(expanded === vc.id ? null : vc.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                >
                  {expanded === vc.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 text-sm">
                      {vc.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vc.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {vc.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                    {vc.target_event_category_id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {categories.find(
                          (c) => c.id === vc.target_event_category_id,
                        )?.name ?? "Kategori Tertentu"}
                      </span>
                    )}
                  </div>
                  {vc.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {vc.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditTarget(vc)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vc.id, vc.name)}
                    disabled={delId === vc.id}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Hapus"
                  >
                    {delId === vc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {/* Candidates panel */}
              {expanded === vc.id && (
                <CandidatesPanel voteCategoryId={vc.id} addToast={addToast} />
              )}
            </div>
          ))}
        </div>
      )}

      <VoteCategoryModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        eventId={eventId}
        categories={categories}
        onSaved={(c) => {
          setVCats((p) => [...p, c]);
          setShowAdd(false);
          addToast("success", `"${c.name}" ditambahkan.`);
        }}
      />
      {editTarget && (
        <VoteCategoryModal
          open
          onClose={() => setEditTarget(null)}
          eventId={eventId}
          categories={categories}
          existing={editTarget}
          onSaved={(c) => {
            setVCats((p) => p.map((x) => (x.id === c.id ? c : x)));
            setEditTarget(null);
            addToast("success", `"${c.name}" diperbarui.`);
          }}
        />
      )}
    </div>
  );
}

function CandidatesPanel({
  voteCategoryId,
  addToast,
}: {
  voteCategoryId: string;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [candidates, setCandidates] = useState<VoteCandidateRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<VoteCandidateRead | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setCandidates(await getVoteCandidates(voteCategoryId));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLoading(false);
    }
  }, [voteCategoryId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Hapus kandidat ini?")) return;
    setDelId(id);
    try {
      await deleteVoteCandidate(id);
      setCandidates((p) => p.filter((c) => c.id !== id));
      addToast("success", "Kandidat dihapus.");
    } catch (e: unknown) {
      addToast("error", e instanceof Error ? e.message : "Gagal.");
    } finally {
      setDelId(null);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Kandidat
        </p>
        <Btn size="sm" variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="w-3.5 h-3.5" /> Tambah
        </Btn>
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      )}
      {!loading && err && (
        <p className="text-xs text-red-500 text-center py-3">{err}</p>
      )}
      {!loading && !err && candidates.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">
          Belum ada kandidat.
        </p>
      )}
      {!loading && !err && candidates.length > 0 && (
        <div className="space-y-2">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.candidate_name ?? ""}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                    {(c.candidate_name ?? "?").charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {c.candidate_name ?? (
                      <span className="italic text-slate-400">Tanpa Nama</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {c.team_id.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                  {c.total_votes} suara
                </span>
                <button
                  onClick={() => setEditTarget(c)}
                  className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={delId === c.id}
                  className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {delId === c.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <CandidateModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        voteCategoryId={voteCategoryId}
        onSaved={(c) => {
          setCandidates((p) => [...p, c]);
          setShowAdd(false);
          addToast("success", "Kandidat ditambahkan.");
        }}
      />
      {editTarget && (
        <CandidateModal
          open
          onClose={() => setEditTarget(null)}
          voteCategoryId={voteCategoryId}
          existing={editTarget}
          onSaved={(c) => {
            setCandidates((p) => p.map((x) => (x.id === c.id ? c : x)));
            setEditTarget(null);
            addToast("success", "Kandidat diperbarui.");
          }}
        />
      )}
    </div>
  );
}

function VoteCategoryModal({
  open,
  onClose,
  eventId,
  categories,
  existing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  categories: CategoryRead[];
  existing?: VoteCategoryRead;
  onSaved: (c: VoteCategoryRead) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [targetCatId, setTargetCatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(existing?.name ?? "");
      setDesc(existing?.description ?? "");
      setIsActive(existing?.is_active ?? true);
      setTargetCatId(existing?.target_event_category_id ?? "");
      setErr(null);
    }
  }, [open, existing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const result = existing
        ? await updateVoteCategory(existing.id, {
            name,
            description: desc || undefined,
            is_active: isActive,
          })
        : await createVoteCategory(eventId, {
            name,
            description: desc || undefined,
            is_active: isActive,
            target_event_category_id: targetCatId || undefined,
          });
      onSaved(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Kategori Voting" : "Tambah Kategori Voting"}
      width="md"
    >
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        <FieldRow label="Nama *">
          <input
            className={iCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth. Danpas Terbaik"
            required
          />
        </FieldRow>
        <FieldRow label="Deskripsi">
          <textarea
            className={iCls}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Deskripsi singkat kategori voting..."
            rows={2}
          />
        </FieldRow>
        <FieldRow label="Batasi ke Kategori Kompetisi">
          <select
            className={sCls}
            value={targetCatId}
            onChange={(e) => setTargetCatId(e.target.value)}
          >
            <option value="">Semua Kategori (Terbuka)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FieldRow>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600"
          />
          <span className="text-sm font-medium text-slate-700">
            Aktifkan kategori ini
          </span>
        </label>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading}>
            {existing ? "Simpan Perubahan" : "Tambahkan"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function CandidateModal({
  open,
  onClose,
  voteCategoryId,
  existing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  voteCategoryId: string;
  existing?: VoteCandidateRead;
  onSaved: (c: VoteCandidateRead) => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTeamId(existing?.team_id ?? "");
      setCandidateName(existing?.candidate_name ?? "");
      setImageUrl(existing?.image_url ?? "");
      setErr(null);
    }
  }, [open, existing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const result = existing
        ? await updateVoteCandidate(existing.id, {
            candidate_name: candidateName || undefined,
            image_url: imageUrl || undefined,
          })
        : await createVoteCandidate(voteCategoryId, {
            team_id: teamId,
            candidate_name: candidateName || undefined,
            image_url: imageUrl || undefined,
          });
      onSaved(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Kandidat" : "Tambah Kandidat"}
      width="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        {err && <ErrBanner msg={err} />}
        {!existing && (
          <FieldRow
            label="Team ID *"
            hint="UUID tim yang akan dijadikan kandidat."
          >
            <input
              className={iCls}
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </FieldRow>
        )}
        <FieldRow
          label="Nama Kandidat"
          hint="Opsional — default menggunakan nama tim."
        >
          <input
            className={iCls}
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="cth. Danpas Rizky — SMAN 5 Jakarta"
          />
        </FieldRow>
        <FieldRow label="URL Foto" hint="Opsional — URL gambar kandidat.">
          <input
            className={iCls}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://cdn.evora.id/candidates/foto.jpg"
          />
        </FieldRow>
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border border-slate-200 w-20 h-20">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Btn variant="outline" onClick={onClose}>
            Batal
          </Btn>
          <Btn type="submit" loading={loading}>
            {existing ? "Simpan" : "Tambahkan"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5: SCORING
// ─────────────────────────────────────────────────────────────────────────────
function ScoringTab({
  eventId,
  categories,
  addToast,
}: {
  eventId: string;
  categories: CategoryRead[];
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [sheets, setSheets] = useState<ScoreSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [rankingCatId, setRankingCatId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<RankingsResponse | null>(null);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingsErr, setRankingsErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getEventScoresheets(eventId, categoryFilter || undefined);
      setSheets(res);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat scoresheets.");
    } finally {
      setLoading(false);
    }
  }, [eventId, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleLock(sheet: ScoreSheet) {
    const action = sheet.is_locked ? "Buka kunci" : "Kunci";
    if (!confirm(`${action} scoresheet ini?`)) return;
    setLockingId(sheet.id);
    try {
      const res = sheet.is_locked
        ? await unlockScoresheet(sheet.id)
        : await lockScoresheet(sheet.id);
      setSheets((p) =>
        p.map((s) =>
          s.id === sheet.id ? { ...s, is_locked: res.is_locked } : s,
        ),
      );
      addToast("success", res.message);
    } catch (e: unknown) {
      addToast("error", e instanceof Error ? e.message : "Gagal.");
    } finally {
      setLockingId(null);
    }
  }

  async function loadRankings(catId: string) {
    if (rankingCatId === catId) {
      setRankingCatId(null);
      setRankings(null);
      return;
    }
    setRankingCatId(catId);
    setRankings(null);
    setRankingsErr(null);
    setRankingsLoading(true);
    try {
      setRankings(await getRankings(eventId, catId));
    } catch (e: unknown) {
      setRankingsErr(e instanceof Error ? e.message : "Gagal memuat ranking.");
    } finally {
      setRankingsLoading(false);
    }
  }

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <SectionHead
        icon={<BarChart3 className="w-5 h-5" />}
        title="Scoring & Ranking"
        subtitle="Pantau lembar skor juri dan lihat peringkat akhir per kategori."
        action={
          <Btn variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Btn>
        }
      />

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filter Kategori
          </span>
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-700/20"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scoresheets */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red-700" /> Lembar Skor
        </h3>
        {loading && <LoadingPane />}
        {!loading && err && <ErrorPane message={err} onRetry={load} />}
        {!loading && !err && sheets.length === 0 && (
          <EmptyState
            icon={<BarChart3 className="w-7 h-7" />}
            message="Belum ada lembar skor yang disubmit."
          />
        )}
        {!loading && !err && sheets.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tim ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Juri ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Skor
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sheets.map((sheet) => (
                    <tr
                      key={sheet.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {sheet.team_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {sheet.judge_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-black text-slate-900">
                          {sheet.total_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sheet.is_locked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <Lock className="w-3 h-3" /> Terkunci
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <Unlock className="w-3 h-3" /> Terbuka
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {fmtDate(sheet.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Btn
                          size="sm"
                          variant={sheet.is_locked ? "outline" : "danger"}
                          loading={lockingId === sheet.id}
                          onClick={() => toggleLock(sheet)}
                        >
                          {sheet.is_locked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" /> Buka
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Kunci
                            </>
                          )}
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rankings per category */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Medal className="w-4 h-4 text-red-700" /> Peringkat per Kategori
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => loadRankings(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {rankingCatId === cat.id ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-800 text-sm">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Klik untuk melihat peringkat
                  </span>
                </button>
                {rankingCatId === cat.id && (
                  <div className="border-t border-slate-100">
                    {rankingsLoading && (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      </div>
                    )}
                    {!rankingsLoading && rankingsErr && (
                      <p className="text-xs text-red-500 text-center py-4">
                        {rankingsErr}
                      </p>
                    )}
                    {!rankingsLoading &&
                      rankings &&
                      rankings.rankings.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">
                          Belum ada data peringkat.
                        </p>
                      )}
                    {!rankingsLoading &&
                      rankings &&
                      rankings.rankings.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                  Rank
                                </th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Tim
                                </th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                  Lot
                                </th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Total Skor
                                </th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Juri
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {rankings.rankings.map((r) => (
                                <tr
                                  key={r.team_id}
                                  className={
                                    r.rank <= 3
                                      ? "bg-yellow-50/50"
                                      : "hover:bg-slate-50"
                                  }
                                >
                                  <td className="px-4 py-3 font-black text-lg">
                                    {r.rank <= 3 ? (
                                      MEDALS[r.rank - 1]
                                    ) : (
                                      <span className="text-slate-500 font-bold text-sm">
                                        #{r.rank}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-900">
                                    {r.team_name}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    {r.lot_number ?? "—"}
                                  </td>
                                  <td className="px-4 py-3 font-black text-red-800">
                                    {r.total_score.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    {r.judge_count} juri
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT: EventDetailView
// ─────────────────────────────────────────────────────────────────────────────
interface EventDetailViewProps {
  eventId: string;
  userRole: "ORGANIZER" | "JUDGE" | "TABULATOR" | "OFFICIAL_TEAM";
  userId?: string;
  judgeMetaData?: { speciality?: string; judge_code?: string } | null;
  eventTitle?: string;
  eventSlug?: string;
  isSuperAdmin?: boolean;
}

// Safe hook that returns null if provider not available
function useDashboardSafe() {
  try {
    return useDashboard();
  } catch {
    return { setMobileDrawerOpen: null };
  }
}

export function EventDetailView({
  eventId,
  userRole,
  userId,
  judgeMetaData,
  eventTitle,
  eventSlug,
  isSuperAdmin = false,
}: EventDetailViewProps) {
  const dashboard = useDashboardSafe();
  
  // Role-based routing — delegate to specialized views
  if (userRole === "JUDGE" || userRole === "TABULATOR") {
    return (
      <JudgeView
        eventId={eventId}
        eventTitle={eventTitle ?? ""}
        eventSlug={eventSlug ?? ""}
        userId={userId ?? ""}
        judgeMetaData={judgeMetaData}
      />
    );
  }
  if (userRole === "OFFICIAL_TEAM") {
    return <OfficialTeamView eventId={eventId} />;
  }
  // ORGANIZER — fall through to the existing organizer view below

  const [event, setEvent] = useState<EventReadFull | null>(null);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventErr, setEventErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("categories");
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(type: "success" | "error", message: string) {
    const id = ++_tid;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }
  function removeToast(id: number) {
    setToasts((p) => p.filter((t) => t.id !== id));
  }

  const loadEvent = useCallback(async () => {
    setLoadingEvent(true);
    setEventErr(null);
    try {
      const data = await getEventDetails(eventId);
      setEvent(data);
      setCategories(data.categories ?? []);
    } catch (e: unknown) {
      setEventErr(e instanceof Error ? e.message : "Gagal memuat event.");
    } finally {
      setLoadingEvent(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-red-800 animate-spin" />
          <p className="text-sm text-slate-500">Memuat data event…</p>
        </div>
      </div>
    );
  }

  if (eventErr || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold mb-4">
            {eventErr ?? "Event tidak ditemukan."}
          </p>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader
        title={event.title}
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => dashboard.setMobileDrawerOpen?.(true)} />}
        onBackClick={() => window.location.href = "/dashboard"}
        className="lg:hidden"
      />

      <ToastList toasts={toasts} remove={removeToast} />

      {/* ── EVENT HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4">
            <Link
              href="/dashboard"
              className="mt-1 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {event.title}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${event.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {event.is_active ? "Aktif" : "Nonaktif"}
                </span>
                {event.is_voting_enabled && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                    Voting ON
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                  /{event.slug}
                </span>
                <span>🏛 {event.organizer}</span>
                {event.location && <span>📍 {event.location}</span>}
                <span>
                  📅 {fmtDate(event.event_date_start)} –{" "}
                  {fmtDate(event.event_date_end)}
                </span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 mt-5 overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-red-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────────────────── */}
      <div className="p-6">
        {activeTab === "categories" && (
          <CategoriesTab eventId={eventId} addToast={addToast} />
        )}
        {activeTab === "staff" && (
          <StaffTab eventId={eventId} addToast={addToast} />
        )}
        {activeTab === "teams" && (
          <TeamsTab
            eventId={eventId}
            categories={categories}
            addToast={addToast}
          />
        )}
        {activeTab === "voting" && (
          <VotingTab
            eventId={eventId}
            categories={categories}
            addToast={addToast}
          />
        )}
        {activeTab === "scoring" && (
          <ScoringTab
            eventId={eventId}
            categories={categories}
            addToast={addToast}
          />
        )}
      </div>
    </div>
  );
}
