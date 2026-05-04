// app/logout/page.tsx
// Logout page - handles logout API call and redirects to home

"use client";

import { useEffect, useState } from "react";
import { logout } from "@/services/auth-service";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout API - clears cookies server-side
        await logout();
      } catch (err) {
        // Only log unexpected errors, don't show to user
        console.error("[LogoutPage] Unexpected error:", err);
      } finally {
        // Use hard redirect to ensure cookies are cleared before navigation
        // This prevents race conditions with middleware/auth checks
        window.location.href = "/";
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Logout Gagal</h1>
            <p className="text-slate-600">{error}</p>
            <p className="text-sm text-slate-500">Mengalihkan ke halaman utama...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sedang Keluar...</h1>
            <p className="text-slate-600">Mohon tunggu sebentar</p>
          </>
        )}
      </div>
    </div>
  );
}
