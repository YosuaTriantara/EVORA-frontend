// CREATED: 2025-04-17 - Analytics Placeholder Page for Event Context
// Placeholder page for analytics feature (Phase 11 ORGANIZER UX Refactor)

"use client";

import { BarChart3, TrendingUp, Users, CreditCard, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analitik Event</h2>
        <p className="text-slate-500 mt-1">
          Statistik dan analisis performa event
        </p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Fitur Analitik Segera Hadir
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Kami sedang mengembangkan dashboard analitik lengkap untuk membantu Anda 
            memantau performa event secara real-time.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" disabled>
              <TrendingUp className="w-4 h-4 mr-2" />
              Lihat Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Pendaftar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-bold text-slate-400">--</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Voting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-bold text-slate-400">--</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-bold text-slate-400">--</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Konversi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <span className="text-2xl font-bold text-slate-400">--</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview List */}
      <Card>
        <CardHeader>
          <CardTitle>Fitur yang Akan Datang</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              "📊 Dashboard statistik real-time",
              "📈 Grafik tren pendaftaran dan voting",
              "🎯 Analisis konversi dan retensi",
              "💰 Laporan keuangan otomatis",
              "👥 Demografi peserta",
              "🔔 Alert dan notifikasi otomatis",
            ].map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                <span className="text-slate-600">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
