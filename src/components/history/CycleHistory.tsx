"use client";

import { useMemo, useState } from "react";
import { Bookmark, Trash2, Clock3, SquarePlus, TrendingUp } from "lucide-react";
import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import { deleteCycleSnapshot, loadCycleHistory, saveCycleSnapshot, summarizeCycleHistory, type CycleSnapshot } from "@/lib/history";
import { formatDateShort, formatPercent } from "@/lib/cycle";
import { formatMarkerValue } from "@/lib/preferences";
import type { SimulationResult, VentanaFertilState } from "@/types";

export function CycleHistory({
  state,
  simulation,
  lowAnxietyMode = false,
  onNotify,
}: {
  state: VentanaFertilState;
  simulation: SimulationResult;
  lowAnxietyMode?: boolean;
  onNotify: (tone: "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const [history, setHistory] = useState<CycleSnapshot[]>(() => loadCycleHistory());

  const summary = useMemo(() => summarizeCycleHistory(history), [history]);

  const handleSave = () => {
    const next = saveCycleSnapshot(state, simulation);
    setHistory(next);
    trackEvent("cycle_snapshot_saved", {
      hasSimulation: simulation.valid,
      confidenceLevel: simulation.confidenceBand,
      uncertaintyBucket: simulation.uncertaintyBand,
      source: "history",
      isDemo: state.isDemo,
      deviceCategory: getDeviceCategory(),
    });
    onNotify("success", "Ciclo guardado", "Guardamos un snapshot local del ciclo actual.");
  };

  const handleDelete = (id: string) => {
    const next = deleteCycleSnapshot(id);
    setHistory(next);
    onNotify("warning", "Snapshot eliminado", "Se quitó del historial local.");
  };

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Historial</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Ciclos guardados</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Compará patrones simples sin convertirlo en un informe clínico.</p>
        </div>
        <button type="button" onClick={handleSave} className="inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90">
          <SquarePlus className="size-4" />
          Guardar ciclo actual
        </button>
      </div>

      {history.length === 0 ? (
        <Empty title="Todavía no guardaste ciclos anteriores." message="Podés guardar el ciclo actual cuando quieras y compararlo más adelante." actionLabel="Guardar ciclo actual" onAction={handleSave} />
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {history.slice(0, 3).map((snapshot) => (
            <article key={snapshot.id} className="rounded-[24px] border border-app-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{formatDateShort(snapshot.createdAt)}</p>
                  <p className="mt-1 text-sm font-semibold text-app-foreground">Inicio {snapshot.cycleStartDate}</p>
                </div>
                <button type="button" onClick={() => handleDelete(snapshot.id)} className="inline-flex size-9 items-center justify-center rounded-full border border-app-border bg-white text-app-muted transition hover:border-rose-200 hover:text-rose-700">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                <Row icon={Clock3} label="Duración usada" value={`${snapshot.averageLengthUsed} días`} />
                <Row icon={Bookmark} label="Ovulación estimada" value={snapshot.estimatedOvulationDay === null ? "—" : `Día ${snapshot.estimatedOvulationDay}`} />
                <Row icon={TrendingUp} label="Incertidumbre" value={formatMarkerValue(snapshot.uncertaintyScore, lowAnxietyMode)} />
              </div>
              <p className="mt-4 text-sm leading-6 text-app-muted">Ventana: {snapshot.fertileWindow}</p>
            </article>
          ))}
        </div>
      )}

      {history.length > 0 ? (
        <div className="mt-4 rounded-[24px] border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff6ef_100%)] p-4">
          <p className="text-sm font-semibold text-app-foreground">Comparación de los últimos ciclos</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Metric label="Ciclos guardados" value={`${summary.count}`} />
            <Metric label="Duración promedio" value={summary.averageLength ? `${summary.averageLength} días` : "—"} />
            <Metric label="Incertidumbre promedio" value={lowAnxietyMode ? (summary.averageUncertainty >= 70 ? "Alta" : summary.averageUncertainty >= 40 ? "Moderada" : "Baja") : formatPercent(summary.averageUncertainty)} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-surface-2/50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-app-muted">
        <Icon className="size-4 text-app-primary" />
        {label}
      </div>
      <span className="text-sm font-semibold text-app-foreground">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-app-border bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-app-foreground">{value}</p>
    </div>
  );
}

function Empty({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="mt-4 rounded-[24px] border border-dashed border-app-border bg-white p-5 text-center">
      <p className="text-sm font-semibold text-app-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-app-muted">{message}</p>
      <button type="button" onClick={onAction} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:bg-app-primary/90">
        {actionLabel}
      </button>
    </div>
  );
}
