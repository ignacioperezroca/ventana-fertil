import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl, getPriceForPlan } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { checkoutSchema } from "@/lib/validation/cloud";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Iniciá sesión para continuar." }, { status: 401 });
    const input = checkoutSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: "El plan elegido no es válido." }, { status: 400 });
    const entitlements = await getUserEntitlements(user.id);
    if (entitlements.hasPremium) return NextResponse.json({ error: "Tu cuenta ya tiene Premium activo." }, { status: 409 });

    const admin = createAdminClient();
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const stripe = getStripe();
    let customerId = subscription?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      }, { idempotencyKey: `customer-${user.id}` });
      customerId = customer.id;
      const { error } = await admin.from("subscriptions").upsert({
        user_id: user.id, stripe_customer_id: customerId, status: "none",
      }, { onConflict: "user_id" });
      if (error) throw new Error("No se pudo vincular la cuenta de facturación.");
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: getPriceForPlan(input.data.plan), quantity: 1 }],
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${appUrl}/account?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "No pudimos abrir el pago. Probá de nuevo." }, { status: 500 });
  }
}
