"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";

import { CHANGELOG_ITEMS } from "@/content/changelog";

export function DisplayPreferences({
  showPercentages,
  reducedMotion,
  onChange,
  onMotionChange,
}: {
  showPercentages: boolean;
  onChange: (next: boolean) => void;
  reducedMotion: boolean;
  onMotionChange: (next: boolean) => void;
}) {
  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Preferencias</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Porcentajes</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Si lo apagás, verás Bajo / Moderado / Alto / Muy alto.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showPercentages}
          onClick={() => onChange(!showPercentages)}
          className={`vf-press inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
            showPercentages ? "border-app-primary bg-app-primary/6 text-app-primary" : "border-app-border bg-white text-app-muted"
          }`}
        >
          {showPercentages ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
          {showPercentages ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4 rounded-[24px] border border-app-border bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-app-foreground">Reducir animaciones</p>
          <p className="mt-1 text-sm leading-6 text-app-muted">Podés dejar la app más liviana si preferís menos movimiento.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={reducedMotion}
          onClick={() => onMotionChange(!reducedMotion)}
          className={`vf-press inline-flex h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-app-primary/15 ${
            reducedMotion ? "border-app-primary bg-app-primary/6 text-app-primary" : "border-app-border bg-white text-app-muted"
          }`}
        >
          {reducedMotion ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
          {reducedMotion ? "On" : "Off"}
        </button>
      </div>

      <details className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Qué hay de nuevo</summary>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-app-muted">
          {CHANGELOG_ITEMS.map((item) => (
            <div key={item.version} className="rounded-[20px] border border-app-border bg-app-surface-2/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">v{item.version}</p>
              <p className="mt-1 font-semibold text-app-foreground">{item.title}</p>
              <p className="mt-1">{item.summary}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
