import { monthKey, parseDate, todayIsoDate } from "@/lib/cycle";
import type {
  BodySignals,
  DailyLog,
  ExposureEntry,
  ExposureMethod,
  LhResult,
  LoadedStoredState,
  StoredSnapshot,
  VentanaFertilState,
} from "@/types";

export const STORAGE_KEY = "ventana-fertil:v1";
export const DEMO_STORAGE_KEY = "ventana-fertil:v1:demo";
export const ACTIVE_MODE_KEY = "ventana-fertil:active-mode";
export const LEGACY_STORAGE_KEY = "fertile-window-simulator-state";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidTimestamp(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
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
    // localStorage may be unavailable or full. The UI handles this gracefully.
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
    isDemo: false,
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
  const log = isRecord(value) ? (value as Partial<DailyLog>) : {};
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
  const body = isRecord(value) ? (value as Partial<BodySignals>) : {};
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
  if (!isRecord(value)) return null;
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

function sanitizeBaseState(value: unknown): VentanaFertilState {
  const fallback = createDefaultState();
  const state = isRecord(value) ? (value as Partial<VentanaFertilState>) : {};

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
    isDemo: Boolean(state.isDemo),
    bodySignals: sanitizeBodySignals(state.bodySignals),
    exposureEntries: Array.isArray(state.exposureEntries)
      ? state.exposureEntries.map(sanitizeExposure).filter((entry): entry is ExposureEntry => Boolean(entry))
      : [],
    dailyLogs:
      state.dailyLogs && typeof state.dailyLogs === "object"
        ? Object.fromEntries(Object.entries(state.dailyLogs).map(([date, value]) => [date, sanitizeDailyLog(value)]))
        : {},
  };
}

export function sanitizeState(value: unknown) {
  return sanitizeBaseState(value);
}

function snapshotToState(snapshot: StoredSnapshot): VentanaFertilState {
  return sanitizeBaseState({
    ...createDefaultState(),
    isDemo: snapshot.isDemo,
    currentStep: snapshot.ui.currentStep,
    selectedDate: snapshot.ui.selectedDate,
    calendarMonth: snapshot.ui.calendarMonth,
    lastPeriodStart: snapshot.cycle.lastPeriodStart,
    averageCycleLength: snapshot.cycle.averageCycleLength,
    minimumCycleLength: snapshot.cycle.minimumCycleLength,
    maximumCycleLength: snapshot.cycle.maximumCycleLength,
    regularity: snapshot.cycle.regularity,
    ovulationMethod: snapshot.ovulation.mode,
    knownOvulationDate: snapshot.ovulation.knownOvulationDate,
    lhSurgeDate: snapshot.ovulation.lhSurgeDate,
    lhResult: snapshot.ovulation.lhResult,
    bodySignals: snapshot.signals,
    exposureEntries: snapshot.exposures,
    dailyLogs: snapshot.dailyLogs,
  });
}

function stateToSnapshot(state: VentanaFertilState, updatedAt = new Date().toISOString()): StoredSnapshot {
  const sanitized = sanitizeBaseState(state);
  return {
    version: 1,
    updatedAt,
    isDemo: sanitized.isDemo,
    cycle: {
      lastPeriodStart: sanitized.lastPeriodStart,
      averageCycleLength: sanitized.averageCycleLength,
      minimumCycleLength: sanitized.minimumCycleLength,
      maximumCycleLength: sanitized.maximumCycleLength,
      regularity: sanitized.regularity,
    },
    ovulation: {
      mode: sanitized.ovulationMethod,
      knownOvulationDate: sanitized.knownOvulationDate,
      lhSurgeDate: sanitized.lhSurgeDate,
      lhResult: sanitized.lhResult,
    },
    signals: sanitized.bodySignals,
    exposures: sanitized.exposureEntries,
    dailyLogs: sanitized.dailyLogs,
    ui: {
      currentStep: sanitized.currentStep,
      selectedDate: sanitized.selectedDate,
      calendarMonth: sanitized.calendarMonth,
      isDemo: sanitized.isDemo,
    },
  };
}

