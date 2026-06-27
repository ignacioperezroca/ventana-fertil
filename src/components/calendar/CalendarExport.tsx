"use client";

import { ChevronDown, Download, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { buildReminderEvents, buildIcsFile, parseDate } from "@/lib/cycle";
import { trackEvent } from "@/lib/analytics";
import type { SimulationResult } from "@/types";

export function CalendarExport({
  simulation,
  onToast,
}: {
  simulation: SimulationResult;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ovulationDate = parseDate(simulation.ovulationDate);
  const events = useMemo(() => (ovulationDate ? buildReminderEvents(ovulationDate) : []), [ovulationDate]);

  const download = () => {
    if (!ovulationDate || events.length === 0) {
      onToast("warning", "Sin calendario", "Primero necesitamos una ovulación estimada para crear recordatorios.");
      return;
    }

    try {
      const ics = buildIcsFile(events);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ventana-fertil-recordatorios.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("ics_downloaded", { hasResult: true, isDemo: false, source: "fertile_window_reminders", eventVersion: "g1" });
      onToast("success", "Calendario descargado", "Se generaron 8 eventos para tu ventana fértil estimada.");
    } catch {
      onToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descarga habilitada.");
    }
  };

  return (
    <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Guardar</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Recordatorios de calendario</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Generá 8 eventos de 08:00 a 08:15 para tu ventana fértil estimada.</p>
        </div>
        <button
          type="button"
          onClick={download}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(75,44,85,0.5)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
        >
          <Download className="mr-2 size-4" />
          Descargar calendario .ics
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-app-foreground transition hover:text-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/15"
      >
        <CalendarDays className="size-4" />
        Ver eventos incluidos
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="mt-4 grid gap-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 rounded-[22px] border border-app-border bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-app-foreground">{event.title}</p>
                  <p className="mt-1 text-xs text-app-muted">{event.date} · {event.timeLabel}</p>
                </div>
                <span className="rounded-full border border-app-border bg-app-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">
                  {event.offset === 0 ? "O" : `O${event.offset > 0 ? `+${event.offset}` : event.offset}`}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-app-border bg-app-surface-2 px-4 py-3 text-sm leading-6 text-app-muted">
              Primero calculá una ventana fértil para ver los eventos.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
