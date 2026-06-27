import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe no está configurado.");
  stripeClient ??= new Stripe(secretKey, { typescript: true });
  return stripeClient;
}
