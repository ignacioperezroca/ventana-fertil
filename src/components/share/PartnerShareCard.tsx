"use client";

import { Copy, Link2, MessageCircle, Shield } from "lucide-react";
import { trackEvent, getDeviceCategory } from "@/lib/analytics";
import { copyPartnerSummaryText, copyPartnerContextText, copyShareUrl } from "@/lib/share";

export function PartnerShareCard({
  onNotify,
  contextLabel,
  lowAnxietyMode = false,
}: {
  onNotify: (tone: "success" | "warning" | "danger", title: string, message: string) => void;
  contextLabel: string;
  lowAnxietyMode?: boolean;
}) {
  const copySummary = async () => {
    try {
      await copyPartnerSummaryText();
      trackEvent("partner_share_copied", { source: "summary", isDemo: false, deviceCategory: getDeviceCategory() });
      onNotify("success", "Resumen copiado", "Se copió un resumen seguro para compartir.");
    } catch (error) {
      onNotify("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá nuevamente.");
    }
  };

  const copyContext = async () => {
    const confirmed = window.confirm("Esto puede revelar información personal del ciclo. Confirmás que querés copiarlo?");
    if (!confirmed) return;
    try {
      await copyPartnerContextText(contextLabel);
      trackEvent("partner_share_copied", { source: "context", isDemo: false, deviceCategory: getDeviceCategory() });
      onNotify("success", "Contexto copiado", "Se copió una versión con contexto general, sin fechas íntimas.");
    } catch (error) {
      onNotify("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá nuevamente.");
    }
  };

  const copyLink = async () => {
    try {
      await copyShareUrl();
      onNotify("success", "Link copiado", "Se copió el enlace de la app.");
    } catch (error) {
      onNotify("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá nuevamente.");
    }
  };

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Compartir resumen</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Mandá una explicación sin exponer datos íntimos</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Lo que se copia acá no incluye fechas exactas ni notas personales.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Shield className="size-5" />
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <p className="text-sm font-semibold text-app-foreground">Estoy usando 🥚 Ventana Fértil para entender mejor el ciclo y la ventana fértil estimada.</p>
        <p className="mt-2 text-sm leading-6 text-app-muted">La app muestra marcadores educativos por timing y también aclara la incertidumbre del calendario.</p>
        {lowAnxietyMode ? <p className="mt-2 text-xs leading-5 text-app-muted">Modo baja ansiedad activo: las cifras exactas se muestran menos.</p> : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ActionButton icon={Link2} label="Copiar link" onClick={copyLink} />
        <ActionButton icon={Copy} label="Copiar resumen" onClick={copySummary} />
        <ActionButton icon={MessageCircle} label="Copiar contexto" onClick={copyContext} />
      </div>
      <p className="mt-4 text-xs leading-5 text-app-muted">Este resumen está pensado para compartir con otra persona sin exponer datos personales del ciclo.</p>
    </section>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Copy; label: string; onClick: () => Promise<void> }) {
  return (
    <button type="button" onClick={() => void onClick()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40 focus:outline-none focus:ring-2 focus:ring-app-primary/20">
      <Icon className="size-4" />
      {label}
    </button>
  );
}
