import type { RelativeRiskPoint } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";

export function TimingCurveChart({ points }: { points: RelativeRiskPoint[] }) {
  const width = 640;
  const height = 240;
  const max = Math.max(...points.map((point) => point.percent), 1);
  const step = width / (points.length - 1);
  const coords = points.map((point, index) => ({
    x: index * step,
    y: height - 34 - (point.percent / max) * 150,
    percent: point.percent,
    label: point.label,
  }));

  const curve = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const area = `${curve} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_20px_50px_-38px_rgba(36,22,47,0.34)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Curva</p>
          <p className="mt-1 text-sm text-app-muted">Curva visual del marcador estimado.</p>
        </div>
        <Tooltip label="Pico en O-3 / O-2">
          <span className="rounded-full bg-app-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-primary">Pico</span>
        </Tooltip>
      </div>

      <div className="mt-4 overflow-hidden rounded-[24px] border border-app-border bg-[linear-gradient(180deg,#fffdfb_0%,#fff6f1_100%)]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Curva del marcador por día relativo a la ovulación">
          <defs>
            <linearGradient id="vf-timing-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(216,111,143,0.45)" />
              <stop offset="100%" stopColor="rgba(216,111,143,0.02)" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#vf-timing-fill)" />
          <path d={curve} fill="none" stroke="#b73f61" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="vf-animate-draw" />
          {coords.map((point) => (
            <g key={point.label} transform={`translate(${point.x} ${point.y})`}>
              <circle r={point.label === "O-3" || point.label === "O-2" ? 7 : 5} fill={point.label === "O-3" || point.label === "O-2" ? "#932b52" : "#d86f8f"} stroke="#fff" strokeWidth="3">
                <title>{`${point.label} · ${point.percent.toFixed(1)}%`}</title>
              </circle>
            </g>
          ))}
          {coords.map((point) => (
            <text key={`${point.label}-text`} x={point.x} y={height - 8} textAnchor="middle" fontSize="12" fill="#6f5c73" fontWeight="600">
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <p className="font-medium text-app-foreground">El pico suele aparecer antes de ovular.</p>
        <p className="text-app-muted">O-3 / O-2</p>
      </div>
    </div>
  );
}
