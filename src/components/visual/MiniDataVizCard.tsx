export function MiniDataVizCard({
  title,
  value,
  kind = "bars",
  color = "rose",
}: {
  title: string;
  value: string;
  kind?: "bars" | "ring" | "dots" | "meter";
  color?: "rose" | "plum" | "amber" | "green";
}) {
  const palette = (
    color === "plum"
      ? ["#4b2c55", "#7b4f82"]
      : color === "amber"
        ? ["#e4b733", "#ce7b24"]
        : color === "green"
          ? ["#72b48a", "#2f9466"]
          : ["#d86f8f", "#932b52"]
  ) as [string, string];

  return (
    <div className="rounded-[24px] border border-app-border bg-white p-4 shadow-[0_18px_40px_-34px_rgba(36,22,47,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-lg font-semibold text-app-foreground">{value}</p>
        <MiniVisual kind={kind} palette={palette} />
      </div>
    </div>
  );
}

function MiniVisual({ kind, palette }: { kind: string; palette: [string, string] }) {
  if (kind === "ring") {
    const gradientId = `vf-mini-ring-${palette[0].replace(/[^a-z0-9]/gi, "")}`;
    return (
      <svg viewBox="0 0 44 44" className="size-10">
        <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(75,44,85,0.12)" strokeWidth="6" />
        <circle cx="22" cy="22" r="16" fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" strokeDasharray="72 100" className="vf-animate-draw" />
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={palette[0]} />
            <stop offset="100%" stopColor={palette[1]} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (kind === "dots") {
    return (
      <div className="flex items-end gap-1.5">
        {[10, 18, 28].map((height, index) => (
          <span key={height} className="w-2 rounded-full" style={{ height, background: index === 2 ? palette[1] : palette[0], opacity: 0.9 }} />
        ))}
      </div>
    );
  }

  if (kind === "meter") {
    return <div className="h-2 w-12 rounded-full bg-[linear-gradient(90deg,#f0e6de_0%,#d86f8f_60%,#932b52_100%)]" />;
  }

  return (
    <div className="flex items-end gap-1.5">
      {[9, 16, 24, 14].map((height, index) => (
        <span key={height} className="w-2.5 rounded-full" style={{ height, background: index === 2 ? palette[1] : palette[0], opacity: 0.9 }} />
      ))}
    </div>
  );
}
