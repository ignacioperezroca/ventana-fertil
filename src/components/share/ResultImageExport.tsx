"use client";

import { Download, Image as ImageIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

import { formatDateShort } from "@/lib/cycle";
import { getFertileRangeText, getPeakDates, getOvulationText } from "@/lib/fertility";
import type { SimulationResult } from "@/types";

export function ResultImageExport({
  simulation,
  onToast,
}: {
  simulation: SimulationResult;
  onToast: (tone: "neutral" | "success" | "warning" | "danger", title: string, message: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  const fertileRange = useMemo(() => getFertileRangeText(simulation), [simulation]);
  const peakDates = useMemo(() => getPeakDates(simulation).map((date) => formatDateShort(date)).join(" · "), [simulation]);
  const ovulationDate = useMemo(() => getOvulationText(simulation), [simulation]);

  const handleDownload = async () => {
    if (!cardRef.current) {
      onToast("warning", "Sin imagen", "No encontramos la tarjeta para exportar.");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fff8f1",
      });
      const link = document.createElement("a");
      link.download = "ventana-fertil-resultado.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      onToast("success", "Imagen lista", "Se descargó tu resumen visual.");
    } catch {
      onToast("danger", "No se pudo exportar", "Probá de nuevo en un navegador compatible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[30px] border border-app-border bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_22px_70px_-44px_rgba(36,22,47,0.32)] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Imagen</p>
          <h3 className="mt-2 text-xl font-semibold text-app-foreground">Descargar resumen visual</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">Una tarjeta simple para compartir sin exponer datos íntimos.</p>
        </div>
        <div className="rounded-2xl border border-app-border bg-white p-3 text-app-primary">
          <ImageIcon className="size-5" />
        </div>
      </div>

      <div ref={cardRef} className="mt-4 rounded-[28px] border border-app-border bg-white p-4">
        <p className="text-sm font-semibold text-app-foreground">🥚 Ventana Fértil</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">Tu ventana fértil estimada</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Mini label="Ventana fértil" value={fertileRange} />
          <Mini label="Más fértiles" value={peakDates || "—"} />
          <Mini label="Ovulación" value={ovulationDate} />
        </div>
        <p className="mt-4 text-xs leading-5 text-app-muted">Estimación educativa. La ovulación puede moverse y esto no reemplaza consulta médica.</p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="vf-press mt-4 inline-flex h-12 items-center justify-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
      >
        <Download className="mr-2 size-4" />
        {busy ? "Generando..." : "Descargar imagen"}
      </button>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-app-surface-2 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-app-foreground">{value}</p>
    </div>
  );
}
