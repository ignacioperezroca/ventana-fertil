import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { MiniDataVizCard } from "@/components/visual/MiniDataVizCard";
import { formatDateLong, formatDateShort } from "@/lib/cycle";
import { getFertileRangeText, getPeakDates, getOvulationText, getSimpleStatusLabel, projectSimulationShift } from "@/lib/fertility";
import type { SimulationResult } from "@/types";

export function VisualResultCard({
  simulation,
  shiftDays,
  onExplain,
}: {
  simulation: SimulationResult;
  shiftDays: number;
  onExplain: () => void;
}) {
  const visualSimulation = projectSimulationShift(simulation, shiftDays);
  const peakDates = getPeakDates(visualSimulation);
  const ovulation = getOvulationText(visualSimulation);
  const fertileRange = getFertileRangeText(visualSimulation);
  const status = getSimpleStatusLabel(visualSimulation);
  const confidence = visualSimulation.confidenceBand || "Media";
  const nextKeyDate = peakDates[1] ?? peakDates[0] ?? ovulation;

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,248,243,0.9)_100%)] p-4 shadow-[0_28px_80px_-48px_rgba(36,22,47,0.5)] sm:p-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(216,111,143,0.12)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(228,183,51,0.15)_0%,transparent_38%)]" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Resultado estimado</p>
            {shiftDays !== 0 ? (
              <span className="rounded-full border border-app-rose/30 bg-app-rose/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-rose">
                Escenario visual {shiftDays > 0 ? `+${shiftDays}` : shiftDays}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-app-foreground">Tu ventana fértil estimada</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-app-muted">Los días de mayor fertilidad suelen aparecer antes de ovular.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MiniDataVizCard title="Ovulación estimada" value={ovulation || "—"} kind="ring" color="amber" />
            <MiniDataVizCard title="Ventana fértil" value={fertileRange || "—"} kind="bars" color="rose" />
            <MiniDataVizCard title="Días más fértiles" value={peakDates.map((date) => formatDateShort(date)).join(" · ") || "—"} kind="dots" color="plum" />
            <MiniDataVizCard title="Confianza" value={confidence} kind="meter" color="green" />
          </div>
        </div>

        <div className="grid gap-3 rounded-[30px] border border-app-border bg-white/84 p-4 shadow-[0_16px_40px_-30px_rgba(36,22,47,0.35)] lg:w-[290px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">Estado</p>
            <p className="mt-2 text-sm font-medium text-app-foreground">{status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">Próximo día clave</p>
            <p className="mt-2 text-lg font-semibold text-app-foreground">{nextKeyDate ? formatDateLong(nextKeyDate) : "—"}</p>
          </div>
          <button
            type="button"
            onClick={onExplain}
            className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
          >
            Ver explicación
            <ArrowRight className="ml-2 size-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
            <Sparkles className="size-3.5 text-app-accent" />
            Marcador por timing
            <Flame className="ml-auto size-3.5 text-app-rose" />
          </div>
        </div>
      </div>
    </section>
  );
}
