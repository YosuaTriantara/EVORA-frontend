"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  BarChart3,
  Users,
  Lock,
  Unlock,
  Trophy,
} from "lucide-react";
import {
  getRankings,
  lockScoresheet,
  unlockScoresheet,
  type ScoreSheet,
} from "@/services/event-management/scoring-service";
import type { CategoryRead } from "@/types/admin";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useEventContext } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface RankingEntry {
  rank: number;
  team_id: string;
  team_name: string;
  lot_number: number | null;
  total_score: number;
  judge_count: number;
}

interface ScoringStats {
  totalSheets: number;
  lockedSheets: number;
  pendingSheets: number;
}

interface ScoringClientViewProps {
  eventId: string;
  initialCategories: CategoryRead[];
  initialScoresheets: ScoreSheet[];
  initialStats: ScoringStats;
}

export function ScoringClientView({
  eventId,
  initialCategories,
  initialScoresheets,
  initialStats,
}: ScoringClientViewProps) {
  const { event: currentEvent } = useEventContext();

  const [categories] = useState<CategoryRead[]>(initialCategories);
  const [scoresheets, setScoresheets] = useState<ScoreSheet[]>(initialScoresheets);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || ""
  );
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const stats = {
    totalSheets: scoresheets.length,
    lockedSheets: scoresheets.filter((s) => s.is_locked).length,
    pendingSheets: scoresheets.filter((s) => !s.is_locked).length,
  };

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

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    try {
      setLoadingRankings(true);
      const rankingsData = await getRankings(eventId, categoryId);
      setRankings(rankingsData.rankings);
    } catch (err) {
      console.error("Failed to load rankings:", err);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  const handleLockToggle = async (sheet: ScoreSheet) => {
    try {
      setProcessing(sheet.id);
      if (sheet.is_locked) {
        await unlockScoresheet(sheet.id);
        addToast("success", "Score sheet berhasil dibuka");
      } else {
        await lockScoresheet(sheet.id);
        addToast("success", "Score sheet berhasil dikunci");
      }
      // Update local state
      setScoresheets((prev) =>
        prev.map((s) =>
          s.id === sheet.id ? { ...s, is_locked: !s.is_locked } : s
        )
      );
    } catch (err) {
      addToast("error", "Gagal mengubah status score sheet");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastList toasts={toasts} remove={removeToast} />

      {/* Mobile Header */}
      <MobileHeader
        title={currentEvent?.title || "Penilaian"}
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
              <Calculator className="w-6 h-6" />
              Manajemen Penilaian
            </h1>
            <p className="text-gray-500 mt-1">
              {stats.totalSheets} score sheet • {stats.lockedSheets} dikunci • {stats.pendingSheets} pending
            </p>
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
                  <p className="text-sm text-gray-500">Total Score Sheet</p>
                  <p className="text-2xl font-bold">{stats.totalSheets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dikunci</p>
                  <p className="text-2xl font-bold">{stats.lockedSheets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Unlock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingSheets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Peringkat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRankings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data peringkat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peringkat</TableHead>
                      <TableHead>Tim</TableHead>
                      <TableHead>No. Undian</TableHead>
                      <TableHead className="text-right">Total Skor</TableHead>
                      <TableHead className="text-right">Jumlah Juri</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((entry) => (
                      <TableRow key={entry.team_id}>
                        <TableCell>
                          {entry.rank === 1 && <span className="text-yellow-500 font-bold text-lg">🥇</span>}
                          {entry.rank === 2 && <span className="text-gray-400 font-bold text-lg">🥈</span>}
                          {entry.rank === 3 && <span className="text-amber-600 font-bold text-lg">🥉</span>}
                          {entry.rank > 3 && <span className="text-gray-500">#{entry.rank}</span>}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{entry.team_name}</p>
                        </TableCell>
                        <TableCell>{entry.lot_number || "-"}</TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.total_score.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{entry.judge_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Sheets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Score Sheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scoresheets.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada score sheet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tim ID</TableHead>
                      <TableHead>Juri ID</TableHead>
                      <TableHead className="text-right">Total Skor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scoresheets.map((sheet) => (
                      <TableRow key={sheet.id}>
                        <TableCell className="font-mono text-sm">
                          {sheet.team_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sheet.judge_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {sheet.total_score.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sheet.is_locked ? "default" : "secondary"}>
                            {sheet.is_locked ? "🔒 Dikunci" : "🔓 Terbuka"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLockToggle(sheet)}
                            disabled={processing === sheet.id}
                          >
                            {processing === sheet.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : sheet.is_locked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
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
    </div>
  );
}
