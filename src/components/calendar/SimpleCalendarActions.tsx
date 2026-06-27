"use client";

import { CalendarPlus2, Download, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { trackEvent } from "@/lib/analytics";
import { buildNextPeriodReminderEvent, formatDateShort } from "@/lib/cycle";
import { buildSimulationIcs } from "@/lib/fertility";
import type { SimulationResult } from "@/types";

export function SimpleCalendarActions({
  simulation,
  lastPeriodStart,
  averageCycleLength,
  onToast,
  isDemo = false,
}: {
  simulation: SimulationResult;
  lastPeriodStart: string;
  averageCycleLength: number;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
  isDemo?: boolean;
}) {
  const nextPeriodEvent = useMemo(() => buildNextPeriodReminderEvent(lastPeriodStart, averageCycleLength), [averageCycleLength, lastPeriodStart]);

  const downloadWindow = () => {
    try {
      const ics = buildSimulationIcs(simulation);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ventana-fertil-recordatorios.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("calendar_downloaded", { hasResult: true, isDemo, source: "simple_calendar_actions", eventVersion: "g1" });
      onToast("success", "Calendario descargado", "Se generaron 8 eventos para tu ventana fértil estimada.");
    } catch {
      onToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descargas habilitadas.");
    }
  };

  const downloadNextPeriod = () => {
    if (!nextPeriodEvent) {
      onToast("warning", "Sin recordatorio", "Primero cargá una fecha válida.");
      return;
    }
    try {
      const ics = buildIcsFromEvent(nextPeriodEvent);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ventana-fertil-proximo-periodo.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("next_period_reminder_downloaded", { hasResult: true, isDemo, source: "simple_calendar_actions", eventVersion: "g1" });
      onToast("success", "Recordatorio descargado", "Se generó el evento para el próximo período.");
    } catch {
      onToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descargas habilitadas.");
    }
  };

  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Guardar recordatorios</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Calendario simple</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Generá 8 eventos de 08:00 a 08:15 para tu ventana fértil estimada.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <CalendarPlus2 className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadWindow}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
        >
          <Download className="mr-2 size-4" />
          Descargar ventana fértil
        </button>
        <button
          type="button"
          onClick={downloadNextPeriod}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          <Sparkles className="mr-2 size-4 text-app-primary" />
          Recordarme cargar próximo período
        </button>
      </div>

      <details className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Ver eventos incluidos</summary>
        <div className="mt-4 grid gap-3">
          <EventGroup
            title="Ventana fértil del mes"
            items={simulation.reminders.map((event) => ({
              label: event.title,
              value: `${formatDateShort(event.date)} · ${event.timeLabel}`,
            }))}
          />
          {nextPeriodEvent ? (
            <EventGroup
              title="Próximo período"
              items={[
                {
                  label: nextPeriodEvent.title,
                  value: `${formatDateShort(nextPeriodEvent.date)} · ${nextPeriodEvent.timeLabel}`,
                },
              ]}
            />
          ) : null}
        </div>
      </details>
    </section>
  );
}

function EventGroup({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="rounded-[20px] border border-app-border bg-app-surface-2/50 px-3 py-2 text-sm">
            <p className="font-semibold text-app-foreground">{item.label}</p>
            <p className="mt-1 text-app-muted">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildIcsFromEvent(event: { id: string; title: string; description: string; startIso: string }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ventana Fertil//Simulador Educativo//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:America/Argentina/Buenos_Aires",
    "BEGIN:VEVENT",
    `UID:${event.id}@ventana-fertil`,
    `DTSTAMP:${event.startIso}`,
    `DTSTART;TZID=America/Argentina/Buenos_Aires:${event.startIso}`,
    `SUMMARY:${event.title.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,")}`,
    `DESCRIPTION:${event.description.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${event.title.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
