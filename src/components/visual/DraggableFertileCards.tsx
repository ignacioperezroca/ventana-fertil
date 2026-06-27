"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { addDays, formatDateShort, parseDate } from "@/lib/cycle";
import type { SimulationResult } from "@/types";

export function DraggableFertileCards({
  simulation,
  shiftDays = 0,
  selectedOffset,
  onSelectOffset,
}: {
  simulation: SimulationResult;
  shiftDays?: number;
  selectedOffset: number;
  onSelectOffset: (offset: number) => void;
}) {
  const ovulation = parseDate(simulation.ovulationDate);
  const scenarioOvulation = ovulation ? addDays(ovulation, shiftDays) : null;
  const items = simulation.riskTable.map((point) => {
    const date = scenarioOvulation ? addDays(scenarioOvulation, point.offset) : null;
    const peak = point.offset >= -4 && point.offset <= -1;
    return { ...point, date, peak };
  });

  return (
    <section className="rounded-[34px] border border-app-border bg-white/92 p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Marcadores</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Tus 8 días clave</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Marcador estimado por timing. Deslizá las tarjetas para darles un toque más táctil.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted sm:flex">
          <Sparkles className="size-3.5 text-app-accent" />
          Drag suave
        </div>
      </div>

      <div className="vf-no-scrollbar mt-4 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {items.map((item) => {
            const active = selectedOffset === item.offset;
            const toneClass = item.offset >= -4 && item.offset <= -1
              ? "border-app-rose/40 bg-[linear-gradient(180deg,rgba(255,240,244,0.98)_0%,rgba(255,228,236,0.9)_100%)] text-app-deep-rose"
              : "border-app-border bg-white text-app-foreground";

            return (
              <motion.button
                key={item.label}
                type="button"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.08}
                onClick={() => onSelectOffset(item.offset)}
                className={`vf-press relative flex w-[136px] shrink-0 flex-col rounded-[28px] border p-4 text-left shadow-[0_18px_40px_-34px_rgba(36,22,47,0.35)] transition ${toneClass} ${active ? "ring-2 ring-app-primary/20" : ""}`}
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-app-foreground">{item.date ? formatDateShort(item.date) : "—"}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">{item.label}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${item.peak ? "bg-app-rose/12 text-app-rose" : "bg-app-surface-2 text-app-muted"}`}>
                    {item.peak ? <Flame className="inline size-3 -translate-y-0.5" /> : <Sparkles className="inline size-3 -translate-y-0.5" />} {item.percent.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full ${
                      item.offset === 0
                        ? "bg-[linear-gradient(90deg,#fff0bf_0%,#e4b733_55%,#ce7b24_100%)]"
                        : item.peak
                          ? "bg-[linear-gradient(90deg,#f2b7c7_0%,#d86f8f_55%,#932b52_100%)]"
                          : "bg-[linear-gradient(90deg,#badcc8_0%,#d86f8f_100%)]"
                    }`}
                    style={{ width: `${Math.max(12, item.percent * 3)}%` }}
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-app-muted">
                  {item.peak ? "Pico visual." : item.offset === 0 ? "Ovulación estimada." : "Marcador educativo."}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
