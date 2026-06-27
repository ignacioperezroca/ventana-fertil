"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cloudDataToState, stateToCloudSnapshot } from "@/lib/cloud-snapshot";
import { loadStoredState, saveStoredState, STORAGE_KEY } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

export function CloudSyncBridge() {
  const [authenticated, setAuthenticated] = useState(false);
  const [prompt, setPrompt] = useState<"migrate" | "conflict" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cloudData, setCloudData] = useState<Parameters<typeof cloudDataToState>[0] | null>(null);
  const [localSummary, setLocalSummary] = useState<{ periodStart: string; logs: number; exposures: number } | null>(null);
  const syncEnabled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    let active = true;
    createClient().auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      setAuthenticated(true);
      const local = loadStoredState();
      if (local?.lastPeriodStart) setLocalSummary({ periodStart: local.lastPeriodStart, logs: Object.keys(local.dailyLogs).length, exposures: local.exposureEntries.length });
      const response = await fetch("/api/sync/state", { cache: "no-store" });
      if (!response.ok) return;
      const cloud = await response.json() as Parameters<typeof cloudDataToState>[0];
      setCloudData(cloud);
      if (local?.lastPeriodStart && cloud.cycles.length > 0) setPrompt("conflict");
      else if (local?.lastPeriodStart) setPrompt("migrate");
      else syncEnabled.current = true;
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authenticated || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const sync = () => {
      if (!syncEnabled.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const state = loadStoredState();
        if (!state?.lastPeriodStart) return;
        const response = await fetch("/api/sync/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(stateToCloudSnapshot(state)) });
        setStatus(response.ok ? "Sincronizado" : "Sin conexión: los cambios siguen guardados en este dispositivo.");
      }, 900);
    };
    window.addEventListener("ventana-fertil:local-state-saved", sync);
    return () => { window.removeEventListener("ventana-fertil:local-state-saved", sync); if (timer.current) clearTimeout(timer.current); };
  }, [authenticated]);

  async function upload(path: "/api/sync/migrate" | "/api/sync/state") {
    const state = loadStoredState();
    if (!state) return;
    setStatus("Guardando…");
    const response = await fetch(path, { method: path.endsWith("migrate") ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(stateToCloudSnapshot(state)) });
    if (response.ok) {
      syncEnabled.current = true;
      setPrompt(null);
      setStatus("Datos guardados en tu cuenta.");
    } else setStatus("No pudimos completar la migración. El respaldo local se conserva.");
  }

  function useCloudCopy() {
    if (!cloudData) return;
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) window.localStorage.setItem(`${STORAGE_KEY}:pre-cloud-backup`, current);
    saveStoredState(cloudDataToState(cloudData));
    syncEnabled.current = true;
    window.location.reload();
  }

  if (!authenticated) return <div className="fixed right-4 top-4 z-40"><Link href="/login" className="rounded-full border border-app-border bg-white/95 px-4 py-2 text-sm font-semibold shadow-sm">Iniciar sesión</Link></div>;
  return (
    <>
      <div className="fixed right-4 top-4 z-40 flex items-center gap-2"><span className="rounded-full bg-white/95 px-3 py-2 text-xs shadow-sm" aria-live="polite">{status ?? "Cuenta conectada"}</span><Link href="/account" className="rounded-full bg-app-primary px-4 py-2 text-sm font-semibold text-white">Mi cuenta</Link></div>
      {prompt && <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="migration-title"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 id="migration-title" className="text-xl font-bold">{prompt === "conflict" ? "Hay datos en dos lugares" : "Encontramos datos guardados"}</h2><p className="mt-2 text-sm text-app-muted">{prompt === "conflict" ? "Tu cuenta y este dispositivo tienen datos. Elegí qué versión querés conservar como actual." : "¿Querés guardarlos en tu cuenta para acceder desde otros dispositivos? El respaldo local no se borra."}</p>{localSummary && <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-app-background p-3 text-center text-xs"><div><dt className="text-app-muted">Último período</dt><dd className="mt-1 font-semibold">{localSummary.periodStart}</dd></div><div><dt className="text-app-muted">Registros</dt><dd className="mt-1 font-semibold">{localSummary.logs}</dd></div><div><dt className="text-app-muted">Fechas</dt><dd className="mt-1 font-semibold">{localSummary.exposures}</dd></div></dl>}<div className="mt-5 grid gap-2">{prompt === "conflict" && <button onClick={useCloudCopy} className="min-h-11 rounded-xl border border-app-border px-4 font-semibold">Conservar nube</button>}<button onClick={() => upload(prompt === "migrate" ? "/api/sync/migrate" : "/api/sync/state")} className="min-h-11 rounded-xl bg-app-primary px-4 font-semibold text-white">{prompt === "conflict" ? "Usar datos de este dispositivo" : "Guardar en mi cuenta"}</button><button onClick={() => setPrompt(null)} className="min-h-11 px-4 text-sm text-app-muted">Ahora no</button></div></section></div>}
    </>
  );
}
