import { createDefaultState, sanitizeState } from "@/lib/storage";
import type { VentanaFertilState } from "@/types";
import type { Json } from "@/types/database";

export function stateToCloudSnapshot(state: VentanaFertilState) {
  return {
    cycle: {
      periodStart: state.lastPeriodStart,
      averageCycleLength: state.averageCycleLength,
      minimumCycleLength: state.minimumCycleLength,
      maximumCycleLength: state.maximumCycleLength,
      regularity: state.regularity,
      ovulationMethod: state.ovulationMethod,
      knownOvulationDate: state.knownOvulationDate,
      lhSurgeDate: state.lhSurgeDate,
      lhResult: state.lhResult,
      bodySignals: state.bodySignals,
      isActive: true,
    },
    dailyLogs: Object.entries(state.dailyLogs).map(([logDate, log]) => ({
      logDate, note: log.note.slice(0, 2000), symptoms: log.symptoms.slice(0, 1000),
      bbt: parseTemperature(log.bbt), lhResult: log.lhResult, mucus: log.mucus,
      cervixPosition: log.cervixPosition, sexMethods: log.sexMethods,
      exposureNote: log.exposureNote.slice(0, 1000), stressLevel: log.stressLevel,
      sleepQuality: log.sleepQuality, travelOrIllness: log.travelOrIllness,
    })),
    exposures: state.exposureEntries.map((entry) => ({
      exposureDate: entry.date, methods: entry.methods, notes: entry.notes.slice(0, 1000),
    })),
  };
}

interface CloudData {
  cycles: Array<{
    id: string; period_start: string; average_cycle_length: number; minimum_cycle_length: number;
    maximum_cycle_length: number; regularity: string; ovulation_method: string;
    known_ovulation_date: string | null; lh_surge_date: string | null; lh_result: string | null;
    body_signals: Json; is_active: boolean;
  }>;
  dailyLogs: Array<{
    log_date: string; note: string | null; symptoms: string | null; bbt: number | null;
    lh_result: string | null; mucus: string | null; cervix_position: string | null;
    sex_methods: string[]; exposure_note: string | null; stress_level: string | null;
    sleep_quality: string | null; travel_or_illness: boolean;
  }>;
  exposures: Array<{ id: string; exposure_date: string; methods: string[]; notes: string | null }>;
}

export function cloudDataToState(cloud: CloudData) {
  const cycle = cloud.cycles.find((item) => item.is_active) ?? cloud.cycles[0];
  if (!cycle) return createDefaultState();
  const base = createDefaultState();
  return sanitizeState({
    ...base,
    currentStep: 5,
    lastPeriodStart: cycle.period_start,
    averageCycleLength: cycle.average_cycle_length,
    minimumCycleLength: cycle.minimum_cycle_length,
    maximumCycleLength: cycle.maximum_cycle_length,
    regularity: cycle.regularity,
    ovulationMethod: cycle.ovulation_method,
    knownOvulationDate: cycle.known_ovulation_date ?? "",
    lhSurgeDate: cycle.lh_surge_date ?? "",
    lhResult: cycle.lh_result ?? "",
    bodySignals: cycle.body_signals,
    dailyLogs: Object.fromEntries(cloud.dailyLogs.map((log) => [log.log_date, {
      note: log.note ?? "", symptoms: log.symptoms ?? "", bbt: log.bbt?.toString().replace(".", ",") ?? "",
      lhResult: log.lh_result ?? "", mucus: log.mucus ?? "", cervixPosition: log.cervix_position ?? "",
      sexMethods: log.sex_methods, exposureNote: log.exposure_note ?? "", stressLevel: log.stress_level ?? "",
      sleepQuality: log.sleep_quality ?? "", travelOrIllness: log.travel_or_illness,
    }])),
    exposureEntries: cloud.exposures.map((entry) => ({ id: entry.id, date: entry.exposure_date, methods: entry.methods, notes: entry.notes ?? "" })),
  });
}

function parseTemperature(value: string) {
  if (!value.trim()) return null;
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}
