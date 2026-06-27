"use client";

import { Flame } from "lucide-react";

import { formatDateShort } from "@/lib/cycle";
import { getPeakDates, getOvulationText, getSimpleStatusLabel } from "@/lib/fertility";
import { getPersonalizedResultMessage, getResultStateFromSimulation } from "@/lib/personalization";
import type { SimpleRegularity } from "@/lib/simple-storage";
import type { SimulationResult } from "@/types";

export function HeroResult({
  simulation,
  entryCount,
  regularity,
  isDemo = false,
}: {
  simulation: SimulationResult;
  entryCount: number;
  regularity: SimpleRegularity;
  isDemo?: boolean;
}) {
  const peakDates = getPeakDates(simulation).map((date) => formatDateShort(date));
  const ovulation = getOvulationText(simulation);
  const status = getSimpleStatusLabel(simulation);
  const personalized = getPersonalizedResultMessage({
    hasResult: true,
    confidenceLabel: simulation.confidenceBand,
    cycleRegularity: regularity,
    isDemo,
    historyCount: entryCount,
    resultState: getResultStateFromSimulation(simulation),
  });

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(255,248,242,0.94)_100%)] p-4 shadow-[0_28px_80px_-48px_rgba(36,22,47,0.5)] sm:p-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_10%,rgba(216,111,143,0.12)_0%,transparent_32%),radial-gradient(circle_at_95%_100%,rgba(228,183,51,0.12)_0%,transparent_28%)]" aria-hidden="true" />

      <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Resultado del mes</p>
            <span className="rounded-full border border-app-border bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{status}</span>
          </div>

          <div className="mt-4 rounded-[28px] border border-app-border bg-white/90 p-4 shadow-[0_18px_50px_-36px_rgba(36,22,47,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">Tu lectura de hoy</p>
            <h2 className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${personalized.statusTone === "lowConfidence" ? "text-app-rose" : "text-app-foreground"}`}>
              {personalized.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">{personalized.subtitle}</p>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-app-muted">Los días de mayor fertilidad suelen aparecer antes de ovular.</p>

          <div className="mt-5 grid gap-3">
            <Line label="Días más fértiles" value={peakDates.join(", ") || "—"} icon={<Flame className="size-4 text-app-rose" />} />
            <Line label="Ovulación estimada" value={ovulation} icon={<span aria-hidden="true">🥚</span>} />
          </div>
        </div>

        <div className="grid gap-3 rounded-[30px] border border-app-border bg-white/84 p-4 shadow-[0_18px_40px_-30px_rgba(36,22,47,0.35)]">
          <div className="inline-flex items-center rounded-full border border-app-border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
            Estimación educativa
          </div>
          <p className="mt-2 text-xs leading-5 text-app-muted">La ovulación puede moverse.</p>
        </div>
      </div>
    </section>
  );
}

function Line({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[24px] border border-app-border bg-white p-4">
      <div className="rounded-2xl border border-app-border bg-app-surface-2 p-3">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-app-muted">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-app-foreground">{value}</p>
      </div>
    </div>
  );
}
