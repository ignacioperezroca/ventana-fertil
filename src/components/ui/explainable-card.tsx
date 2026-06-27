import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function ExplainableCard({
  title,
  short,
  details,
  visual,
  defaultOpen = false,
}: {
  title: string;
  short: string;
  details: ReactNode;
  visual?: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="rounded-[26px] border border-app-border bg-white/90 p-4 shadow-[0_20px_50px_-40px_rgba(36,22,47,0.28)]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-app-foreground">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-app-muted">{short}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-app-muted transition-transform duration-200" />
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="text-sm leading-6 text-app-muted">{details}</div>
        {visual ? <div className="flex items-center justify-center">{visual}</div> : null}
      </div>
    </details>
  );
}
