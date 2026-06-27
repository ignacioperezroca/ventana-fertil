"use client";

import { useMemo } from "react";

import { buildConfidenceExplainer } from "@/lib/resultSummary";
import type { SimpleRegularity } from "@/lib/simple-storage";
import type { SimulationResult } from "@/types";

export function ResultConfidencePill({
  simulation,
  entryCount,
  regularity,
  lowAnxietyMode = false,
}: {
  simulation: SimulationResult;
  entryCount: number;
  regularity: SimpleRegularity;
  lowAnxietyMode?: boolean;
}) {
  const explainer = useMemo(() => buildConfidenceExplainer(simulation, entryCount, regularity), [entryCount, regularity, simulation]);
  const classes =
    explainer.label === "Alta"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : explainer.label === "Baja"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`rounded-[26px] border p-4 shadow-[0_18px_40px_-34px_rgba(36,22,47,0.25)] ${classes}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">Claridad</p>
          <p className="mt-1 text-lg font-semibold">{explainer.label === "Alta" ? "Buena estimación" : explainer.label === "Baja" ? "Estimación con baja confianza" : "Estimación inicial"}</p>
        </div>
        <span className="rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">
          {explainer.label}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70" aria-hidden="true">
        <div className="h-full rounded-full bg-current" style={{ width: `${explainer.meter}%`, opacity: 0.9 }} />
      </div>

      <p className="mt-3 text-sm leading-6">{explainer.summary}</p>

      <details className="mt-3 rounded-[20px] border border-black/5 bg-white/70 p-3">
        <summary className="cursor-pointer list-none text-sm font-semibold">Por qué?</summary>
        <div className="mt-2 grid gap-2 text-sm leading-6 opacity-90">
          {explainer.details.map((detail) => (
            <p key={detail}>• {detail}</p>
          ))}
          {lowAnxietyMode ? <p>• En modo baja ansiedad, la app prioriza etiquetas sobre cifras exactas.</p> : null}
        </div>
      </details>
    </div>
  );
}
