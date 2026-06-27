import { loadStoredState } from "@/lib/storage";
import { parseDate } from "@/lib/cycle";
import {
  createDefaultAppState,
  patchPeriodEntry,
  dedupePeriodEntries,
  sortPeriodEntries,
  upsertPeriodEntry,
  type CycleRepository,
} from "@/lib/repositories/cycleRepository";
import { sanitizeImportedState, safeParseJson, validateAppState } from "@/lib/validation";
import type { AppPreferences, AppState, AppStateWarning, PeriodEntry } from "@/types";

export const CYCLE_STORAGE_KEY = "ventana-fertil:v2";
export const LEGACY_SIMPLE_STORAGE_KEY = "ventana-fertil:v1";

type LocalStorageWarning = AppStateWarning;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / private mode errors
  }
}

function safeRemoveItem(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function sanitizePreferences(value: unknown): AppPreferences {
  const fallback = createDefaultAppState().preferences;
  if (!isRecord(value)) return fallback;
  return {
    defaultCycleLength:
      typeof value.defaultCycleLength === "number" && value.defaultCycleLength >= 21 && value.defaultCycleLength <= 45
        ? value.defaultCycleLength
        : fallback.defaultCycleLength,
    showPercentages: typeof value.showPercentages === "boolean" ? value.showPercentages : fallback.showPercentages,
    reducedMotion: typeof value.reducedMotion === "boolean" ? value.reducedMotion : undefined,
    cycleRegularity: (
      value.cycleRegularity === "regular" ||
      value.cycleRegularity === "algo_variable" ||
      value.cycleRegularity === "irregular" ||
      value.cycleRegularity === "no_se"
        ? value.cycleRegularity
        : undefined
    ) as AppPreferences["cycleRegularity"],
  };
}

function sanitizeEntry(value: unknown): PeriodEntry | null {
  const state = sanitizeImportedState({
    version: 2,
    updatedAt: new Date().toISOString(),
    preferences: createDefaultAppState().preferences,
    entries: [value],
    currentEntryId: null,
  });
  return state?.entries[0] ?? null;
}

function readV2State(): { state: AppState | null; warnings: LocalStorageWarning[] } {
  const raw = safeGetItem(CYCLE_STORAGE_KEY);
  if (!raw) return { state: null, warnings: [] };

  const parsed = safeParseJson(raw);
  if (!parsed.ok) {
    return {
      state: null,
      warnings: [{ code: "corrupt-storage", message: "Se detectaron datos locales dañados y se ignoraron." }],
    };
  }

  const sanitized = sanitizeImportedState(parsed.value);
  if (!sanitized) {
    return {
      state: null,
      warnings: [{ code: "corrupt-storage", message: "Se detectaron datos locales dañados y se ignoraron." }],
    };
  }

  return { state: sanitized, warnings: [] };
}

function readLegacyV1State(): { state: AppState | null; warnings: LocalStorageWarning[] } {
  const raw = safeGetItem(LEGACY_SIMPLE_STORAGE_KEY);
  if (!raw) return { state: null, warnings: [] };

  const parsed = safeParseJson(raw);
  if (!parsed.ok) return { state: null, warnings: [] };
  const sanitized = sanitizeImportedState(parsed.value);
  if (!sanitized) return { state: null, warnings: [] };

  return {
    state: sanitized,
    warnings: [{ code: "legacy-migration", message: "Se migraron datos antiguos al nuevo formato local." }],
  };
}

function readLegacyFullState(): { state: AppState | null; warnings: LocalStorageWarning[] } {
  const legacy = loadStoredState();
  if (!legacy) return { state: null, warnings: [] };

  const periodStartDate = legacy.state.lastPeriodStart;
  if (!parseDate(periodStartDate)) return { state: null, warnings: [] };

  const entry = sanitizeEntry({
    id: `entry-${periodStartDate}`,
    periodStartDate,
    source: legacy.state.isDemo ? "demo" : "manual",
    createdAt: legacy.updatedAt,
    updatedAt: legacy.updatedAt,
    notes: "",
  });

  if (!entry) return { state: null, warnings: [] };

  return {
    state: {
      version: 2,
      updatedAt: legacy.updatedAt,
      preferences: {
        defaultCycleLength: legacy.state.averageCycleLength,
        showPercentages: true,
        reducedMotion: undefined,
      },
      entries: [entry],
      currentEntryId: entry.id,
    },
    warnings: [{ code: "legacy-migration", message: "Se migraron datos antiguos al nuevo formato local." }],
  };
}

function readStateWithMeta(): { state: AppState; warnings: LocalStorageWarning[] } {
  const v2 = readV2State();
  if (v2.state) return { state: v2.state, warnings: v2.warnings };

  const v1 = readLegacyV1State();
  if (v1.state) {
    return {
      state: v1.state,
      warnings: [...v2.warnings, ...v1.warnings],
    };
  }

  const full = readLegacyFullState();
  if (full.state) {
    return {
      state: full.state,
      warnings: [...v2.warnings, ...v1.warnings, ...full.warnings],
    };
  }

  return {
    state: createDefaultAppState(),
    warnings: [...v2.warnings, ...v1.warnings, ...full.warnings],
  };
}

function persistState(state: AppState) {
  const validation = validateAppState(state);
  if (!validation.valid) {
    throw new Error(validation.issues[0] ?? "El estado no es válido.");
  }

  safeSetItem(CYCLE_STORAGE_KEY, JSON.stringify(state));
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("ventana-fertil:local-state-saved"));
  }
}

