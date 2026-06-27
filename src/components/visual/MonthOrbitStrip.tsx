"use client";

import { motion } from "framer-motion";
import { Droplets, Flame, Sparkles } from "lucide-react";
import { addDays, diffInDays, formatDateInput, formatDateShort, parseDate } from "@/lib/cycle";
import { vfFadeUp, vfStagger } from "@/components/motion/MotionConfig";
import type { SimulationResult } from "@/types";

export function MonthOrbitStrip({
  simulation,
  cycleLength,
  shiftDays = 0,
  cycleStart,
  selectedDay,
  onSelectDay,
}: {
  simulation: SimulationResult;
  cycleLength: number;
  shiftDays?: number;
  cycleStart: string;
  selectedDay: string | null;
  onSelectDay: (date: string) => void;
}) {
  const startDate = parseDate(cycleStart);
  const ovulation = parseDate(simulation.ovulationDate);
  const scenarioOvulation = ovulation ? addDays(ovulation, shiftDays) : null;
  const fertileStart = scenarioOvulation ? addDays(scenarioOvulation, -6) : null;
  const fertileEnd = scenarioOvulation ? addDays(scenarioOvulation, 1) : null;
  const peakStart = scenarioOvulation ? addDays(scenarioOvulation, -4) : null;
  const peakEnd = scenarioOvulation ? addDays(scenarioOvulation, -1) : null;
  const todayCycleDay = simulation.cycleDayToday;
  const length = Math.max(21, Math.min(45, Number.isFinite(cycleLength) ? cycleLength : 28));

  if (!startDate) return null;

  const days = Array.from({ length }, (_, index) => {
    const dayNumber = index + 1;
    const date = addDays(startDate, index);
    const iso = formatDateInput(date);
    const shortLabel = formatDateShort(date);
    const fertile = fertileStart && fertileEnd ? date >= fertileStart && date <= fertileEnd : false;
    const peak = peakStart && peakEnd ? date >= peakStart && date <= peakEnd : false;
    const ovulationDay = scenarioOvulation ? diffInDays(date, scenarioOvulation) === 0 : false;
    const today = todayCycleDay ? todayCycleDay === dayNumber : false;
    const selected = selectedDay === iso;
    const periodStart = dayNumber === 1;

    return { dayNumber, iso, shortLabel, date, fertile, peak, ovulationDay, today, selected, periodStart };
  });

  return (
    <section className="rounded-[34px] border border-app-border bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.36)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Visual</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Mes en movimiento</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Tocá un día para abrir su detalle. El strip acompaña la ventana fértil estimada sin llenarte de texto.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted sm:flex">
          <Sparkles className="size-3.5 text-app-accent" />
          Arrastrable
        </div>
      </div>

      <div className="vf-no-scrollbar mt-4 overflow-x-auto pb-2">
        <motion.div className="flex min-w-max gap-2" variants={vfStagger} initial="hidden" animate="visible">
          {days.map((day) => {
            const active = day.selected;
            const className = day.ovulationDay
              ? "border-app-accent/50 bg-[linear-gradient(180deg,rgba(255,248,217,0.98)_0%,rgba(255,238,185,0.92)_100%)] text-app-primary shadow-[0_18px_34px_-26px_rgba(228,183,51,0.55)]"
              : day.peak
                ? "border-app-rose/45 bg-[linear-gradient(180deg,rgba(255,236,241,0.98)_0%,rgba(255,220,231,0.92)_100%)] text-app-deep-rose shadow-[0_18px_34px_-26px_rgba(216,111,143,0.55)]"
                : day.fertile
                  ? "border-app-rose/20 bg-[linear-gradient(180deg,rgba(255,247,249,0.96)_0%,rgba(255,238,242,0.92)_100%)] text-app-foreground"
                  : "border-app-border bg-white text-app-foreground";

            return (
              <motion.button
                key={day.dayNumber}
                type="button"
                onClick={() => onSelectDay(day.iso)}
                className={`vf-press relative flex h-[98px] w-[64px] shrink-0 flex-col items-center justify-between rounded-[24px] border px-2 py-3 text-center transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${className} ${active ? "ring-2 ring-app-primary/20" : ""} ${day.today ? "ring-2 ring-app-accent/25" : ""}`}
                variants={vfFadeUp}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-center">
                  {day.periodStart ? <Droplets className="size-3.5 text-app-rose" /> : null}
                  {day.peak ? <Flame className="size-3.5 text-app-rose" /> : null}
                  {day.ovulationDay ? <span aria-hidden="true" className="text-sm">🥚</span> : null}
                </div>
                {day.today ? <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-app-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-app-accent">Hoy</span> : null}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">{day.dayNumber}</p>
                  <p className="text-[10px] leading-none text-app-muted">{day.shortLabel}</p>
                </div>
                <div className="h-2 w-6 overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full ${
                      day.ovulationDay
                        ? "bg-app-accent"
                        : day.peak
                          ? "bg-app-rose"
                          : day.fertile
                            ? "bg-app-rose/70"
                            : "bg-app-border"
                    }`}
                    style={{ width: day.ovulationDay ? "100%" : day.peak ? "88%" : day.fertile ? "64%" : "32%" }}
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2">
          <span className="size-2.5 rounded-full bg-app-rose" />
          Ventana fértil
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2">
          <span className="size-2.5 rounded-full bg-app-deep-rose" />
          Más fértiles
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2">
          <span className="size-2.5 rounded-full bg-app-accent" />
          Ovulación
        </span>
      </div>
    </section>
  );
}
