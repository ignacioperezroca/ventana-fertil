import "server-only";

import { FREE_LIMITS } from "@/lib/limits";
import { createAdminClient } from "@/lib/supabase/admin";
import { cloudSnapshotSchema, type CloudSnapshotInput } from "@/lib/validation/cloud";
import type { Json } from "@/types/database";

export async function getCloudState(userId: string) {
  const admin = createAdminClient();
  const [cycles, logs, exposures] = await Promise.all([
    admin.from("cycles").select("*").eq("user_id", userId).order("period_start", { ascending: false }),
    admin.from("daily_logs").select("*").eq("user_id", userId).order("log_date", { ascending: false }),
    admin.from("exposures").select("*").eq("user_id", userId).order("exposure_date", { ascending: false }),
  ]);
  const error = cycles.error ?? logs.error ?? exposures.error;
  if (error) throw new Error("No se pudieron cargar los datos sincronizados.");
  return { cycles: cycles.data, dailyLogs: logs.data, exposures: exposures.data };
}

export async function migrateSnapshot(userId: string, input: unknown, hasPremium: boolean) {
  const parsed = cloudSnapshotSchema.parse(input);
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("local_data_migrated_at")
    .eq("id", userId)
    .single();
  if (profileError) throw new Error("No se pudo verificar la migración.");
  if (profile.local_data_migrated_at) return { migrated: false, reason: "already_migrated" as const };

  const { data: existing, error: existingError } = await admin
    .from("cycles")
    .select("id,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (existingError) throw new Error("No se pudo comparar el estado guardado.");
  if (existing.length > 0) return { migrated: false, reason: "conflict" as const };

  const cycle = await insertCycle(admin, userId, parsed.cycle);
  const logLimit = hasPremium ? parsed.dailyLogs.length : FREE_LIMITS.cloudDailyLogs;
  const exposureLimit = hasPremium ? parsed.exposures.length : FREE_LIMITS.cloudExposures;
  const logs = parsed.dailyLogs.slice(0, logLimit).map((log) => mapDailyLog(userId, cycle.id, log));
  const exposures = parsed.exposures.slice(0, exposureLimit).map((entry) => mapExposure(userId, cycle.id, entry));

  if (logs.length) {
    const { error } = await admin.from("daily_logs").upsert(logs, { onConflict: "user_id,log_date" });
    if (error) throw new Error("No se pudieron migrar los registros diarios.");
  }
  if (exposures.length) {
    const { error } = await admin.from("exposures").insert(exposures);
    if (error) throw new Error("No se pudieron migrar las fechas relevantes.");
  }
  const { error: markError } = await admin
    .from("profiles")
    .update({ local_data_migrated_at: new Date().toISOString() })
    .eq("id", userId);
  if (markError) throw new Error("Los datos se guardaron, pero no pudimos cerrar la migración.");
  return { migrated: true, counts: { dailyLogs: logs.length, exposures: exposures.length } };
}

export async function upsertCurrentSnapshot(userId: string, input: unknown, hasPremium: boolean) {
  const parsed = cloudSnapshotSchema.parse(input);
  const admin = createAdminClient();
  const { data: active, error: activeError } = await admin.from("cycles").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle();
  if (activeError) throw new Error("No se pudo verificar el ciclo activo.");
  let cycleId = active?.id;
  if (cycleId) {
    const { error } = await admin.from("cycles").update({
      period_start: parsed.cycle.periodStart,
      average_cycle_length: parsed.cycle.averageCycleLength,
      minimum_cycle_length: parsed.cycle.minimumCycleLength,
      maximum_cycle_length: parsed.cycle.maximumCycleLength,
      regularity: parsed.cycle.regularity,
      ovulation_method: parsed.cycle.ovulationMethod,
      known_ovulation_date: parsed.cycle.knownOvulationDate || null,
      lh_surge_date: parsed.cycle.lhSurgeDate || null,
      lh_result: parsed.cycle.lhResult || null,
      body_signals: parsed.cycle.bodySignals as Json,
    }).eq("id", cycleId).eq("user_id", userId);
    if (error) throw new Error("No se pudo actualizar el ciclo.");
  } else {
    cycleId = (await insertCycle(admin, userId, parsed.cycle)).id;
  }
  const logLimit = hasPremium ? parsed.dailyLogs.length : FREE_LIMITS.cloudDailyLogs;
  const exposureLimit = hasPremium ? parsed.exposures.length : FREE_LIMITS.cloudExposures;
  const logs = parsed.dailyLogs.slice(0, logLimit).map((log) => mapDailyLog(userId, cycleId!, log));
  if (logs.length) {
    const { error } = await admin.from("daily_logs").upsert(logs, { onConflict: "user_id,log_date" });
    if (error) throw new Error("No se pudieron sincronizar los registros.");
  }
  const { error: deleteError } = await admin.from("exposures").delete().eq("user_id", userId).eq("cycle_id", cycleId);
  if (deleteError) throw new Error("No se pudieron preparar las fechas relevantes.");
  const exposures = parsed.exposures.slice(0, exposureLimit).map((entry) => mapExposure(userId, cycleId!, entry));
  if (exposures.length) {
    const { error } = await admin.from("exposures").insert(exposures);
    if (error) throw new Error("No se pudieron sincronizar las fechas relevantes.");
  }
  return { synced: true, limitsApplied: !hasPremium && (parsed.dailyLogs.length > logLimit || parsed.exposures.length > exposureLimit) };
}

type Admin = ReturnType<typeof createAdminClient>;

async function insertCycle(admin: Admin, userId: string, cycle: CloudSnapshotInput["cycle"]) {
  const { data, error } = await admin.from("cycles").insert({
    user_id: userId,
    period_start: cycle.periodStart,
    average_cycle_length: cycle.averageCycleLength,
    minimum_cycle_length: cycle.minimumCycleLength,
    maximum_cycle_length: cycle.maximumCycleLength,
    regularity: cycle.regularity,
    ovulation_method: cycle.ovulationMethod,
    known_ovulation_date: cycle.knownOvulationDate || null,
    lh_surge_date: cycle.lhSurgeDate || null,
    lh_result: cycle.lhResult || null,
    body_signals: cycle.bodySignals as Json,
    is_active: true,
  }).select("id").single();
  if (error) throw new Error("No se pudo migrar el ciclo.");
  return data;
}

function mapDailyLog(userId: string, cycleId: string, log: CloudSnapshotInput["dailyLogs"][number]) {
  return {
    user_id: userId, cycle_id: cycleId, log_date: log.logDate,
    note: log.note || null, symptoms: log.symptoms || null, bbt: log.bbt ?? null,
    lh_result: log.lhResult || null, mucus: log.mucus || null,
    cervix_position: log.cervixPosition || null, sex_methods: log.sexMethods,
    exposure_note: log.exposureNote || null, stress_level: log.stressLevel || null,
    sleep_quality: log.sleepQuality || null, travel_or_illness: log.travelOrIllness,
  };
}

function mapExposure(userId: string, cycleId: string, entry: CloudSnapshotInput["exposures"][number]) {
  return { user_id: userId, cycle_id: cycleId, exposure_date: entry.exposureDate, methods: entry.methods, notes: entry.notes || null };
}
