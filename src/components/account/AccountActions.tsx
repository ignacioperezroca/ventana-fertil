"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AccountActions({ canExport, hasBilling }: { canExport: boolean; hasBilling: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function openPortal() {
    setPending("portal");
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const body = await response.json() as { url?: string; error?: string };
    if (body.url) window.location.href = body.url;
    else setStatus(body.error ?? "No pudimos abrir la suscripción.");
    setPending(null);
  }

  async function signOut() {
    setPending("signout");
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  async function deleteAccount() {
    const confirmation = window.prompt("Escribí ELIMINAR para borrar la cuenta, los datos en la nube y cancelar el acceso.");
    if (confirmation !== "ELIMINAR") return;
    setPending("delete");
    const response = await fetch("/api/account/delete", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirmation }) });
    if (response.ok) {
      window.localStorage.removeItem("ventana-fertil:v1");
      router.replace("/");
      router.refresh();
    } else setStatus("No pudimos eliminar la cuenta. Intentá nuevamente.");
    setPending(null);
  }

  return (
    <div className="space-y-3">
      {hasBilling && <button onClick={openPortal} disabled={pending !== null} className="min-h-11 w-full rounded-xl border border-app-primary px-4 font-semibold text-app-primary">Administrar suscripción</button>}
      {canExport && <a href="/api/account/export" className="flex min-h-11 items-center justify-center rounded-xl border border-app-border px-4 font-semibold">Exportar datos</a>}
      <button onClick={signOut} disabled={pending !== null} className="min-h-11 w-full rounded-xl border border-app-border px-4 font-semibold">Cerrar sesión</button>
      <button onClick={deleteAccount} disabled={pending !== null} className="min-h-11 w-full rounded-xl border border-rose-300 px-4 font-semibold text-rose-700">Eliminar cuenta y datos</button>
      {status && <p aria-live="polite" className="text-sm text-rose-700">{status}</p>}
    </div>
  );
}
