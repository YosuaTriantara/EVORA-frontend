"use client";

import { useState } from "react";
import {
  Trophy,
  CreditCard,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    id: "competition",
    label: "Competition",
    icon: LayoutDashboard,
    title: "Competition Management",
    description:
      "Sistem tata kelola perlombaan dari pendaftaran hingga penentuan juara secara digital dan terpusat.",
    badges: ["Database Peserta", "Scoring", "Broadcast", "Auto Web"],
    items: [
      {
        title: "Database Peserta",
        desc: "Kelola data tim, official, dan berkas administrasi secara digital.",
      },
      {
        title: "Hybrid Scoring System",
        desc: "Input nilai digital atau generate form penilaian yang bisa di-scan.",
      },
      {
        title: "Broadcast Center",
        desc: "Kirim informasi ke seluruh peserta via email.",
      },
      {
        title: "Auto-Generated Web",
        desc: "Landing page khusus untuk publikasi event secara otomatis.",
      },
    ],
  },
  {
    id: "voting",
    label: "Live Voting",
    icon: Trophy,
    title: "Live Voting System",
    description:
      "Modul monetisasi untuk meningkatkan engagement dan pemasukan event secara real-time.",
    badges: ["Paid Voting", "Leaderboard", "Anti-Spam"],
    items: [
      {
        title: "Paid Voting (Monetisasi)",
        desc: "Jual poin voting untuk kategori Juara Favorit.",
      },
      {
        title: "Real-time Leaderboard",
        desc: "Grafik perolehan suara yang update otomatis tanpa refresh.",
      },
      {
        title: "Anti-Spam Protection",
        desc: "Sistem keamanan untuk mencegah kecurangan vote.",
      },
      {
      title: "Vote Analytics",
      desc: "Pantau tren perolehan suara kandidat ",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    title: "Integrated Payment",
    description:
      "Gerbang pembayaran otomatis untuk pendaftaran dan voting dengan pelaporan keuangan transparan.",
    badges: ["QRIS", "Invoice", "Laporan", "Settlement"],
    items: [
      {
        title: "QRIS Otomatis",
        desc: "Terima pembayaran via e-wallet/bank dengan verifikasi otomatis.",
      },
      {
        title: "Manajemen Tagihan",
        desc: "Kirim invoice biaya pendaftaran ke email peserta.",
      },
      {
        title: "Laporan Keuangan",
        desc: "Rekap mutasi masuk dan pendapatan event secara transparan.",
      },
      {
        title: "Settlement Cepat",
        desc: "Pencairan dana pendapatan voting ke rekening panitia.",
      },
    ],
  },
];

// Satu tema tunggal selaras dengan HeroSection:
// bg-slate-50, blob bg-red-50, aksen red-900, teks slate-900/600
const theme = {
  tab: "data-[active=true]:bg-red-900 data-[active=true]:text-white data-[active=true]:border-red-900",
  card: "bg-white border-slate-200",
  icon: "bg-red-50 text-red-900",
  check: "text-red-900",
  badge: "bg-red-50 text-red-900",
  title: "text-slate-900",
  desc: "text-slate-600",
  featureTitle: "text-slate-900",
  featureDesc: "text-slate-500",
  featureBg: "bg-slate-50 border-slate-100",
  dot: "data-[active=true]:bg-red-900",
};

export function BentoFeatures() {
  const [active, setActive] = useState(0);
  const feature = features[active];
  const t = theme;
  const Icon = feature.icon;

  return (
    <section id="features" className="relative py-10 md:py-16 bg-slate-50 overflow-hidden">
      {/* Consistent red blob from HeroSection */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-red-50 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Kelola Event dalam 
            <span className="text-red-900"> Satu Platform</span>
          </h2>
          <p className="text-base text-slate-600">
            Evora terdiri dari 3 fitur utama yang dapat bekerja secara terintegrasi
            maupun independen sesuai kebutuhan event Anda.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {features.map((f, i) => {
            const TabIcon = f.icon;
            return (
              <button
                key={f.id}
                data-active={active === i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border border-slate-200 text-slate-500 bg-white transition-all duration-200 ${t.tab}`}
              >
                <TabIcon className="w-4 h-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div
          key={feature.id}
          className={`rounded-3xl p-8 border ${t.card} transition-all duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Left */}
            <div className="flex flex-col">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${t.icon}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${t.title}`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed mb-6 ${t.desc}`}>{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.badges.map((b) => (
                  <span key={b} className={`text-xs font-medium px-3 py-1 rounded-full ${t.badge}`}>
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Feature list */}
            <div className="flex flex-col gap-3">
              {feature.items.map((item) => (
                <div
                  key={item.title}
                  className={`flex items-start gap-3 p-3 rounded-2xl border ${t.featureBg}`}
                >
                  <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${t.check}`} />
                  <div>
                    <span className={`font-semibold text-sm block ${t.featureTitle}`}>
                      {item.title}
                    </span>
                    <span className={`text-xs leading-relaxed ${t.featureDesc}`}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-2 justify-center mt-6">
          {features.map((f, i) => (
            <button
              key={f.id}
              data-active={active === i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full bg-slate-300 transition-all duration-300 ${t.dot} ${
                active === i ? "w-6" : "w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}