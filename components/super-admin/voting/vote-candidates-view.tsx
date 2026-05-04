"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVoteCandidates,
  createVoteCandidate,
  updateVoteCandidate,
  deleteVoteCandidate,
  type VoteCandidate,
  type CreateVoteCandidateRequest,
  type UpdateVoteCandidateRequest,
} from "@/services/super-admin/sa-voting-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, User, Trophy, ArrowUp, ArrowDown } from "lucide-react";

interface VoteCandidatesViewProps {
  categoryId: string;
  categoryName: string;
}

export function VoteCandidatesView({ categoryId, categoryName }: VoteCandidatesViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<VoteCandidate | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vote-candidates", categoryId],
    queryFn: () => getVoteCandidates(categoryId, { limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVoteCandidateRequest) => createVoteCandidate(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-candidates", categoryId] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVoteCandidateRequest }) =>
      updateVoteCandidate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-candidates", categoryId] });
      setEditingCandidate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVoteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-candidates", categoryId] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-100 rounded animate-pulse w-48" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Gagal memuat kandidat: {error.message}</p>
      </div>
    );
  }

  const sortedCandidates = data?.data.sort((a, b) => a.display_order - b.display_order) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Kandidat: {categoryName}</h3>
          <p className="text-slate-500 mt-1">
            Kelola kandidat yang dapat dipilih dalam kategori ini
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Kandidat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kandidat Baru</DialogTitle>
            </DialogHeader>
            <CandidateForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Kandidat"
          value={data?.data.length || 0}
          icon={<User className="w-5 h-5" />}
        />
        <StatCard
          label="Kandidat Aktif"
          value={data?.data.filter((c) => c.is_active !== false).length || 0}
          icon={<User className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="Total Votes"
          value={data?.data.reduce((sum, c) => sum + (c.total_votes || 0), 0).toLocaleString() || "0"}
          icon={<Trophy className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Candidates Table */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Nama Kandidat</TableHead>
              <TableHead>Team ID</TableHead>
              <TableHead>Total Votes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate, index) => (
              <TableRow key={candidate.id}>
                <TableCell className="font-medium text-slate-500">
                  #{candidate.display_order}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {candidate.image_url ? (
                      <img
                        src={candidate.image_url}
                        alt={candidate.candidate_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    {candidate.candidate_name}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-500">
                  {candidate.team_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    {(candidate.total_votes || 0).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      candidate.is_active !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {candidate.is_active !== false ? "Aktif" : "Nonaktif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCandidate(candidate)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus kandidat ini?")) {
                          deleteMutation.mutate(candidate.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {sortedCandidates.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Belum ada kandidat. Klik "Tambah Kandidat" untuk membuat.
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCandidate} onOpenChange={() => setEditingCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kandidat</DialogTitle>
          </DialogHeader>
          {editingCandidate && (
            <CandidateForm
              defaultValues={{
                team_id: editingCandidate.team_id,
                candidate_name: editingCandidate.candidate_name,
                image_url: editingCandidate.image_url || "",
                display_order: editingCandidate.display_order,
                is_active: editingCandidate.is_active !== false,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({
                  id: editingCandidate.id,
                  payload: data,
                })
              }
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
      <div className="p-3 bg-slate-100 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function CandidateForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: CreateVoteCandidateRequest & { is_active?: boolean };
  onSubmit: (data: CreateVoteCandidateRequest & { is_active?: boolean }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateVoteCandidateRequest & { is_active?: boolean }>(
    defaultValues || {
      team_id: "",
      candidate_name: "",
      image_url: "",
      display_order: 1,
      is_active: true,
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="candidate_name">Nama Kandidat</Label>
        <Input
          id="candidate_name"
          value={formData.candidate_name}
          onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
          placeholder="Contoh: Tim Alpha"
          required
        />
      </div>

      <div>
        <Label htmlFor="team_id">Team ID</Label>
        <Input
          id="team_id"
          value={formData.team_id}
          onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
          placeholder="UUID team yang terdaftar"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Masukkan UUID team yang sudah terdaftar di event ini
        </p>
      </div>

      <div>
        <Label htmlFor="image_url">URL Gambar (Opsional)</Label>
        <Input
          id="image_url"
          value={formData.image_url || ""}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <Label htmlFor="display_order">Urutan Tampilan</Label>
        <Input
          id="display_order"
          type="number"
          min={1}
          value={formData.display_order}
          onChange={(e) =>
            setFormData({ ...formData, display_order: parseInt(e.target.value) })
          }
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
          className="rounded border-slate-300"
        />
        <Label htmlFor="is_active" className="mb-0">
          Kandidat aktif (bisa dipilih untuk voting)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : defaultValues ? "Simpan Perubahan" : "Tambah Kandidat"}
      </Button>
    </form>
  );
}
