import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { linkCheckoutCustomer, syncSubscription } from "@/lib/stripe/sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Firma requerida." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: claimed, error: claimError } = await admin.rpc("claim_stripe_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_livemode: event.livemode,
    p_payload_version: event.api_version ?? null,
  });
  if (claimError) return NextResponse.json({ error: "No se pudo registrar el evento." }, { status: 500 });
  if (!claimed) return NextResponse.json({ received: true, duplicate: true });

  try {
    await processEvent(event);
    await admin.from("stripe_events").update({ processing_error: null, processed_at: new Date().toISOString() }).eq("stripe_event_id", event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Error de procesamiento";
    await admin.from("stripe_events").update({ processing_error: message }).eq("stripe_event_id", event.id);
    return NextResponse.json({ error: "No se pudo procesar el evento." }, { status: 500 });
  }
}

async function processEvent(event: Stripe.Event) {
  const stripe = getStripe();
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await linkCheckoutCustomer(session);
      if (typeof session.subscription === "string") await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const details = invoice.parent?.subscription_details;
      const subscriptionId = typeof details?.subscription === "string" ? details.subscription : details?.subscription?.id;
      if (subscriptionId) await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
      break;
    }
    default:
      break;
  }
}
