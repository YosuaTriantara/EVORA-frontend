"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loginUser, registerUser, AuthError } from "@/lib/auth";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await loginUser(email, password);

      if (!profile.is_active) {
        setError("Akun Anda dinonaktifkan. Hubungi administrator.");
        return;
      }

      // Gunakan hard redirect agar cookie benar-benar tersedia sebelum dashboard load
      // Ini mencegah race condition antara cookie set dan auth check di dashboard layout
      if (profile.role === "SUPER_ADMIN") {
        window.location.href = "/super-admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await registerUser(email, password, fullName);

      setSuccessMsg(
        "Akun berhasil dibuat! Silakan masuk dengan kredensial Anda.",
      );
      setTab("login");
      setFullName("");
      setPassword("");
    } catch (err: unknown) {
      if (err instanceof AuthError && err.status === 400) {
        // Email already registered — suggest switching to login
        setError(
          "Email ini sudah terdaftar. Silakan masuk dengan akun yang sudah ada.",
        );
        setTab("login");
      } else {
        setError(err instanceof Error ? err.message : "Registrasi gagal.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
            {/* Header gradient */}
            <div className="h-2 bg-linear-to-r from-red-900 via-red-700 to-rose-500" />

            <div className="px-8 pt-8 pb-2">
              {/* Brand mark */}
              <div className="flex flex-col items-center justify-center gap-3 mb-6">
                <img
                  src="/evora-logo-2026.png"
                  alt="Evora Logo"
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
                <div className="text-center">
                  <p className="font-black text-slate-900 leading-tight text-base tracking-tight">
                    EVORA
                  </p>
                  <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest">
                    Platform Kompetisi
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
                <button
                  onClick={() => {
                    setTab("login");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    tab === "login"
                      ? "bg-white text-slate-900 shadow-sm shadow-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    setTab("register");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    tab === "register"
                      ? "bg-white text-slate-900 shadow-sm shadow-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Daftar
                </button>
              </div>

              {/* Heading */}
              <div className="mb-6">
                {tab === "login" ? (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      Selamat Datang Kembali
                    </h1>
                    <p className="text-slate-500 text-sm">
                      Masuk untuk mengakses dashboard dan event Anda.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      Buat Akun Baru
                    </h1>
                    <p className="text-slate-500 text-sm">
                      Daftarkan diri untuk ikut kompetisi bersama Evora.
                    </p>
                  </>
                )}
              </div>

              {/* Success banner */}
              {successMsg && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-green-700 text-sm leading-snug">
                    {successMsg}
                  </p>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm leading-snug">{error}</p>
                </div>
              )}
            </div>

            {/* ── LOGIN FORM ───────────────────────────────────────────────── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="peserta@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-red-700 hover:text-red-800 font-medium"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-red-900 hover:bg-red-800 active:bg-red-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-red-900/15"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memverifikasi…
                    </>
                  ) : (
                    <>
                      Masuk ke Akun
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── REGISTER FORM ────────────────────────────────────────────── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="px-8 pb-8 space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Santoso"
                    required
                    autoComplete="name"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="peserta@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.
                  </p>
                </div>

                {/* TOS notice */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <a
                    href="#"
                    className="text-red-700 font-medium hover:underline"
                  >
                    Syarat & Ketentuan
                  </a>{" "}
                  serta{" "}
                  <a
                    href="#"
                    className="text-red-700 font-medium hover:underline"
                  >
                    Kebijakan Privasi
                  </a>{" "}
                  Evora.
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email || !password || !fullName}
                  className="w-full bg-red-900 hover:bg-red-800 active:bg-red-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2 shadow-lg shadow-red-900/15"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Membuat Akun…
                    </>
                  ) : (
                    <>
                      Buat Akun Sekarang
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Back to home - removed super admin link */}
          <p className="text-center mt-4 text-sm text-slate-500">
            <Link
              href="/"
              className="text-red-900 hover:text-red-800 font-medium transition-colors"
            >
              ← Kembali ke halaman utama
            </Link>
          </p>
        </div>
      </main>

    </div>
  );
}
