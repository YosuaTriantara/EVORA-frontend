"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Upload,
  Users,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getMyTeams,
  getTeamMembers,
  addTeamMember,
  uploadPaymentProof,
  updateTeamInfo,
} from "@/services/registration-service";
import type { MyTeam, TeamMember } from "@/types/event";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useDashboard } from "@/context/dashboard-context";

// Safe hook that returns null if provider not available
function useDashboardSafe() {
  try {
    return useDashboard();
  } catch {
    return { setMobileDrawerOpen: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<MyTeam["status"], string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PENDING_VERIFICATION: "bg-blue-100 text-blue-800",
  REGISTERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISQUALIFIED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<MyTeam["status"], string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PENDING_VERIFICATION: "Menunggu Verifikasi",
  REGISTERED: "Terdaftar",
  CANCELLED: "Dibatalkan",
  DISQUALIFIED: "Didiskualifikasi",
  REJECTED: "Ditolak",
};

const STATUS_ICON: Record<MyTeam["status"], React.ReactNode> = {
  PENDING_PAYMENT: <Clock className="w-3 h-3" />,
  PENDING_VERIFICATION: <Clock className="w-3 h-3" />,
  REGISTERED: <CheckCircle className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
  DISQUALIFIED: <XCircle className="w-3 h-3" />,
  REJECTED: <XCircle className="w-3 h-3" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload Proof Modal
// ─────────────────────────────────────────────────────────────────────────────

interface UploadProofModalProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadProofModal({
  teamId,
  teamName,
  open,
  onClose,
  onSuccess,
}: UploadProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (loading) return;
    setFile(null);
    setError(null);
    onClose();
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await uploadPaymentProof(teamId, file);
      setFile(null);
      onSuccess();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah bukti bayar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-500">
            Tim: <span className="font-semibold text-slate-700">{teamName}</span>
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              File Bukti Bayar *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-300 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                id="proof-file-input"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setError(null);
                }}
                disabled={loading}
              />
              <label
                htmlFor="proof-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                {file ? (
                  <span className="text-sm font-medium text-slate-700 break-all">
                    {file.name}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">
                    Klik untuk pilih file (gambar / PDF)
                  </span>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-red-900 hover:bg-red-800 text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Member Modal
// ─────────────────────────────────────────────────────────────────────────────

interface AddMemberModalProps {
  teamId: string;
  teamName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddMemberModal({
  teamId,
  teamName,
  open,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (loading) return;
    setName("");
    setRole("");
    setIdentityNumber("");
    setEmail("");
    setPhone("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await addTeamMember(teamId, {
        name: name.trim(),
        role: role.trim(),
        ...(identityNumber.trim() && { identity_number: identityNumber.trim() }),
        ...((email.trim() || phone.trim()) && {
          extra_data: {
            ...(email.trim() && { email: email.trim() }),
            ...(phone.trim() && { phone: phone.trim() }),
          },
        }),
      });
      onSuccess();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menambahkan anggota.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Tim</DialogTitle>
          <DialogDescription>
            Isi informasi anggota tim yang akan ditambahkan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-sm text-slate-500">
            Tim: <span className="font-semibold text-slate-700">{teamName}</span>
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nama *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap anggota"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Peran / Posisi *
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Ketua, Anggota, Cadangan"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nomor Identitas
              </label>
              <Input
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="NIM / NIK / No. KTP"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  No. HP
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !role.trim() || loading}
              className="bg-red-900 hover:bg-red-800 text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Members List (inline toggle)
// ─────────────────────────────────────────────────────────────────────────────

interface MembersListProps {
  teamId: string;
  refreshKey: number;
}

function MembersList({ teamId, refreshKey }: MembersListProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTeamMembers(teamId)
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Gagal memuat anggota.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Memuat anggota…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm m-4">
        {error}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        Belum ada anggota terdaftar.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {members.map((member, index) => (
        <div
          key={member.id}
          className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800 text-sm">
                {member.name}
              </p>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {member.role}
              </span>
            </div>
            {member.identity_number && (
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {member.identity_number}
              </p>
            )}
            {(member.extra_data?.email || member.extra_data?.phone) && (
              <p className="text-xs text-slate-400 mt-0.5">
                {[member.extra_data.email, member.extra_data.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Card
// ─────────────────────────────────────────────────────────────────────────────

interface TeamCardProps {
  team: MyTeam;
  onUploadSuccess: () => void;
}

function TeamCard({ team, onUploadSuccess }: TeamCardProps) {
  const [showMembers, setShowMembers] = useState(false);
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState(team.name);
  const [editInstitution, setEditInstitution] = useState(team.institution ?? "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const canManageMembers =
    team.status !== "CANCELLED" && team.status !== "DISQUALIFIED";

  function handleMemberAdded() {
    setMembersRefreshKey((k) => k + 1);
    if (!showMembers) setShowMembers(true);
  }

  async function handleSaveEdit() {
    setEditLoading(true);
    setEditError(null);
    try {
      await updateTeamInfo(
        team.id,
        editTeamName.trim() !== team.name ? editTeamName.trim() : undefined,
        editInstitution.trim(),
      );
      onUploadSuccess(); // Re-use the existing refresh callback
      setEditOpen(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Gagal menyimpan perubahan.");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base truncate">
                {team.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_BADGE[team.status]
                }`}
              >
                {STATUS_ICON[team.status]}
                {STATUS_LABEL[team.status]}
              </span>
            </div>
            {team.lot_number !== null && (
              <p className="text-xs text-slate-400 mt-1">
                Nomor Lot:{" "}
                <span className="font-bold text-slate-600 font-mono">
                  #{team.lot_number}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Rejection notice for REJECTED status */}
        {team.status === "REJECTED" && (
          <div className="mx-5 mb-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-semibold text-red-700">Pembayaran Ditolak</p>
            <p className="text-xs text-red-600 mt-0.5">
              Silakan upload ulang bukti pembayaran yang valid.
            </p>
          </div>
        )}

        {/* Admin note for PENDING_PAYMENT with admin_note */}
        {team.status === "PENDING_PAYMENT" && team.admin_note && (
          <div className="mx-5 mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-700">Catatan dari Organizer:</p>
            <p className="text-xs text-amber-600 mt-0.5">{team.admin_note}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {(team.status === "PENDING_PAYMENT" || team.status === "REJECTED") && (
            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className={
                team.status === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs"
              }
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {team.status === "REJECTED" ? "Upload Ulang Bukti Bayar" : "Upload Bukti Bayar"}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMembers((v) => !v)}
            className="text-xs font-semibold"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {showMembers ? "Sembunyikan Anggota" : "Lihat/Kelola Anggota"}
          </Button>

          {canManageMembers && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddMemberOpen(true)}
              className="text-xs font-semibold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tambah Anggota
            </Button>
          )}

          {canManageMembers && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditTeamName(team.name);
                setEditInstitution(team.institution ?? "");
                setEditOpen(true);
              }}
              className="text-xs font-semibold text-slate-700"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit Tim
            </Button>
          )}
        </div>

        {/* Members panel (inline) */}
        {showMembers && (
          <div className="border-t border-slate-100">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Daftar Anggota
              </h4>
            </div>
            <MembersList
              teamId={team.id}
              refreshKey={membersRefreshKey}
            />
          </div>
        )}
      </div>

      {/* Upload Proof Modal */}
      <UploadProofModal
        teamId={team.id}
        teamName={team.name}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={onUploadSuccess}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        teamId={team.id}
        teamName={team.name}
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={handleMemberAdded}
      />

      {/* Edit Team Modal */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open && !editLoading) setEditOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Edit Informasi Tim</DialogTitle>
            <DialogDescription>
              Ubah nama tim dan asal institusi jika diperlukan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nama Tim *
              </label>
              <Input
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                placeholder="Nama tim"
                disabled={editLoading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Asal Institusi
              </label>
              <Input
                value={editInstitution}
                onChange={(e) => setEditInstitution(e.target.value)}
                placeholder="Nama sekolah / universitas"
                disabled={editLoading}
              />
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                {editError}
              </div>
            )}
            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editTeamName.trim() || editLoading}
                className="bg-red-900 hover:bg-red-800 text-white font-bold"
              >
                {editLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan…</>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface OfficialTeamViewProps {
  eventId: string;
}

export function OfficialTeamView({ eventId }: OfficialTeamViewProps) {
  const dashboard = useDashboardSafe();
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTeams() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyTeams(eventId);
      setTeams(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat tim.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader
        title="Tim Saya"
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => dashboard.setMobileDrawerOpen?.(true)} />}
        onBackClick={() => window.location.href = "/dashboard"}
        className="lg:hidden"
      />

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Back link (hidden on mobile, visible on desktop) */}
        <Link
          href="/dashboard"
          className="hidden lg:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tim Saya di Event Ini
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola tim, anggota, dan pembayaran pendaftaran Anda.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Memuat data tim…</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <XCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={loadTeams}
              className="text-red-700 border-red-200 hover:bg-red-50"
            >
              Coba Lagi
            </Button>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">
              Anda belum mendaftarkan tim di event ini.
            </p>
            <Link
              href="/events"
              className="inline-block mt-1 text-sm text-red-800 hover:text-red-700 font-semibold underline underline-offset-2"
            >
              Lihat daftar event →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onUploadSuccess={loadTeams}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
