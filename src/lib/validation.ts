import { parseDate } from "@/lib/cycle";
import type { SimpleCoreState } from "@/lib/simple-storage";
import type { AppState, PeriodEntry, VentanaFertilState } from "@/types";

export type ValidationField =
  | "lastPeriodStart"
  | "averageCycleLength"
  | "minimumCycleLength"
  | "maximumCycleLength"
  | "knownOvulationDate"
  | "lhSurgeDate"
  | "lhResult"
  | "exposureEntries";

export interface ValidationIssue {
  field: ValidationField;
  message: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  fieldErrors: Partial<Record<ValidationField, string[]>>;
  hasErrors: boolean;
}

export interface SimpleValidationReport {
  issues: string[];
  hasErrors: boolean;
}

export interface ValidationSummary {
  valid: boolean;
  issues: string[];
}

const MAX_NOTES_LENGTH = 1000;
const MAX_IMPORT_HISTORY_DAYS = 3650;
const SIMPLE_DATE_NOTICE_DAYS = 365;

function pushIssue(fieldErrors: Partial<Record<ValidationField, string[]>>, field: ValidationField, message: string) {
  if (!fieldErrors[field]) fieldErrors[field] = [];
  fieldErrors[field]?.push(message);
}

export function validateVentanaFertilState(state: VentanaFertilState): ValidationReport {
  const issues: ValidationIssue[] = [];
  const fieldErrors: Partial<Record<ValidationField, string[]>> = {};

  if (state.averageCycleLength < 21 || state.averageCycleLength > 45) {
    const message = "La duración promedio debe estar entre 21 y 45 días.";
    issues.push({ field: "averageCycleLength", message });
    pushIssue(fieldErrors, "averageCycleLength", message);
  }

  if (state.minimumCycleLength > state.maximumCycleLength) {
    const message = "La duración mínima no puede ser mayor que la máxima.";
    issues.push({ field: "minimumCycleLength", message });
    pushIssue(fieldErrors, "minimumCycleLength", message);
    pushIssue(fieldErrors, "maximumCycleLength", message);
  }

  const lastPeriodValid = state.lastPeriodStart === "" || Boolean(parseDate(state.lastPeriodStart));
  const knownOvulationValid = state.knownOvulationDate === "" || Boolean(parseDate(state.knownOvulationDate));
  const lhSurgeValid = state.lhSurgeDate === "" || Boolean(parseDate(state.lhSurgeDate));

  if (state.ovulationMethod !== "known" && !state.lastPeriodStart.trim()) {
    const message = "El primer día de la última menstruación es obligatorio salvo que ya conozcas la ovulación.";
    issues.push({ field: "lastPeriodStart", message });
    pushIssue(fieldErrors, "lastPeriodStart", message);
  }

  if (state.lastPeriodStart.trim() && !lastPeriodValid) {
    const message = "La fecha de la última menstruación no es válida.";
    issues.push({ field: "lastPeriodStart", message });
    pushIssue(fieldErrors, "lastPeriodStart", message);
  }

  if (state.ovulationMethod === "known" && !state.knownOvulationDate.trim()) {
    const message = "Ingresá la fecha conocida de ovulación.";
    issues.push({ field: "knownOvulationDate", message });
    pushIssue(fieldErrors, "knownOvulationDate", message);
  }

  if (state.knownOvulationDate.trim() && !knownOvulationValid) {
    const message = "La fecha conocida de ovulación no es válida.";
    issues.push({ field: "knownOvulationDate", message });
    pushIssue(fieldErrors, "knownOvulationDate", message);
  }

  if (state.ovulationMethod === "lh" && !state.lhSurgeDate.trim()) {
    const message = "Ingresá la fecha del pico LH.";
    issues.push({ field: "lhSurgeDate", message });
    pushIssue(fieldErrors, "lhSurgeDate", message);
  }

  if (state.lhSurgeDate.trim() && !lhSurgeValid) {
    const message = "La fecha del pico LH no es válida.";
    issues.push({ field: "lhSurgeDate", message });
    pushIssue(fieldErrors, "lhSurgeDate", message);
  }

  if (state.ovulationMethod === "lh" && !state.lhResult) {
    const message = "Elegí si el resultado LH fue bajo, alto o pico.";
    issues.push({ field: "lhResult", message });
    pushIssue(fieldErrors, "lhResult", message);
  }

  const invalidExposureDates = state.exposureEntries.filter((entry) => entry.date && !parseDate(entry.date));
  if (invalidExposureDates.length > 0) {
    const message = "Hay una o más fechas de exposición inválidas.";
    issues.push({ field: "exposureEntries", message });
    pushIssue(fieldErrors, "exposureEntries", message);
  }

  return {
    issues,
    fieldErrors,
    hasErrors: issues.length > 0,
  };
}

