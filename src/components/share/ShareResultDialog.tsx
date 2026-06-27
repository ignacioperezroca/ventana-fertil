"use client";

import { Copy, MessageCircleMore, X } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { getWhatsAppUrl, shareResult } from "@/lib/share";
import { BottomSheet } from "@/components/ui/BottomSheet";

export function ShareResultDialog({
  open,
  message,
  onClose,
  onCopy,
  isDemo = false,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  onCopy: () => Promise<void>;
  isDemo?: boolean;
}) {
  const handleShare = async () => {
    try {
      trackEvent("share_result_clicked", { hasResult: true, isDemo, source: "share_result_dialog", eventVersion: "g1" });
      const usedNative = await shareResult(message);
      if (!usedNative) {
        window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      }
      onClose();
    } catch {
      window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
      onClose();
    }
  };

  return (
    <BottomSheet open={open} title="Compartir resultado" subtitle="Esto puede revelar información personal del ciclo." onClose={onClose}>
      <div className="grid gap-4">
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">
          <p className="font-semibold">Este resultado puede revelar información personal del ciclo.</p>
          <p className="mt-1">Compartilo solo si querés. El mensaje no incluye tu fecha de inicio por defecto.</p>
        </div>

        <div className="rounded-[24px] border border-app-border bg-white p-4">
          <p className="text-sm font-semibold text-app-foreground">Resumen listo para compartir</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">{message}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleShare}
            className="vf-press inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(37,211,102,0.45)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
          >
            <MessageCircleMore className="mr-2 size-4" />
            Compartir
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="vf-press inline-flex h-12 flex-1 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
          >
            <Copy className="mr-2 size-4" />
            Copiar
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="vf-press inline-flex h-11 items-center justify-center rounded-full border border-transparent bg-transparent px-4 text-sm font-semibold text-app-muted transition hover:text-app-foreground focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          <X className="mr-2 size-4" />
          Cancelar
        </button>
      </div>
    </BottomSheet>
  );
}
