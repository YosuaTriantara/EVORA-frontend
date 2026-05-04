"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2, Eye, EyeOff } from "lucide-react";
import { login, logout } from "@/lib/admin-api";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await login(email, password);

      if (profile.role !== "SUPER_ADMIN") {
        await logout();
        setError(
          "Akses ditolak. Akun ini tidak memiliki hak akses Super Admin.",
        );
        return;
      }

      router.replace("/super-admin/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login gagal. Coba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-br from-red-950 to-slate-900 px-8 pt-8 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-900/40">
                E
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  EVORA
                </p>
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  Super Admin Panel
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              Selamat Datang
            </h1>
            <p className="text-slate-400 text-sm">
              Masuk dengan kredensial Super Admin Anda.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/60 rounded-lg px-4 py-3">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm leading-snug">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@evora.id"
                required
                autoComplete="email"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
              className="w-full bg-red-900 hover:bg-red-800 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi…
                </>
              ) : (
                "Masuk ke Panel"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <p className="text-[11px] text-slate-500 leading-snug">
                Panel ini hanya untuk{" "}
                <span className="text-yellow-500 font-bold">SUPER_ADMIN</span>.
                Akses tidak sah akan dicatat dan dilaporkan.
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-slate-600 text-xs">
          <a
            href="/"
            className="hover:text-slate-400 transition-colors underline underline-offset-2"
          >
            ← Kembali ke halaman utama
          </a>
        </p>
      </div>
    </div>
  );
}
