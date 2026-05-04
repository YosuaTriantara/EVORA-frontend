"use client";

import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export function LoadingPane() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-red-800 animate-spin" />
    </div>
  );
}

export function ErrorPane({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600 text-center max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
        {icon}
      </div>
      <p className="text-sm text-slate-400 text-center max-w-xs">{message}</p>
    </div>
  );
}
