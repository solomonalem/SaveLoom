"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ModalVariant } from "./types";
import { buttons, surfaces } from "~/lib/design";

const variantStyles: Record<
  ModalVariant,
  { icon: typeof Info; iconClass: string; accentClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 bg-emerald-50",
    accentClass: "border-emerald-200",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-600 bg-red-50",
    accentClass: "border-red-200",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-600 bg-amber-50",
    accentClass: "border-amber-200",
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-600 bg-indigo-50",
    accentClass: "border-indigo-200",
  },
};

interface AppModalProps {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  showCancel?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AppModal({
  title,
  message,
  variant = "info",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  destructive = false,
  showCancel = false,
  loading = false,
  onConfirm,
  onCancel,
}: AppModalProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        className={`relative w-full max-w-md ${surfaces.card} border ${style.accentClass} p-6 shadow-xl`}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h2 id="app-modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {showCancel && (
            <button type="button" onClick={onCancel} className={buttons.secondary} disabled={loading}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive
                ? "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                : buttons.primary
            }
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
