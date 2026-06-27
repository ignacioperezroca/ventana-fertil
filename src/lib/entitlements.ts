import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { mapSubscriptionToEntitlements } from "@/lib/entitlement-policy";

export type { UserEntitlements } from "@/lib/entitlement-policy";

export async function getUserEntitlements(userId: string) {
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select("status,current_period_end,cancel_at_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("No se pudo verificar la suscripción.");
  return mapSubscriptionToEntitlements(data);
}
