import "server-only";

import { requireUser } from "@/lib/auth/user";
import { getUserEntitlements } from "@/lib/entitlements";
import { FREE_LIMITS } from "@/lib/limits";
import { createAdminClient } from "@/lib/supabase/admin";
import { dailyLogSchema } from "@/lib/validation/cloud";

export async function upsertDailyLog(input: unknown) {
  const user = await requireUser();
  const log = dailyLogSchema.parse(input);
  const admin = createAdminClient();
  const entitlements = await getUserEntitlements(user.id);
  if (!entitlements.features.unlimitedLogs) {
    const { count, error } = await admin.from("daily_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    const { data: existing } = await admin.from("daily_logs").select("id").eq("user_id", user.id).eq("log_date", log.logDate).maybeSingle();
    if (error) throw new Error("No se pudo verificar el límite de registros.");
    if (!existing && (count ?? 0) >= FREE_LIMITS.cloudDailyLogs) throw new Error("Alcanzaste el límite gratuito de registros en la nube.");
  }
  const { data, error } = await admin.from("daily_logs").upsert({
    user_id: user.id, cycle_id: log.cycleId ?? null, log_date: log.logDate, note: log.note || null,
    symptoms: log.symptoms || null, bbt: log.bbt ?? null, lh_result: log.lhResult || null,
    mucus: log.mucus || null, cervix_position: log.cervixPosition || null, sex_methods: log.sexMethods,
    exposure_note: log.exposureNote || null, stress_level: log.stressLevel || null,
    sleep_quality: log.sleepQuality || null, travel_or_illness: log.travelOrIllness,
  }, { onConflict: "user_id,log_date" }).select().single();
  if (error) throw new Error("No se pudo guardar el registro.");
  return data;
}

export async function deleteDailyLog(id: string) {
  const user = await requireUser();
  const { error } = await createAdminClient().from("daily_logs").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("No se pudo eliminar el registro.");
}
