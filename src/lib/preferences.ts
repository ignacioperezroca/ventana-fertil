import { getRiskLabel, formatPercent } from "@/lib/cycle";

export const PREFERENCES_KEY = "ventana-fertil:preferences:v1";

export interface UserPreferences {
  lowAnxietyMode: boolean;
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
    // Ignore storage failures; UI continues with in-memory state.
  }
}

export function createDefaultPreferences(): UserPreferences {
  return { lowAnxietyMode: false };
}

export function loadPreferences(): UserPreferences {
  const fallback = createDefaultPreferences();
  const raw = safeGetItem(PREFERENCES_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      lowAnxietyMode: typeof parsed.lowAnxietyMode === "boolean" ? parsed.lowAnxietyMode : fallback.lowAnxietyMode,
    };
  } catch {
    return fallback;
  }
}

export function savePreferences(preferences: UserPreferences) {
  safeSetItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function formatMarkerValue(percent: number, lowAnxietyMode: boolean) {
  return lowAnxietyMode ? `Marcador ${getRiskLabel(percent).toLowerCase()}` : formatPercent(percent);
}

export function getMarkerCategoryLabel(percent: number) {
  return `Marcador ${getRiskLabel(percent).toLowerCase()}`;
}
