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
  Users,
  CreditCard,
  Trophy,
  Tag,
  UserCog,
  Info,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getAdminEvent,
  updateEvent,
  toggleEventPg,
  toggleEventVoting,
  toggleEventActive,
  getEventCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getEventStaff,
  addEventStaff,
  removeEventStaff,
  getEventTeams,
  updateTeamStatus,
  updateTeamLot,
  deleteTeam,
  getEventTransactions,
  verifyTransaction,
  getUsers,
} from "@/services/super-admin-service";
import { VotingTab } from "./voting/voting-tab";
import type {
  EventReadFull,
  CategoryRead,
  EventStaffRead,
  TeamReadFull,
  TeamStatus,
  TransactionRead,
  StaffRole,
  UpdateEventPayload,
  UserRead,
} from "@/types/admin";

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

let _tid = 0;

function ToastList({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto ${
            t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          )}
          <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => onRemove(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return "—";
  const normalized = d.includes("T") ? d : `${d}T00:00:00`;
  return new Date(normalized).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}



// ─────────────────────────────────────────────
// SMALL MODAL WRAPPER
// ─────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${widths[size]} my-8 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

function FormActions({
  onCancel,
  loading,
  submitLabel,
}: {
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

type EventStaffItem = EventStaffRead & {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
};

type EventTransactionItem = TransactionRead & {
  user_email?: string;
  payment_proof_url?: string | null;
  team_name?: string;
  category_name?: string;
};

const TEAM_STATUS_META: Record<
  TeamStatus,
  { label: string; className: string; paymentHint?: string }
> = {
  PENDING_PAYMENT: {
    label: "Menunggu Upload Bukti",
    className: "bg-orange-100 text-orange-700",
    paymentHint: "Belum ada bukti transfer yang dikirim tim.",
  },
  PENDING_VERIFICATION: {
    label: "Menunggu Verifikasi",
    className: "bg-yellow-100 text-yellow-700",
    paymentHint: "Bukti transfer sudah masuk dan menunggu review admin.",
  },
  REGISTERED: {
    label: "Terverifikasi",
    className: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-700",
  },
  DISQUALIFIED: {
    label: "Didiskualifikasi",
    className: "bg-slate-200 text-slate-700",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-red-100 text-red-700",
  },
};

const TX_STATUS_META: Record<
  EventTransactionItem["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Pembayaran Pending", className: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Pembayaran Berhasil", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Pembayaran Gagal", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Dikembalikan", className: "bg-slate-100 text-slate-700" },
};

const STAFF_ROLE_META: Record<StaffRole, { label: string; className: string }> = {
  ORGANIZER: { label: "Organizer", className: "bg-blue-100 text-blue-700" },
  JUDGE: { label: "Judge", className: "bg-purple-100 text-purple-700" },
  TABULATOR: { label: "Tabulator", className: "bg-teal-100 text-teal-700" },
  OFFICIAL_TEAM: { label: "Official Team", className: "bg-orange-100 text-orange-700" },
};

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB TYPES
// ─────────────────────────────────────────────

type Tab =
  | "info"
  | "categories"
  | "staff"
  | "teams"
  | "transactions"
  | "voting";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "info", label: "Info & Edit", icon: <Info className="w-4 h-4" /> },
  { id: "categories", label: "Kategori", icon: <Tag className="w-4 h-4" /> },
  { id: "staff", label: "Staff", icon: <UserCog className="w-4 h-4" /> },
  { id: "teams", label: "Tim", icon: <Users className="w-4 h-4" /> },
  {
    id: "transactions",
    label: "Transaksi",
    icon: <CreditCard className="w-4 h-4" />,
  },
  { id: "voting", label: "Voting", icon: <Trophy className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────
// TAB: INFO & EDIT
// ─────────────────────────────────────────────

function InfoTab({
  event,
  onUpdated,
  addToast,
}: {
  event: EventReadFull;
  onUpdated: (ev: EventReadFull) => void;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [form, setForm] = useState<UpdateEventPayload>({
    title: event.title,
    slug: event.slug,
    organizer: event.organizer,
    location: event.location ?? "",
    profil_url: event.profil_url ?? "",
    event_date_start: event.event_date_start,
    event_date_end: event.event_date_end,
    is_voting_enabled: event.is_voting_enabled ?? undefined,
    is_pg_enabled: event.is_pg_enabled ?? undefined,
    is_active: event.is_active ?? undefined,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const updated = await updateEvent(event.id, form);
      onUpdated(updated);
      addToast("success", "Event berhasil diperbarui.");
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memperbarui event.");
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof UpdateEventPayload>(
    k: K,
    v: UpdateEventPayload[K],
  ) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(type: "pg" | "voting" | "active") {
    setToggling(type);
    try {
      let res;
      if (type === "pg") res = await toggleEventPg(event.id, !(event.is_pg_enabled ?? false));
      else if (type === "voting") res = await toggleEventVoting(event.id, !(event.is_voting_enabled ?? false));
      else res = await toggleEventActive(event.id, !(event.is_active ?? false));

      // Check if response is an event object (has id) or just a message
      if ("id" in res) {
        const updatedEvent: EventReadFull = {
          ...event,
          is_pg_enabled: (res.is_pg_enabled ?? event.is_pg_enabled) as boolean | null,
          is_voting_enabled: (res.is_voting_enabled ?? event.is_voting_enabled) as boolean | null,
          is_active: (res.is_active ?? event.is_active) as boolean | null,
        };
        onUpdated(updatedEvent);
      } else {
        const updatedEvent: EventReadFull = {
          ...event,
          is_pg_enabled: (
            res.is_pg_enabled ??
            (type === "pg" ? !(event.is_pg_enabled ?? false) : event.is_pg_enabled)
          ) as boolean | null,
          is_voting_enabled: (
            res.is_voting_enabled ??
            (type === "voting"
              ? !(event.is_voting_enabled ?? false)
              : event.is_voting_enabled)
          ) as boolean | null,
          is_active: (
            res.is_active ??
            (type === "active" ? !(event.is_active ?? false) : event.is_active)
          ) as boolean | null,
        };
        onUpdated(updatedEvent);
      }
      addToast("success", "message" in res ? res.message : "Status berhasil diperbarui.");
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Toggle gagal.");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Fitur Event
        </p>
        {[
          {
            key: "active" as const,
            label: "Publik (Visible)",
            desc: "Event terlihat di halaman publik.",
            active: event.is_active,
            icon: event.is_active ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            ),
            activeColor: "text-green-600",
          },
          {
            key: "pg" as const,
            label: "Payment Gateway",
            desc: "Aktifkan pembayaran otomatis.",
            active: event.is_pg_enabled,
            icon: <CreditCard className="w-4 h-4" />,
            activeColor: "text-blue-600",
          },
          {
            key: "voting" as const,
            label: "Voting",
            desc: "Aktifkan sistem voting publik.",
            active: event.is_voting_enabled,
            icon: <Trophy className="w-4 h-4" />,
            activeColor: "text-yellow-600",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={item.active ? item.activeColor : "text-slate-400"}
              >
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              disabled={toggling === item.key}
              className={`transition-colors disabled:opacity-50 ${
                item.active ? item.activeColor : "text-slate-400"
              }`}
            >
              {toggling === item.key ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : item.active ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Edit Detail Event
        </p>

        {err && <ErrorBanner message={err} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Judul Event" required>
            <FieldInput
              value={form.title ?? ""}
              onChange={(v) => set("title", v)}
              placeholder="Kompetisi PBB Nasional"
              required
            />
          </FormField>
          <FormField label="Slug" required hint="URL unik event.">
            <FieldInput
              value={form.slug ?? ""}
              onChange={(v) => set("slug", v)}
              placeholder="pbb-nasional-2025"
              required
            />
          </FormField>
          <FormField label="Penyelenggara" required>
            <FieldInput
              value={form.organizer ?? ""}
              onChange={(v) => set("organizer", v)}
              required
            />
          </FormField>
          <FormField label="Lokasi">
            <FieldInput
              value={form.location ?? ""}
              onChange={(v) => set("location", v)}
              placeholder="GOR Soemantri, Jakarta"
            />
          </FormField>
          <FormField label="URL Foto">
            <FieldInput
              value={form.profil_url ?? ""}
              onChange={(v) => set("profil_url", v)}
              type="url"
              placeholder="https://cdn.evora.id/..."
            />
          </FormField>
          <div />
          <FormField label="Tanggal Mulai" required>
            <FieldInput
              value={form.event_date_start ?? ""}
              onChange={(v) => set("event_date_start", v)}
              type="date"
              required
            />
          </FormField>
          <FormField label="Tanggal Selesai" required>
            <FieldInput
              value={form.event_date_end ?? ""}
              onChange={(v) => set("event_date_end", v)}
              type="date"
              required
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-red-900 hover:bg-red-800 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </form>

      {/* Meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        {[
          { label: "ID", value: event.id.slice(0, 8) + "…" },
          { label: "Dibuat", value: formatDate(event.created_at) },
          { label: "Diperbarui", value: formatDate(event.updated_at) },
          { label: "Kategori", value: `${event.categories.length} kategori` },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-slate-50 rounded-lg p-3 border border-slate-100"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {m.label}
            </p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB: CATEGORIES
// ─────────────────────────────────────────────

function CategoriesTab({
  eventId,
  addToast,
}: {
  eventId: string;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [cats, setCats] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryRead | null>(null);
  const [delLoading, setDelLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEventCategories(eventId);
      setCats(data);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(catId: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    setDelLoading(catId);
    try {
      await deleteCategory(catId);
      setCats((prev) => prev.filter((c) => c.id !== catId));
      addToast("success", `Kategori "${name}" dihapus.`);
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal menghapus.");
    } finally {
      setDelLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-700">
          {cats.length} Kategori Kompetisi
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 bg-red-900 hover:bg-red-800 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Kategori
        </button>
      </div>

      {err && <ErrorBanner message={err} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Belum ada kategori.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cats.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-red-200 transition-colors sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm">
                  {cat.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-[11px] text-slate-500">
                    Kuota:{" "}
                    <span className="font-bold text-slate-700">
                      {cat.max_quota || "∞"}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Biaya:{" "}
                    <span className="font-bold text-slate-700">
                      {formatRupiah(cat.registration_fee)}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  onClick={() => setEditTarget(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={delLoading === cat.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {delLoading === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <CategoryModal
          mode="create"
          eventId={eventId}
          onClose={() => setShowAdd(false)}
          onSuccess={(cat) => {
            setCats((prev) => [...prev, cat]);
            setShowAdd(false);
            addToast("success", `Kategori "${cat.name}" ditambahkan.`);
          }}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <CategoryModal
          mode="edit"
          eventId={eventId}
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={(cat) => {
            setCats((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
            setEditTarget(null);
            addToast("success", `Kategori "${cat.name}" diperbarui.`);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  mode,
  eventId,
  initial,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit";
  eventId: string;
  initial?: CategoryRead;
  onClose: () => void;
  onSuccess: (c: CategoryRead) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quota, setQuota] = useState(String(initial?.max_quota ?? "30"));
  const [fee, setFee] = useState(String(initial?.registration_fee ?? "350000"));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      let result: CategoryRead;
      if (mode === "create") {
        result = await createCategory(eventId, {
          name,
          event_id: eventId,
          max_quota: Number(quota),
          registration_fee: Number(fee),
        });
      } else {
        result = await updateCategory(initial!.id, {
          name,
          max_quota: Number(quota),
          registration_fee: Number(fee),
        });
      }
      onSuccess(result);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <ErrorBanner message={err} />}
        <FormField label="Nama Kategori" required>
          <FieldInput
            value={name}
            onChange={setName}
            placeholder="PBB Variasi"
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kuota Maksimal" hint="0 = tidak terbatas">
            <FieldInput value={quota} onChange={setQuota} type="number" />
          </FormField>
          <FormField label="Biaya Pendaftaran (IDR)">
            <FieldInput value={fee} onChange={setFee} type="number" />
          </FormField>
        </div>
        <FormActions
          onCancel={onClose}
          loading={loading}
          submitLabel={mode === "create" ? "Tambah Kategori" : "Simpan"}
        />
      </form>
    </Modal>
  );
}

function StaffTab({
  eventId,
  addToast,
}: {
  eventId: string;
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [staff, setStaff] = useState<EventStaffItem[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserRead>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [data, usersRes] = await Promise.all([
        getEventStaff(eventId),
        getUsers({ limit: 100, is_active: true }),
      ]);
      setUserMap(Object.fromEntries(usersRes.data.map((user) => [user.id, user])));
      setStaff(data as EventStaffItem[]);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memuat staff.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(item: EventStaffItem) {
    if (!confirm(`Hapus assignment ${item.role} ini?`)) return;
    setRemoveLoading(item.id);
    try {
      await removeEventStaff(eventId, item.id);
      setStaff((prev) => prev.filter((row) => row.id !== item.id));
      addToast("success", "Staff berhasil dihapus dari event.");
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal menghapus staff.");
    } finally {
      setRemoveLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-700">
          {staff.length} Assignment Staff
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Staff
        </button>
      </div>

      {err && <ErrorBanner message={err} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<UserCog className="h-6 w-6" />}
          title="Belum ada staff"
          description="Tambahkan organizer, judge, tabulator, atau official team untuk event ini."
        />
      ) : (
        <div className="space-y-2">
          {staff.map((item) => {
            const fallbackUser = userMap[item.user_id];
            const displayName =
              item.user?.full_name ||
              fallbackUser?.full_name ||
              item.user?.email ||
              fallbackUser?.email ||
              "User tidak ditemukan";
            const displayEmail =
              item.user?.email || fallbackUser?.email || item.user_id;
            const roleMeta = STAFF_ROLE_META[item.role];

            return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {displayName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((chunk) => chunk[0]?.toUpperCase())
                    .join("") || "U"}
                </div>
                <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleMeta.className}`}>
                    {roleMeta.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </span>
                </div>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {displayEmail}
                </p>
                {item.meta_data && Object.keys(item.meta_data).length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    {Object.entries(item.meta_data)
                      .map(([key, value]) =>
                        `${key}: ${
                          typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)
                        }`
                      )
                      .join(" • ")}
                  </p>
                )}
              </div>
              </div>
              <button
                onClick={() => handleRemove(item)}
                disabled={removeLoading === item.id}
                className="inline-flex items-center gap-1.5 self-end rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 sm:self-auto"
              >
                {removeLoading === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Hapus
              </button>
            </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <StaffModal
          eventId={eventId}
          onClose={() => setShowAdd(false)}
          onSuccess={(item) => {
            setStaff((prev) => [item, ...prev]);
            setShowAdd(false);
            addToast("success", "Staff berhasil ditambahkan ke event.");
          }}
        />
      )}
    </div>
  );
}

function StaffModal({
  eventId,
  onClose,
  onSuccess,
}: {
  eventId: string;
  onClose: () => void;
  onSuccess: (item: EventStaffItem) => void;
}) {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<StaffRole>("JUDGE");
  const [speciality, setSpeciality] = useState("");
  const [judgeCode, setJudgeCode] = useState("");

  useEffect(() => {
    let active = true;
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const res = await getUsers({ limit: 100, is_active: true, role: "USER" });
        if (active) setUsers(res.data);
      } catch (ex: unknown) {
        if (active) {
          setErr(ex instanceof Error ? ex.message : "Gagal memuat daftar user.");
        }
      } finally {
        if (active) setLoadingUsers(false);
      }
    }
    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const meta_data: Record<string, unknown> = {};
      if (speciality.trim()) meta_data.speciality = speciality.trim();
      if (judgeCode.trim()) meta_data.judge_code = judgeCode.trim();
      const created = await addEventStaff(eventId, {
        user_id: userId,
        role,
        ...(Object.keys(meta_data).length > 0 ? { meta_data } : {}),
      });

      const user = users.find((item) => item.id === userId);
      onSuccess({
        ...(created as EventStaffRead),
        user: user
          ? {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
            }
          : undefined,
      });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal menambahkan staff.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Tambah Staff Event" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && <ErrorBanner message={err} />}

        <FormField label="User" required>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            disabled={loadingUsers}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 disabled:bg-slate-50"
          >
            <option value="">{loadingUsers ? "Memuat user..." : "Pilih user"}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {(user.full_name || "Tanpa Nama") + " - " + user.email}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Role" required>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          >
            {["ORGANIZER", "JUDGE", "TABULATOR", "OFFICIAL_TEAM"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Speciality" hint="Opsional, umum dipakai untuk judge/tabulator">
            <FieldInput value={speciality} onChange={setSpeciality} placeholder="Baris Berbaris" />
          </FormField>
          <FormField label="Judge Code" hint="Opsional">
            <FieldInput value={judgeCode} onChange={setJudgeCode} placeholder="J-01" />
          </FormField>
        </div>

        <FormActions onCancel={onClose} loading={saving} submitLabel="Simpan Staff" />
      </form>
    </Modal>
  );
}

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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [lotDrafts, setLotDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getEventTeams(eventId, {
        limit: 100,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(categoryFilter ? { category_id: categoryFilter } : {}),
      });
      setTeams(res.data as TeamReadFull[]);
      setLotDrafts(
        Object.fromEntries(
          res.data.map((team) => [team.id, team.lot_number != null ? String(team.lot_number) : ""])
        )
      );
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memuat tim.");
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatus(team: TeamReadFull, status: TeamStatus) {
    setWorkingId(team.id);
    try {
      const res = await updateTeamStatus(team.id, { status });
      setTeams((prev) =>
        prev.map((item) => (item.id === team.id ? { ...item, status: res.new_status } : item))
      );
      addToast("success", res.message);
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal mengubah status tim.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleLot(team: TeamReadFull) {
    const nextValue = Number(lotDrafts[team.id]);
    if (!Number.isFinite(nextValue) || nextValue < 1) {
      addToast("error", "Nomor lot harus berupa angka >= 1.");
      return;
    }

    setWorkingId(team.id);
    try {
      const res = await updateTeamLot(team.id, { lot_number: nextValue });
      setTeams((prev) =>
        prev.map((item) => (item.id === team.id ? { ...item, lot_number: res.lot_number } : item))
      );
      addToast("success", res.message);
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal mengubah nomor lot.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(team: TeamReadFull) {
    if (!confirm(`Hapus tim "${team.name}"?`)) return;
    setWorkingId(team.id);
    try {
      const res = await deleteTeam(team.id);
      setTeams((prev) => prev.filter((item) => item.id !== team.id));
      addToast("success", res.message);
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal menghapus tim.");
    } finally {
      setWorkingId(null);
    }
  }

  function categoryName(id: string) {
    return categories.find((item) => item.id === id)?.name ?? id;
  }

  function memberSummary(member: TeamReadFull["members"][number]) {
    return [
      member.identity_number,
      member.extra_data?.institution,
      member.extra_data?.phone,
      member.extra_data?.email,
    ]
      .filter(Boolean)
      .join(" • ");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status Tim
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            {["PENDING_PAYMENT", "PENDING_VERIFICATION", "REGISTERED", "CANCELLED", "DISQUALIFIED"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Kategori
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua Kategori</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Tim
          </button>
        </div>
      </div>

      {err && <ErrorBanner message={err} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Belum ada tim"
          description="Belum ada tim yang terdaftar untuk filter yang dipilih."
        />
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{team.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TEAM_STATUS_META[team.status].className}`}>
                      {TEAM_STATUS_META[team.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {categoryName(team.category_id)} • {team.members.length} member
                  </p>
                  <p className="mt-1 break-all text-[11px] text-slate-400">
                    Team ID: {team.id}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Lot</span>
                      <span className="mt-1 block font-medium text-slate-700">{team.lot_number ?? "Belum diatur"}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Official User</span>
                      <span className="mt-1 block break-all font-medium text-slate-700">{team.official_user_id}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Dibuat</span>
                      <span className="mt-1 block font-medium text-slate-700">{formatDate(team.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,180px)_minmax(0,140px)_auto]">
                  <select
                    value={team.status}
                    onChange={(e) => handleStatus(team, e.target.value as TeamStatus)}
                    disabled={workingId === team.id}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {["PENDING_PAYMENT", "PENDING_VERIFICATION", "REGISTERED", "CANCELLED", "DISQUALIFIED"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      value={lotDrafts[team.id] ?? ""}
                      onChange={(e) => setLotDrafts((prev) => ({ ...prev, [team.id]: e.target.value }))}
                      placeholder="Nomor lot"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleLot(team)}
                      disabled={workingId === team.id}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Simpan
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(team)}
                    disabled={workingId === team.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {workingId === team.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Daftar Anggota Tim
                </p>
                {team.members.length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada anggota terdaftar.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{member.name}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                            {member.role}
                          </span>
                        </div>
                        {memberSummary(member) && (
                          <p className="mt-1 text-xs text-slate-500">{memberSummary(member)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionsTab({
  eventId,
  categories,
  addToast,
}: {
  eventId: string;
  categories: CategoryRead[];
  addToast: (t: "success" | "error", m: string) => void;
}) {
  const [transactions, setTransactions] = useState<EventTransactionItem[]>([]);
  const [teamMap, setTeamMap] = useState<Record<string, TeamReadFull>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [res, teamsRes] = await Promise.all([
        getEventTransactions(eventId, {
          limit: 100,
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
        getEventTeams(eventId, { limit: 200 }),
      ]);
      setTransactions(res.data as EventTransactionItem[]);
      setTeamMap(
        Object.fromEntries(teamsRes.data.map((team) => [team.id, team as TeamReadFull]))
      );
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify(item: EventTransactionItem, isApproved: boolean) {
    const admin_note = isApproved
      ? undefined
      : window.prompt("Masukkan catatan penolakan (minimal 10 karakter):", "") ?? "";

    if (!isApproved && admin_note.trim().length < 10) {
      addToast("error", "Catatan penolakan minimal 10 karakter.");
      return;
    }

    setWorkingId(item.id);
    try {
      const res = await verifyTransaction(item.id, {
        is_approved: isApproved,
        ...(admin_note ? { admin_note } : {}),
      });
      setTransactions((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...row, status: res.new_status, admin_note: admin_note || row.admin_note }
            : row
        )
      );
      addToast("success", res.message);
    } catch (ex: unknown) {
      addToast("error", ex instanceof Error ? ex.message : "Gagal memverifikasi transaksi.");
    } finally {
      setWorkingId(null);
    }
  }

  function getTeamState(item: EventTransactionItem) {
    const teamId = item.team_id || item.meta_data?.team_id;
    return teamId ? teamMap[teamId] : undefined;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status Pembayaran
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            {["PENDING", "PAID", "FAILED", "REFUNDED"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Transaksi
        </button>
      </div>

      {err && <ErrorBanner message={err} />}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="Belum ada transaksi"
          description="Tidak ada transaksi registrasi untuk filter yang dipilih."
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              {(() => {
                const team = getTeamState(item);
                const txMeta = TX_STATUS_META[item.status];

                return (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${txMeta.className}`}>
                      {txMeta.label}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {formatRupiah(item.amount)}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">User Pembayar</span>
                      <span className="mt-1 block break-all font-medium text-slate-700">{item.user_email || item.user_id}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tim</span>
                      <span className="mt-1 block font-medium text-slate-700">{item.team_name || team?.name || item.meta_data?.team_id || "Tanpa Team"}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori</span>
                      <span className="mt-1 block font-medium text-slate-700">{item.category_name || (team ? categories.find((cat) => cat.id === team.category_id)?.name : undefined) || item.meta_data?.category_id || "Tanpa kategori"}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bukti Pembayaran</span>
                      {item.payment_proof_url ? (
                        <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all font-medium text-red-700 underline">
                          Lihat bukti transfer
                        </a>
                      ) : (
                        <span className="mt-1 block font-medium text-slate-400">Belum ada bukti diunggah</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Dibuat: {formatDate(item.created_at)}
                  </p>
                  {team && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Status tim saat ini: {TEAM_STATUS_META[team.status].label}
                    </p>
                  )}
                  {item.admin_note && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      Catatan admin: {item.admin_note}
                    </p>
                  )}
                </div>

                {item.status === "PENDING" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleVerify(item, true)}
                      disabled={workingId === item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      {workingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(item, false)}
                      disabled={workingId === item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400">
                    Sudah diproses
                  </p>
                )}
              </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export function SuperAdminEventDetail({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventReadFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++_tid;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const ev = await getAdminEvent(eventId);
      setEvent(ev);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Gagal memuat event.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        <p className="text-sm text-slate-500">Memuat event…</p>
      </div>
    );
  }

  if (err || !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-800 mb-1">Gagal Memuat</h2>
          <p className="text-sm text-red-600 mb-4">{err || "Event tidak ditemukan."}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <Link
              href="/super-admin/events"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
      <ToastList toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/super-admin/events"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Semua Event
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 break-words">
            {event.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1 break-words">
            {event.organizer} • {formatDate(event.event_date_start)} -{" "}
            {formatDate(event.event_date_end)}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              event.is_active
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {event.is_active ? "Publik" : "Draft"}
          </span>
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-red-700 text-red-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {activeTab === "info" && (
          <InfoTab
            event={event}
            onUpdated={(ev) => setEvent(ev)}
            addToast={addToast}
          />
        )}
        {activeTab === "categories" && (
          <CategoriesTab eventId={eventId} addToast={addToast} />
        )}
        {activeTab === "voting" && <VotingTab eventId={eventId} />}
        {activeTab === "staff" && (
          <StaffTab eventId={eventId} addToast={addToast} />
        )}
        {activeTab === "teams" && (
          <TeamsTab
            eventId={eventId}
            categories={event.categories}
            addToast={addToast}
          />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab
            eventId={eventId}
            categories={event.categories}
            addToast={addToast}
          />
        )}
      </div>
    </div>
  );
}
