"use client";

import { calculateSimulation, formatDateShort, formatPercent, todayIsoDate } from "@/lib/cycle";
import { createDemoState } from "@/lib/demo";
import { getCurrentDayStatus } from "@/lib/status";
import { ShareCard } from "@/components/share/ShareCard";
import { copyShareText, copyShareUrl, getShareImageUrl, shareApp } from "@/lib/share";
import { buildMonthGrid, formatMonthLabel } from "@/lib/calendar";
import { useCallback } from "react";

const SURFACE = "rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.88)] shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl";

export default function PreviewPage() {
  const state = createDemoState();
  const simulation = calculateSimulation(state);
  const currentDayStatus = getCurrentDayStatus(simulation);
  const monthAnchor = new Date(`${state.calendarMonth}T00:00:00`);
  const monthCells = buildMonthGrid(monthAnchor).slice(0, 14);
  const handleCopyLink = useCallback(async () => {
    try {
      await copyShareUrl();
    } catch {
      // Preview mode: no-op if clipboard is unavailable.
    }
  }, []);
  const handleCopyText = useCallback(async () => {
    try {
      await copyShareText();
    } catch {
      // Preview mode: no-op if clipboard is unavailable.
    }
  }, []);
  const handleShare = useCallback(async () => {
    try {
      const shared = await shareApp();
      if (!shared) {
        await copyShareUrl();
      }
    } catch {
      // Preview mode: no-op if share is unavailable.
    }
  }, []);
  const handleDownloadImage = useCallback(async () => {
    try {
      const response = await fetch(getShareImageUrl());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ventana-fertil-compartir.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Preview mode: no-op if download is unavailable.
    }
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf4ee_0%,#fffdfb_42%,#f7efeb_100%)] px-4 py-6 text-app-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className={`${SURFACE} p-6 sm:p-8`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">
                🥚 Ventana Fértil
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-app-foreground sm:text-5xl">Entendé tu ciclo, día por día.</h1>
              <p className="max-w-2xl text-lg leading-8 text-app-muted">Una vista demo, lista para capturas limpias y sin datos personales.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{currentDayStatus.label}</Badge>
              <Badge>Modo demo</Badge>
              <Badge>Privada</Badge>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`${SURFACE} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Resumen</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Día actual" value={simulation.cycleDayToday ? `Día ${simulation.cycleDayToday}` : "—"} helper={currentDayStatus.short} />
              <SummaryCard label="Ovulación estimada" value={simulation.ovulationDate ? formatDateShort(simulation.ovulationDate) : "—"} helper="Modelo visual" />
              <SummaryCard label="Ventana fértil" value={simulation.fertileWindowStart ? `${formatDateShort(simulation.fertileWindowStart)} – ${formatDateShort(simulation.fertileWindowEnd)}` : "—"} helper="O-6 a O+1" />
              <SummaryCard label="Incertidumbre" value={`${simulation.uncertaintyScore}%`} helper={simulation.uncertaintyBand} />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Día pico" value="O-3" helper="26.7%" />
              <SummaryCard label="Cluster pico" value="O-4 a O-1" helper="Mayor atención" />
              <SummaryCard label="Ventana base" value="8 días" helper="O-6 a O+1" />
              <SummaryCard label="Estado" value={currentDayStatus.label} helper={currentDayStatus.cta} />
            </div>
          </div>

          <div className={`${SURFACE} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Calendario</p>
            <p className="mt-1 text-xl font-semibold text-app-foreground">{formatMonthLabel(monthAnchor)}</p>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                <div key={day} className="px-1 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
                  {day}
                </div>
              ))}
              {monthCells.map((cell) => {
                const day = simulation.dayInsights[cell.iso];
                const today = cell.iso === todayIsoDate();
                return (
                  <div key={cell.iso} className={`min-h-16 rounded-2xl border p-2 text-xs ${today ? "border-app-primary bg-app-primary/10" : "border-app-border bg-white"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-app-foreground">{cell.date.getDate()}</span>
                      {today ? <span className="rounded-full bg-app-primary px-2 py-0.5 text-[10px] font-semibold text-white">Hoy</span> : null}
                    </div>
                    <div className="mt-2 space-y-1">
                      {day?.peakWindow ? <p className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-800">Pico</p> : null}
                      {day?.fertileWindow ? <p className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-800">{formatPercent(day.markerPercent)}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`${SURFACE} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Curva</p>
            <div className="mt-4 grid grid-cols-8 gap-2">
              {simulation.riskTable.map((point) => (
                <div key={point.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end rounded-2xl border border-app-border bg-white px-2 py-2">
                    <div className="w-full rounded-2xl bg-[linear-gradient(180deg,#d86f8f_0%,#932b52_100%)]" style={{ height: `${Math.max(16, Math.round((point.percent / 27) * 120))}px` }} />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{point.label}</p>
                  <p className="text-[11px] text-app-muted">{point.percent.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <ShareCard
              onCopyLink={handleCopyLink}
              onCopyText={handleCopyText}
              onShare={handleShare}
              onDownloadImage={handleDownloadImage}
            />
            <div className={`${SURFACE} p-5`}>
              <p className="text-sm font-semibold text-app-foreground">Privacidad</p>
              <p className="mt-2 text-sm leading-6 text-app-muted">La vista de preview usa demo local y no incluye datos personales del usuario.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="inline-flex items-center rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold text-app-foreground">{children}</span>;
}

function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-app-border bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-app-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-app-muted">{helper}</p>
    </div>
  );
}
