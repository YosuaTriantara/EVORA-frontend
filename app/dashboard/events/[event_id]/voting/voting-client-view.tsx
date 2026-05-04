"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  AlertCircle,
  CheckCircle2,
  X,
  BarChart3,
  Users,
  TrendingUp,
} from "lucide-react";
import type { VoteCategory } from "@/services/super-admin/sa-voting-service";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useEventContext } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface VotingStats {
  total_votes: number;
  total_categories: number;
  active_categories: number;
}

interface VotingClientViewProps {
  eventId: string;
  initialCategories: VoteCategory[];
  initialStats: VotingStats;
}

export function VotingClientView({
  eventId,
  initialCategories,
  initialStats,
}: VotingClientViewProps) {
  const { event: currentEvent } = useEventContext();

  const [categories] = useState<VoteCategory[]>(initialCategories);
  const [stats] = useState<VotingStats>(initialStats);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastList toasts={toasts} remove={removeToast} />

      {/* Mobile Header */}
      <MobileHeader
        title={currentEvent?.title || "Voting"}
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
              <Trophy className="w-6 h-6" />
              Manajemen Voting
            </h1>
            <p className="text-gray-500 mt-1">
              {categories.length} kategori voting
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/voting/events/${eventId}`} target="_blank">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Lihat Halaman Publik
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Kandidat</p>
                  <p className="text-2xl font-bold">{stats.total_votes.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kategori Aktif</p>
                  <p className="text-2xl font-bold">{stats.active_categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Kategori</p>
                  <p className="text-2xl font-bold">{stats.total_categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada kategori voting</p>
              <p className="text-sm text-gray-400 mt-2">
                Hubungi Super Admin untuk mengatur kategori voting
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {category.candidate_count || 0} kandidat
                      </span>
                    </div>
                    <Link href={`/super-admin/events/${eventId}`}>
                      <Button variant="ghost" size="sm">
                        Kelola
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
