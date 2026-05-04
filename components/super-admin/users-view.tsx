"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  ShieldCheck,
  User,
  CheckCircle2,
  XCircle,
  KeyRound,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/services/super-admin-service";
import type {
  UserRead,
  SuperAdminUserRole,
  UserRole,
} from "@/types/admin";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role === "SUPER_ADMIN";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
        isAdmin ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {isAdmin ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <User className="w-3 h-3" />
      )}
      {isAdmin ? "Super Admin" : "User"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      <XCircle className="w-3 h-3" />
      Nonaktif
    </span>
  );
}

// ─────────────────────────────────────────────
// NOTIFICATION TOAST
// ─────────────────────────────────────────────

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

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
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto animate-in slide-in-from-right-4 duration-300 ${
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
// MODAL — Create / Edit
// ─────────────────────────────────────────────

interface UserModalProps {
  mode: "create" | "edit";
  initial?: UserRead | null;
  onClose: () => void;
  onSuccess: (user: UserRead) => void;
}

function UserModal({ mode, initial, onClose, onSuccess }: UserModalProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SuperAdminUserRole>(
    (initial?.role as SuperAdminUserRole) ?? "USER"
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [pointBalance, setPointBalance] = useState<number>(
    initial?.point_balance ?? 0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result: UserRead;

      if (mode === "create") {
        const payload: CreateUserPayload = {
          email,
          password,
          full_name: fullName,
          role,
          is_active: isActive,
        };
        result = await createUser(payload);
      } else {
        const payload: UpdateUserPayload = {
          full_name: fullName,
          role,
          is_active: isActive,
          point_balance: pointBalance,
        };
        result = await updateUser(initial!.id, payload);
      }

      onSuccess(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {mode === "create" ? (
              <Plus className="w-4 h-4 text-red-900" />
            ) : (
              <Pencil className="w-4 h-4 text-red-900" />
            )}
            <h2 className="font-bold text-slate-900 text-base">
              {mode === "create" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
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

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Budi Santoso"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@evora.id"
              disabled={mode === "edit"}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
            />
            {mode === "edit" && (
              <p className="text-[10px] text-slate-400">
                Email tidak bisa diubah.
              </p>
            )}
          </div>

          {/* Password (create only) */}
          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as SuperAdminUserRole)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            >
              <option value="USER">USER</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>

          {/* Point Balance (edit only) */}
          {mode === "edit" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Saldo Poin
              </label>
              <input
                type="number"
                min={0}
                value={pointBalance}
                onChange={(e) => setPointBalance(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Status Aktif
              </p>
              <p className="text-[11px] text-slate-400">
                Akun yang nonaktif tidak bisa login.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`transition-colors ${
                isActive ? "text-green-600" : "text-slate-400"
              }`}
            >
              {isActive ? (
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
                "Buat Pengguna"
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
  user,
  onClose,
  onConfirm,
  loading,
}: {
  user: UserRead;
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
        <h2 className="font-bold text-lg text-slate-900 mb-1">
          Hapus Pengguna?
        </h2>
        <p className="text-sm text-slate-500 mb-1">
          Akun{" "}
          <span className="font-bold text-slate-800">{user.full_name}</span>{" "}
          akan di-soft-delete.
        </p>
        <p className="text-xs text-slate-400 mb-6">({user.email})</p>
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
// MAIN VIEW
// ─────────────────────────────────────────────

export function UsersView() {
  const [users, setUsers] = useState<UserRead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "SUPER_ADMIN" | "USER">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRead | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = { current: 0 };

  function addToast(type: "success" | "error", message: string) {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({
        skip: page * limit,
        limit,
        search: search || undefined,
        role: roleFilter || undefined,
        is_active:
          activeFilter === "true"
            ? true
            : activeFilter === "false"
              ? false
              : undefined,
      });
      setUsers(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pengguna.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, activeFilter]);

  async function handleToggleActive(user: UserRead) {
    setToggleLoading(user.id);
    try {
      const updated = await updateUser(user.id, { is_active: !user.is_active });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addToast(
        "success",
        `${updated.full_name} sekarang ${updated.is_active ? "Aktif" : "Nonaktif"}.`,
      );
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Gagal mengubah status.",
      );
    } finally {
      setToggleLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      addToast(
        "success",
        `Pengguna "${deleteTarget.full_name}" berhasil dihapus.`,
      );
      setDeleteTarget(null);
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Gagal menghapus pengguna.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCreateSuccess(user: UserRead) {
    setUsers((prev) => [user, ...prev]);
    setTotal((prev) => prev + 1);
    setShowCreate(false);
    addToast("success", `Pengguna "${user.full_name}" berhasil dibuat.`);
  }

  function handleEditSuccess(user: UserRead) {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    setEditTarget(null);
    addToast("success", `Pengguna "${user.full_name}" berhasil diperbarui.`);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <ToastList toasts={toasts} onRemove={removeToast} />

      {/* Modals */}
      {showCreate && (
        <UserModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {editTarget && (
        <UserModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          user={deleteTarget}
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
              <Users className="w-6 h-6 text-red-900" />
              Manajemen Pengguna
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total.toLocaleString("id-ID")} pengguna terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers()}
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
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors bg-slate-50"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          >
            <option value="">Semua Role</option>
            <option value="USER">USER</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>

          {/* Active filter */}
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
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchUsers()}
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
                    Pengguna
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Saldo Poin
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 animate-pulse"
                    >
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 text-slate-300" />
                        <p className="text-slate-400 font-medium">
                          Tidak ada pengguna ditemukan.
                        </p>
                        {(search || roleFilter || activeFilter) && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setRoleFilter("");
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
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } ${user.deleted_at ? "opacity-50" : ""}`}
                    >
                      {/* User info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold text-xs shrink-0">
                            {user.full_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-tight">
                              {user.full_name || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge active={user.is_active} />
                      </td>

                      {/* Point Balance */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-slate-700">
                          {user.point_balance.toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={
                              toggleLoading === user.id || !!user.deleted_at
                            }
                            title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                              user.is_active
                                ? "text-green-600 hover:bg-green-50"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {toggleLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.is_active ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditTarget(user)}
                            disabled={!!user.deleted_at}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={
                              !!user.deleted_at || user.role === "SUPER_ADMIN"
                            }
                            title={
                              user.role === "SUPER_ADMIN"
                                ? "Tidak bisa hapus Super Admin"
                                : "Hapus"
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
                pengguna
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