function snapshotFromPayload(value: unknown): { snapshot: StoredSnapshot; migratedFromLegacy: boolean } | null {
  if (!isRecord(value)) return null;

  if (value.version === 1 && isRecord(value.cycle) && isRecord(value.ovulation) && isRecord(value.ui)) {
    const snapshot: StoredSnapshot = {
      version: 1,
      updatedAt: isValidTimestamp(value.updatedAt) ? String(value.updatedAt) : new Date().toISOString(),
      isDemo: Boolean(value.isDemo),
      cycle: {
        lastPeriodStart: typeof value.cycle.lastPeriodStart === "string" ? value.cycle.lastPeriodStart : "",
        averageCycleLength: typeof value.cycle.averageCycleLength === "number" ? value.cycle.averageCycleLength : 28,
        minimumCycleLength: typeof value.cycle.minimumCycleLength === "number" ? value.cycle.minimumCycleLength : 26,
        maximumCycleLength: typeof value.cycle.maximumCycleLength === "number" ? value.cycle.maximumCycleLength : 30,
        regularity:
          value.cycle.regularity === "regular" ||
          value.cycle.regularity === "algo_variable" ||
          value.cycle.regularity === "irregular" ||
          value.cycle.regularity === "no_se"
            ? value.cycle.regularity
            : "regular",
      },
      ovulation: {
        mode:
          value.ovulation.mode === "calendar" ||
          value.ovulation.mode === "known" ||
          value.ovulation.mode === "lh" ||
          value.ovulation.mode === "unsure"
            ? value.ovulation.mode
            : "calendar",
        knownOvulationDate: typeof value.ovulation.knownOvulationDate === "string" ? value.ovulation.knownOvulationDate : "",
        lhSurgeDate: typeof value.ovulation.lhSurgeDate === "string" ? value.ovulation.lhSurgeDate : "",
        lhResult: typeof value.ovulation.lhResult === "string" && LH_RESULTS.has(value.ovulation.lhResult as LhResult) ? (value.ovulation.lhResult as LhResult) : "",
      },
      signals: sanitizeBodySignals(value.signals),
      exposures: Array.isArray(value.exposures) ? value.exposures.map(sanitizeExposure).filter((entry): entry is ExposureEntry => Boolean(entry)) : [],
      dailyLogs:
        value.dailyLogs && typeof value.dailyLogs === "object"
          ? Object.fromEntries(Object.entries(value.dailyLogs).map(([date, entry]) => [date, sanitizeDailyLog(entry)]))
          : {},
      ui: {
        currentStep: typeof value.ui.currentStep === "number" ? value.ui.currentStep : 1,
        selectedDate: typeof value.ui.selectedDate === "string" ? value.ui.selectedDate : todayIsoDate(),
        calendarMonth: typeof value.ui.calendarMonth === "string" ? value.ui.calendarMonth : monthKey(parseDate(todayIsoDate()) ?? new Date()),
        isDemo: Boolean(value.ui.isDemo),
      },
    };
    return { snapshot, migratedFromLegacy: false };
  }

  if ("state" in value || "bodySignals" in value || "exposureEntries" in value || "currentStep" in value) {
    const rawState = ("state" in value ? (value.state as unknown) : value) as VentanaFertilState;
    const snapshot = stateToSnapshot(rawState);
    return { snapshot, migratedFromLegacy: true };
  }

  return null;
}

function persistSnapshot(snapshot: StoredSnapshot, key: string = STORAGE_KEY) {
  if (typeof window === "undefined") return;
  safeSetItem(key, JSON.stringify(snapshot));
}

