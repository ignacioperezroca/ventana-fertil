"use client";

import { Shield, Trash2, Download, Database } from "lucide-react";
import type { ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

export function PrivacyTrustSection() {
  return (
    <section className="rounded-[34px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
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
        <TrustRow icon={<Database className="size-4" />} text="No necesitás crear cuenta." />
        <TrustRow icon={<Download className="size-4" />} text="Tus datos quedan guardados en este navegador." />
        <TrustRow icon={<Trash2 className="size-4" />} text="Podés borrar o exportar la información cuando quieras." />
        <TrustRow icon={<Shield className="size-4" />} text="No usamos esta herramienta como diagnóstico médico." />
      </div>

      <details
        className="mt-4 rounded-[28px] border border-app-border bg-white p-4"
        onToggle={(event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) {
            trackEvent("privacy_opened", { source: "privacy_trust", hasResult: false, isDemo: false, eventVersion: "g1" });
          }
        }}
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-app-foreground">Ver privacidad</summary>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-app-muted">
          <p>Qué se guarda: último período, duración promedio del ciclo, preferencias locales y el resultado que vos generás.</p>
          <p>Dónde se guarda: únicamente en este navegador, sin backend para el MVP.</p>
          <p>Cómo borrar datos: desde los controles de la app o limpiando el almacenamiento del navegador.</p>
          <p>Qué no se envía: fechas íntimas, notas, señales corporales ni analíticas sensibles.</p>
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
