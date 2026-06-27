"use client";

import { Database, Shield, Trash2, Download } from "lucide-react";
import type { ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

export function PrivacyTrustCard({ isDemo = false }: { isDemo?: boolean }) {
  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Privacidad</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Privado por diseño</h3>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Shield className="size-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm leading-6 text-app-muted">
        <TrustRow icon={<Database className="size-4" />} text="Sin cuenta." />
        <TrustRow icon={<Download className="size-4" />} text="Datos en este navegador." />
        <TrustRow icon={<Trash2 className="size-4" />} text="Podés borrar todo cuando quieras." />
        <TrustRow icon={<Shield className="size-4" />} text="Compartís solo si querés." />
      </div>

      <details
        className="mt-4 rounded-[24px] border border-app-border bg-white p-4"
        onToggle={(event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) {
            trackEvent("privacy_opened", { source: "privacy_trust_card", hasResult: false, isDemo, eventVersion: "g1" });
          }
        }}
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Ver detalles</summary>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-app-muted">
          <p>Qué se guarda: el último período, la duración promedio del ciclo, preferencias locales y el resultado que vos generás.</p>
          <p>Qué no se guarda: notas sensibles, señales corporales ni datos que no necesitás para usar el simulador.</p>
          <p>Qué no se envía: nada sale del navegador para el MVP.</p>
          <p>Cómo borrar datos: desde los controles de la app o limpiando el almacenamiento local del navegador.</p>
        </div>
      </details>
    </section>
  );
}

function TrustRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 rounded-full border border-app-border bg-white p-1.5 text-app-primary">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
