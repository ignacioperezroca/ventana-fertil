import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/tooltip";

export function VisualMetricCard({
  icon,
  label,
  value,
  hint,
  accent = "rose",
  trend,
  compact = false,
  tooltip,
  exactValue,
  lowAnxietyMode = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: "rose" | "plum" | "yellow" | "green" | "amber";
  trend?: number;
  compact?: boolean;
  tooltip?: string;
  exactValue?: string;
  lowAnxietyMode?: boolean;
}) {
  const accentClass =
    accent === "plum"
      ? "from-app-primary/15 to-app-primary/5 text-app-primary"
      : accent === "yellow"
        ? "from-app-accent/20 to-app-accent/10 text-app-accent"
        : accent === "green"
          ? "from-emerald-100 to-emerald-50 text-emerald-700"
          : accent === "amber"
            ? "from-amber-100 to-amber-50 text-amber-700"
            : "from-app-rose/15 to-app-rose/5 text-app-rose";

  const body = (
    <div className={`rounded-[26px] border border-app-border bg-gradient-to-br ${accentClass} p-${compact ? "3" : "4"} shadow-[0_18px_40px_-34px_rgba(36,22,47,0.38)] vf-hover-card`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-app-muted">{label}</p>
          <p className={`mt-2 ${compact ? "text-lg" : "text-xl"} font-semibold text-app-foreground`}>{value}</p>
          {lowAnxietyMode && exactValue ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">{exactValue}</p> : null}
          {hint ? <p className="mt-1 text-sm leading-6 text-app-muted">{hint}</p> : null}
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-app-foreground shadow-sm">{icon}</div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-app-primary/80 transition-all duration-500" style={{ width: `${Math.max(18, Math.min(100, trend ?? 68))}%` }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{trend ?? 68}%</span>
      </div>
    </div>
  );

  if (tooltip) {
    return <Tooltip label={tooltip}>{body}</Tooltip>;
  }

  return body;
}
