"use client";

import { CalendarDays, Shield, Wand2 } from "lucide-react";
import { useRef } from "react";

import type { SimpleCoreState, SimpleRegularity } from "@/lib/simple-storage";
import { getRegularityLabel } from "@/lib/fertility";
import { DateShortcutPicker } from "@/components/input/DateShortcutPicker";
import { CycleLengthSelector } from "@/components/input/CycleLengthSelector";

const REGULARITY_OPTIONS: { value: SimpleRegularity; title: string; description: string }[] = [
  { value: "regular", title: "Regular", description: "La ventana suele moverse poco." },
  { value: "algo_variable", title: "Algo variable", description: "Puede correrse algunos días." },
  { value: "irregular", title: "Irregular / no sé", description: "La lectura es más conservadora." },
];

export function SimplePeriodInput({
  state,
  onChange,
  onCalculate,
  onDemo,
  onOpenTrust,
  errors = [],
  savedLabel,
  dateNotice,
}: {
  state: SimpleCoreState;
  onChange: (patch: Partial<SimpleCoreState>) => void;
  onCalculate: () => void;
  onDemo: () => void;
  onOpenTrust: () => void;
  errors?: string[];
  savedLabel?: string | null;
  dateNotice?: string | null;
}) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="rounded-[34px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.42)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Input</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-app-foreground">Cuándo empezó tu último período?</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-app-muted">Poné cuándo empezó tu último período y te mostramos tus días más fértiles del mes.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted sm:flex">
          <CalendarDays className="size-4 text-app-accent" />
          {savedLabel ?? getRegularityLabel(state.regularity)}
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-app-foreground">Primer día de tu última menstruación</span>
          <input
            ref={dateInputRef}
            type="date"
            value={state.lastPeriodStart}
            onChange={(event) => onChange({ lastPeriodStart: event.target.value })}
            className="h-12 rounded-2xl border border-app-border bg-white px-4 text-sm text-app-foreground outline-none transition placeholder:text-app-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/15"
          />
          {dateNotice ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{dateNotice}</p> : null}
        </label>

        <DateShortcutPicker
          value={state.lastPeriodStart}
          onChange={(value) => onChange({ lastPeriodStart: value })}
          isDemo={state.isDemo}
          onOpenPicker={() => {
            if ("showPicker" in HTMLInputElement.prototype) {
              dateInputRef.current?.showPicker?.();
              return;
            }
            dateInputRef.current?.focus();
          }}
        />

        <CycleLengthSelector
          value={state.averageCycleLength}
          onChange={(value) => onChange({ averageCycleLength: value })}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-app-foreground">Regularidad del ciclo</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {REGULARITY_OPTIONS.map((option) => {
            const active = state.regularity === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ regularity: option.value })}
                className={`vf-press rounded-[22px] border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
                  active
                    ? "border-app-primary bg-app-primary/6 shadow-[0_16px_30px_-24px_rgba(75,44,85,0.45)]"
                    : "border-app-border bg-white hover:border-app-primary/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-app-foreground">{option.title}</span>
                  <span className={`mt-0.5 size-2.5 rounded-full ${active ? "bg-app-primary" : "bg-app-border"}`} aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs leading-5 text-app-muted">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="mt-4 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900" role="status" aria-live="polite">
          {errors.map((issue) => (
            <p key={issue}>{issue}</p>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCalculate}
          className="vf-press inline-flex h-12 flex-1 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(75,44,85,0.55)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
        >
          <Wand2 className="mr-2 size-4" />
          Calcular
        </button>
        <button
          type="button"
          onClick={onDemo}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          Ver ejemplo
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenTrust}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-app-muted transition hover:text-app-foreground focus:outline-none focus:ring-2 focus:ring-app-primary/15"
      >
        <Shield className="size-4 text-app-primary" />
        Por qué es privado?
      </button>
    </section>
  );
}
