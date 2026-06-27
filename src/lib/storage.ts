import { monthKey, parseDate, todayIsoDate } from "@/lib/cycle";
import type {
  BodySignals,
  DailyLog,
  ExposureEntry,
  ExposureMethod,
  LhResult,
  StoredSnapshot,
  VentanaFertilState,
} from "@/types";

export const STORAGE_KEY = "ventana-fertil:v1";

const EXPOSE_METHODS = new Set<ExposureMethod>([
  "sin_proteccion",
  "retiro",
  "espermicida",
  "preservativo",
  "anticoncepcion_emergencia",
  "otro",
]);

const LH_RESULTS = new Set<LhResult>(["low", "high", "peak"]);
const SIGNAL_LEVELS = new Set<BodySignals["stressLevel"]>(["low", "medium", "high"]);
const MUCUS = new Set<BodySignals["cervicalMucus"]>(["dry", "sticky", "creamy", "watery", "egg_white"]);
const CERVIX = new Set<BodySignals["cervixPosition"]>(["low", "medium", "high"]);

export function createDefaultBodySignals(): BodySignals {
  return {
    basalBodyTemperature: "",
    cervicalMucus: "",
    cervixPosition: "",
    stressLevel: "",
    sleepQuality: "",
    travelOrIllness: false,
    restingHeartRate: "",
    wristTemperatureTrend: "",
    hormoneLh: "",
    hormoneEstrogen: "",
    hormoneProgesterone: "",
    hormoneFsh: "",
    notes: "",
  };
}

export function createDefaultDailyLog(): DailyLog {
  return {
    note: "",
    symptoms: "",
    bbt: "",
    lhResult: "",
    mucus: "",
    cervixPosition: "",
    sexMethods: [],
    exposureNote: "",
    stressLevel: "",
    sleepQuality: "",
    travelOrIllness: false,
  };
}

export function createDefaultState(): VentanaFertilState {
  const today = todayIsoDate();
  return {
    currentStep: 1,
    selectedDate: today,
    calendarMonth: monthKey(parseDate(today) ?? new Date()),
    lastPeriodStart: "",
    averageCycleLength: 28,
    minimumCycleLength: 26,
    maximumCycleLength: 30,
    regularity: "regular",
    ovulationMethod: "calendar",
    knownOvulationDate: "",
    lhSurgeDate: "",
    lhResult: "",
    bodySignals: createDefaultBodySignals(),
    exposureEntries: [],
    dailyLogs: {},
  };
}

export function sanitizeDailyLog(value: unknown): DailyLog {
  const fallback = createDefaultDailyLog();
  const log = value && typeof value === "object" ? (value as Partial<DailyLog>) : {};
  return {
    note: typeof log.note === "string" ? log.note : fallback.note,
    symptoms: typeof log.symptoms === "string" ? log.symptoms : fallback.symptoms,
    bbt: typeof log.bbt === "string" ? log.bbt : fallback.bbt,
    lhResult: typeof log.lhResult === "string" && LH_RESULTS.has(log.lhResult as LhResult) ? (log.lhResult as LhResult) : "",
    mucus: typeof log.mucus === "string" && MUCUS.has(log.mucus as BodySignals["cervicalMucus"]) ? (log.mucus as BodySignals["cervicalMucus"]) : "",
    cervixPosition:
      typeof log.cervixPosition === "string" && CERVIX.has(log.cervixPosition as BodySignals["cervixPosition"])
        ? (log.cervixPosition as BodySignals["cervixPosition"])
        : "",
    sexMethods: Array.isArray(log.sexMethods)
      ? log.sexMethods.filter((method): method is ExposureMethod => typeof method === "string" && EXPOSE_METHODS.has(method as ExposureMethod))
      : [],
    exposureNote: typeof log.exposureNote === "string" ? log.exposureNote : fallback.exposureNote,
    stressLevel:
      typeof log.stressLevel === "string" && SIGNAL_LEVELS.has(log.stressLevel as BodySignals["stressLevel"])
        ? (log.stressLevel as BodySignals["stressLevel"])
        : "",
    sleepQuality:
      typeof log.sleepQuality === "string" && SIGNAL_LEVELS.has(log.sleepQuality as BodySignals["sleepQuality"])
        ? (log.sleepQuality as BodySignals["sleepQuality"])
        : "",
    travelOrIllness: Boolean(log.travelOrIllness),
  };
}

function sanitizeBodySignals(value: unknown): BodySignals {
  const fallback = createDefaultBodySignals();
  const body = value && typeof value === "object" ? (value as Partial<BodySignals>) : {};
  return {
    basalBodyTemperature: typeof body.basalBodyTemperature === "string" ? body.basalBodyTemperature : fallback.basalBodyTemperature,
    cervicalMucus:
      typeof body.cervicalMucus === "string" && MUCUS.has(body.cervicalMucus as BodySignals["cervicalMucus"])
        ? (body.cervicalMucus as BodySignals["cervicalMucus"])
        : "",
    cervixPosition:
      typeof body.cervixPosition === "string" && CERVIX.has(body.cervixPosition as BodySignals["cervixPosition"])
        ? (body.cervixPosition as BodySignals["cervixPosition"])
        : "",
    stressLevel:
      typeof body.stressLevel === "string" && SIGNAL_LEVELS.has(body.stressLevel as BodySignals["stressLevel"])
        ? (body.stressLevel as BodySignals["stressLevel"])
        : "",
    sleepQuality:
      typeof body.sleepQuality === "string" && SIGNAL_LEVELS.has(body.sleepQuality as BodySignals["sleepQuality"])
        ? (body.sleepQuality as BodySignals["sleepQuality"])
        : "",
    travelOrIllness: Boolean(body.travelOrIllness),
    restingHeartRate: typeof body.restingHeartRate === "string" ? body.restingHeartRate : fallback.restingHeartRate,
    wristTemperatureTrend: typeof body.wristTemperatureTrend === "string" ? body.wristTemperatureTrend : fallback.wristTemperatureTrend,
    hormoneLh: typeof body.hormoneLh === "string" ? body.hormoneLh : fallback.hormoneLh,
    hormoneEstrogen: typeof body.hormoneEstrogen === "string" ? body.hormoneEstrogen : fallback.hormoneEstrogen,
    hormoneProgesterone: typeof body.hormoneProgesterone === "string" ? body.hormoneProgesterone : fallback.hormoneProgesterone,
    hormoneFsh: typeof body.hormoneFsh === "string" ? body.hormoneFsh : fallback.hormoneFsh,
    notes: typeof body.notes === "string" ? body.notes : fallback.notes,
  };
}

