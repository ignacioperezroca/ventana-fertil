export const CHECKINS_KEY = "ventana-fertil:checkins:v1";

export type CheckinState = "bien" | "normal" | "sensible" | "cansada";
export type CheckinStress = "bajo" | "medio" | "alto";
export type CheckinSleep = "malo" | "normal" | "bueno";

export interface DailyCheckInRecord {
  date: string;
  state: CheckinState;
  stress: CheckinStress;
  sleep: CheckinSleep;
  note: string;
  mucus: string;
  bbt: string;
  lhResult: string;
  updatedAt: string;
}

export interface DailyCheckInMap {
  [date: string]: DailyCheckInRecord;
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

export function loadCheckins(): DailyCheckInMap {
  const raw = safeGetItem(CHECKINS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as DailyCheckInMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCheckin(record: DailyCheckInRecord) {
  const current = loadCheckins();
  const next = { ...current, [record.date]: record };
  safeSetItem(CHECKINS_KEY, JSON.stringify(next));
  return next;
}

export function deleteCheckin(date: string) {
  const current = loadCheckins();
  const next = { ...current };
  delete next[date];
  safeSetItem(CHECKINS_KEY, JSON.stringify(next));
  return next;
}

export function clearCheckins() {
  safeSetItem(CHECKINS_KEY, JSON.stringify({}));
}

export function getCheckin(date: string) {
  return loadCheckins()[date] ?? null;
}