export function loadStoredState(): LoadedStoredState | null {
  if (typeof window === "undefined") return null;

  const activeMode = safeGetItem(ACTIVE_MODE_KEY);
  const preferredKey = activeMode === "demo" ? DEMO_STORAGE_KEY : STORAGE_KEY;
  const currentRaw = safeGetItem(preferredKey) ?? safeGetItem(activeMode === "demo" ? STORAGE_KEY : DEMO_STORAGE_KEY);
  if (currentRaw) {
    try {
      const parsed = JSON.parse(currentRaw) as unknown;
      const normalized = snapshotFromPayload(parsed);
      if (normalized) {
        return {
          state: {
            ...snapshotToState(normalized.snapshot),
            isDemo: preferredKey === DEMO_STORAGE_KEY || normalized.snapshot.isDemo,
          },
          updatedAt: normalized.snapshot.updatedAt,
          migratedFromLegacy: normalized.migratedFromLegacy,
        };
      }
    } catch {
      // Fall through to legacy migration.
    }
  }

  const legacyRaw = safeGetItem(LEGACY_STORAGE_KEY);
  if (!legacyRaw) return null;

  try {
    const parsed = JSON.parse(legacyRaw) as unknown;
    const normalized = snapshotFromPayload(parsed);
    if (!normalized) return null;
    persistSnapshot(normalized.snapshot, normalized.snapshot.isDemo ? DEMO_STORAGE_KEY : STORAGE_KEY);
    safeRemoveItem(LEGACY_STORAGE_KEY);
    return {
      state: {
        ...snapshotToState(normalized.snapshot),
        isDemo: normalized.snapshot.isDemo,
      },
      updatedAt: normalized.snapshot.updatedAt,
      migratedFromLegacy: true,
    };
  } catch {
    return null;
  }
}

export function loadRealStoredState(): LoadedStoredState | null {
  if (typeof window === "undefined") return null;
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const normalized = snapshotFromPayload(parsed);
    if (!normalized) return null;
    return {
      state: {
        ...snapshotToState(normalized.snapshot),
        isDemo: false,
      },
      updatedAt: normalized.snapshot.updatedAt,
      migratedFromLegacy: normalized.migratedFromLegacy,
    };
  } catch {
    return null;
  }
}

export function loadDemoStoredState(): LoadedStoredState | null {
  if (typeof window === "undefined") return null;
  const raw = safeGetItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const normalized = snapshotFromPayload(parsed);
    if (!normalized) return null;
    return {
      state: {
        ...snapshotToState(normalized.snapshot),
        isDemo: true,
      },
      updatedAt: normalized.snapshot.updatedAt,
      migratedFromLegacy: normalized.migratedFromLegacy,
    };
  } catch {
    return null;
  }
}

export function saveStoredState(state: VentanaFertilState) {
  if (typeof window === "undefined") return { updatedAt: new Date().toISOString() };
  const snapshot = stateToSnapshot(state);
  const key = snapshot.isDemo ? DEMO_STORAGE_KEY : STORAGE_KEY;
  persistSnapshot(snapshot, key);
  safeSetItem(ACTIVE_MODE_KEY, snapshot.isDemo ? "demo" : "real");
  return { updatedAt: snapshot.updatedAt };
}

export function clearStoredState() {
  if (typeof window === "undefined") return;
  safeRemoveItem(STORAGE_KEY);
  safeRemoveItem(DEMO_STORAGE_KEY);
  safeRemoveItem(ACTIVE_MODE_KEY);
  safeRemoveItem(LEGACY_STORAGE_KEY);
}

export function clearDemoStoredState() {
  if (typeof window === "undefined") return;
  safeRemoveItem(DEMO_STORAGE_KEY);
  if (safeGetItem(ACTIVE_MODE_KEY) === "demo") {
    safeSetItem(ACTIVE_MODE_KEY, "real");
  }
}

export function exportStoredState(state: VentanaFertilState) {
  const snapshot = stateToSnapshot(state);
  return JSON.stringify(snapshot, null, 2);
}

export function importStoredState(payload: string): LoadedStoredState {
  const parsed = JSON.parse(payload) as unknown;
  const normalized = snapshotFromPayload(parsed);
  if (!normalized) {
    throw new Error("El archivo no tiene un formato válido.");
  }
  return {
    state: snapshotToState(normalized.snapshot),
    updatedAt: normalized.snapshot.updatedAt,
    migratedFromLegacy: normalized.migratedFromLegacy,
  };
}

export function buildSnapshotFromState(state: VentanaFertilState, updatedAt = new Date().toISOString()) {
  return stateToSnapshot(state, updatedAt);
}