function sanitizeExposure(value: unknown): ExposureEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as Partial<ExposureEntry>;
  if (typeof entry.id !== "string" || typeof entry.date !== "string") return null;
  const date = parseDate(entry.date);
  if (!date) return null;
  return {
    id: entry.id,
    date: entry.date,
    methods: Array.isArray(entry.methods)
      ? entry.methods.filter((method): method is ExposureMethod => typeof method === "string" && EXPOSE_METHODS.has(method as ExposureMethod))
      : [],
    notes: typeof entry.notes === "string" ? entry.notes : "",
  };
}

export function sanitizeState(value: unknown): VentanaFertilState {
  const fallback = createDefaultState();
  const state = value && typeof value === "object" ? (value as Partial<VentanaFertilState>) : {};

  return {
    currentStep: typeof state.currentStep === "number" && state.currentStep >= 1 && state.currentStep <= 5 ? state.currentStep : fallback.currentStep,
    selectedDate: typeof state.selectedDate === "string" && parseDate(state.selectedDate) ? state.selectedDate : fallback.selectedDate,
    calendarMonth: typeof state.calendarMonth === "string" && parseDate(state.calendarMonth) ? state.calendarMonth : fallback.calendarMonth,
    lastPeriodStart: typeof state.lastPeriodStart === "string" && (state.lastPeriodStart === "" || parseDate(state.lastPeriodStart)) ? state.lastPeriodStart : fallback.lastPeriodStart,
    averageCycleLength:
      typeof state.averageCycleLength === "number" && Number.isFinite(state.averageCycleLength)
        ? state.averageCycleLength
        : fallback.averageCycleLength,
    minimumCycleLength:
      typeof state.minimumCycleLength === "number" && Number.isFinite(state.minimumCycleLength)
        ? state.minimumCycleLength
        : fallback.minimumCycleLength,
    maximumCycleLength:
      typeof state.maximumCycleLength === "number" && Number.isFinite(state.maximumCycleLength)
        ? state.maximumCycleLength
        : fallback.maximumCycleLength,
    regularity:
      state.regularity === "regular" ||
      state.regularity === "algo_variable" ||
      state.regularity === "irregular" ||
      state.regularity === "no_se"
        ? state.regularity
        : fallback.regularity,
    ovulationMethod:
      state.ovulationMethod === "calendar" ||
      state.ovulationMethod === "known" ||
      state.ovulationMethod === "lh" ||
      state.ovulationMethod === "unsure"
        ? state.ovulationMethod
        : fallback.ovulationMethod,
    knownOvulationDate:
      typeof state.knownOvulationDate === "string" && (state.knownOvulationDate === "" || parseDate(state.knownOvulationDate))
        ? state.knownOvulationDate
        : fallback.knownOvulationDate,
    lhSurgeDate:
      typeof state.lhSurgeDate === "string" && (state.lhSurgeDate === "" || parseDate(state.lhSurgeDate))
        ? state.lhSurgeDate
        : fallback.lhSurgeDate,
    lhResult:
      typeof state.lhResult === "string" && LH_RESULTS.has(state.lhResult as LhResult) ? (state.lhResult as LhResult) : "",
    bodySignals: sanitizeBodySignals(state.bodySignals),
    exposureEntries: Array.isArray(state.exposureEntries)
      ? state.exposureEntries.map(sanitizeExposure).filter((entry): entry is ExposureEntry => Boolean(entry))
      : [],
    dailyLogs:
      state.dailyLogs && typeof state.dailyLogs === "object"
        ? Object.fromEntries(
            Object.entries(state.dailyLogs).map(([date, value]) => [date, sanitizeDailyLog(value)]),
          )
        : {},
  };
}

export function loadStoredState(): VentanaFertilState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSnapshot;
    if (!parsed || parsed.version !== 1 || !parsed.state) return null;
    return sanitizeState(parsed.state);
  } catch {
    return null;
  }
}

export function saveStoredState(state: VentanaFertilState) {
  if (typeof window === "undefined") return;
  const snapshot: StoredSnapshot = {
    version: 1,
    updatedAt: new Date().toISOString(),
    state: sanitizeState(state),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("ventana-fertil:local-state-saved"));
}

export function clearStoredState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportStoredState(state: VentanaFertilState) {
  const snapshot: StoredSnapshot = {
    version: 1,
    updatedAt: new Date().toISOString(),
    state: sanitizeState(state),
  };
  return JSON.stringify(snapshot, null, 2);
}

export function importStoredState(payload: string) {
  const parsed = JSON.parse(payload) as StoredSnapshot;
  if (!parsed || parsed.version !== 1 || !parsed.state) {
    throw new Error("El archivo no tiene un formato válido.");
  }
  return sanitizeState(parsed.state);
}
