"use client";

import { Sparkles } from "lucide-react";

export function PremiumIdeasCard({
  onInterest,
}: {
  onInterest: () => void;
}) {
  return (
    <section className="rounded-[34px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Roadmap</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Próximamente</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Espacio para ideas premium sin bloquear el acceso al simulador gratis.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-accent">
          <Sparkles className="size-5" />
        </div>
      </div>

      <ul className="mt-4 grid gap-2 text-sm leading-6 text-app-muted">
        <li>Histórico de ciclos</li>
        <li>Exportación avanzada</li>
        <li>Modo pareja</li>
        <li>Recordatorios mensuales</li>
        <li>Visualizaciones premium</li>
      </ul>

      <button
        type="button"
        onClick={onInterest}
        className="vf-press mt-4 inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
      >
        Quiero enterarme
      </button>
    </section>
  );
}
