"use client";

import { Check, Copy, MessageCircleMore } from "lucide-react";
import { useMemo, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { buildResultCopyText } from "@/lib/resultCopy";
import { copyResultToClipboard } from "@/lib/share";
import { getFertileRangeText, getPeakDates, getOvulationText } from "@/lib/fertility";
import { formatDateShort } from "@/lib/cycle";
import type { SimulationResult } from "@/types";

export function SharePreview({
  simulation,
  onToast,
  onRequestShare,
  isDemo = false,
}: {
  simulation: SimulationResult;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
  onRequestShare: () => void;
  isDemo?: boolean;
}) {
  const [copied, setCopied] = useState<"result" | null>(null);

  const fertileRange = getFertileRangeText(simulation);
  const peakDates = getPeakDates(simulation).map((date) => formatDateShort(date));
  const ovulationDate = getOvulationText(simulation);
  const copyText = useMemo(() => buildResultCopyText(simulation), [simulation]);

  const handleCopyResult = async () => {
    try {
      trackEvent("copy_result_clicked", { hasResult: true, isDemo, source: "share_preview", eventVersion: "g1" });
      await copyResultToClipboard(copyText);
      setCopied("result");
      onToast("success", "Copiado", "El resultado quedó listo para pegar.");
      window.setTimeout(() => setCopied(null), 1800);
    } catch (error) {
      onToast("danger", "No se pudo copiar", error instanceof Error ? error.message : "Probá de nuevo.");
    }
  };

  return (
    <section className="rounded-[34px] border border-app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,249,244,0.92)_100%)] p-4 shadow-[0_24px_70px_-46px_rgba(36,22,47,0.34)] sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Compartir resultado</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Preview listo para WhatsApp</h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-app-muted">Esto puede revelar información personal del ciclo.</p>
      </div>

      <div className="mt-4 rounded-[28px] border border-app-border bg-white p-4 shadow-[0_18px_50px_-36px_rgba(36,22,47,0.28)]">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-app-foreground">🥚 Ventana Fértil</p>
          <span className="rounded-full border border-app-border bg-app-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-app-muted">
            Privado · visual · educativo
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PreviewMetric label="Ventana fértil estimada" value={fertileRange} />
          <PreviewMetric label="Más fértiles" value={peakDates.slice(0, 4).join(" · ") || "—"} />
          <PreviewMetric label="Ovulación estimada" value={ovulationDate} />
        </div>
        <p className="mt-4 text-xs leading-5 text-app-muted">Estimación educativa: la ovulación puede moverse y esto no reemplaza consulta médica.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequestShare}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_18px_30px_-22px_rgba(37,211,102,0.5)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
        >
          <MessageCircleMore className="mr-2 size-4" />
          Compartir resultado
        </button>
        <button
          type="button"
          onClick={handleCopyResult}
          className="vf-press inline-flex h-12 items-center justify-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/30 focus:outline-none focus:ring-2 focus:ring-app-primary/15"
        >
          {copied === "result" ? <Check className="mr-2 size-4 text-app-success" /> : <Copy className="mr-2 size-4" />}
          Copiar resultado
        </button>
      </div>
    </section>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-app-surface-2 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-app-foreground">{value}</p>
    </div>
  );
}
