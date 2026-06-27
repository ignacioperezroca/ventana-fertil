"use client";

import { Copy, Share2 } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { copyShareUrl, getGenericSharePayload, shareApp } from "@/lib/share";

export function PublicShareCard({
  onNotify,
  isDemo = false,
}: {
  onNotify: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
  isDemo?: boolean;
}) {
  const payload = getGenericSharePayload();

  const handleShare = async () => {
    try {
      trackEvent("share_app_clicked", { source: "public_share_card", hasResult: false, isDemo, eventVersion: "g1" });
      const usedNative = await shareApp();
      if (!usedNative) {
        await copyShareUrl();
        onNotify("success", "Link copiado", "La app quedó lista para compartir.");
        return;
      }
      onNotify("success", "Compartido", "Abrimos la hoja nativa para compartir la app.");
    } catch (error) {
      onNotify("danger", "No se pudo compartir", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  };

  const handleCopyLink = async () => {
    try {
      trackEvent("share_app_clicked", { source: "public_share_card_copy", hasResult: false, isDemo, eventVersion: "g1" });
      await copyShareUrl();
      onNotify("success", "Link copiado", "La app quedó lista para compartir.");
    } catch (error) {
      onNotify("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  };

  return (
    <section className="rounded-[34px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Compartir app</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Compartí Ventana Fértil sin datos personales</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Este resumen nunca incluye fechas íntimas ni notas del ciclo.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <Share2 className="size-5" />
        </div>
      </div>

      <div className="mt-4 rounded-[28px] border border-app-border bg-white p-4">
        <p className="text-sm font-semibold text-app-foreground">🥚 Ventana Fértil</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">Calculá tus días más fértiles del mes en segundos.</p>
        <p className="mt-3 text-xs leading-5 text-app-muted">Simulador educativo, visual y privado.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-app-primary/25"
        >
          <Share2 className="mr-2 size-4" />
          Compartir app
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          <Copy className="mr-2 size-4" />
          Copiar link
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-app-muted">URL sugerida: {payload.url}</p>
    </section>
  );
}
