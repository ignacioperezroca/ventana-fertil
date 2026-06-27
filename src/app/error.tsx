"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ventana-fertil:error]", error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-app-border bg-[rgba(255,255,255,0.9)] p-6 shadow-[0_22px_70px_-42px_rgba(36,22,47,0.32)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">Algo no cargó bien</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app-foreground">Podés recargar la app</h1>
        <p className="mt-3 text-sm leading-6 text-app-muted">
          Tus datos locales deberían seguir guardados en este navegador. Si algo se trabó, una recarga suele alcanzar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="inline-flex h-12 items-center rounded-full bg-app-primary px-5 text-sm font-semibold text-white transition hover:bg-app-primary/90">
            Recargar
          </button>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-12 items-center rounded-full border border-app-border bg-white px-5 text-sm font-semibold text-app-foreground transition hover:border-app-primary/40">
            Refrescar navegador
          </button>
        </div>
      </div>
    </main>
  );
}
