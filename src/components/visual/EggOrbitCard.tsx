import { CalendarDays, Sparkles } from "lucide-react";

export function EggOrbitCard({
  title,
  subtitle,
  badge = "Demo",
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  const orbitDots = [
    { left: "18%", top: "14%" },
    { left: "72%", top: "16%" },
    { left: "84%", top: "52%" },
    { left: "68%", top: "84%" },
    { left: "24%", top: "82%" },
    { left: "10%", top: "48%" },
  ];

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-app-border bg-[radial-gradient(circle_at_top,#fffdf8_0%,#fff7f1_42%,#f8ece6_100%)] p-5 shadow-[0_24px_70px_-42px_rgba(36,22,47,0.4)] vf-hover-card">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(75,44,85,0.05)_0%,rgba(216,111,143,0.04)_35%,transparent_70%)]" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-app-muted">
            <Sparkles className="size-3.5 text-app-accent" />
            {badge}
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-app-foreground">{title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-app-muted">{subtitle}</p>
        </div>
        <div className="hidden rounded-full border border-app-border bg-white/90 p-2 text-app-muted sm:flex">
          <CalendarDays className="size-4" />
        </div>
      </div>

      <div className="relative mx-auto mt-6 flex aspect-square w-full max-w-[320px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-dashed border-app-border/70 vf-animate-orbit" aria-hidden="true" />
        <div className="absolute inset-6 rounded-full border border-app-rose/35 bg-white/35 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)]" aria-hidden="true" />
        <div className="absolute inset-12 rounded-full border border-white/60 bg-[radial-gradient(circle_at_top,#fffefc_0%,#fff4ea_42%,#f6d9c0_100%)] shadow-[0_24px_40px_-34px_rgba(36,22,47,0.45)] vf-animate-float" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.6)_18%,transparent_44%)]" />
          <div className="absolute left-1/2 top-1/2 h-[48%] w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-[50%_50%_46%_46%/58%_58%_42%_42%] bg-[radial-gradient(circle_at_40%_35%,#fffefb_0%,#fff4e3_44%,#ead5b5_100%)] shadow-[inset_0_-18px_22px_rgba(75,44,85,0.08),0_16px_24px_-18px_rgba(75,44,85,0.4)] vf-animate-pulse-soft" />
        </div>
        {orbitDots.map((dot, index) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className={`absolute size-3 rounded-full border border-white/80 shadow-sm ${index === 3 ? "bg-app-deep-rose vf-animate-pulse-soft" : index % 2 === 0 ? "bg-app-accent" : "bg-app-rose"}`}
            style={{ left: dot.left, top: dot.top, transform: "translate(-50%, -50%)" }}
            aria-hidden="true"
          />
        ))}
        <div className="absolute inset-[18%] rounded-full border border-app-primary/20 bg-transparent" aria-hidden="true" />
      </div>
    </div>
  );
}
