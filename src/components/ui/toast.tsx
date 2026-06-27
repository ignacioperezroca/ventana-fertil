"use client";

import { Check, Info, X } from "lucide-react";
import type { ReactNode } from "react";

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  message: string;
}

export function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-[60] px-3 sm:left-auto sm:right-4 sm:top-4 sm:w-[min(22rem,calc(100vw-2rem))] sm:px-0">
      <div className="space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const Icon = toast.tone === "success" ? Check : toast.tone === "warning" ? Info : toast.tone === "danger" ? X : Info;
  const classes =
    toast.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : toast.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : toast.tone === "danger"
          ? "border-rose-200 bg-rose-50 text-rose-950"
          : "border-app-border bg-white text-app-foreground";

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_50px_-36px_rgba(36,22,47,0.38)] ${classes}`} role="status" aria-live="polite">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        <p className="text-sm leading-6 opacity-90">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="inline-flex size-8 items-center justify-center rounded-full border border-transparent text-current transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
        aria-label={`Cerrar aviso: ${toast.title}`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastToneLabel({ tone, children }: { tone: ToastTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : tone === "warning"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : tone === "danger"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-app-border bg-white text-app-foreground"
      }`}
    >
      {children}
    </span>
  );
}
