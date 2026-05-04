"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter,
  Edit3,
  Check,
  Hash,
} from "lucide-react";
import { updateTeamStatus, updateTeamLot } from "@/services/event-management/teams-service";
import type { TeamReadFull, TeamStatus } from "@/lib/validation/schemas/team.schema";
import type { CategoryRead } from "@/types/admin";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useEventContext } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Toast types
interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

let toastId = 0;

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
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-xs ${
            t.type === "success"
              ? "bg-white border-green-200 text-green-800"
              : "bg-white border-red-200 text-red-700"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

const STATUS_LABELS: Record<TeamStatus, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PENDING_VERIFICATION: "Menunggu Verifikasi",
  REGISTERED: "Terdaftar",
  CANCELLED: "Dibatalkan",
  DISQUALIFIED: "Didiskualifikasi",
  REJECTED: "Ditolak",
};

const STATUS_COLORS: Record<TeamStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_PAYMENT: "secondary",
  PENDING_VERIFICATION: "default",
  REGISTERED: "default",
  CANCELLED: "outline",
  DISQUALIFIED: "destructive",
  REJECTED: "destructive",
};

const ALL_STATUSES: TeamStatus[] = [
  "PENDING_PAYMENT",
  "PENDING_VERIFICATION",
  "REGISTERED",
  "CANCELLED",
  "DISQUALIFIED",
  "REJECTED",
];

interface TeamsClientViewProps {
  eventId: string;
  initialTeams: TeamReadFull[];
  initialCategories: CategoryRead[];
  totalTeams: number;
}

export function TeamsClientView({
  eventId,
  initialTeams,
  initialCategories,
  totalTeams,
}: TeamsClientViewProps) {
  const { event: currentEvent } = useEventContext();

  const [teams, setTeams] = useState<TeamReadFull[]>(initialTeams);
  const [categories] = useState<CategoryRead[]>(initialCategories);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TeamStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Dialog states
  const [editingTeam, setEditingTeam] = useState<TeamReadFull | null>(null);

  // Form states
  const [newStatus, setNewStatus] = useState<TeamStatus>("REGISTERED");
  const [newLotNumber, setNewLotNumber] = useState("");
  const [updating, setUpdating] = useState(false);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filter teams client-side
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      searchQuery === "" ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || team.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || team.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handlers
  const handleUpdateStatus = async () => {
    if (!editingTeam) return;
    try {
      setUpdating(true);
      const result = await updateTeamStatus(editingTeam.id, { status: newStatus });
      
      // Update local state
      setTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeam.id ? { ...t, status: result.new_status } : t
        )
      );
      
      addToast("success", "Status tim berhasil diperbarui");
      setEditingTeam(null);
    } catch (err) {
      addToast("error", "Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateLot = async () => {
    if (!editingTeam || !newLotNumber) return;
    try {
      setUpdating(true);
      const result = await updateTeamLot(editingTeam.id, { lot_number: parseInt(newLotNumber) });
      
      // Update local state
      setTeams((prev) =>
        prev.map((t) =>
          t.id === editingTeam.id ? { ...t, lot_number: result.lot_number } : t
        )
      );
      
      addToast("success", "Nomor undian berhasil diperbarui");
      setEditingTeam(null);
      setNewLotNumber("");
    } catch (err) {
      addToast("error", "Gagal memperbarui nomor undian");
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (team: TeamReadFull) => {
    setEditingTeam(team);
    setNewStatus(team.status);
    setNewLotNumber(team.lot_number?.toString() || "");
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastList toasts={toasts} remove={removeToast} />

      {/* Mobile Header */}
      <MobileHeader
        title={currentEvent?.title || "Tim"}
        showMenuToggle={true}
        menuToggle={<SidebarMobileTrigger />}
      />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Manajemen Tim
            </h1>
            <p className="text-gray-500 mt-1">
              {totalTeams} tim terdaftar • {filteredTeams.length} ditampilkan
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari nama tim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TeamStatus | "ALL")}
                    className="h-10 pl-10 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ALL">Semua Status</option>
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 pl-10 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tim</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTeams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada tim yang sesuai filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Tim</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>No. Undian</TableHead>
                      <TableHead>Anggota</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell>
                          <p className="font-medium">{team.name}</p>
                        </TableCell>
                        <TableCell>{getCategoryName(team.category_id)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_COLORS[team.status]}>
                            {STATUS_LABELS[team.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {team.lot_number ? (
                            <span className="flex items-center gap-1">
                              <Hash className="w-4 h-4" />
                              {team.lot_number}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{team.members.length} anggota</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(team)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Team Dialog */}
      <Dialog
        open={!!editingTeam}
        onOpenChange={(open) => !open && setEditingTeam(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tim</DialogTitle>
            <DialogDescription>{editingTeam?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Status Pendaftaran</Label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TeamStatus)}
                className="mt-2 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Nomor Undian</Label>
              <Input
                type="number"
                value={newLotNumber}
                onChange={(e) => setNewLotNumber(e.target.value)}
                placeholder="Contoh: 1"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingTeam(null)}
              disabled={updating}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === editingTeam?.status}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Update Status
            </Button>
            <Button
              onClick={handleUpdateLot}
              disabled={updating || !newLotNumber}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
              Update Undian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
