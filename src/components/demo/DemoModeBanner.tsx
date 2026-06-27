"use client";

import { BadgeInfo, RotateCcw, Sparkles } from "lucide-react";

export function DemoModeBanner({
  onUseMyData,
  onSaveExample,
}: {
  onUseMyData: () => void;
  onSaveExample: () => void;
}) {
  return (
    <section className="rounded-[30px] border border-app-rose/20 bg-[linear-gradient(180deg,rgba(255,244,248,0.94)_0%,rgba(255,255,255,0.92)_100%)] p-4 shadow-[0_22px_56px_-40px_rgba(216,111,143,0.42)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-app-rose/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-app-rose">
            <Sparkles className="size-3.5" />
            Ejemplo
          </p>
          <h2 className="text-lg font-semibold text-app-foreground">Modo demo activo</h2>
          <p className="max-w-2xl text-sm leading-6 text-app-muted">Cargamos un ejemplo visual para probar la experiencia sin tocar tus datos reales.</p>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
            <BadgeInfo className="size-3.5" />
            No se guardó como tus datos reales
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onUseMyData}
            className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
          >
            <RotateCcw className="mr-2 size-4" />
            Usar mis datos
          </button>
          <button
            type="button"
            onClick={onSaveExample}
            className="vf-press inline-flex h-11 items-center justify-center rounded-full bg-app-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
          >
            Guardar ejemplo
          </button>
        </div>
      </div>
    </section>
  );
}
