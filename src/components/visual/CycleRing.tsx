import { clamp } from "@/lib/cycle";
import { Tooltip } from "@/components/ui/tooltip";

export function CycleRing({
  cycleLength,
  currentDay,
  ovulationDay,
  fertileStart,
  fertileEnd,
  peakStart,
  peakEnd,
  conservativeStart,
  conservativeEnd,
  statusLabel,
  confidenceLabel,
}: {
  cycleLength: number;
  currentDay: number | null;
  ovulationDay: number | null;
  fertileStart: number | null;
  fertileEnd: number | null;
  peakStart: number | null;
  peakEnd: number | null;
  conservativeStart: number | null;
  conservativeEnd: number | null;
  statusLabel: string;
  confidenceLabel: string;
}) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = 118;
  const circumference = 2 * Math.PI * r;

  const toOffset = (day: number | null) => {
    if (day === null) return 0;
    const normalized = clamp((day - 1) / Math.max(1, cycleLength), 0, 0.999);
    return normalized * circumference;
  };

  const renderArc = (start: number | null, end: number | null, stroke: string, strokeWidth: number, opacity = 1) => {
    if (start === null || end === null) return null;
    const startOffset = toOffset(start);
    const endOffset = toOffset(end + 1);
    const length = endOffset - startOffset > 0 ? endOffset - startOffset : circumference - startOffset + endOffset;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-startOffset}
        opacity={opacity}
        className="vf-animate-draw"
      />
    );
  };

  const currentAngle = currentDay ? ((currentDay - 1) / Math.max(1, cycleLength)) * Math.PI * 2 - Math.PI / 2 : -Math.PI / 2;
  const currentX = cx + Math.cos(currentAngle) * (r + 4);
  const currentY = cy + Math.sin(currentAngle) * (r + 4);

  const ovulationAngle = ovulationDay ? ((ovulationDay - 1) / Math.max(1, cycleLength)) * Math.PI * 2 - Math.PI / 2 : -Math.PI / 2;
  const ovulationX = cx + Math.cos(ovulationAngle) * (r + 4);
  const ovulationY = cy + Math.sin(ovulationAngle) * (r + 4);

  return (
    <div className="rounded-[34px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,248,242,0.92)_100%)] p-4 shadow-[0_26px_70px_-44px_rgba(36,22,47,0.42)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Ciclo visual</p>
          <p className="mt-1 text-sm text-app-muted">{statusLabel}</p>
        </div>
        <Tooltip label={confidenceLabel}>
          <span className="rounded-full border border-app-border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
            {confidenceLabel}
          </span>
        </Tooltip>
      </div>

      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[360px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible" role="img" aria-label={`Ventana fértil estimada ${fertileStart ?? ""} a ${fertileEnd ?? ""}. Ovulación estimada en ${ovulationDay ?? ""}.`}>
          <defs>
            <linearGradient id="vf-ring-base" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f6ede7" />
              <stop offset="100%" stopColor="#efe1d9" />
            </linearGradient>
            <linearGradient id="vf-ring-fertile" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f2b7c7" />
              <stop offset="100%" stopColor="#d86f8f" />
            </linearGradient>
            <linearGradient id="vf-ring-peak" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f1b84d" />
              <stop offset="100%" stopColor="#ce7b24" />
            </linearGradient>
          </defs>

          <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#vf-ring-base)" strokeWidth="18" />
          {renderArc(conservativeStart, conservativeEnd, "rgba(220,160,58,0.18)", 22, 0.9)}
          {renderArc(fertileStart, fertileEnd, "url(#vf-ring-fertile)", 18, 1)}
          {renderArc(peakStart, peakEnd, "url(#vf-ring-peak)", 18, 1)}
          {currentDay ? <circle cx={currentX} cy={currentY} r="7" fill="#4b2c55" stroke="#fff" strokeWidth="3" className="vf-animate-pulse-soft" /> : null}
          {ovulationDay ? (
            <g transform={`translate(${ovulationX} ${ovulationY})`}>
              <circle r="11" fill="#fff" stroke="#d86f8f" strokeWidth="2" />
              <text x="0" y="5" textAnchor="middle" fontSize="12">🥚</text>
            </g>
          ) : null}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-[160px] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-app-muted">Día actual</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-app-foreground">{currentDay ?? "—"}</p>
            <p className="mt-2 text-sm font-medium text-app-foreground">{statusLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2"><span className="size-2.5 rounded-full bg-app-rose" />Ventana</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2"><span className="size-2.5 rounded-full bg-app-accent" />Pico</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-2"><span className="size-2.5 rounded-full bg-app-primary" />Ovulación</span>
      </div>
    </div>
  );
}
