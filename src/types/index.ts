export type CycleRegularity = "regular" | "algo_variable" | "irregular" | "no_se";
export type OvulationMethod = "calendar" | "known" | "lh" | "unsure";
export type LhResult = "low" | "high" | "peak";
export type CervicalMucus = "dry" | "sticky" | "creamy" | "watery" | "egg_white";
export type CervixPosition = "low" | "medium" | "high";
export type SignalLevel = "low" | "medium" | "high";
export type ExposureMethod =
  | "sin_proteccion"
  | "retiro"
  | "espermicida"
  | "preservativo"
  | "anticoncepcion_emergencia"
  | "otro";
export type RiskTone = "very-low" | "low" | "moderate" | "high" | "very-high";

export interface BodySignals {
  basalBodyTemperature: string;
  cervicalMucus: CervicalMucus | "";
  cervixPosition: CervixPosition | "";
  stressLevel: SignalLevel | "";
  sleepQuality: SignalLevel | "";
  travelOrIllness: boolean;
  restingHeartRate: string;
  wristTemperatureTrend: string;
  hormoneLh: string;
  hormoneEstrogen: string;
  hormoneProgesterone: string;
  hormoneFsh: string;
  notes: string;
}

export interface ExposureEntry {
  id: string;
  date: string;
  methods: ExposureMethod[];
  notes: string;
}

export interface DailyLog {
  note: string;
  symptoms: string;
  bbt: string;
  lhResult: LhResult | "";
  mucus: CervicalMucus | "";
  cervixPosition: CervixPosition | "";
  sexMethods: ExposureMethod[];
  exposureNote: string;
  stressLevel: SignalLevel | "";
  sleepQuality: SignalLevel | "";
  travelOrIllness: boolean;
}

export interface VentanaFertilState {
  currentStep: number;
  selectedDate: string;
  calendarMonth: string;
  isDemo: boolean;
  lastPeriodStart: string;
  averageCycleLength: number;
  minimumCycleLength: number;
  maximumCycleLength: number;
  regularity: CycleRegularity;
  ovulationMethod: OvulationMethod;
  knownOvulationDate: string;
  lhSurgeDate: string;
  lhResult: LhResult | "";
  bodySignals: BodySignals;
  exposureEntries: ExposureEntry[];
  dailyLogs: Record<string, DailyLog>;
}

export interface StoredSnapshot {
  version: 1;
  updatedAt: string;
  isDemo: boolean;
  cycle: {
    lastPeriodStart: string;
    averageCycleLength: number;
    minimumCycleLength: number;
    maximumCycleLength: number;
    regularity: CycleRegularity;
  };
  ovulation: {
    mode: OvulationMethod;
    knownOvulationDate: string;
    lhSurgeDate: string;
    lhResult: LhResult | "";
  };
  signals: BodySignals;
  exposures: ExposureEntry[];
  dailyLogs: Record<string, DailyLog>;
  ui: {
    currentStep: number;
    selectedDate: string;
    calendarMonth: string;
    isDemo: boolean;
  };
}

export interface LoadedStoredState {
  state: VentanaFertilState;
  updatedAt: string;
  migratedFromLegacy: boolean;
}

export interface RelativeRiskPoint {
  offset: number;
  label: string;
  percent: number;
}

export interface ReminderTemplate {
  offset: number;
  title: string;
  badge: string;
  startTime: string;
}

export interface ReminderEvent {
  id: string;
  offset: number;
  title: string;
  badge: string;
  date: string;
  timeLabel: string;
  description: string;
  startIso: string;
}

export interface ExposureInsight {
  id: string;
  date: string;
  label: string;
  methods: ExposureMethod[];
  notes: string;
  cycleDay: number | null;
  offsetFromOvulation: number | null;
  markerPercent: number;
  riskTone: RiskTone;
  riskLabel: string;
  explanation: string;
}

export interface DayInsight {
  date: string;
  cycleDay: number | null;
  offsetFromOvulation: number | null;
  label: string;
  markerPercent: number;
  riskTone: RiskTone;
  riskLabel: string;
  windowLabel: string;
  explanation: string;
  whyItMatters: string;
  safetyNote: string;
  conservativeWindow: boolean;
  fertileWindow: boolean;
  peakWindow: boolean;
  exposureMethods: ExposureMethod[];
  exposureNotes: string[];
  bodyNotes: string[];
  bodySignals: string[];
}

export interface SimulationResult {
  valid: boolean;
  issues: string[];
  analysisDate: string;
  selectedDate: string;
  ovulationDate: string;
  ovulationSource: OvulationMethod;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  peakWindowStart: string;
  peakWindowEnd: string;
  conservativeWindowStart: string;
  conservativeWindowEnd: string;
  conservativeExpansionDays: number;
  uncertaintyScore: number;
  confidenceScore: number;
  confidenceBand: string;
  confidenceHint: string;
  uncertaintyBand: string;
  uncertaintyHint: string;
  cycleDayToday: number | null;
  selectedDateCycleDay: number | null;
  selectedDateOffset: number | null;
  selectedMarkerPercent: number;
  selectedRiskTone: RiskTone;
  selectedRiskLabel: string;
  selectedReason: string;
  selectedWindowLabel: string;
  riskTable: RelativeRiskPoint[];
  reminders: ReminderEvent[];
  exposureInsights: ExposureInsight[];
  dayInsights: Record<string, DayInsight>;
}

export type PeriodEntrySource = "manual" | "demo" | "import";

export interface PeriodEntry {
  id: string;
  periodStartDate: string;
  periodEndDate?: string;
  source: PeriodEntrySource;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AppPreferences {
  defaultCycleLength: number;
  showPercentages: boolean;
  reducedMotion?: boolean;
  cycleRegularity?: CycleRegularity;
}

export interface AppState {
  version: 2;
  updatedAt: string;
  preferences: AppPreferences;
  entries: PeriodEntry[];
  currentEntryId: string | null;
}

export interface AppStateWarning {
  code: "legacy-migration" | "corrupt-storage" | "invalid-import";
  message: string;
}
