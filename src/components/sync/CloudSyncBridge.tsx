"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cloudDataToAppState, stateToCloudSnapshot, type CloudData } from "@/lib/cloud-snapshot";
import { getCurrentPeriodEntry } from "@/lib/repositories/cycleRepository";
import {
  CYCLE_STORAGE_KEY,
  readCycleRepositoryStateSync,
  writeCycleRepositoryStateSync,
} from "@/lib/repositories/localStorageCycleRepository";
import { createClient } from "@/lib/supabase/client";

export function CloudSyncBridge() {
  const [authenticated, setAuthenticated] = useState(false);
  const [prompt, setPrompt] = useState<"migrate" | "conflict" | null>(null);
  const [cloudData, setCloudData] = useState<CloudData | null>(null);
  const [localSummary, setLocalSummary] = useState<{ periodStart: string; cycles: number } | null>(null);
  const syncEnabled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCloudCopy = useCallback((cloud: CloudData) => {
    const current = window.localStorage.getItem(CYCLE_STORAGE_KEY);
    if (current) window.localStorage.setItem(`${CYCLE_STORAGE_KEY}:pre-cloud-backup`, current);
    writeCycleRepositoryStateSync(cloudDataToAppState(cloud));
    syncEnabled.current = true;
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    let active = true;
    createClient().auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      setAuthenticated(true);
      const local = readCycleRepositoryStateSync().state;
      const current = getCurrentPeriodEntry(local);
      if (current) setLocalSummary({ periodStart: current.periodStartDate, cycles: local.entries.length });
      const response = await fetch("/api/sync/state", { cache: "no-store" });
      if (!response.ok) return;
      const cloud = await response.json() as CloudData;
      setCloudData(cloud);
      if (current && cloud.cycles.length > 0) setPrompt("conflict");
      else if (current) setPrompt("migrate");
      else if (cloud.cycles.length > 0) applyCloudCopy(cloud);
      else syncEnabled.current = true;
    });
    return () => { active = false; };
  }, [applyCloudCopy]);

  useEffect(() => {
    if (!authenticated) return;
    const sync = () => {
      if (!syncEnabled.current) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const snapshot = stateToCloudSnapshot(readCycleRepositoryStateSync().state);
        if (!snapshot) return;
        await fetch("/api/sync/state", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(snapshot),
        });
      }, 900);
    };
    window.addEventListener("ventana-fertil:local-state-saved", sync);
    return () => {
      window.removeEventListener("ventana-fertil:local-state-saved", sync);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [authenticated]);

  async function upload(path: "/api/sync/migrate" | "/api/sync/state") {
    const snapshot = stateToCloudSnapshot(readCycleRepositoryStateSync().state);
    if (!snapshot) return;
    const response = await fetch(path, {
      method: path.endsWith("migrate") ? "POST" : "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (response.ok) {
      syncEnabled.current = true;
      setPrompt(null);
    }
  }

  if (!prompt) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-3 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="migration-title">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="migration-title" className="text-xl font-bold">{prompt === "conflict" ? "Hay datos en dos lugares" : "Encontramos datos guardados"}</h2>
        <p className="mt-2 text-sm text-app-muted">{prompt === "conflict" ? "Tu cuenta y este dispositivo tienen datos. Elegí qué versión querés conservar como actual." : "¿Querés guardarlos en tu cuenta para acceder desde otros dispositivos? El respaldo local no se borra."}</p>
        {localSummary && <dl className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-app-background p-3 text-center text-xs"><div><dt className="text-app-muted">Último período</dt><dd className="mt-1 font-semibold">{localSummary.periodStart}</dd></div><div><dt className="text-app-muted">Ciclos</dt><dd className="mt-1 font-semibold">{localSummary.cycles}</dd></div></dl>}
        <div className="mt-5 grid gap-2">
          {prompt === "conflict" && cloudData && <button type="button" onClick={() => applyCloudCopy(cloudData)} className="min-h-11 rounded-xl border border-app-border px-4 font-semibold">Conservar nube</button>}
          <button type="button" onClick={() => upload(prompt === "migrate" ? "/api/sync/migrate" : "/api/sync/state")} className="min-h-11 rounded-xl bg-app-primary px-4 font-semibold text-white">{prompt === "conflict" ? "Usar datos de este dispositivo" : "Guardar en mi cuenta"}</button>
          <button type="button" onClick={() => setPrompt(null)} className="min-h-11 px-4 text-sm text-app-muted">Ahora no</button>
        </div>
      </section>
    </div>
  );
}
