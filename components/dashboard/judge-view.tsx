"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ClipboardList, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCategorySchema,
  submitScore,
} from "@/services/event-management/scoring-service";
import type { AssessmentSchemaSection, SubmitScoreItem } from "@/services/event-management/scoring-service";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { useDashboard } from "@/context/dashboard-context";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RegistrationCategory {
  id: string;
  name: string;
}

interface JudgeViewProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  userId: string;
  judgeMetaData?: { speciality?: string; judge_code?: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// JudgeView
// ─────────────────────────────────────────────────────────────────────────────

// Safe hook that returns null if provider not available
function useDashboardSafe() {
  try {
    return useDashboard();
  } catch {
    return { setMobileDrawerOpen: null };
  }
}

export function JudgeView({
  eventTitle,
  eventSlug,
  userId,
  judgeMetaData,
}: JudgeViewProps) {
  const dashboard = useDashboardSafe();

  // ── Categories from public API ───────────────────────────────────────────
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesFailed, setCategoriesFailed] = useState(false);

  // ── Setup form state ─────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [manualCategoryId, setManualCategoryId] = useState("");
  const [teamId, setTeamId] = useState("");

  // ── Schema state ─────────────────────────────────────────────────────────
  const [schema, setSchema] = useState<AssessmentSchemaSection[] | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState("");

  // ── Scores state ─────────────────────────────────────────────────────────
  const [scores, setScores] = useState<Record<string, number>>({});

  // ── Submit state ─────────────────────────────────────────────────────────
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{
    total: number;
    sheetId: string;
  } | null>(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const judgeCode = judgeMetaData?.judge_code ?? userId;
  const effectiveCategoryId = categoriesFailed
    ? manualCategoryId.trim()
    : selectedCategoryId;

  const totalScoredItems = schema
    ? schema.reduce(
        (acc, section) =>
          acc +
          section.groups.reduce((gacc, group) => gacc + group.items.length, 0),
        0,
      )
    : 0;
  const scoredCount = Object.keys(scores).length;
  const allItemsScored =
    schema !== null && scoredCount === totalScoredItems && totalScoredItems > 0;

  // ── Fetch categories on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!eventSlug) {
      setCategoriesLoading(false);
      setCategoriesFailed(true);
      return;
    }

    const backendUrl = (
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
    ).replace(/\/+$/, "");
    const url = `${backendUrl}/api/v1/public/event/${eventSlug}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not ok"))))
      .then((data) => {
        const cats: RegistrationCategory[] =
          data?.registration?.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
        setCategoriesFailed(false);
      })
      .catch(() => {
        setCategoriesFailed(true);
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, [eventSlug]);

  // ── Load schema ──────────────────────────────────────────────────────────
  async function loadSchema() {
    const catId = effectiveCategoryId;
    if (!catId) return;

    setSchemaLoading(true);
    setSchemaError(null);
    setSchema(null);
    setScores({});
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const data = await getCategorySchema(catId);
      setSchema(data.sections);
      setActiveCategoryId(catId);
    } catch (err) {
      setSchemaError(
        err instanceof Error ? err.message : "Gagal memuat skema.",
      );
    } finally {
      setSchemaLoading(false);
    }
  }

  // ── Score setter ─────────────────────────────────────────────────────────
  function setScore(itemId: string, value: number) {
    setScores((prev) => ({ ...prev, [itemId]: value }));
  }

  // ── Submit handler ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schema) return;

    setSubmitError(null);
    setSubmitLoading(true);

    const items: SubmitScoreItem[] = Object.entries(scores).map(([item_id, val]) => ({
      item_id,
      val,
    }));

    try {
      const result = await submitScore({
        team_id: teamId,
        judge_id: userId,
        items,
      });
      setSubmitSuccess({ total: result.total_score, sheetId: result.sheet_id });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal submit nilai.",
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  // ── Reset for scoring another team ───────────────────────────────────────
  function resetForNextTeam() {
    setSubmitSuccess(null);
    setScores({});
    setSchema(null);
    setActiveCategoryId("");
    setTeamId("");
    if (categoriesFailed) setManualCategoryId("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader
        title={eventTitle || "Panel Juri"}
        showBack
        showMenuToggle
        menuToggle={<SidebarMobileTrigger onClick={() => dashboard.setMobileDrawerOpen?.(true)} />}
        onBackClick={() => window.location.href = "/dashboard"}
        className="lg:hidden"
      />

      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* ── Back link (hidden on mobile, visible on desktop) ───────────── */}
        <Link
          href="/dashboard"
          className="hidden lg:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        {/* ── Context banner ─────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">
                Event
              </p>
              <h2 className="text-base font-bold text-blue-900">
                {eventTitle || "—"}
              </h2>
              {judgeMetaData?.speciality && (
                <p className="text-sm text-blue-700 mt-0.5">
                  Spesialisasi:{" "}
                  <span className="font-semibold">
                    {judgeMetaData.speciality}
                  </span>
                </p>
              )}
            </div>

            {judgeMetaData?.judge_code && (
              <div className="bg-blue-100 border border-blue-200 rounded-xl px-4 py-2 text-center">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                  Kode Juri
                </p>
                <p className="text-lg font-black text-blue-900 font-mono tracking-widest">
                  {judgeMetaData.judge_code}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Juri</h1>
          <p className="text-slate-500 text-sm mt-1">
            Masukkan nilai peserta sesuai rubrik penilaian yang ditetapkan.
          </p>
        </div>

        {/* ── Setup card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-500" />
            Konfigurasi Penilaian
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Category selector */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kategori *
              </label>
              {categoriesLoading ? (
                <div className="flex items-center gap-2 h-9 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memuat kategori…</span>
                </div>
              ) : categoriesFailed || categories.length === 0 ? (
                <div className="space-y-1">
                  {categoriesFailed && (
                    <p className="text-xs text-amber-600">
                      Gagal memuat kategori dari server. Masukkan ID kategori
                      secara manual.
                    </p>
                  )}
                  <Input
                    value={manualCategoryId}
                    onChange={(e) => setManualCategoryId(e.target.value)}
                    placeholder="UUID kategori lomba"
                    className="font-mono text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadSchema();
                    }}
                  />
                </div>
              ) : (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Team ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ID Tim *
              </label>
              <Input
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="UUID tim yang dinilai"
                className="font-mono text-sm"
              />
            </div>

            {/* Judge Code (read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kode / ID Juri
              </label>
              <Input
                value={judgeCode}
                readOnly
                className="font-mono text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <Button
            onClick={loadSchema}
            disabled={schemaLoading || !effectiveCategoryId}
            className="bg-red-900 hover:bg-red-800 text-white font-bold"
          >
            {schemaLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat Skema…
              </>
            ) : (
              "Muat Rubrik Penilaian"
            )}
          </Button>

          {schemaError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {schemaError}
            </div>
          )}

          {/* Active category indicator */}
          {activeCategoryId && schema && (
            <p className="text-xs text-slate-400 font-mono">
              Skema aktif:{" "}
              <span className="text-slate-600">{activeCategoryId}</span>
              {totalScoredItems > 0 && (
                <span className="ml-2 text-slate-500">
                  ({scoredCount}/{totalScoredItems} item dinilai)
                </span>
              )}
            </p>
          )}
        </div>

        {/* ── Score form ─────────────────────────────────────────────────── */}
        {schema && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitSuccess ? (
              /* ── Success state ── */
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  Nilai Berhasil Disimpan!
                </h2>
                <p className="text-green-700 text-lg">
                  Total Skor:{" "}
                  <span className="font-black text-2xl">
                    {submitSuccess.total}
                  </span>
                </p>
                <p className="text-xs text-green-600 mt-2 font-mono">
                  Sheet ID: {submitSuccess.sheetId}
                </p>
                <Button
                  type="button"
                  onClick={resetForNextTeam}
                  className="mt-6 bg-green-700 hover:bg-green-800 text-white font-bold"
                >
                  Nilai Tim Lain
                </Button>
              </div>
            ) : (
              <>
                {/* ── Section cards ── */}
                {schema.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Section header */}
                    <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                      <h3 className="font-bold text-base">{section.title}</h3>
                      <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                        Bobot {section.weight_percentage}%
                      </span>
                    </div>

                    {/* Groups */}
                    {section.groups.map((group) => (
                      <div
                        key={group.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        {/* Group title */}
                        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                          <h4 className="text-sm font-bold text-slate-700">
                            {group.title}
                          </h4>
                        </div>

                        {/* Items */}
                        {group.items.map((item) => {
                          const itemId = item.id ?? "";
                          const scored = itemId ? scores[itemId] !== undefined : false;
                          return (
                            <div
                              key={itemId || item.display_number}
                              className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 last:border-0 transition-colors ${
                                scored ? "bg-green-50/40" : ""
                              }`}
                            >
                              {/* Label */}
                              <div className="flex items-start gap-3 min-w-0">
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                                    scored
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {item.display_number}
                                </span>
                                <span className="text-sm text-slate-700 leading-relaxed">
                                  {item.label}
                                </span>
                              </div>

                              {/* Discrete value buttons */}
                              <div className="flex flex-wrap gap-1.5 shrink-0">
                                {item.allowed_values.map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => itemId && setScore(itemId, val)}
                                    disabled={!itemId}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                      itemId && scores[itemId] === val
                                        ? "bg-red-900 text-white shadow-md shadow-red-900/30 scale-110"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}

                {/* ── Progress indicator ── */}
                {totalScoredItems > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">
                        Progress Penilaian
                      </span>
                      <span
                        className={`font-bold ${
                          allItemsScored ? "text-green-600" : "text-slate-500"
                        }`}
                      >
                        {scoredCount} / {totalScoredItems}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          allItemsScored ? "bg-green-500" : "bg-red-900"
                        }`}
                        style={{
                          width: `${
                            totalScoredItems > 0
                              ? Math.round(
                                  (scoredCount / totalScoredItems) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ── Submit error ── */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {submitError}
                  </div>
                )}

                {/* ── Submit button ── */}
                <Button
                  type="submit"
                  disabled={
                    submitLoading || !allItemsScored || !teamId.trim()
                  }
                  className="w-full bg-red-900 hover:bg-red-800 disabled:opacity-60 text-white font-bold h-12 text-base shadow-lg shadow-red-900/20"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menyimpan Nilai…
                    </>
                  ) : !teamId.trim() ? (
                    "Lengkapi ID Tim"
                  ) : !allItemsScored ? (
                    `Lengkapi Semua Nilai (${scoredCount}/${totalScoredItems})`
                  ) : (
                    "Submit Nilai"
                  )}
                </Button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
