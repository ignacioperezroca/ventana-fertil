"use client";

import { useEffect } from "react";
import { CalendarDays, Egg, Sparkles } from "lucide-react";
import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import { buildScenarioCards, getScenarioShiftLabel, getScenarioShiftSummary } from "@/lib/scenarios";
import type { ReactNode } from "react";
import type { ExposureEntry, SimulationResult } from "@/types";

export function ScenarioSimulator({
  simulation,
  exposures,
  lowAnxietyMode = false,
}: {
  simulation: SimulationResult;
  exposures: ExposureEntry[];
  lowAnxietyMode?: boolean;
}) {
  const scenarios = buildScenarioCards(simulation, exposures);

  useEffect(() => {
    if (!simulation.valid) return;
    trackEvent("scenario_simulator_opened", {
      hasSimulation: true,
      confidenceLevel: simulation.confidenceBand,
      uncertaintyBucket: simulation.uncertaintyBand,
      source: "today",
      isDemo: false,
      deviceCategory: getDeviceCategory(),
    });
  }, [simulation]);

  if (!simulation.valid || scenarios.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Simulador de escenarios</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Qué pasa si la ovulación se adelanta o atrasa?</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">Este simulador muestra por qué el calendario puede fallar cuando la ovulación se mueve.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          <Sparkles className="size-3.5 text-app-accent" />
          Educativo
        </span>
      </div>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {scenarios.map((scenario) => {
            const shiftLabel = getScenarioShiftLabel(scenario.shiftDays);
            const windowDay = scenario.shiftDays === 0 ? "Base" : scenario.shiftDays > 0 ? `+${Math.abs(scenario.shiftDays)}` : `${scenario.shiftDays}`;
            const tone = scenario.confidenceImpact === "Alta" ? "very-high" : scenario.confidenceImpact === "Media" ? "moderate" : "low";
            return (
              <article key={scenario.id} className="vf-hover-card w-[19rem] rounded-[28px] border border-app-border bg-white p-4 shadow-[0_18px_50px_-38px_rgba(36,22,47,0.35)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">{shiftLabel}</p>
                    <h4 className="mt-2 text-lg font-semibold text-app-foreground">{scenario.title}</h4>
                  </div>
                  <Badge tone={tone}>{scenario.confidenceImpact}</Badge>
                </div>

                <div className="mt-4 rounded-[24px] border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff6ef_100%)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
                    <Egg className="size-4 text-app-primary" />
                    {scenario.ovulationLabel}
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">Ventana</p>
                      <p className="mt-1 text-sm font-semibold text-app-foreground">{scenario.fertileWindowLabel}</p>
                      <p className="mt-1 text-xs leading-5 text-app-muted">Pico: {scenario.peakLabel}</p>
                    </div>
                    <div className="flex flex-col items-end justify-center text-right">
                      <span className="rounded-full bg-app-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-primary">
                        {lowAnxietyMode ? `Impacto ${scenario.confidenceImpact.toLowerCase()}` : scenario.shiftDays === 0 ? "Base" : scenario.confidenceImpact}
                      </span>
                      <span className="mt-2 text-[11px] text-app-muted">{windowDay}</span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-app-surface-2">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#f2b7c7_0%,#d86f8f_55%,#932b52_100%)]" style={{ width: scenario.shiftDays === 0 ? "100%" : `${70 + Math.abs(scenario.shiftDays) * 6}%` }} />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm leading-6 text-app-muted">
                  <p>{scenario.summary}</p>
                  <p>{scenario.exposureLabel}</p>
                  <p>{getScenarioShiftSummary()}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                  <CalendarDays className="size-3.5" />
                  {scenario.confidenceImpact === "Alta" ? "Leé este escenario con más margen" : "Comparación educativa"}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-app-muted">No indica una verdad única. Muestra cómo la ventana puede moverse si cambia la ovulación.</p>
    </section>
  );
}

function Badge({ tone, children }: { tone: "very-low" | "low" | "moderate" | "high" | "very-high"; children: ReactNode }) {
  const classes =
    tone === "very-high"
      ? "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800"
      : tone === "high"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : tone === "moderate"
          ? "border-orange-200 bg-orange-50 text-orange-800"
          : tone === "low"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}
