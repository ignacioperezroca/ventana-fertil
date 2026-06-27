"use client";

import { addDays, formatDateInput, formatDateShort, parseDate } from "@/lib/cycle";
import { formatMarkerValue } from "@/lib/preferences";
import { trackEvent } from "@/lib/analytics";
import type { SimulationResult } from "@/types";

export function FertileWindowStrip({
  simulation,
  cycleStart,
  lowAnxietyMode = false,
}: {
  simulation: SimulationResult;
  cycleStart: string;
  lowAnxietyMode?: boolean;
}) {
  const startDate = parseDate(cycleStart);
  const ovulation = parseDate(simulation.ovulationDate);
  if (!startDate || !ovulation) return null;

  const items = simulation.riskTable.map((point) => {
    const date = addDays(ovulation, point.offset);
    const iso = formatDateInput(date);
    const isToday = simulation.selectedDate === iso;
    const isPeriod = point.offset === -6;
    const isPeak = point.offset >= -4 && point.offset <= -1;
    const isOvulation = point.offset === 0;
    const markerLabel = formatMarkerValue(point.percent, lowAnxietyMode);
    return { ...point, iso, date, isToday, isPeriod, isPeak, isOvulation, markerLabel };
  });

  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Ventana fértil</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Marcador estimado</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Deslizá la fila para ver cómo sube el marcador antes de ovular.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
        <Tag text="🩸" label="Período" />
        <Tag text="🪟" label="Ventana" />
        <Tag text="🔥" label="Pico" />
        <Tag text="🥚" label="Ovulación" />
        <Tag text="📍" label="Hoy" />
      </div>

      <div className="vf-no-scrollbar mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-3">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`vf-press flex w-[104px] shrink-0 flex-col justify-between rounded-[24px] border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
                item.isOvulation
                  ? "border-app-accent/45 bg-[linear-gradient(180deg,rgba(255,248,217,0.98)_0%,rgba(255,238,185,0.92)_100%)] shadow-[0_18px_34px_-26px_rgba(228,183,51,0.55)]"
                  : item.isPeak
                    ? "border-app-rose/35 bg-[linear-gradient(180deg,rgba(255,236,241,0.98)_0%,rgba(255,220,231,0.92)_100%)] shadow-[0_18px_34px_-26px_rgba(216,111,143,0.55)]"
                    : item.offset >= -6 && item.offset <= 1
                      ? "border-app-border bg-white"
                      : "border-app-border bg-app-surface"
              } ${item.isToday ? "ring-2 ring-app-primary/15" : ""}`}
              onClick={() =>
                trackEvent("calendar_day_opened", {
                  source: `fertile-window-${item.label}`,
                  hasResult: true,
                  isDemo: false,
                  eventVersion: "g1",
                })
              }
              aria-label={`${item.label}, ${formatDateShort(item.date)}, ${item.markerLabel}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-app-foreground">{item.label}</p>
                  <p className="mt-1 text-[11px] text-app-muted">{formatDateShort(item.date)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${item.isOvulation ? "bg-app-accent/15 text-app-primary" : item.isPeak ? "bg-white text-app-deep-rose" : "bg-app-surface-2 text-app-muted"}`}>
                  {item.isOvulation ? "🥚" : item.isPeak ? "🔥" : item.isPeriod ? "🩸" : "🪟"}
                </span>
              </div>
              <div className="mt-3">
                <p className={`text-[1.7rem] font-semibold leading-none ${item.isOvulation ? "text-app-primary" : item.isPeak ? "text-app-deep-rose" : "text-app-foreground"}`}>
                  {item.markerLabel}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-app-muted">
                  {item.isToday ? "📍 Hoy" : item.isPeriod ? "🩸" : item.isOvulation ? "🥚 Ovulación" : item.isPeak ? "🔥 Pico" : "🪟 Ventana"}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-surface-2">
                <div
                  className={`h-full rounded-full ${
                    item.isOvulation ? "bg-app-accent" : item.isPeak ? "bg-[linear-gradient(90deg,#f1b84d_0%,#d86f8f_55%,#932b52_100%)]" : item.offset >= -6 && item.offset <= 1 ? "bg-app-rose" : "bg-app-border"
                  }`}
                  style={{ width: `${Math.max(12, item.percent * 3)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tag({ text, label }: { text: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2">
      <span aria-hidden="true">{text}</span>
      <span>{label}</span>
    </span>
  );
}
