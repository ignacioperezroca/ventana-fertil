"use client";

import { ArrowRight, CalendarDays, Flame, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { buildMonthlyActionPlan } from "@/lib/resultSummary";
import type { SimulationResult } from "@/types";

export function MonthlyActionPlan({
  simulation,
  onAction,
}: {
  simulation: SimulationResult;
  onAction?: () => void;
}) {
  const plan = buildMonthlyActionPlan(simulation);

  if (!plan) return null;

  return (
    <section className="rounded-[30px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Qué mirar este mes</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">{plan.title}</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">{plan.summary}</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Sparkles className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Metric label="Próxima fecha clave" value={plan.nextKeyDateLabel} icon={<CalendarDays className="size-4" />} />
        <Metric label="Ventana fértil" value={plan.fertileWindowLabel} icon={<Flame className="size-4" />} />
        <Metric label="Días más fértiles" value={plan.peakDaysLabel} icon={<Sparkles className="size-4" />} />
        <Metric label="Confianza" value={plan.confidenceLabel} icon={<span aria-hidden="true">⚠️</span>} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-app-border bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Siguiente paso</p>
          <p className="mt-1 text-sm font-semibold text-app-foreground">{plan.suggestedAction}</p>
          <p className="mt-1 text-xs leading-5 text-app-muted">Fecha clave: {plan.nextKeyDateLabel}</p>
        </div>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
          >
            {plan.suggestedAction}
            <ArrowRight className="ml-2 size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
        <span className={`inline-flex items-center rounded-full border px-3 py-1 ${plan.stateLabel === "inside" ? "border-rose-200 bg-rose-50 text-rose-800" : plan.stateLabel === "upcoming" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
          {plan.stateLabel === "inside" ? "Dentro de ventana" : plan.stateLabel === "upcoming" ? "Próxima ventana" : "Ventana pasada"}
        </span>
      </div>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-white p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 rounded-full border border-app-border bg-app-surface-2 p-1.5 text-app-primary">{icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-app-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
