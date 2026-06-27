"use client";

import { useState } from "react";

export function PricingCards({ yearlyAvailable, signedIn }: { yearlyAvailable: boolean; signedIn: boolean }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: "monthly" | "yearly") {
    if (!signedIn) {
      window.location.href = "/signup?next=/pricing";
      return;
    }
    setPending(plan);
    setError(null);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const body = await response.json() as { url?: string; error?: string };
    if (body.url) window.location.href = body.url;
    else setError(body.error ?? "No pudimos iniciar el pago.");
    setPending(null);
  }

  const benefits = ["Historial completo", "Registros sin límite", "Sincronización entre dispositivos", "Backup y exportación", "Visualizaciones históricas"];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl border border-app-primary bg-white p-6 shadow-lg shadow-app-primary/10">
        <p className="text-sm font-bold text-app-primary">Mensual</p>
        <h2 className="mt-2 text-2xl font-bold">Premium mes a mes</h2>
        <ul className="mt-5 space-y-2 text-sm text-app-muted">{benefits.map((item) => <li key={item}>✓ {item}</li>)}</ul>
        <button onClick={() => checkout("monthly")} disabled={pending !== null} className="mt-6 min-h-12 w-full rounded-xl bg-app-primary px-4 font-bold text-white">{pending === "monthly" ? "Abriendo pago…" : "Comenzar Premium"}</button>
      </article>
      {yearlyAvailable && (
        <article className="rounded-3xl border border-app-border bg-white p-6">
          <p className="text-sm font-bold text-app-primary">Anual</p>
          <h2 className="mt-2 text-2xl font-bold">Premium por un año</h2>
          <p className="mt-3 text-sm text-app-muted">Un solo cobro anual, con el precio visible en Stripe antes de confirmar.</p>
          <button onClick={() => checkout("yearly")} disabled={pending !== null} className="mt-6 min-h-12 w-full rounded-xl border border-app-primary px-4 font-bold text-app-primary">{pending === "yearly" ? "Abriendo pago…" : "Elegir plan anual"}</button>
        </article>
      )}
      {error && <p aria-live="polite" className="md:col-span-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
