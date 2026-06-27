import "server-only";

import { requireUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { createAdminClient } from "@/lib/supabase/admin";
import { cycleSchema } from "@/lib/validation/cloud";
import type { Json } from "@/types/database";

export async function fetchActiveCycle() {
  const user = await requireUser();
  const { data, error } = await createAdminClient().from("cycles").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle();
  if (error) throw new Error("No se pudo cargar el ciclo activo.");
  return data;
}

export async function fetchCycleHistory() {
  const user = await requireUser();
  const entitlements = await getUserEntitlements(user.id);
  const query = createAdminClient().from("cycles").select("*").eq("user_id", user.id).order("period_start", { ascending: false });
  const { data, error } = entitlements.features.cycleHistory ? await query : await query.limit(1);
  if (error) throw new Error("No se pudo cargar el historial.");
  return data;
}

export async function saveCycle(input: unknown) {
  const user = await requireUser();
  const cycle = cycleSchema.parse(input);
  const payload = {
    user_id: user.id, period_start: cycle.periodStart, average_cycle_length: cycle.averageCycleLength,
    minimum_cycle_length: cycle.minimumCycleLength, maximum_cycle_length: cycle.maximumCycleLength,
    regularity: cycle.regularity, ovulation_method: cycle.ovulationMethod,
    known_ovulation_date: cycle.knownOvulationDate || null, lh_surge_date: cycle.lhSurgeDate || null,
    lh_result: cycle.lhResult || null, body_signals: cycle.bodySignals as Json, is_active: cycle.isActive,
  };
  const admin = createAdminClient();
  if (cycle.id) {
    const { data, error } = await admin.from("cycles").update(payload).eq("id", cycle.id).eq("user_id", user.id).select().single();
    if (error) throw new Error("No se pudo actualizar el ciclo.");
    return data;
  }
  const { data, error } = await admin.from("cycles").insert(payload).select().single();
  if (error) throw new Error("No se pudo crear el ciclo.");
  return data;
}
