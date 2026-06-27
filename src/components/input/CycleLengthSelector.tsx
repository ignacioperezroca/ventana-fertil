"use client";

import { useMemo, useState } from "react";

const QUICK_VALUES = [26, 27, 28, 29, 30];

export function CycleLengthSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [customMode, setCustomMode] = useState(() => !QUICK_VALUES.includes(value));

  const selectedValue = useMemo(() => (customMode ? "Otro" : String(value)), [customMode, value]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-app-foreground">Duración promedio del ciclo</p>
        <p className="text-xs leading-5 text-app-muted">Si no sabés, dejá 28 días como estimación inicial.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_VALUES.map((candidate) => {
          const active = !customMode && value === candidate;
          return (
            <button
              key={candidate}
              type="button"
              onClick={() => {
                setCustomMode(false);
                onChange(candidate);
              }}
              className={`vf-press inline-flex h-10 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
                active ? "border-app-primary bg-app-primary/6 text-app-primary" : "border-app-border bg-white text-app-foreground hover:border-app-primary/25"
              }`}
              aria-pressed={active}
            >
              {candidate}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={`vf-press inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
            customMode ? "border-app-primary bg-app-primary/6 text-app-primary" : "border-app-border bg-white text-app-foreground hover:border-app-primary/25"
          }`}
          aria-pressed={customMode}
        >
          Otro
        </button>
      </div>

      {customMode ? (
        <label className="grid gap-2">
          <span className="sr-only">Duración personalizada del ciclo</span>
          <div className="relative">
            <input
              type="number"
              min={21}
              max={45}
              value={value}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value || "28", 10);
                onChange(Number.isFinite(parsed) ? parsed : 28);
              }}
              className="h-12 w-full rounded-2xl border border-app-border bg-white px-4 pr-16 text-sm text-app-foreground outline-none transition placeholder:text-app-muted focus:border-app-primary focus:ring-2 focus:ring-app-primary/15"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold uppercase tracking-[0.14em] text-app-muted">días</span>
          </div>
          <p className="text-xs leading-5 text-app-muted">Usá un valor entre 21 y 45 días.</p>
        </label>
      ) : null}

      <p className="text-xs leading-5 text-app-muted">Selección actual: {selectedValue}</p>
    </div>
  );
}
