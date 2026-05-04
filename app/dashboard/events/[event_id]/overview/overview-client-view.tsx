"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Tag,
  UserCog,
  Loader2,
  AlertCircle,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import {
  getEventDetails,
  getEventCategories,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  getEventStaff,
  addEventStaff,
  removeEventStaff,
  searchUsers,
} from "@/services/event-management-service";
import type {
  EventReadFull,
  CategoryRead,
  EventStaffReadWithUser,
} from "@/types/admin";
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface OverviewClientViewProps {
  eventId: string;
  initialEvent: EventReadFull;
  initialCategories: CategoryRead[];
  initialStaff: EventStaffReadWithUser[];
}

export function OverviewClientView({
  eventId,
  initialEvent,
  initialCategories,
  initialStaff,
}: OverviewClientViewProps) {
  const { event: currentEvent } = useEventContext();

  const [event, setEvent] = useState<EventReadFull>(initialEvent);
  const [categories, setCategories] = useState<CategoryRead[]>(initialCategories);
  const [staff, setStaff] = useState<EventStaffReadWithUser[]>(initialStaff);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRead | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRead | null>(null);
  const [removingStaff, setRemovingStaff] = useState<EventStaffReadWithUser | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryMaxQuota, setCategoryMaxQuota] = useState("50");
  const [categoryFee, setCategoryFee] = useState("0");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; email: string; full_name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"JUDGE" | "TABULATOR">("JUDGE");
  const [searchingUsers, setSearchingUsers] = useState(false);

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventData, categoriesData, staffData] = await Promise.all([
        getEventDetails(eventId),
        getEventCategories(eventId),
        getEventStaff(eventId),
      ]);
      setEvent(eventData);
      setCategories(categoriesData);
      setStaff(staffData);
    } catch (err) {
      addToast("error", "Gagal memuat data event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId, addToast]);

  // Search users
  const handleSearchUsers = async () => {
    if (!userSearchQuery.trim()) return;
    try {
      setSearchingUsers(true);
      const result = await searchUsers(userSearchQuery, 10);
      setUserSearchResults(result.data);
    } catch (err) {
      addToast("error", "Gagal mencari user");
    } finally {
      setSearchingUsers(false);
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      await createEventCategory(eventId, {
        name: categoryName,
        max_quota: parseInt(categoryMaxQuota) || 50,
        registration_fee: parseInt(categoryFee) || 0,
      });
      addToast("success", "Kategori berhasil dibuat");
      setCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryMaxQuota("50");
      setCategoryFee("0");
      loadData();
    } catch (err) {
      addToast("error", "Gagal membuat kategori");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    try {
      await updateEventCategory(editingCategory.id, {
        name: categoryName,
        max_quota: parseInt(categoryMaxQuota) || editingCategory.max_quota,
        registration_fee: parseInt(categoryFee) || editingCategory.registration_fee,
      });
      addToast("success", "Kategori berhasil diperbarui");
      setEditingCategory(null);
      setCategoryName("");
      setCategoryMaxQuota("50");
      setCategoryFee("0");
      loadData();
    } catch (err) {
      addToast("error", "Gagal memperbarui kategori");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await deleteEventCategory(deletingCategory.id);
      addToast("success", "Kategori berhasil dihapus");
      setDeletingCategory(null);
      loadData();
    } catch (err) {
      addToast("error", "Gagal menghapus kategori");
    }
  };

  // Staff handlers
  const handleAddStaff = async () => {
    if (!selectedUserId) return;
    try {
      await addEventStaff(eventId, {
        user_id: selectedUserId,
        role: selectedRole,
      });
      addToast("success", "Staff berhasil ditambahkan");
      setStaffDialogOpen(false);
      setSelectedUserId("");
      setSelectedRole("JUDGE");
      setUserSearchQuery("");
      setUserSearchResults([]);
      loadData();
    } catch (err) {
      addToast("error", "Gagal menambahkan staff");
    }
  };

  const handleRemoveStaff = async () => {
    if (!removingStaff) return;
    try {
      await removeEventStaff(eventId, removingStaff.id);
      addToast("success", "Staff berhasil dihapus");
      setRemovingStaff(null);
      loadData();
    } catch (err) {
      addToast("error", "Gagal menghapus staff");
    }
  };

  const openEditCategory = (category: CategoryRead) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryMaxQuota(category.max_quota.toString());
    setCategoryFee(category.registration_fee.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastList toasts={toasts} remove={removeToast} />

      {/* Mobile Header */}
      <MobileHeader
        title={currentEvent?.title || "Overview"}
        showMenuToggle={true}
        menuToggle={<SidebarMobileTrigger />}
      />

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        {/* <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div> */}

        {/* Event Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Nama Event</Label>
                <p className="font-medium text-lg">{event?.title}</p>
              </div>
              <div>
                <Label className="text-gray-500">Slug</Label>
                <p className="font-medium">{event?.slug}</p>
              </div>
              <div>
                <Label className="text-gray-500">Tanggal Mulai</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {event?.event_date_start
                    ? new Date(event.event_date_start).toLocaleDateString("id-ID")
                    : "-"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Tanggal Selesai</Label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {event?.event_date_end
                    ? new Date(event.event_date_end).toLocaleDateString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Kategori Lomba ({categories.length})
            </CardTitle>
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Kategori</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="cat-name">Nama Kategori *</Label>
                    <Input
                      id="cat-name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Contoh: Solo Vocal"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cat-quota">Max Quota</Label>
                      <Input
                        id="cat-quota"
                        type="number"
                        value={categoryMaxQuota}
                        onChange={(e) => setCategoryMaxQuota(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cat-fee">Biaya Pendaftaran (Rp)</Label>
                      <Input
                        id="cat-fee"
                        type="number"
                        value={categoryFee}
                        onChange={(e) => setCategoryFee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCategoryDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleCreateCategory}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Belum ada kategori. Tambahkan kategori untuk memulai.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-sm text-gray-500">
                        Quota: {cat.max_quota} | Fee: Rp{cat.registration_fee.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditCategory(cat)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCategory(cat)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Staff Event ({staff.length})
            </CardTitle>
            <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Staff</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Search Users */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cari user (email/nama)..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleSearchUsers}
                      disabled={searchingUsers}
                    >
                      {searchingUsers ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {userSearchResults.length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUserId(user.id)}
                          className={`w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedUserId === user.id ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="font-medium text-sm">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Role Selection */}
                  <div>
                    <Label>Role</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={selectedRole === "JUDGE" ? "default" : "outline"}
                        onClick={() => setSelectedRole("JUDGE")}
                        className="flex-1"
                      >
                        Juri
                      </Button>
                      <Button
                        type="button"
                        variant={selectedRole === "TABULATOR" ? "default" : "outline"}
                        onClick={() => setSelectedRole("TABULATOR")}
                        className="flex-1"
                      >
                        Tabulator
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStaffDialogOpen(false);
                      setSelectedUserId("");
                      setUserSearchQuery("");
                      setUserSearchResults([]);
                    }}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleAddStaff} disabled={!selectedUserId}>
                    Tambah
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Belum ada staff. Tambahkan juri atau tabulator.
              </p>
            ) : (
              <div className="space-y-2">
                {staff.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                        {(s.user.full_name || s.user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {s.user.full_name || s.user.email}
                        </p>
                        <Badge
                          variant={s.role === "JUDGE" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {s.role === "JUDGE" ? "Juri" : "Tabulator"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemovingStaff(s)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nama Kategori</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Quota</Label>
                <Input
                  type="number"
                  value={categoryMaxQuota}
                  onChange={(e) => setCategoryMaxQuota(e.target.value)}
                />
              </div>
              <div>
                <Label>Biaya Pendaftaran (Rp)</Label>
                <Input
                  type="number"
                  value={categoryFee}
                  onChange={(e) => setCategoryFee(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateCategory}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "{deletingCategory?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Staff Confirmation */}
      <Dialog
        open={!!removingStaff}
        onOpenChange={(open) => !open && setRemovingStaff(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Staff</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              {removingStaff?.user.full_name || removingStaff?.user.email} dari
              staff?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingStaff(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleRemoveStaff}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
