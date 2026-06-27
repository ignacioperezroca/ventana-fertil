"use client";

import { addDays, diffInDays, parseDate } from "@/lib/cycle";
import { getSimpleStatusLabel } from "@/lib/fertility";
import { CycleRing } from "@/components/visual/CycleRing";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import type { SimulationResult } from "@/types";

export function InteractiveCycleRing({
  simulation,
  cycleLength,
  cycleStart,
  shiftDays,
  appliedShiftDays,
  onShiftDaysChange,
  onApplyScenario,
  onResetScenario,
}: {
  simulation: SimulationResult;
  cycleLength: number;
  cycleStart: string;
  shiftDays: number;
  appliedShiftDays: number;
  onShiftDaysChange: (value: number) => void;
  onApplyScenario: () => void;
  onResetScenario: () => void;
}) {
  const startDate = parseDate(cycleStart);
  const ovulationDate = parseDate(simulation.ovulationDate);
  const scenarioOvulation = ovulationDate ? addDays(ovulationDate, shiftDays) : null;
  const currentDay = simulation.cycleDayToday ?? simulation.selectedDateCycleDay ?? null;
  const cycleOvulationDay = startDate && scenarioOvulation ? diffInDays(scenarioOvulation, startDate) + 1 : null;
  const fertileStart = cycleOvulationDay !== null ? cycleOvulationDay - 6 : null;
  const fertileEnd = cycleOvulationDay !== null ? cycleOvulationDay + 1 : null;
  const peakStart = cycleOvulationDay !== null ? cycleOvulationDay - 4 : null;
  const peakEnd = cycleOvulationDay !== null ? cycleOvulationDay - 1 : null;
  const conservativeStartDate = parseDate(simulation.conservativeWindowStart);
  const conservativeEndDate = parseDate(simulation.conservativeWindowEnd);
  const conservativeStart = conservativeStartDate && startDate ? diffInDays(addDays(conservativeStartDate, shiftDays), startDate) + 1 : null;
  const conservativeEnd = conservativeEndDate && startDate ? diffInDays(addDays(conservativeEndDate, shiftDays), startDate) + 1 : null;
  const statusLabel = shiftDays === 0 ? getSimpleStatusLabel(simulation) : `Escenario visual ${shiftDays > 0 ? `+${shiftDays}` : shiftDays}`;

  if (!startDate) return null;

  return (
    <section className="rounded-[36px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_26px_70px_-44px_rgba(36,22,47,0.38)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Ciclo visual</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Mové la ovulación</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Escenario visual. La ovulación real puede moverse.</p>
        </div>
        <span className="rounded-full border border-app-border bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 rounded-[32px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,247,241,0.92)_100%)] p-3 sm:p-4">
        <CycleRing
          cycleLength={cycleLength}
          currentDay={currentDay}
          ovulationDay={cycleOvulationDay}
          fertileStart={fertileStart}
          fertileEnd={fertileEnd}
          peakStart={peakStart}
          peakEnd={peakEnd}
          conservativeStart={conservativeStart}
          conservativeEnd={conservativeEnd}
          statusLabel={statusLabel}
          confidenceLabel={simulation.confidenceBand}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-app-foreground">Mové ovulación estimada</span>
          <input
            type="range"
            min={-4}
            max={4}
            step={1}
            value={shiftDays}
            onChange={(event) => onShiftDaysChange(Number(event.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,#f0e6de_0%,#d86f8f_50%,#e4b733_100%)] outline-none accent-[color:var(--app-primary)]"
            aria-label="Mové ovulación estimada"
          />
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
            <span>−4 días</span>
            <span>0</span>
            <span>+4 días</span>
          </div>
        </label>

        {shiftDays !== appliedShiftDays ? (
          <motion.div className="flex flex-col gap-2 rounded-[24px] border border-app-rose/20 bg-app-rose/8 p-3 sm:flex-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-app-foreground">Ovulación movida a {scenarioOvulation ? scenarioOvulation.toLocaleDateString("es-AR", { day: "2-digit", month: "long" }) : "—"}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">Este cambio solo muestra un escenario visual.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApplyScenario}
                className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Aplicar
                <ArrowRightLeft className="ml-2 size-4" />
              </button>
              <button
                type="button"
                onClick={onResetScenario}
                className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30"
              >
                Volver
              </button>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm leading-6 text-app-muted">Mantené el centro en la ovulación o movela un poco para ver cómo cambia la ventana fértil.</p>
        )}
      </div>
    </section>
  );
}
