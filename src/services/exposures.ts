import "server-only";

import { requireUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { FREE_LIMITS } from "@/lib/limits";
import { createAdminClient } from "@/lib/supabase/admin";
import { exposureSchema } from "@/lib/validation/cloud";

export async function saveExposure(input: unknown) {
  const user = await requireUser();
  const entry = exposureSchema.parse(input);
  const admin = createAdminClient();
  const entitlements = await getUserEntitlements(user.id);
  if (!entitlements.features.unlimitedLogs && !entry.id) {
    const { count, error } = await admin.from("exposures").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    if (error) throw new Error("No se pudo verificar el límite.");
    if ((count ?? 0) >= FREE_LIMITS.cloudExposures) throw new Error("Alcanzaste el límite gratuito de fechas relevantes.");
  }
  const payload = { user_id: user.id, cycle_id: entry.cycleId ?? null, exposure_date: entry.exposureDate, methods: entry.methods, notes: entry.notes || null };
  const result = entry.id
    ? await admin.from("exposures").update(payload).eq("id", entry.id).eq("user_id", user.id).select().single()
    : await admin.from("exposures").insert(payload).select().single();
  if (result.error) throw new Error("No se pudo guardar la fecha relevante.");
  return result.data;
}

export async function deleteExposure(id: string) {
  const user = await requireUser();
  const { error } = await createAdminClient().from("exposures").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("No se pudo eliminar la fecha relevante.");
}
