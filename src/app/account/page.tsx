import type { Metadata } from "next";
import Link from "next/link";

import { AccountActions } from "@/components/account/AccountActions";
import { requireUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const entitlements = await getUserEntitlements(user.id);
  const periodEnd = entitlements.currentPeriodEnd ? new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(entitlements.currentPeriodEnd)) : null;
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-app-primary">← Volver a la app</Link>
      <h1 className="mt-6 text-3xl font-bold">Mi cuenta</h1>
      <section className="mt-6 rounded-3xl border border-app-border bg-white p-6">
        <dl className="space-y-4 text-sm">
          <div><dt className="text-app-muted">Email</dt><dd className="font-semibold">{user.email}</dd></div>
          <div><dt className="text-app-muted">Plan</dt><dd className="font-semibold capitalize">{entitlements.plan}</dd></div>
          <div><dt className="text-app-muted">Estado</dt><dd className="font-semibold">{entitlements.subscriptionStatus}</dd></div>
          {periodEnd && <div><dt className="text-app-muted">{entitlements.cancelAtPeriodEnd ? "Acceso hasta" : "Próxima renovación"}</dt><dd className="font-semibold">{periodEnd}</dd></div>}
        </dl>
        {!entitlements.hasPremium && <Link href="/pricing" className="mt-6 flex min-h-11 items-center justify-center rounded-xl bg-app-primary px-4 font-bold text-white">Conocer Premium</Link>}
      </section>
      <section className="mt-4 rounded-3xl border border-app-border bg-white p-6">
        <h2 className="text-lg font-bold">Datos y privacidad</h2>
        <p className="mt-2 text-sm text-app-muted">La exportación contiene solo los datos asociados a esta cuenta. El borrado es definitivo.</p>
        <div className="mt-5"><AccountActions canExport={entitlements.features.dataExport} hasBilling={entitlements.subscriptionStatus !== "none"} /></div>
      </section>
    </main>
  );
}
