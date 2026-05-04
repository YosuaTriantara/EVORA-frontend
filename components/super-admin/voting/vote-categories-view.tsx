"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVoteCategories,
  createVoteCategory,
  updateVoteCategory,
  deleteVoteCategory,
  type VoteCategory,
  type CreateVoteCategoryRequest,
  type UpdateVoteCategoryRequest,
} from "@/services/super-admin/sa-voting-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Pencil, Trash2, Plus, Folder, Users } from "lucide-react";

interface VoteCategoriesViewProps {
  eventId: string;
}

export function VoteCategoriesView({ eventId }: VoteCategoriesViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VoteCategory | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vote-categories", eventId],
    queryFn: () => getVoteCategories(eventId, { limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVoteCategoryRequest) => createVoteCategory(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-categories", eventId] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVoteCategoryRequest }) =>
      updateVoteCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-categories", eventId] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVoteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-categories", eventId] });
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
        <p className="text-red-600">Gagal memuat kategori voting: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Kategori Voting</h3>
          <p className="text-slate-500 mt-1">
            Kelola kategori voting untuk event ini
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Voting Baru</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Kategori"
          value={data?.data.length || 0}
          icon={<Folder className="w-5 h-5" />}
        />
        <StatCard
          label="Kategori Aktif"
          value={data?.data.filter((c) => c.is_active).length || 0}
          icon={<Folder className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="Total Kandidat"
          value={data?.data.reduce((sum, c) => sum + (c.candidate_count || 0), 0) || 0}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* Categories Table */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Kandidat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {category.description || "-"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    {category.candidate_count || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      category.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {category.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus kategori ini? Semua kandidat dalam kategori ini juga akan terhapus.")) {
                          deleteMutation.mutate(category.id);
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

        {data?.data.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Belum ada kategori voting. Klik "Tambah Kategori" untuk membuat.
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori Voting</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              defaultValues={{
                name: editingCategory.name,
                description: editingCategory.description || "",
                is_active: editingCategory.is_active,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({
                  id: editingCategory.id,
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

function CategoryForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: CreateVoteCategoryRequest;
  onSubmit: (data: CreateVoteCategoryRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateVoteCategoryRequest>(
    defaultValues || {
      name: "",
      description: "",
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
        <Label htmlFor="name">Nama Kategori</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Favorite Team"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Deskripsi (Opsional)</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Deskripsi kategori voting..."
          rows={3}
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
          Kategori aktif (bisa dipilih untuk voting)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : defaultValues ? "Simpan Perubahan" : "Tambah Kategori"}
      </Button>
    </form>
  );
}
