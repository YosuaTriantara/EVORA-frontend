"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  CreditCard,
  Trophy,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventPg,
  toggleEventVoting,
  toggleEventActive,
} from "@/services/super-admin-service";
import type {
  EventReadFull,
  CreateEventPayload,
  UpdateEventPayload,
} from "@/types/admin";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

let _toastId = 0;

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
// TOGGLE PILL
// ─────────────────────────────────────────────

function TogglePill({
  active,
  loading,
  label,
  icon,
  onToggle,
  activeColor,
}: {
  active: boolean;
  loading: boolean;
  label: string;
  icon: React.ReactNode;
  onToggle: () => void;
  activeColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      title={`${active ? "Nonaktifkan" : "Aktifkan"} ${label}`}
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
        active
          ? `${activeColor} shadow-sm`
          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
      }`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// MODAL — Create / Edit
// ─────────────────────────────────────────────

interface EventFormModalProps {
  mode: "create" | "edit";
  initial?: EventReadFull | null;
  onClose: () => void;
  onSuccess: (event: EventReadFull) => void;
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  organizer: "",
  location: "",
  profil_url: "",
  event_date_start: "",
  event_date_end: "",
  is_voting_enabled: false,
};

function EventFormModal({
  mode,
  initial,
  onClose,
  onSuccess,
}: EventFormModalProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? EMPTY_FORM.title,
    slug: initial?.slug ?? EMPTY_FORM.slug,
    organizer: initial?.organizer ?? EMPTY_FORM.organizer,
    location: initial?.location ?? EMPTY_FORM.location,
    profil_url: initial?.profil_url ?? EMPTY_FORM.profil_url,
    event_date_start: initial?.event_date_start ?? EMPTY_FORM.event_date_start,
    event_date_end: initial?.event_date_end ?? EMPTY_FORM.event_date_end,
    is_voting_enabled:
      initial?.is_voting_enabled ?? EMPTY_FORM.is_voting_enabled,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Auto-generate slug from title (create mode only)
  function handleTitleChange(val: string) {
    set("title", val);
    if (mode === "create") {
      const slug = val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 60);
      set("slug", slug);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let result: EventReadFull;
      if (mode === "create") {
        const payload: CreateEventPayload = {
          title: form.title,
          slug: form.slug,
          organizer: form.organizer,
          location: form.location,
          profil_url: form.profil_url || undefined,
          event_date_start: form.event_date_start,
          event_date_end: form.event_date_end,
          is_voting_enabled: form.is_voting_enabled,
          content_data: {},
          theme_setting: {},
        };
        result = await createEvent(payload);
      } else {
        const payload: UpdateEventPayload = {
          title: form.title,
          slug: form.slug,
          organizer: form.organizer,
          location: form.location,
          profil_url: form.profil_url || undefined,
          event_date_start: form.event_date_start,
          event_date_end: form.event_date_end,
          is_voting_enabled: form.is_voting_enabled,
        };
        result = await updateEvent(initial!.id, payload);
      }
      onSuccess(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {mode === "create" ? (
              <Plus className="w-4 h-4 text-red-900" />
            ) : (
              <Pencil className="w-4 h-4 text-red-900" />
            )}
            <h2 className="font-bold text-slate-900 text-base">
              {mode === "create" ? "Buat Event Baru" : "Edit Event"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Judul Event *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Kompetisi PBB Nasional 2025"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="pbb-nasional-2025"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
            <p className="text-[10px] text-slate-400">
              Digunakan sebagai URL unik. Hanya huruf kecil, angka, dan tanda
              hubung.
            </p>
          </div>

          {/* Organizer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Penyelenggara *
            </label>
            <input
              type="text"
              required
              value={form.organizer}
              onChange={(e) => set("organizer", e.target.value)}
              placeholder="Dwipara Dwisma"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lokasi
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="GOR Soemantri, Jakarta"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
          </div>

          {/* Profil URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              URL Foto / Banner
            </label>
            <input
              type="url"
              value={form.profil_url}
              onChange={(e) => set("profil_url", e.target.value)}
              placeholder="https://cdn.evora.id/events/pbb2025.jpg"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={form.event_date_start}
                onChange={(e) => set("event_date_start", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                value={form.event_date_end}
                onChange={(e) => set("event_date_end", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
            </div>
          </div>

          {/* Voting toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Aktifkan Fitur Voting
              </p>
              <p className="text-[11px] text-slate-400">
                Mengizinkan publik melakukan voting pada event ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("is_voting_enabled", !form.is_voting_enabled)}
              className={`transition-colors ${
                form.is_voting_enabled ? "text-yellow-500" : "text-slate-400"
              }`}
            >
              {form.is_voting_enabled ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "create" ? (
                "Buat Event"
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL — Confirm Delete
// ─────────────────────────────────────────────

function ConfirmDeleteModal({
  event,
  onClose,
  onConfirm,
  loading,
}: {
  event: EventReadFull;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm text-center p-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="font-bold text-lg text-slate-900 mb-1">Hapus Event?</h2>
        <p className="text-sm text-slate-500 mb-1">
          Event <span className="font-bold text-slate-800">{event.title}</span>{" "}
          akan dinonaktifkan.
        </p>
        <p className="text-xs text-slate-400 mb-6 font-mono">{event.slug}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Ya, Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EVENT ROW
// ─────────────────────────────────────────────

function EventRow({
  event,
  idx,
  toggleLoading,
  onEdit,
  onDelete,
  onTogglePg,
  onToggleVoting,
  onToggleActive,
}: {
  event: EventReadFull;
  idx: number;
  toggleLoading: Record<string, boolean>;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePg: () => void;
  onToggleVoting: () => void;
  onToggleActive: () => void;
}) {
  return (
    <tr
      className={`group border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
      }`}
    >
      {/* Event info */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {event.profil_url ? (
            <img
              src={event.profil_url}
              alt={event.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">
              {event.title}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">{event.slug}</p>
            <p className="text-[11px] text-slate-500">{event.organizer}</p>
          </div>
        </div>
      </td>

      {/* Dates */}
      <td className="px-4 py-3">
        <div className="text-xs text-slate-600 space-y-0.5">
          <p>{formatDate(event.event_date_start)}</p>
          <p className="text-slate-400">→ {formatDate(event.event_date_end)}</p>
        </div>
      </td>

      {/* Categories count */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-slate-700">
            {event.categories.length}
          </span>
          <span className="text-[10px] text-slate-400">kategori</span>
          {event.categories.length > 0 && (
            <p className="text-[10px] text-slate-400 line-clamp-1">
              {event.categories
                .slice(0, 2)
                .map((c) => c.name)
                .join(", ")}
              {event.categories.length > 2 &&
                ` +${event.categories.length - 2}`}
            </p>
          )}
        </div>
      </td>

      {/* Feature toggles */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <TogglePill
            active={event.is_active ?? false}
            loading={!!toggleLoading[`active-${event.id}`]}
            label="Publik"
            icon={
              (event.is_active ?? false) ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )
            }
            onToggle={onToggleActive}
            activeColor="bg-green-100 text-green-700 border-green-200"
          />
          <TogglePill
            active={event.is_pg_enabled ?? false}
            loading={!!toggleLoading[`pg-${event.id}`]}
            label="PG"
            icon={<CreditCard className="w-3 h-3" />}
            onToggle={onTogglePg}
            activeColor="bg-blue-100 text-blue-700 border-blue-200"
          />
          <TogglePill
            active={event.is_voting_enabled ?? false}
            loading={!!toggleLoading[`voting-${event.id}`]}
            label="Voting"
            icon={<Trophy className="w-3 h-3" />}
            onToggle={onToggleVoting}
            activeColor="bg-yellow-100 text-yellow-700 border-yellow-200"
          />
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* View detail */}
          <Link
            href={`/super-admin/events/${event.id}`}
            title="Kelola Detail"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-900 hover:bg-red-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Edit */}
          <button
            onClick={onEdit}
            title="Edit Event"
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            title="Hapus Event"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// MAIN VIEW
// ─────────────────────────────────────────────

export function EventsView() {
  const [events, setEvents] = useState<EventReadFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<EventReadFull | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventReadFull | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<Record<string, boolean>>(
    {},
  );

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastRef = useRef(0);

  function addToast(type: "success" | "error", message: string) {
    const id = ++toastRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminEvents({
        skip: page * limit,
        limit,
        search: search || undefined,
        is_active:
          activeFilter === "true"
            ? true
            : activeFilter === "false"
              ? false
              : undefined,
      });
      setEvents(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setPage(0);
  }, [search, activeFilter]);

  async function handleToggle(
    eventId: string,
    type: "pg" | "voting" | "active",
  ) {
    const key = `${type}-${eventId}`;
    setToggleLoading((prev) => ({ ...prev, [key]: true }));
    try {
      // Find current event to get current toggle state
      const currentEvent = events.find((e) => e.id === eventId);
      if (!currentEvent) return;

      let res;
      if (type === "pg") {
        const newState = !(currentEvent.is_pg_enabled ?? false);
        res = await toggleEventPg(eventId, newState);
      } else if (type === "voting") {
        const newState = !(currentEvent.is_voting_enabled ?? false);
        res = await toggleEventVoting(eventId, newState);
      } else {
        const newState = !(currentEvent.is_active ?? false);
        res = await toggleEventActive(eventId, newState);
      }

      // Check if response is an event object (has id) or just a message
      if ("id" in res) {
        // Response is full event object - update local state
        setEvents((prev) =>
          prev.map((ev) => {
            if (ev.id !== eventId) return ev;
            return {
              ...ev,
              is_pg_enabled:
                type === "pg"
                  ? (res.is_pg_enabled ?? ev.is_pg_enabled)
                  : ev.is_pg_enabled,
              is_voting_enabled:
                type === "voting"
                  ? (res.is_voting_enabled ?? ev.is_voting_enabled)
                  : ev.is_voting_enabled,
              is_active:
                type === "active"
                  ? (res.is_active ?? ev.is_active)
                  : ev.is_active,
            };
          }),
        );
      } else {
        // Response is { message: string } only - refetch to get updated state
        await fetchEvents();
      }
      addToast("success", "Status berhasil diperbarui.");
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Gagal mengubah status.",
      );
    } finally {
      setToggleLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((ev) => ev.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      addToast("success", `Event "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Gagal menghapus event.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCreateSuccess(ev: EventReadFull) {
    setEvents((prev) => [ev, ...prev]);
    setTotal((prev) => prev + 1);
    setShowCreate(false);
    addToast("success", `Event "${ev.title}" berhasil dibuat.`);
  }

  function handleEditSuccess(ev: EventReadFull) {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)));
    setEditTarget(null);
    addToast("success", `Event "${ev.title}" berhasil diperbarui.`);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <ToastList toasts={toasts} onRemove={removeToast} />

      {showCreate && (
        <EventFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editTarget && (
        <EventFormModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          event={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-red-900" />
              Manajemen Event
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total.toLocaleString("id-ID")} event terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchEvents()}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Event
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul atau slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-slate-50"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) =>
              setActiveFilter(e.target.value as typeof activeFilter)
            }
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium flex-1">{error}</p>
            <button
              onClick={() => fetchEvents()}
              className="text-red-700 hover:text-red-900 text-xs font-bold underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Fitur
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 animate-pulse"
                    >
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CalendarDays className="w-10 h-10 text-slate-300" />
                        <p className="text-slate-400 font-medium">
                          Tidak ada event ditemukan.
                        </p>
                        {(search || activeFilter) && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setActiveFilter("");
                            }}
                            className="text-xs text-red-900 font-bold hover:underline"
                          >
                            Reset filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <EventRow
                      key={ev.id}
                      event={ev}
                      idx={idx}
                      toggleLoading={toggleLoading}
                      onEdit={() => setEditTarget(ev)}
                      onDelete={() => setDeleteTarget(ev)}
                      onTogglePg={() => handleToggle(ev.id, "pg")}
                      onToggleVoting={() => handleToggle(ev.id, "voting")}
                      onToggleActive={() => handleToggle(ev.id, "active")}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-slate-700">
                  {page * limit + 1}–{Math.min((page + 1) * limit, total)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">
                  {total.toLocaleString("id-ID")}
                </span>{" "}
                event
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xs font-bold text-slate-600">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
