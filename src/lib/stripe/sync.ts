import "server-only";

import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

function timestamp(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

export async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;
  if (!userId) throw new Error("La suscripción no tiene un usuario interno asociado.");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) return;
  const item = subscription.items.data[0];
  const periodStart = item?.current_period_start;
  const periodEnd = item?.current_period_end;
  const product = item?.price.product;

  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: item?.price.id ?? null,
    stripe_product_id: typeof product === "string" ? product : product?.id ?? null,
    status: subscription.status,
    current_period_start: timestamp(periodStart),
    current_period_end: timestamp(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: timestamp(subscription.trial_end),
  }, { onConflict: "user_id" });
  if (error) throw new Error("No se pudo sincronizar la suscripción.");
}

export async function linkCheckoutCustomer(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!userId || !customerId) return;
  const { error } = await createAdminClient().from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    status: "incomplete",
  }, { onConflict: "user_id" });
  if (error) throw new Error("No se pudo asociar la cuenta de facturación.");
}