export function validateSimpleState(state: Pick<SimpleCoreState, "lastPeriodStart" | "averageCycleLength">): SimpleValidationReport {
  const issues: string[] = [];

  if (!state.lastPeriodStart.trim()) {
    issues.push("Necesitamos saber cuándo empezó tu último ciclo.");
  } else if (!parseDate(state.lastPeriodStart)) {
    issues.push("La fecha de inicio no es válida.");
  } else {
    const parsed = parseDate(state.lastPeriodStart);
    if (parsed && parsed.getTime() > Date.now()) {
      issues.push("La fecha no puede estar en el futuro.");
    }
  }

  if (state.averageCycleLength < 21 || state.averageCycleLength > 45) {
    issues.push("Usá una duración entre 21 y 45 días.");
  }

  return {
    issues,
    hasErrors: issues.length > 0,
  };
}

export function getSimpleDateNotice(value: string) {
  const date = parseDate(value);
  if (!date) return null;
  const ageInDays = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (ageInDays > SIMPLE_DATE_NOTICE_DAYS) {
    return "Esta fecha parece antigua. Podés usarla, pero quizá convenga cargar el ciclo más reciente.";
  }
  return null;
}

export function isValidISODate(value: unknown): value is string {
  return typeof value === "string" && Boolean(parseDate(value));
}

export function safeParseJson<T = unknown>(raw: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) as T };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "JSON inválido." };
  }
}

export function validateCycleLength(value: unknown): ValidationSummary {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { valid: false, issues: ["La duración del ciclo debe ser un número válido."] };
  }
  if (value < 21 || value > 45) {
    return { valid: false, issues: ["La duración promedio debe estar entre 21 y 45 días."] };
  }
  return { valid: true, issues: [] };
}

function sanitizeNotes(value: unknown) {
  return typeof value === "string" ? value.slice(0, MAX_NOTES_LENGTH) : "";
}

