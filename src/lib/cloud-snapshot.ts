import { createDefaultAppState, getCurrentPeriodEntry } from "@/lib/repositories/cycleRepository";
import type { AppState, CycleRegularity, PeriodEntry } from "@/types";
import type { Json } from "@/types/database";

export function stateToCloudSnapshot(state: AppState) {
  const current = getCurrentPeriodEntry(state);
  if (!current) return null;
  const average = state.preferences.defaultCycleLength;
  return {
    cycle: {
      periodStart: current.periodStartDate,
      averageCycleLength: average,
      minimumCycleLength: Math.max(15, average - 2),
      maximumCycleLength: Math.min(60, average + 2),
      regularity: state.preferences.cycleRegularity ?? "regular",
      ovulationMethod: "calendar" as const,
      knownOvulationDate: "",
      lhSurgeDate: "",
      lhResult: "" as const,
      bodySignals: {},
      isActive: true,
    },
    dailyLogs: [],
    exposures: [],
    sourceUpdatedAt: state.updatedAt || undefined,
  };
}

export interface CloudData {
  cycles: Array<{
    id: string;
    period_start: string;
    average_cycle_length: number;
    regularity: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    body_signals: Json;
  }>;
  dailyLogs: unknown[];
  exposures: unknown[];
}

export function cloudDataToAppState(cloud: CloudData): AppState {
  const ordered = [...cloud.cycles].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  const entries: PeriodEntry[] = ordered.map((cycle) => ({
    id: cycle.id,
    periodStartDate: cycle.period_start,
    source: "manual",
    createdAt: cycle.created_at,
    updatedAt: cycle.updated_at,
    notes: "",
  }));
  const active = ordered.find((cycle) => cycle.is_active) ?? ordered[0];
  const fallback = createDefaultAppState();
  return {
    ...fallback,
    updatedAt: active?.updated_at ?? new Date().toISOString(),
    preferences: {
      ...fallback.preferences,
      defaultCycleLength: active?.average_cycle_length ?? 28,
      cycleRegularity: normalizeRegularity(active?.regularity),
    },
    entries,
    currentEntryId: active?.id ?? entries[0]?.id ?? null,
  };
}

function normalizeRegularity(value: string | undefined): CycleRegularity {
  return value === "algo_variable" || value === "irregular" || value === "no_se" ? value : "regular";
}
