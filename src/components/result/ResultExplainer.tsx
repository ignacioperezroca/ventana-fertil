"use client";

import { ChevronDown, Egg, Flame, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function ResultExplainer({
  defaultOpen = false,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[30px] border border-app-border bg-white/92 p-4 shadow-[0_20px_50px_-38px_rgba(36,22,47,0.28)] sm:p-5"
      onToggle={(event) => onOpenChange?.((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-app-foreground">Qué significa?</span>
          <span className="mt-1 block text-sm leading-6 text-app-muted">Tres ideas visuales para entender el resultado sin leer un muro de texto.</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-app-muted transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="mt-4 grid gap-3">
        <Bullet icon={<Egg className="size-4 text-app-accent" />} title="Ovulación estimada" text="El ciclo suele ovular alrededor de 14 días antes del próximo período." />
        <Bullet icon={<Flame className="size-4 text-app-rose" />} title="Ventana fértil" text="Se estima desde varios días antes de ovular." />
        <Bullet icon={<TriangleAlert className="size-4 text-app-muted" />} title="Incertidumbre" text="La ovulación puede moverse si el ciclo cambia." />
      </div>
    </details>
  );
}

function Bullet({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[24px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,249,244,0.92)_100%)] p-4">
      <div className="rounded-2xl border border-app-border bg-white p-3 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-app-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">{text}</p>
      </div>
    </div>
  );
}
