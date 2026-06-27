import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Iniciá sesión para continuar." }, { status: 401 });
    const { data, error } = await createAdminClient()
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    if (error || !data.stripe_customer_id) {
      return NextResponse.json({ error: "Todavía no hay una suscripción para administrar." }, { status: 404 });
    }
    const session = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${getAppUrl()}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "No pudimos abrir la administración de pagos." }, { status: 500 });
  }
}
