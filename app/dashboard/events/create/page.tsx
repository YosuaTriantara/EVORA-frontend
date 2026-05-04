"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  X,
  Trophy,
} from "lucide-react";
import { createEvent } from "@/services/event-management/events-service";
import type { CreateEventPayload } from "@/types/admin";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateEventPayload>({
    title: "",
    slug: "",
    organizer: "",
    location: "",
    profil_url: "",
    event_date_start: "",
    event_date_end: "",
    is_voting_enabled: false,
    content_data: {},
    theme_setting: {},
  });

  const handleChange = (field: keyof CreateEventPayload, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      const newEvent = await createEvent(formData);
      setSuccess("Event berhasil dibuat!");
      
      // Redirect ke halaman detail event setelah 1.5 detik
      setTimeout(() => {
        router.push(`/dashboard/events/${newEvent.id}`);
      }, 1500);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal membuat event.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.slug.trim() &&
    formData.organizer.trim() &&
    formData.location.trim() &&
    formData.event_date_start &&
    formData.event_date_end;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Buat Event Baru
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Isi informasi dasar untuk membuat event baru
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {err && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{err}</p>
          <button
            onClick={() => setErr(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-600" />
              Informasi Dasar
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Contoh: Kompetisi Musik Nasional 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">/events/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="kompetisi-musik-nasional-2024"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Slug akan digunakan sebagai URL event. Hanya huruf kecil, angka, dan tanda hubung.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Penyelenggara <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => handleChange("organizer", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Nama penyelenggara event"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Lokasi penyelenggaraan event"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Profil (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.profil_url || ""}
                  onChange={(e) => handleChange("profil_url", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="https://example.com/event-image.jpg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL gambar untuk ditampilkan sebagai profil event.
                </p>
              </div>
            </div>
          </div>

          {/* Date Settings */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Tanggal Event
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.event_date_start}
                  onChange={(e) => handleChange("event_date_start", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.event_date_end}
                  onChange={(e) => handleChange("event_date_end", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Feature Settings */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-600" />
              Fitur
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_voting_enabled"
                checked={formData.is_voting_enabled}
                onChange={(e) => handleChange("is_voting_enabled", e.target.checked)}
                className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
              />
              <label htmlFor="is_voting_enabled" className="text-sm text-slate-700">
                Aktifkan fitur voting untuk event ini
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-7">
              Jika diaktifkan, pengunjung dapat membeli poin dan memberikan suara untuk kandidat favorit mereka.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="text-red-500">*</span> Wajib diisi
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="inline-flex items-center gap-2 bg-red-900 hover:bg-red-800 disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Membuat…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
