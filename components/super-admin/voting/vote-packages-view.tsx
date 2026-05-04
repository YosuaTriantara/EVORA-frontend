"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVotePackages,
  createVotePackage,
  updateVotePackage,
  deleteVotePackage,
  type VotePackage,
  type CreateVotePackageRequest,
  type UpdateVotePackageRequest,
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
import { Pencil, Trash2, Plus, Package } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function VotePackagesView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VotePackage | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vote-packages"],
    queryFn: () => getVotePackages({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createVotePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-packages"] });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVotePackageRequest }) =>
      updateVotePackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-packages"] });
      setEditingPackage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVotePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vote-packages"] });
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
        <p className="text-red-600">Gagal memuat paket voting: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Paket Voting</h2>
          <p className="text-slate-500 mt-1">
            Kelola paket poin voting untuk seluruh platform
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Paket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Paket Voting Baru</DialogTitle>
            </DialogHeader>
            <PackageForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Paket"
          value={data?.data.length || 0}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Paket Aktif"
          value={data?.data.filter((p) => p.is_active).length || 0}
          icon={<Package className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="Rata-rata Harga"
          value={formatCurrency(
            data?.data.length
              ? data.data.reduce((sum, p) => sum + p.price_idr, 0) / data.data.length
              : 0
          )}
          icon={<Package className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* Packages Table */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Nama Paket</TableHead>
              <TableHead>Poin</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.name}</TableCell>
              <TableCell>{pkg.points_amount.toLocaleString()} poin</TableCell>
                <TableCell>{formatCurrency(pkg.price_idr)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {pkg.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPackage(pkg)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus paket ini?")) {
                          deleteMutation.mutate(pkg.id);
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
            Belum ada paket voting. Klik "Tambah Paket" untuk membuat.
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paket Voting</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <PackageForm
              defaultValues={{
                name: editingPackage.name,
                points_amount: editingPackage.points_amount,
                price_idr: editingPackage.price_idr,
                is_active: editingPackage.is_active,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({
                  id: editingPackage.id,
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

function PackageForm({
  defaultValues,
  onSubmit,
  isLoading,
}: {
  defaultValues?: CreateVotePackageRequest;
  onSubmit: (data: CreateVotePackageRequest) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateVotePackageRequest>(
    defaultValues || {
      name: "",
      points_amount: 100,
      price_idr: 10000,
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
        <Label htmlFor="name">Nama Paket</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Paket Silver"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="points">Jumlah Poin</Label>
          <Input
            id="points"
            type="number"
            min={1}
            value={formData.points_amount}
            onChange={(e) =>
              setFormData({ ...formData, points_amount: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Harga (IDR)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1000}
            value={formData.price_idr}
            onChange={(e) =>
              setFormData({ ...formData, price_idr: parseInt(e.target.value) })
            }
            required
          />
        </div>
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
          Paket aktif (bisa dibeli)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : defaultValues ? "Simpan Perubahan" : "Tambah Paket"}
      </Button>
    </form>
  );
}
