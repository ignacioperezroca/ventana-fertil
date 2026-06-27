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
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Marcador estimado por timing</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Deslizá la fila para ver cómo sube el timing antes de ovular.</p>
        </div>
        <div className="rounded-full border border-app-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
          🩸 {formatDateShort(startDate)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
        <Tag text="🩸 Período" />
        <Tag text="🪟 Ventana" />
        <Tag text="🔥 Pico" />
        <Tag text="🥚 Ovulación" />
        <Tag text="📍 Hoy" />
      </div>

      <div className="vf-no-scrollbar mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`vf-press flex w-[92px] shrink-0 flex-col justify-between rounded-[24px] border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
                item.isOvulation
                  ? "border-app-accent/40 bg-[linear-gradient(180deg,rgba(255,248,217,0.98)_0%,rgba(255,238,185,0.92)_100%)]"
                  : item.isPeak
                    ? "border-app-rose/30 bg-[linear-gradient(180deg,rgba(255,236,241,0.98)_0%,rgba(255,220,231,0.92)_100%)]"
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
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${item.isPeak ? "bg-white text-app-deep-rose" : "bg-app-surface-2 text-app-muted"}`}>
                  {item.markerLabel}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-app-surface-2">
                <div
                  className={`h-full rounded-full ${
                    item.isOvulation ? "bg-app-accent" : item.isPeak ? "bg-[linear-gradient(90deg,#f1b84d_0%,#d86f8f_55%,#932b52_100%)]" : item.offset >= -6 && item.offset <= 1 ? "bg-app-rose" : "bg-app-border"
                  }`}
                  style={{ width: `${Math.max(12, item.percent * 3)}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">
                {item.isToday ? "📍 Hoy" : item.isPeriod ? "🩸 Inicio" : item.isOvulation ? "🥚 Ovulación" : item.isPeak ? "🔥 Pico" : "🪟 Ventana"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-app-muted">La fila resume los 8 marcadores O-6 a O+1 sin mostrar una tabla larga.</p>
    </section>
  );
}

function Tag({ text }: { text: string }) {
  return <span className="inline-flex items-center rounded-full border border-app-border bg-white px-3 py-2">{text}</span>;
}

