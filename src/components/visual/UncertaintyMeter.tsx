import { useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";

export function UncertaintyMeter({ score, label, hint, lowAnxietyMode = false }: { score: number; label: string; hint: string; lowAnxietyMode?: boolean }) {
  const width = Math.max(0, Math.min(100, score));
  const [showNumber, setShowNumber] = useState(false);

  return (
    <div className="rounded-[28px] border border-app-border bg-white p-5 shadow-[0_20px_50px_-38px_rgba(36,22,47,0.32)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Incertidumbre</p>
          <p className="mt-1 text-2xl font-semibold text-app-foreground">{lowAnxietyMode && !showNumber ? label : `${score}/100`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip label={hint}>
            <span className="rounded-full border border-app-border bg-app-surface-2 px-3 py-1 text-xs font-semibold text-app-muted">{label}</span>
          </Tooltip>
          {lowAnxietyMode ? (
            <button
              type="button"
              onClick={() => setShowNumber((current) => !current)}
              className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold text-app-foreground transition hover:border-app-primary/40"
            >
              {showNumber ? "Ocultar número" : "Ver número"}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-app-surface-2">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#badcc8_0%,#e4b733_40%,#d86f8f_72%,#932b52_100%)] vf-animate-shimmer"
          style={{ width: `${width}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-app-muted">{hint}</p>
    </div>
  );
}
