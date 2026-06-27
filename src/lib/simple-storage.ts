import { addDays, formatDateInput } from "@/lib/cycle";
import { createDefaultAppState, getCurrentPeriodEntry } from "@/lib/repositories/cycleRepository";
import {
  clearCycleRepositoryStateSync,
  CYCLE_STORAGE_KEY,
  readCycleRepositoryStateSync,
  createLocalStorageCycleRepository,
  writeCycleRepositoryStateSync,
} from "@/lib/repositories/localStorageCycleRepository";
import type { AppPreferences, AppState, PeriodEntry } from "@/types";

export type SimpleRegularity = "regular" | "algo_variable" | "irregular";

export interface SimpleCoreState {
  version: 1;
  updatedAt: string;
  lastPeriodStart: string;
  averageCycleLength: number;
  regularity: SimpleRegularity;
  isDemo: boolean;
}

export interface SimpleLoadResult {
  state: SimpleCoreState | null;
  updatedAt: string | null;
  migratedFromLegacy: boolean;
  entryCount: number;
  warnings: string[];
}

export const SIMPLE_STORAGE_KEY = CYCLE_STORAGE_KEY;

function mapRegularity(value: AppPreferences["cycleRegularity"]): SimpleRegularity {
  if (value === "algo_variable" || value === "irregular") return value;
  return "regular";
}

function mapAppStateToSimple(state: AppState): SimpleCoreState | null {
  const current = getCurrentPeriodEntry(state);
  if (!current || !current.periodStartDate) return null;

  return {
    version: 1,
    updatedAt: state.updatedAt,
    lastPeriodStart: current.periodStartDate,
    averageCycleLength: state.preferences.defaultCycleLength,
    regularity: mapRegularity(state.preferences.cycleRegularity),
    isDemo: current.source === "demo",
  };
}

function mapSimpleToAppState(simple: SimpleCoreState) {
  const currentTimestamp = simple.updatedAt || new Date().toISOString();
  const currentState = readCycleRepositoryStateSync().state ?? createDefaultAppState();
  const hasValidStart = Boolean(simple.lastPeriodStart && !Number.isNaN(Date.parse(simple.lastPeriodStart)));
  const currentEntry = getCurrentPeriodEntry(currentState);

  const nextEntries = hasValidStart
    ? (() => {
        const entry: PeriodEntry = {
          id: currentEntry?.id ?? `entry-${simple.lastPeriodStart}`,
          periodStartDate: simple.lastPeriodStart,
          source: simple.isDemo ? "demo" : currentEntry?.source ?? "manual",
          createdAt: currentEntry?.createdAt ?? currentTimestamp,
          updatedAt: currentTimestamp,
          notes: currentEntry?.notes ?? "",
        };

        const filtered = currentState.entries.filter((item) => item.id !== entry.id);
        filtered.unshift(entry);
        return filtered;
      })()
    : currentState.entries;

  return {
    version: 2 as const,
    updatedAt: currentTimestamp,
    preferences: {
      ...currentState.preferences,
      defaultCycleLength: simple.averageCycleLength,
      cycleRegularity: simple.regularity,
    },
    entries: nextEntries,
    currentEntryId: hasValidStart ? currentEntry?.id ?? `entry-${simple.lastPeriodStart}` : currentState.currentEntryId,
  };
}

export function createDefaultSimpleState(): SimpleCoreState {
  return {
    version: 1,
    updatedAt: "",
    lastPeriodStart: "",
    averageCycleLength: 28,
    regularity: "regular",
    isDemo: false,
  };
}

export function createDemoSimpleState(): SimpleCoreState {
  const today = new Date();
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    lastPeriodStart: formatDateInput(addDays(today, -13)),
    averageCycleLength: 28,
    regularity: "regular",
    isDemo: true,
  };
}

export function loadSimpleStateWithMeta(): SimpleLoadResult {
  if (typeof window === "undefined") {
    return { state: null, updatedAt: null, migratedFromLegacy: false, entryCount: 0, warnings: [] };
  }

  const result = readCycleRepositoryStateSync();
  const simple = mapAppStateToSimple(result.state);

  return {
    state: simple,
    updatedAt: simple?.updatedAt ?? null,
    migratedFromLegacy: result.warnings.some((warning) => warning.code === "legacy-migration"),
    entryCount: result.state.entries.length,
    warnings: result.warnings.map((warning) => warning.message),
  };
}

export function loadSimpleState() {
  return loadSimpleStateWithMeta().state;
}

export function saveSimpleState(state: SimpleCoreState) {
  if (typeof window === "undefined") return state;
  const payload = {
    ...state,
    updatedAt: state.updatedAt || new Date().toISOString(),
  };
  const appState = mapSimpleToAppState(payload);
  const saved = writeCycleRepositoryStateSync(appState);
  return {
    version: 1 as const,
    updatedAt: saved.updatedAt,
    lastPeriodStart: payload.lastPeriodStart,
    averageCycleLength: payload.averageCycleLength,
    regularity: payload.regularity,
    isDemo: payload.isDemo,
  };
}

export function clearSimpleState() {
  if (typeof window === "undefined") return;
  clearCycleRepositoryStateSync();
}

export function buildDemoIfMissing() {
  return createDemoSimpleState();
}

export function hasSimpleState() {
  if (typeof window === "undefined") return false;
  const result = readCycleRepositoryStateSync();
  return Boolean(mapAppStateToSimple(result.state));
}

export function createStateStamp() {
  return new Date().toISOString();
}

export function getSimpleRepository() {
  return createLocalStorageCycleRepository();
}
