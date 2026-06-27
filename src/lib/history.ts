import { diffInDays, parseDate } from "@/lib/cycle";
import type { SimulationResult, VentanaFertilState } from "@/types";

export const HISTORY_KEY = "ventana-fertil:history:v1";

export interface CycleSnapshot {
  id: string;
  createdAt: string;
  cycleStartDate: string;
  averageLengthUsed: number;
  estimatedOvulationDay: number | null;
  fertileWindow: string;
  uncertaintyScore: number;
}

export interface CycleHistorySummary {
  count: number;
  averageUncertainty: number;
  averageLength: number;
  recent: CycleSnapshot[];
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
    // ignore
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

function isSnapshot(value: unknown): value is CycleSnapshot {
  return Boolean(value) && typeof value === "object" && typeof (value as CycleSnapshot).id === "string";
}

export function loadCycleHistory() {
  const raw = safeGetItem(HISTORY_KEY);
  if (!raw) return [] as CycleSnapshot[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isSnapshot) : [];
  } catch {
    return [];
  }
}

export function saveCycleSnapshot(state: VentanaFertilState, simulation: SimulationResult) {
  const ovulationDate = parseDate(simulation.ovulationDate);
  if (!state.lastPeriodStart || !ovulationDate || !simulation.fertileWindowStart || !simulation.fertileWindowEnd) return loadCycleHistory();

  const snapshot: CycleSnapshot = {
    id: `${state.lastPeriodStart}-${state.averageCycleLength}-${simulation.ovulationDate}`,
    createdAt: new Date().toISOString(),
    cycleStartDate: state.lastPeriodStart,
    averageLengthUsed: state.averageCycleLength,
    estimatedOvulationDay: diffInDays(ovulationDate, parseDate(state.lastPeriodStart) ?? ovulationDate) + 1,
    fertileWindow: `${simulation.fertileWindowStart} → ${simulation.fertileWindowEnd}`,
    uncertaintyScore: simulation.uncertaintyScore,
  };

  const history = loadCycleHistory();
  const next = history.filter((item) => item.id !== snapshot.id);
  next.unshift(snapshot);
  safeSetItem(HISTORY_KEY, JSON.stringify(next.slice(0, 20)));
  return next.slice(0, 20);
}

export function deleteCycleSnapshot(id: string) {
  const next = loadCycleHistory().filter((snapshot) => snapshot.id !== id);
  safeSetItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearCycleHistory() {
  safeRemoveItem(HISTORY_KEY);
}

export function summarizeCycleHistory(history: CycleSnapshot[]): CycleHistorySummary {
  const count = history.length;
  const recent = history.slice(0, 3);
  const validWindow = recent.length > 0 ? recent : history;
  const averageUncertainty = validWindow.length ? Math.round(validWindow.reduce((sum, item) => sum + item.uncertaintyScore, 0) / validWindow.length) : 0;
  const averageLength = validWindow.length ? Math.round(validWindow.reduce((sum, item) => sum + item.averageLengthUsed, 0) / validWindow.length) : 0;
  return { count, averageUncertainty, averageLength, recent };
}
