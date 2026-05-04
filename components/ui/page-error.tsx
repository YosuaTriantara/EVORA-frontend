// PageError Component - Reusable error boundary fallback for pages
// Reference: Frontend Implementation Guide Section 8.2

"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageErrorProps {
  /** Error message to display */
  error?: Error;
  /** Reset function to retry */
  reset?: () => void;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Show home button */
  showHomeButton?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * PageError - Komponen error boundary reusable untuk halaman
 *
 * Usage in error.tsx:
 * 'use client';
 * import { PageError } from '@/components/ui/page-error';
 *
 * export default function Error({ error, reset }: { error: Error; reset: () => void }) {
 *   return <PageError error={error} reset={reset} />;
 * }
 */
export function PageError({
  error,
  reset,
  title = "Terjadi Kesalahan",
  message,
  showHomeButton = true,
  className = "",
}: PageErrorProps) {
  const errorMessage = message || error?.message || "Gagal memuat data";

  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md">{errorMessage}</p>
      </div>

      <div className="flex gap-2">
        {reset && (
          <Button onClick={reset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        )}

        {showHomeButton && (
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Ke Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * ApiErrorPage - Specialized error page for API errors
 */
export function ApiErrorPage({
  statusCode,
  reset,
}: {
  statusCode: number;
  reset?: () => void;
}) {
  const config: Record<
    number,
    { title: string; message: string; showHome: boolean }
  > = {
    401: {
      title: "Sesi Berakhir",
      message: "Sesi Anda telah berakhir. Silakan login kembali.",
      showHome: false,
    },
    403: {
      title: "Akses Ditolak",
      message: "Anda tidak memiliki izin untuk mengakses halaman ini.",
      showHome: true,
    },
    404: {
      title: "Halaman Tidak Ditemukan",
      message: "Halaman yang Anda cari tidak ditemukan.",
      showHome: true,
    },
    500: {
      title: "Error Server",
      message: "Terjadi kesalahan pada server. Coba lagi nanti.",
      showHome: true,
    },
  };

  const { title, message, showHome } = config[statusCode] || config[500];

  return (
    <PageError
      title={title}
      message={message}
      reset={reset}
      showHomeButton={showHome}
    />
  );
}
