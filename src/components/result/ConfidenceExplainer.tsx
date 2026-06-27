"use client";

import { ChevronDown, Sparkles } from "lucide-react";

import { buildConfidenceExplainer } from "@/lib/resultSummary";
import type { SimpleRegularity } from "@/lib/simple-storage";
import type { SimulationResult } from "@/types";

export function ConfidenceExplainer({
  simulation,
  historyCount,
  regularity,
}: {
  simulation: SimulationResult;
  historyCount: number;
  regularity: SimpleRegularity;
}) {
  const confidence = buildConfidenceExplainer(simulation, historyCount, regularity);

  return (
    <section className="rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Confianza</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">{confidence.label}</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">{confidence.summary}</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Sparkles className="size-5" />
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-app-border bg-app-surface-2/50 p-4">
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full ${
              confidence.label === "Alta"
                ? "bg-[linear-gradient(90deg,#c7f9cc_0%,#63c27c_100%)]"
                : confidence.label === "Media"
                  ? "bg-[linear-gradient(90deg,#ffd79a_0%,#e4a64a_100%)]"
                  : "bg-[linear-gradient(90deg,#f3b3c1_0%,#d86f8f_100%)]"
            }`}
            style={{ width: `${confidence.meter}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          <span>Lectura visual</span>
          <span>{confidence.meter}%</span>
        </div>
      </div>

      <details className="group mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-app-foreground">
          Por qué?
          <ChevronDown className="size-4 text-app-muted transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid gap-2 text-sm leading-6 text-app-muted">
          {confidence.details.map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </div>
      </details>
    </section>
  );
}
