"use client";

import { CheckCircle2, Share2, Shield, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { EggOrbitHero } from "@/components/visual/EggOrbitHero";
import { ES_AR_COPY } from "@/i18n/es-AR";

export function ActivationHeader({
  eyebrow = "Ventana Fértil",
  headline = ES_AR_COPY.heroHeadline,
  subheadline = ES_AR_COPY.heroSubheadline,
  onPrimaryAction,
  onSecondaryAction,
}: {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[36px] border border-app-border bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98)_0%,rgba(255,248,242,0.96)_38%,rgba(246,230,222,0.9)_100%)] shadow-[0_28px_80px_-46px_rgba(36,22,47,0.5)]">
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-7">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-app-muted">
            <SparklesIcon />
            {eyebrow}
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-app-foreground sm:text-5xl">{headline}</h1>
          <p className="max-w-2xl text-base leading-7 text-app-muted sm:text-lg">{subheadline}</p>

          <div className="flex flex-wrap gap-2">
            <TrustPill icon={<CheckCircle2 className="size-3.5" />} label="Sin cuenta" />
            <TrustPill icon={<Shield className="size-3.5" />} label="Privado" />
            <TrustPill icon={<Share2 className="size-3.5" />} label="Compartible" />
            <TrustPill icon={<Sparkles className="size-3.5" />} label="Educativo" />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(75,44,85,0.55)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
            >
              Calcular
            </button>
            <button
              type="button"
              onClick={onSecondaryAction}
              className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white/90 px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-app-primary/15"
            >
              Ver ejemplo
            </button>
          </div>
        </div>

        <EggOrbitHero
          onPrimaryAction={onPrimaryAction}
          onSecondaryAction={onSecondaryAction}
          title="🥚 Ventana Fértil"
          subtitle="Visual, privada y lista para usar en segundos."
          compactNote="Sin cuenta. Datos en este navegador."
          showContent={false}
        />
      </div>
    </section>
  );
}

function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
      <span className="text-app-primary">{icon}</span>
      {label}
    </span>
  );
}

function SparklesIcon() {
  return <span aria-hidden="true">✨</span>;
}