function normalizeIncomingState(state: AppState): AppState {
  const current = createDefaultAppState();
  const entries = sortPeriodEntries(
    dedupePeriodEntries(
      (Array.isArray(state.entries) ? state.entries : [])
        .map((entry) => sanitizeEntry(entry))
        .filter((entry): entry is PeriodEntry => Boolean(entry)),
    ),
  );
  const currentEntryId = state.currentEntryId && entries.some((entry) => entry.id === state.currentEntryId) ? state.currentEntryId : entries[0]?.id ?? null;
  return {
    version: 2,
    updatedAt: state.updatedAt && !Number.isNaN(Date.parse(state.updatedAt)) ? state.updatedAt : new Date().toISOString(),
    preferences: sanitizePreferences(state.preferences) ?? current.preferences,
    entries,
    currentEntryId,
  };
}

export async function readCycleRepositoryState() {
  return readStateWithMeta();
}

export function readCycleRepositoryStateSync() {
  return readStateWithMeta();
}

export function writeCycleRepositoryStateSync(state: AppState) {
  const normalized = normalizeIncomingState(state);
  persistState(normalized);
  return normalized;
}

export function clearCycleRepositoryStateSync() {
  safeRemoveItem(CYCLE_STORAGE_KEY);
  safeRemoveItem(LEGACY_SIMPLE_STORAGE_KEY);
  safeRemoveItem("fertile-window-simulator-state");
}

export function createLocalStorageCycleRepository(): CycleRepository {
  return {
    async getState() {
      return readStateWithMeta().state;
    },
    async saveState(state) {
      persistState(normalizeIncomingState(state));
    },
    async addPeriodEntry(entry) {
      const current = readStateWithMeta().state;
      const normalized = sanitizeEntry(entry);
      if (!normalized) return current;
      const next = upsertPeriodEntry(current, normalized);
      persistState(next);
      return next;
    },
    async updatePeriodEntry(id, patch) {
      const current = readStateWithMeta().state;
      const existing = current.entries.find((entry) => entry.id === id);
      if (!existing) return current;
      const nextEntry = patchPeriodEntry(existing, patch);
      const next = {
        ...current,
        updatedAt: nextEntry.updatedAt,
        entries: sortPeriodEntries([nextEntry, ...current.entries.filter((entry) => entry.id !== id)]),
        currentEntryId: current.currentEntryId === id ? id : current.currentEntryId,
      } satisfies AppState;
      persistState(next);
      return next;
    },
    async deletePeriodEntry(id) {
      const current = readStateWithMeta().state;
      const nextEntries = current.entries.filter((entry) => entry.id !== id);
      const next = {
        ...current,
        updatedAt: new Date().toISOString(),
        entries: nextEntries,
        currentEntryId: current.currentEntryId === id ? nextEntries[0]?.id ?? null : current.currentEntryId,
      } satisfies AppState;
      persistState(next);
      return next;
    },
    async setCurrentEntry(id) {
      const current = readStateWithMeta().state;
      if (!current.entries.some((entry) => entry.id === id)) return current;
      const next = {
        ...current,
        updatedAt: new Date().toISOString(),
        currentEntryId: id,
      } satisfies AppState;
      persistState(next);
      return next;
    },
    async exportState() {
      return readStateWithMeta().state;
    },
    async importState(state) {
      const sanitized = normalizeIncomingState(state);
      persistState(sanitized);
      return sanitized;
    },
    async clearState() {
      safeRemoveItem(CYCLE_STORAGE_KEY);
      safeRemoveItem(LEGACY_SIMPLE_STORAGE_KEY);
      safeRemoveItem("fertile-window-simulator-state");
    },
  };
}
