import Link from "next/link";

import { PricingCards } from "@/components/paywall/PricingCards";
import { getAuthenticatedUser } from "@/lib/auth/user";
import { getAvailablePlans } from "@/lib/stripe/config";

export default async function PricingPage() {
  const [user, plans] = await Promise.all([getAuthenticatedUser(), Promise.resolve(getAvailablePlans())]);
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-app-primary">← Volver</Link>
      <h1 className="mt-6 text-3xl font-bold">Ventana Fértil Premium</h1>
      <p className="mt-3 max-w-2xl text-app-muted">Guardá tu historia, sincronizá dispositivos y accedé a tus registros sin límite. El cálculo básico y la información de seguridad siguen disponibles gratis.</p>
      <div className="mt-8"><PricingCards yearlyAvailable={plans.yearly} signedIn={Boolean(user)} /></div>
      <p className="mt-6 text-xs text-app-muted">Podés cancelar o cambiar el plan desde el portal de Stripe. Premium no convierte las estimaciones en diagnóstico ni anticoncepción.</p>
    </main>
  );
}
