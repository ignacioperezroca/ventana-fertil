import type { AppState, PeriodEntry, PeriodEntrySource } from "@/types";

export interface CycleRepository {
  getState(): Promise<AppState>;
  saveState(state: AppState): Promise<void>;
  addPeriodEntry(entry: PeriodEntry): Promise<AppState>;
  updatePeriodEntry(id: string, patch: Partial<PeriodEntry>): Promise<AppState>;
  deletePeriodEntry(id: string): Promise<AppState>;
  setCurrentEntry(id: string): Promise<AppState>;
  exportState(): Promise<AppState>;
  importState(state: AppState): Promise<AppState>;
  clearState(): Promise<void>;
}

export function createDefaultAppState(): AppState {
  return {
    version: 2,
    updatedAt: "",
    preferences: {
      defaultCycleLength: 28,
      showPercentages: true,
      reducedMotion: undefined,
    },
    entries: [],
    currentEntryId: null,
  };
}

export function createDefaultPeriodEntry(source: PeriodEntrySource = "manual"): PeriodEntry {
  const timestamp = new Date().toISOString();
  return {
    id: `entry-${timestamp}`,
    periodStartDate: "",
    source,
    createdAt: timestamp,
    updatedAt: timestamp,
    notes: "",
  };
}

export function sortPeriodEntries(entries: PeriodEntry[]) {
  return [...entries].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt || left.createdAt || "");
    const rightTime = Date.parse(right.updatedAt || right.createdAt || "");
    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return left.id.localeCompare(right.id);
    if (Number.isNaN(leftTime)) return 1;
    if (Number.isNaN(rightTime)) return -1;
    return rightTime - leftTime;
  });
}

export function dedupePeriodEntries(entries: PeriodEntry[]) {
  const seen = new Set<string>();
  const deduped: PeriodEntry[] = [];
  for (const entry of entries) {
    if (seen.has(entry.periodStartDate)) continue;
    seen.add(entry.periodStartDate);
    deduped.push(entry);
  }
  return deduped;
}

export function getCurrentPeriodEntry(state: AppState) {
  return state.entries.find((entry) => entry.id === state.currentEntryId) ?? state.entries[0] ?? null;
}

export function upsertPeriodEntry(state: AppState, entry: PeriodEntry) {
  const nextEntries = sortPeriodEntries(
    dedupePeriodEntries([entry, ...state.entries.filter((existing) => existing.id !== entry.id)]),
  );
  return {
    ...state,
    updatedAt: entry.updatedAt || new Date().toISOString(),
    entries: nextEntries,
    currentEntryId: entry.id,
  } satisfies AppState;
}

export function patchPeriodEntry(entry: PeriodEntry, patch: Partial<PeriodEntry>) {
  return {
    ...entry,
    ...patch,
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: patch.updatedAt ?? new Date().toISOString(),
  } satisfies PeriodEntry;
}
