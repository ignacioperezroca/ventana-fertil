"use client";

import { Download, Link2, Share2, Sparkles } from "lucide-react";
import { getGenericSharePayload, getShareImageUrl } from "@/lib/share";

export function ShareCard({
  onCopyLink,
  onCopyText,
  onShare,
  onDownloadImage,
  note = "Este contenido no incluye tus datos personales.",
}: {
  onCopyLink: () => Promise<void>;
  onCopyText: () => Promise<void>;
  onShare: () => Promise<void>;
  onDownloadImage: () => Promise<void>;
  note?: string;
}) {
  const payload = getGenericSharePayload();

  return (
    <section className="rounded-[28px] border border-app-border bg-[rgba(255,255,255,0.88)] p-5 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Compartir</p>
          <h3 className="mt-1 text-xl font-semibold text-app-foreground">Compartí la app sin exponer datos personales</h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">{note}</p>
        </div>
        <div className="rounded-2xl bg-app-primary/10 px-3 py-2 text-app-primary">
          <Sparkles className="size-5" />
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-app-border bg-white p-4">
        <p className="text-sm font-semibold text-app-foreground">🥚 Ventana Fértil</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">Entendé tu ciclo, día por día.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>🪟 Ventana fértil</Badge>
          <Badge>🥚 Ovulación</Badge>
          <Badge>⚠️ Incertidumbre</Badge>
        </div>
        <p className="mt-4 text-xs leading-5 text-app-muted">Herramienta educativa y privada.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ActionButton icon={Link2} label="Copiar link" onClick={onCopyLink} />
        <ActionButton icon={Share2} label="Compartir" onClick={onShare} />
        <ActionButton icon={Sparkles} label="Copiar texto" onClick={onCopyText} />
        <ActionButton icon={Download} label="Bajar imagen" onClick={onDownloadImage} />
      </div>

      <p className="mt-4 text-xs leading-5 text-app-muted">URL sugerida: {getShareImageUrl()}</p>
      <p className="mt-2 text-xs leading-5 text-app-muted">La tarjeta usa copy genérico, sin fechas del ciclo ni datos sensibles.</p>
      <p className="mt-1 text-xs leading-5 text-app-muted">Share payload: {payload.title}</p>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="inline-flex items-center rounded-full border border-app-border bg-app-surface-2 px-3 py-1 text-xs font-semibold text-app-foreground">{children}</span>;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-app-border bg-white px-4 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40 focus:outline-none focus:ring-2 focus:ring-app-primary/20"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
