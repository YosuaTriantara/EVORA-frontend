"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getMe, UserProfile } from "@/lib/auth";
import { getManagedEvents, ManagedEvent } from "@/services/event-management-service";
import { DashboardProvider } from "@/context/dashboard-context";
import { UnifiedSidebar, SidebarMobileTrigger } from "@/components/dashboard/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import Link from "next/link";

interface AuthState {
  status: "loading" | "authenticated" | "inactive" | "error";
  user: UserProfile | null;
  managedEvents: ManagedEvent[];
  errorMessage?: string;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Extract event_id from URL if we're on an event detail page
  // URL pattern: /dashboard/events/[event_id]/...
  const eventIdMatch = pathname?.match(/\/dashboard\/events\/([^\/]+)/);
  const currentEventId = eventIdMatch ? eventIdMatch[1] : undefined;
  
  // Only show mobile header on dashboard home page (no back button needed)
  // Other pages have their own MobileHeader with back button
  const isDashboardHome = pathname === "/dashboard" || pathname === "/dashboard/";
  
  const [authState, setAuthState] = useState<AuthState>({
    status: "loading",
    user: null,
    managedEvents: [],
  });

  const initAuth = async () => {
    try {
      // Step 1: Verify user authentication
      const user = await getMe();
      if (!user.is_active) {
        console.log("[AuthGuard] User inactive, redirecting to login");
        setAuthState({ status: "inactive", user: null, managedEvents: [] });
        return;
      }

      // Step 2: Fetch managed events untuk sidebar (non-blocking)
      // Jika gagal, tetap tampilkan dashboard dengan managedEvents kosong
      let managedEvents: ManagedEvent[] = [];
      try {
        managedEvents = await getManagedEvents();
      } catch (error) {
        console.warn("[AuthGuard] Failed to fetch managed events, continuing with empty list:", error);
        // Don't fail auth just because managed events couldn't be fetched
      }
      
      setAuthState({
        status: "authenticated",
        user,
        managedEvents,
      });
    } catch (error) {
      console.error("[AuthGuard] Authentication failed:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      setAuthState({ 
        status: "error", 
        user: null, 
        managedEvents: [],
        errorMessage: message,
      });
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  if (authState.status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl">E</span>
          </div>
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Memverifikasi sesi…</p>
        </div>
      </div>
    );
  }

  if (authState.status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">Gagal Memuat Dashboard</h2>
            <p className="text-sm text-slate-500">{authState.errorMessage || "Terjadi kesalahan saat memuat data."}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAuthState({ status: "loading", user: null, managedEvents: [] });
                initAuth();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <button
              onClick={() => window.location.href = "/login"}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authState.status === "inactive" || !authState.user) {
    // Redirect akan ditangani oleh middleware, tapi ini fallback
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <DashboardProvider 
      user={authState.user} 
      managedEvents={authState.managedEvents}
    >
      <div className="min-h-screen bg-background lg:pl-64">
        {/* Sidebar - Desktop fixed, Mobile drawer */}
        <UnifiedSidebar currentEventId={currentEventId} />
        
        {/* Mobile Header - Only on dashboard home (other pages have their own) */}
        {isDashboardHome && (
          <div className="lg:hidden">
            <MobileHeader
              showBack={false}
              showMenuToggle={true}
              menuToggle={<SidebarMobileTrigger />}
              rightActions={
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">E</span>
                  </div>
                  <span className="hidden sm:inline">Evora</span>
                </Link>
              }
            />
          </div>
        )}
        
        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