export function validatePeriodEntry(entry: PeriodEntry): ValidationSummary {
  const issues: string[] = [];
  const now = new Date();
  const date = parseDate(entry.periodStartDate);

  if (!entry.id || typeof entry.id !== "string") {
    issues.push("La entrada necesita un identificador válido.");
  }

  if (!date) {
    issues.push("La fecha de inicio del período no es válida.");
  } else {
    if (date.getTime() > now.getTime()) {
      issues.push("La fecha de inicio no puede estar en el futuro.");
    }
    const ageInDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
    if (ageInDays > MAX_IMPORT_HISTORY_DAYS) {
      issues.push("La fecha de inicio es demasiado antigua para este simulador.");
    }
  }

  if (entry.periodEndDate && !parseDate(entry.periodEndDate)) {
    issues.push("La fecha de fin del período no es válida.");
  }

  if (typeof entry.notes === "string" && entry.notes.length > MAX_NOTES_LENGTH) {
    issues.push("Las notas son demasiado largas.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function validateAppState(state: AppState): ValidationSummary {
  const issues: string[] = [];
  const ids = new Set<string>();

  if (!state || state.version !== 2) {
    issues.push("El estado debe ser versión 2.");
  }

  const cycle = validateCycleLength(state.preferences?.defaultCycleLength);
  if (!cycle.valid) issues.push(...cycle.issues);

  if (!state.entries || !Array.isArray(state.entries)) {
    issues.push("Las entradas del historial no son válidas.");
  } else {
    for (const entry of state.entries) {
      const result = validatePeriodEntry(entry);
      issues.push(...result.issues);
      if (ids.has(entry.id)) {
        issues.push(`Hay entradas duplicadas con el id ${entry.id}.`);
      }
      ids.add(entry.id);
    }
  }

  if (state.currentEntryId && !ids.has(state.currentEntryId)) {
    issues.push("La entrada actual no existe dentro del historial.");
  }

  if (!state.updatedAt || Number.isNaN(Date.parse(state.updatedAt))) {
    issues.push("El estado necesita una fecha de actualización válida.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function sanitizeImportedState(value: unknown): AppState | null {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;
  const version = source.version;

  const normalizeEntry = (entryValue: unknown): PeriodEntry | null => {
    if (!entryValue || typeof entryValue !== "object") return null;
    const entry = entryValue as Partial<PeriodEntry>;
    if (typeof entry.id !== "string" || !entry.id.trim()) return null;
    const periodStartDate = entry.periodStartDate;
    if (!isValidISODate(periodStartDate)) return null;
    const normalized: PeriodEntry = {
      id: entry.id,
      periodStartDate,
      periodEndDate: isValidISODate(entry.periodEndDate) ? entry.periodEndDate : undefined,
      source: entry.source === "demo" || entry.source === "import" ? entry.source : "manual",
      createdAt: typeof entry.createdAt === "string" && !Number.isNaN(Date.parse(entry.createdAt)) ? entry.createdAt : new Date().toISOString(),
      updatedAt: typeof entry.updatedAt === "string" && !Number.isNaN(Date.parse(entry.updatedAt)) ? entry.updatedAt : new Date().toISOString(),
      notes: sanitizeNotes(entry.notes),
    };
    const validation = validatePeriodEntry(normalized);
    return validation.valid ? normalized : null;
  };

  if (version === 2) {
    const entries = Array.isArray(source.entries) ? source.entries.map(normalizeEntry).filter((entry): entry is PeriodEntry => Boolean(entry)) : [];
    const dedupedById: PeriodEntry[] = [];
    const seenIds = new Set<string>();
    for (const entry of entries) {
      if (seenIds.has(entry.id)) continue;
      seenIds.add(entry.id);
      dedupedById.push(entry);
    }

    const deduped: PeriodEntry[] = [];
    const seenDates = new Set<string>();
    for (const entry of dedupedById) {
      if (seenDates.has(entry.periodStartDate)) continue;
      seenDates.add(entry.periodStartDate);
      deduped.push(entry);
    }
    const currentEntryId =
      typeof source.currentEntryId === "string" && deduped.some((entry) => entry.id === source.currentEntryId)
        ? source.currentEntryId
        : deduped[0]?.id ?? null;
    const appState: AppState = {
      version: 2,
      updatedAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
      preferences: {
        defaultCycleLength:
          typeof source.preferences === "object" &&
          source.preferences !== null &&
          typeof (source.preferences as Record<string, unknown>).defaultCycleLength === "number"
            ? (source.preferences as Record<string, number>).defaultCycleLength
            : 28,
        showPercentages:
          typeof source.preferences === "object" &&
          source.preferences !== null &&
          typeof (source.preferences as Record<string, unknown>).showPercentages === "boolean"
            ? Boolean((source.preferences as Record<string, unknown>).showPercentages)
            : true,
        reducedMotion:
          typeof source.preferences === "object" &&
          source.preferences !== null &&
          typeof (source.preferences as Record<string, unknown>).reducedMotion === "boolean"
            ? Boolean((source.preferences as Record<string, unknown>).reducedMotion)
            : undefined,
        cycleRegularity:
          typeof source.preferences === "object" &&
          source.preferences !== null &&
          ((source.preferences as Record<string, unknown>).cycleRegularity === "regular" ||
            (source.preferences as Record<string, unknown>).cycleRegularity === "algo_variable" ||
            (source.preferences as Record<string, unknown>).cycleRegularity === "irregular" ||
            (source.preferences as Record<string, unknown>).cycleRegularity === "no_se")
            ? ((source.preferences as Record<string, unknown>).cycleRegularity as AppState["preferences"]["cycleRegularity"])
            : undefined,
      },
      entries: deduped,
      currentEntryId,
    };

    const validated = validateAppState(appState);
    if (!validated.valid) {
      return null;
    }
    return appState;
  }

  if (version === 1) {
    const periodStartDate = typeof source.lastPeriodStart === "string" ? source.lastPeriodStart : "";
    const averageCycleLength = typeof source.averageCycleLength === "number" ? source.averageCycleLength : 28;
    if (!isValidISODate(periodStartDate)) return null;

    return {
      version: 2,
      updatedAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
      preferences: {
        defaultCycleLength: averageCycleLength,
        showPercentages: true,
        reducedMotion: undefined,
      },
      entries: [
        {
          id: typeof source.id === "string" ? source.id : `entry-${periodStartDate}`,
          periodStartDate,
          source: typeof source.isDemo === "boolean" && source.isDemo ? "demo" : "manual",
          createdAt: typeof source.createdAt === "string" && !Number.isNaN(Date.parse(source.createdAt)) ? source.createdAt : new Date().toISOString(),
          updatedAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
          notes: "",
        },
      ],
      currentEntryId: `entry-${periodStartDate}`,
    };
  }

  if (source.cycle && typeof source.cycle === "object") {
    const cycle = source.cycle as Record<string, unknown>;
    const periodStartDate = typeof cycle.lastPeriodStart === "string" ? cycle.lastPeriodStart : "";
    if (!isValidISODate(periodStartDate)) return null;
    const entry: PeriodEntry = {
      id: `entry-${periodStartDate}`,
      periodStartDate,
      source: "import",
      createdAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
      updatedAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
      notes: "",
    };
    return {
      version: 2,
      updatedAt: typeof source.updatedAt === "string" && !Number.isNaN(Date.parse(source.updatedAt)) ? source.updatedAt : new Date().toISOString(),
      preferences: {
        defaultCycleLength: typeof cycle.averageCycleLength === "number" ? cycle.averageCycleLength : 28,
        showPercentages: true,
        reducedMotion: undefined,
        cycleRegularity:
          typeof source.regularity === "string" &&
          (source.regularity === "regular" ||
            source.regularity === "algo_variable" ||
            source.regularity === "irregular" ||
            source.regularity === "no_se")
            ? (source.regularity as AppState["preferences"]["cycleRegularity"])
            : undefined,
      },
      entries: [entry],
      currentEntryId: entry.id,
    };
  }

  return null;
}

export function validateImportPayload(raw: string): ValidationSummary {
  const parsed = safeParseJson(raw);
  if (!parsed.ok) {
    return { valid: false, issues: [parsed.error] };
  }

  const sanitized = sanitizeImportedState(parsed.value);
  if (!sanitized) {
    return { valid: false, issues: ["El archivo no tiene un formato válido para importar."] };
  }

  const validation = validateAppState(sanitized);
  return {
    valid: validation.valid,
    issues: validation.issues,
  };
}
