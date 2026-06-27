import { Activity, CalendarRange, FlaskConical, MoonStar, Thermometer, TriangleAlert } from "lucide-react";
import type { VentanaFertilState } from "@/types";

export function UncertaintyBreakdown({ state }: { state: VentanaFertilState }) {
  const factors = [
    {
      icon: CalendarRange,
      label: "Variabilidad del ciclo",
      impact: state.maximumCycleLength - state.minimumCycleLength >= 4 ? "Alto" : state.maximumCycleLength - state.minimumCycleLength >= 2 ? "Medio" : "Bajo",
      description: state.maximumCycleLength - state.minimumCycleLength >= 4 ? "Puede mover bastante la ventana estimada." : "El margen existe, pero es más acotado.",
    },
    {
      icon: TriangleAlert,
      label: "Ovulación estimada vs conocida",
      impact: state.ovulationMethod === "known" ? "Bajo" : "Medio",
      description: state.ovulationMethod === "known" ? "Tener una fecha conocida mejora la lectura." : "La estimación depende más del calendario.",
    },
    {
      icon: FlaskConical,
      label: "Test LH",
      impact: state.ovulationMethod === "lh" && state.lhResult ? "Bajo" : "Medio",
      description: state.ovulationMethod === "lh" && state.lhResult ? "Aporta un ancla útil para ubicar el pico." : "Si falta, perdemos una pista importante.",
    },
    {
      icon: Thermometer,
      label: "Temperatura basal",
      impact: state.bodySignals.basalBodyTemperature ? "Bajo" : "Medio",
      description: state.bodySignals.basalBodyTemperature ? "Sirve como soporte retrospectivo." : "Sin ella hay menos contexto para leer el ciclo.",
    },
    {
      icon: MoonStar,
      label: "Sueño / estrés / viaje",
      impact: state.bodySignals.stressLevel === "high" || state.bodySignals.sleepQuality === "low" || state.bodySignals.travelOrIllness ? "Alto" : "Bajo",
      description: state.bodySignals.stressLevel === "high" || state.bodySignals.sleepQuality === "low" || state.bodySignals.travelOrIllness ? "Estos factores pueden mover la ovulación." : "No parecen empujar demasiado la lectura.",
    },
    {
      icon: Activity,
      label: "Contexto corporal",
      impact: state.bodySignals.cervicalMucus || state.bodySignals.cervixPosition ? "Medio" : "Bajo",
      description: state.bodySignals.cervicalMucus || state.bodySignals.cervixPosition ? "Aporta señales que ayudan a leer el día." : "Sin señales, la simulación depende más del promedio.",
    },
  ];

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Qué mueve la incertidumbre</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Por qué esta estimación puede moverse</h3>
        </div>
        <TriangleAlert className="size-5 text-app-accent" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <article key={factor.label} className="rounded-[24px] border border-app-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-app-primary/10 text-app-primary">
                    <Icon className="size-4" />
                  </span>
                  <p className="text-sm font-semibold text-app-foreground">{factor.label}</p>
                </div>
                <Badge impact={factor.impact} />
              </div>
              <p className="mt-3 text-sm leading-6 text-app-muted">{factor.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Badge({ impact }: { impact: string }) {
  const classes =
    impact === "Alto"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : impact === "Medio"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>{impact}</span>;
}
