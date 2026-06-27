"use client";

import { useMemo, useState } from "react";
import { Egg, Flame, Sparkles } from "lucide-react";
import type { SimulationResult } from "@/types";
import { addDays, formatDateShort, parseDate } from "@/lib/cycle";
import { formatMarkerValue } from "@/lib/preferences";

export function FertileTimeline({ simulation, lowAnxietyMode = false }: { simulation: SimulationResult; lowAnxietyMode?: boolean }) {
  const [selected, setSelected] = useState<number>(-3);
  const ovulation = parseDate(simulation.ovulationDate);

  const items = useMemo(
    () =>
      simulation.riskTable.map((point) => {
        const date = ovulation ? addDays(ovulation, point.offset) : null;
        return { ...point, date };
      }),
    [ovulation, simulation.riskTable],
  );

  const current = items.find((item) => item.offset === selected) ?? items[3];

  return (
    <div className="rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_20px_50px_-38px_rgba(36,22,47,0.36)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Días O</p>
          <p className="mt-1 text-sm text-app-muted">Deslizá para ver el pico.</p>
        </div>
        <div className="rounded-full bg-app-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-primary">
          O-3 · O-2
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3">
          {items.map((item) => {
            const active = item.offset === selected;
            const peak = item.offset >= -4 && item.offset <= -1;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelected(item.offset)}
                className={`vf-press min-w-[120px] rounded-[24px] border p-4 text-left transition ${
                  active ? "border-app-primary bg-app-primary/8 shadow-[0_18px_30px_-20px_rgba(75,44,85,0.35)]" : "border-app-border bg-white hover:border-app-primary/35"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-app-foreground">{item.label}</p>
                    <p className="mt-1 text-[11px] text-app-muted">{item.date ? formatDateShort(item.date) : "—"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${peak ? "bg-orange-50 text-orange-800" : "bg-app-surface-2 text-app-muted"}`}>
                    {peak ? <Flame className="inline size-3 -translate-y-0.5" /> : <Sparkles className="inline size-3 -translate-y-0.5" />} {formatMarkerValue(item.percent, lowAnxietyMode)}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-app-surface-2">
                  <div className={`h-full rounded-full ${peak ? "bg-[linear-gradient(90deg,#f1b84d_0%,#d86f8f_55%,#932b52_100%)]" : "bg-[linear-gradient(90deg,#badcc8_0%,#d86f8f_100%)]"}`} style={{ width: `${Math.max(8, item.percent * 3)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff5f0_100%)] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
          {current.offset === 0 ? <Egg className="size-4 text-app-primary" /> : <Flame className="size-4 text-app-accent" />}
          {current.label} · {current.date ? formatDateShort(current.date) : "—"}
        </div>
        <p className="mt-2 text-sm leading-6 text-app-muted">{current.offset >= -4 && current.offset <= -1 ? "El marcador sube antes de ovular." : "Marcador educativo por día."}</p>
      </div>
    </div>
  );
}
