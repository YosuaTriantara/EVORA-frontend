// useApiError Hook - React Query error handling with toast notifications
// Reference: Frontend Implementation Guide Section 8.1

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError } from "@/lib/api/error-handler";

interface UseApiErrorOptions {
  /** Redirect to login on 401 (default: true) */
  redirectOnAuthError?: boolean;
  /** Show toast notifications (default: true) */
  showToast?: boolean;
  /** Custom toast function (default: console.error) */
  toastFn?: (message: string) => void;
  /** Callback for specific error codes */
  onError?: (error: AdminApiError) => void;
}

/**
 * useApiError - Hook for handling API errors with toast notifications
 *
 * Usage:
 * const { data, error, isLoading } = useQuery({...});
 * useApiError(error);
 *
 * With custom options:
 * useApiError(error, {
 *   redirectOnAuthError: false,
 *   showToast: true,
 *   toastFn: (msg) => toast.error(msg)
 * });
 */
export function useApiError(
  error: unknown,
  options: UseApiErrorOptions = {}
): void {
  const router = useRouter();
  const {
    redirectOnAuthError = true,
    showToast = true,
    toastFn = (msg: string) => console.error("[API Error]", msg),
    onError,
  } = options;

  useEffect(() => {
    if (!error) return;

    if (error instanceof AdminApiError) {
      // Call custom error handler if provided
      onError?.(error);

      // Handle specific status codes
      switch (error.status) {
        case 401:
          if (redirectOnAuthError) {
            router.push("/login");
          }
          if (showToast) {
            toastFn("Sesi Anda telah berakhir. Silakan login kembali.");
          }
          break;

        case 403:
          if (showToast) {
            toastFn("Akses ditolak. Anda tidak memiliki izin untuk melakukan ini.");
          }
          break;

        case 404:
          if (showToast) {
            toastFn("Data tidak ditemukan.");
          }
          break;

        case 422:
          if (showToast) {
            const detail = typeof error.detail === "string"
              ? error.detail
              : "Data tidak valid. Periksa kembali input Anda.";
            toastFn(`Validasi gagal: ${detail}`);
          }
          break;

        case 429:
          if (showToast) {
            toastFn("Terlalu banyak request. Coba lagi sebentar.");
          }
          break;

        case 500:
        case 502:
        case 503:
          if (showToast) {
            toastFn("Terjadi kesalahan server. Coba lagi nanti.");
          }
          break;

        default:
          if (showToast) {
            const message = typeof error.detail === "string"
              ? error.detail
              : "Terjadi kesalahan. Silakan coba lagi.";
            toastFn(message);
          }
      }
    } else if (error instanceof Error) {
      // Generic error
      if (showToast) {
        toastFn(error.message || "Terjadi kesalahan yang tidak diketahui.");
      }
    }
  }, [error, router, redirectOnAuthError, showToast, toastFn, onError]);
}

/**
 * getErrorMessage - Extract user-friendly error message from any error
 *
 * Usage:
 * const message = getErrorMessage(error);
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AdminApiError) {
    switch (error.status) {
      case 401:
        return "Sesi Anda telah berakhir. Silakan login kembali.";
      case 403:
        return "Akses ditolak. Anda tidak memiliki izin.";
      case 404:
        return "Data tidak ditemukan.";
      case 422:
        return typeof error.detail === "string"
          ? `Validasi gagal: ${error.detail}`
          : "Data tidak valid. Periksa kembali input Anda.";
      case 429:
        return "Terlalu banyak request. Coba lagi sebentar.";
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
 * isAuthError - Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof AdminApiError && error.status === 401;
}

/**
 * isNotFoundError - Check if error is a 404 not found
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof AdminApiError && error.status === 404;
}

/**
 * isValidationError - Check if error is a 422 validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof AdminApiError && error.status === 422;
}
