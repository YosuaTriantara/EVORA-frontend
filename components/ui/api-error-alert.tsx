// ApiErrorAlert Component - Display API errors with user-friendly messages
// Reference: Frontend Implementation Guide Section 5.1

"use client";

import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AdminApiError } from "@/lib/api/error-handler";

interface ApiErrorAlertProps {
  /** The error object from API call */
  error: unknown;
  /** Optional custom title (default based on status code) */
  title?: string;
  /** Whether to show a dismiss button */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof AdminApiError) {
    switch (error.status) {
      case 400:
        return typeof error.detail === "string"
          ? error.detail
          : "Permintaan tidak valid. Periksa kembali data Anda.";
      case 401:
        return "Sesi Anda telah berakhir. Silakan login kembali.";
      case 403:
        return "Anda tidak memiliki izin untuk melakukan ini.";
      case 404:
        return "Data tidak ditemukan.";
      case 409:
        return "Data sudah ada atau terjadi konflik.";
      case 422:
        return typeof error.detail === "string"
          ? `Validasi gagal: ${error.detail}`
          : "Data tidak valid. Periksa kembali input Anda.";
      case 429:
        return "Terlalu banyak request. Silakan tunggu sebentar.";
      case 500:
      case 502:
      case 503:
        return "Terjadi kesalahan server. Coba lagi nanti.";
      default:
        return typeof error.detail === "string"
          ? error.detail
          : "Terjadi kesalahan. Silakan coba lagi.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}

/**
 * Get error title based on status code
 */
function getErrorTitle(error: unknown): string {
  if (error instanceof AdminApiError) {
    switch (error.status) {
      case 401:
        return "Sesi Berakhir";
      case 403:
        return "Akses Ditolak";
      case 404:
        return "Data Tidak Ditemukan";
      case 422:
        return "Validasi Gagal";
      case 429:
        return "Terlalu Banyak Request";
      case 500:
      case 502:
      case 503:
        return "Error Server";
      default:
        return "Terjadi Kesalahan";
    }
  }
  return "Error";
}

/**
 * ApiErrorAlert - Komponen untuk menampilkan error dari API
 *
 * Usage:
 * const { error } = useQuery({...});
 *
 * {error && <ApiErrorAlert error={error} dismissible onDismiss={() => {}} />}
 *
 * With mutation:
 * const { mutate, error, reset } = useMutation({...});
 *
 * {error && <ApiErrorAlert error={error} dismissible onDismiss={reset} />}
 */
export function ApiErrorAlert({
  error,
  title,
  dismissible = false,
  onDismiss,
  className,
}: ApiErrorAlertProps) {
  if (!error) return null;

  const errorTitle = title || getErrorTitle(error);
  const errorMessage = getErrorMessage(error);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{errorTitle}</span>
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 -mr-1"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}
