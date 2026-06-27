"use client";

import { CalendarClock, Download, X } from "lucide-react";
import { useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { buildNextPeriodReminderEvent, buildNextPeriodReminderIcs, formatDateShort } from "@/lib/cycle";

export function NextPeriodReminder({
  lastPeriodStart,
  averageCycleLength,
  onToast,
}: {
  lastPeriodStart: string;
  averageCycleLength: number;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const reminder = buildNextPeriodReminderEvent(lastPeriodStart, averageCycleLength);

  if (dismissed) return null;

  const handleDownload = () => {
    if (!reminder) {
      onToast("warning", "Sin recordatorio", "Primero necesitamos una fecha de inicio válida.");
      return;
    }

    try {
      const ics = buildNextPeriodReminderIcs(lastPeriodStart, averageCycleLength);
      if (!ics) {
        onToast("warning", "Sin recordatorio", "Primero necesitamos una fecha de inicio válida.");
        return;
      }
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ventana-fertil-proximo-periodo.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("next_period_reminder_downloaded", { hasResult: true, isDemo: false, source: "retention_prompt", eventVersion: "g1" });
      onToast("success", "Recordatorio descargado", "Se generó un evento para el próximo período.");
    } catch {
      onToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descarga habilitada.");
    }
  };

  if (!reminder) {
    return (
      <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-app-border bg-app-surface-2 p-3 text-app-muted">
            <CalendarClock className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Recordatorio</p>
            <h3 className="mt-2 text-xl font-semibold text-app-foreground">Querés acordarte de cargar tu próximo período?</h3>
            <p className="mt-2 text-sm leading-6 text-app-muted">Primero calculá tu ventana fértil para generar eventos de calendario.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[34px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Retención</p>
          <h3 className="text-xl font-semibold text-app-foreground">Querés acordarte de cargar tu próximo período?</h3>
          <p className="max-w-2xl text-sm leading-6 text-app-muted">Descargá un recordatorio simple para volver a Ventana Fértil cuando arranque el próximo ciclo.</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(75,44,85,0.5)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
        >
          <Download className="mr-2 size-4" />
          Descargar recordatorio .ics
        </button>
      </div>

      <div className="mt-4 rounded-[28px] border border-app-border bg-white p-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-app-foreground">{reminder.title}</p>
          <span className="rounded-full border border-app-border bg-app-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-app-muted">
            {reminder.timeLabel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Tu próximo período estimado aparece el <span className="font-semibold text-app-foreground">{formatDateShort(reminder.date)}</span>.
        </p>
        <p className="mt-3 text-xs leading-5 text-app-muted">{reminder.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs leading-5 text-app-muted">
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="size-3.5" />
          Remind cercano al próximo ciclo
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleDownload} className="inline-flex items-center gap-1 font-semibold text-app-foreground transition hover:text-app-primary">
            <Download className="size-3.5" />
            Descargar
          </button>
          <button type="button" onClick={() => setDismissed(true)} className="inline-flex items-center gap-1 font-semibold text-app-muted transition hover:text-app-foreground">
            <X className="size-3.5" />
            No ahora
          </button>
        </div>
      </div>
    </section>
  );
}
