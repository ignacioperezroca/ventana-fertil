"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import { buildSimpleScenarioPreviewCards } from "@/lib/scenarios";
import type { SimulationResult } from "@/types";

export function SimpleScenarioPreview({ simulation, isDemo = false }: { simulation: SimulationResult; isDemo?: boolean }) {
  const [open, setOpen] = useState(false);
  const cards = buildSimpleScenarioPreviewCards(simulation);

  if (!simulation.valid || cards.length === 0) return null;

  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <details
        className="group"
        open={open}
        onToggle={(event) => {
          const isOpen = (event.currentTarget as HTMLDetailsElement).open;
          setOpen(isOpen);
          if (isOpen) {
            trackEvent("scenario_preview_opened", {
              hasSimulation: true,
              confidenceLevel: simulation.confidenceBand,
              uncertaintyBucket: simulation.uncertaintyBand,
              source: "result_preview",
              isDemo,
              deviceCategory: getDeviceCategory(),
            });
          }
        }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Escenarios</p>
            <h3 className="mt-2 text-xl font-semibold text-app-foreground">Si la ovulación se mueve</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
            <Sparkles className="size-3.5 text-app-accent" />
            {open ? "Ocultar" : "Ver escenarios"}
            <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </span>
        </summary>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-app-muted">
          Esto no predice qué va a pasar. Solo muestra cómo cambia la ventana si la ovulación se adelanta o se retrasa.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.id} className="rounded-[24px] border border-app-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{card.title}</p>
                  <p className="mt-2 text-sm font-semibold text-app-foreground">{card.ovulationLabel}</p>
                </div>
                <span className="rounded-full border border-app-border bg-app-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-app-muted">
                  Escenario
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm leading-6 text-app-muted">
                <p>Ventana: {card.fertileWindowLabel}</p>
                <p>Pico: {card.peakLabel}</p>
                <p>{card.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
