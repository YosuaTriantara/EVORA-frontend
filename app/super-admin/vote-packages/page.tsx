"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, RefreshCw, Search, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { useToast } from "@/components/dashboard/ui-components/feedback-toast";
import {
  getVotePackages,
  createVotePackage,
  updateVotePackage,
  deleteVotePackage,
  type VotePackage,
  type CreateVotePackageRequest,
} from "@/services/super-admin/sa-voting-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SuperAdminVotePackagesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VotePackage | null>(null);
  const [formData, setFormData] = useState<CreateVotePackageRequest>({
    name: "",
    points_amount: 0,
    price_idr: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getVotePackages({ limit: 100 });
      setPackages(result.data);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal memuat paket voting");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleCreate = async () => {
    if (!formData.name || formData.points_amount <= 0 || formData.price_idr < 0) {
      addToast("error", "Semua field wajib diisi dengan benar");
      return;
    }

    setSubmitting(true);
    try {
      await createVotePackage(formData);
      addToast("success", "Paket voting berhasil dibuat");
      setIsCreateDialogOpen(false);
      setFormData({ name: "", points_amount: 0, price_idr: 0, is_active: true });
      loadPackages();
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal membuat paket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPackage) return;

    setSubmitting(true);
    try {
      await updateVotePackage(selectedPackage.id, {
        name: formData.name,
        points_amount: formData.points_amount,
        price_idr: formData.price_idr,
        is_active: formData.is_active,
      });
      addToast("success", "Paket voting berhasil diperbarui");
      setIsEditDialogOpen(false);
      setSelectedPackage(null);
      loadPackages();
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal memperbarui paket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPackage) return;

    setSubmitting(true);
    try {
      await deleteVotePackage(selectedPackage.id);
      addToast("success", "Paket voting berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setSelectedPackage(null);
      loadPackages();
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Gagal menghapus paket");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (pkg: VotePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      points_amount: pkg.points_amount,
      price_idr: pkg.price_idr,
      is_active: pkg.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (pkg: VotePackage) => {
    setSelectedPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: packages.length,
    active: packages.filter((p) => p.is_active).length,
    inactive: packages.filter((p) => !p.is_active).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paket Voting</h1>
          <p className="text-slate-500">Kelola paket pembelian voting</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Paket
          </Button>
          <Button variant="outline" onClick={loadPackages} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Nonaktif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-400">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari paket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Table */}
      {loading ? (
        <DataTableSkeleton rows={5} columns={5} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Poin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Harga</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada paket voting
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium">{pkg.name}</td>
                      <td className="px-4 py-3 text-sm">{pkg.points_amount.toLocaleString("id-ID")} poin</td>
                      <td className="px-4 py-3 text-sm">
                        Rp {pkg.price_idr.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={pkg.is_active 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                        }>
                          {pkg.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(pkg)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => openDeleteDialog(pkg)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Paket Voting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Paket</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Paket 100 Poin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Jumlah Poin</Label>
              <Input
                id="points"
                type="number"
                value={formData.points_amount}
                onChange={(e) => setFormData({ ...formData, points_amount: parseInt(e.target.value) || 0 })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga (IDR)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_idr}
                onChange={(e) => setFormData({ ...formData, price_idr: parseInt(e.target.value) || 0 })}
                placeholder="50000"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paket Voting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Paket</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-points">Jumlah Poin</Label>
              <Input
                id="edit-points"
                type="number"
                value={formData.points_amount}
                onChange={(e) => setFormData({ ...formData, points_amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Harga (IDR)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price_idr}
                onChange={(e) => setFormData({ ...formData, price_idr: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-is_active" className="cursor-pointer">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Paket Voting</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Apakah Anda yakin ingin menghapus paket <strong>{selectedPackage?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
