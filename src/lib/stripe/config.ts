import "server-only";

export type BillingPlan = "monthly" | "yearly";

export function getPriceForPlan(plan: BillingPlan) {
  const price = plan === "monthly" ? process.env.STRIPE_PRICE_ID_MONTHLY : process.env.STRIPE_PRICE_ID_YEARLY;
  if (!price) throw new Error("Ese plan no está disponible.");
  return price;
}

export function getAvailablePlans() {
  return {
    monthly: Boolean(process.env.STRIPE_PRICE_ID_MONTHLY),
    yearly: Boolean(process.env.STRIPE_PRICE_ID_YEARLY),
  };
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
