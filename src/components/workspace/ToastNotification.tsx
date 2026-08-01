import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 flex items-start gap-3 animate-fade-in text-xs"
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "warning" && (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white leading-tight">{toast.title}</h4>
            {toast.message && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug truncate">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
