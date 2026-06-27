"use client";

import { CalendarDays, CalendarPlus2, Download, Sparkles } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { buildNextPeriodReminderIcs, formatDateShort } from "@/lib/cycle";
import { buildSimulationIcs } from "@/lib/fertility";
import { getNextPeriodDate } from "@/lib/resultSummary";
import { NextCyclePrompt } from "@/components/retention/NextCyclePrompt";
import type { SimulationResult } from "@/types";

export function CalendarSubscriptionCard({
  simulation,
  lastPeriodStart,
  averageCycleLength,
  onToast,
}: {
  simulation: SimulationResult;
  lastPeriodStart: string;
  averageCycleLength: number;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const downloadMonthIcs = () => {
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
      trackEvent("ics_downloaded", { hasResult: true, isDemo: false, source: "calendar_subscription", eventVersion: "g1" });
      onToast("success", "Calendario descargado", "Se generaron 8 eventos para tu ventana fértil estimada.");
    } catch {
      onToast("danger", "No se pudo descargar", "Probá de nuevo en un navegador con descargas habilitadas.");
    }
  };

  const copyExpectedNextPeriod = async () => {
    const nextDate = getNextPeriodDate(lastPeriodStart, averageCycleLength);
    if (!nextDate) {
      onToast("warning", "Sin recordatorio", "Primero calculá con una fecha válida.");
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("El portapapeles no está disponible en este navegador.");
      }
      await navigator.clipboard.writeText(formatDateShort(nextDate));
      onToast("success", "Fecha copiada", "Podés pegarla donde quieras.");
    } catch (error) {
      onToast("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  };

  const handleInterest = () => {
    onToast("neutral", "Lo sumamos al roadmap.", "Calendario automático mensual guardado como oportunidad futura.");
  };

  const nextReminderIcs = buildNextPeriodReminderIcs(lastPeriodStart, averageCycleLength);

  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Calendario</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Guardar recordatorios</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Descargá 8 eventos de 08:00 a 08:15 para tu ventana fértil estimada.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <CalendarDays className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="rounded-[24px] border border-app-border bg-white p-4">
          <div className="flex items-center gap-2">
            <CalendarPlus2 className="size-4 text-app-primary" />
            <p className="text-sm font-semibold text-app-foreground">Eventos incluidos</p>
          </div>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-app-muted">
            <p>• O-6 a O+1 del mes actual.</p>
            <p>• Descarga del próximo período para volver a cargar el ciclo.</p>
            <p>• Descripción educativa, sin notas personales ni datos sensibles.</p>
          </div>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={downloadMonthIcs}
            className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
          >
            <Download className="mr-2 size-4" />
            Descargar .ics del mes actual
          </button>
          <button
            type="button"
            onClick={handleInterest}
            className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
          >
            <Sparkles className="mr-2 size-4 text-app-primary" />
            Me interesa
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff6ef_100%)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">Próximamente</p>
        <h4 className="mt-2 text-sm font-semibold text-app-foreground">Calendario automático mensual</h4>
        <p className="mt-2 text-xs leading-5 text-app-muted">Lo sumamos al roadmap para que el calendario se renueve solo cada mes.</p>
      </div>

      <div className="mt-4">
        <NextCyclePrompt
          lastPeriodStart={lastPeriodStart}
          averageCycleLength={averageCycleLength}
          onDownload={() => {
            if (!nextReminderIcs) {
              onToast("warning", "Sin recordatorio", "Primero necesitamos una fecha válida.");
              return;
            }
            const blob = new Blob([nextReminderIcs], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "ventana-fertil-proximo-periodo.ics";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            trackEvent("next_period_reminder_downloaded", { hasResult: true, isDemo: false, source: "next_cycle_prompt", eventVersion: "g1" });
            onToast("success", "Recordatorio descargado", "Se generó el evento para el próximo período.");
          }}
          onCopyDate={copyExpectedNextPeriod}
        />
      </div>
    </section>
  );
}
