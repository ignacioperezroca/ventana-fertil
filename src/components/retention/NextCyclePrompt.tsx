"use client";

import { CalendarClock, Download, Link2 } from "lucide-react";

import { buildNextPeriodReminderEvent, formatDateShort } from "@/lib/cycle";

export function NextCyclePrompt({
  lastPeriodStart,
  averageCycleLength,
  onDownload,
  onCopyDate,
}: {
  lastPeriodStart: string;
  averageCycleLength: number;
  onDownload: () => void;
  onCopyDate: () => void;
}) {
  const reminder = buildNextPeriodReminderEvent(lastPeriodStart, averageCycleLength);

  if (!reminder) {
    return (
      <div className="rounded-[24px] border border-dashed border-app-border bg-white p-4 text-sm leading-6 text-app-muted">
        Primero necesitás un período válido para generar el recordatorio.
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-app-border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">Recordatorio</p>
          <h4 className="mt-2 text-sm font-semibold text-app-foreground">Cuando vuelva a venirte, cargá el nuevo ciclo</h4>
          <p className="mt-2 text-xs leading-5 text-app-muted">Tu próximo período estimado aparece el {formatDateShort(reminder.date)}.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface-2 p-3 text-app-primary">
          <CalendarClock className="size-4" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownload}
          className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
        >
          <Download className="mr-2 size-4" />
          Descargar .ics
        </button>
        <button
          type="button"
          onClick={onCopyDate}
          className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          <Link2 className="mr-2 size-4" />
          Copiar fecha
        </button>
      </div>
    </div>
  );
}
