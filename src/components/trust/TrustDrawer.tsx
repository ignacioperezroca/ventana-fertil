"use client";

import { Shield } from "lucide-react";
import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";
import { BottomSheet } from "@/components/ui/BottomSheet";

export function TrustDrawer({ open, onClose, isDemo = false }: { open: boolean; onClose: () => void; isDemo?: boolean }) {
  useEffect(() => {
    if (!open) return;
    trackEvent("privacy_opened", { hasResult: false, isDemo, source: "trust_drawer", eventVersion: "g1" });
  }, [isDemo, open]);

  return (
    <BottomSheet open={open} title="Por qué es privado?" subtitle="La app trabaja localmente en este navegador." onClose={onClose}>
      <div className="grid gap-3">
        <div className="rounded-[24px] border border-app-border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-app-border bg-app-surface-2 p-3 text-app-primary">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-app-foreground">Privado por diseño</p>
              <p className="text-sm leading-6 text-app-muted">No necesitás cuenta y no enviamos datos médicos en este MVP.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 text-sm leading-6 text-app-muted">
          <p>• No necesitás cuenta.</p>
          <p>• Tus datos quedan en este navegador.</p>
          <p>• Podés borrar todo cuando quieras.</p>
          <p>• No se envían datos médicos en este MVP.</p>
        </div>
      </div>
    </BottomSheet>
  );
}
