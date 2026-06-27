import type {
  BodySignals,
  CycleRegularity,
  DayInsight,
  ExposureEntry,
  ExposureInsight,
  LhResult,
  ReminderEvent,
  ReminderTemplate,
  RelativeRiskPoint,
  RiskTone,
  SimulationResult,
  VentanaFertilState,
} from "@/types";

export const RELATIVE_RISK_TABLE: RelativeRiskPoint[] = [
  { offset: -6, label: "O-6", percent: 3.3 },
  { offset: -5, label: "O-5", percent: 3.4 },
  { offset: -4, label: "O-4", percent: 22.0 },
  { offset: -3, label: "O-3", percent: 26.7 },
  { offset: -2, label: "O-2", percent: 24.4 },
  { offset: -1, label: "O-1", percent: 18.5 },
  { offset: 0, label: "O", percent: 6.8 },
  { offset: 1, label: "O+1", percent: 3.3 },
];

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  { offset: -6, badge: "🟡", title: "O-6: Se abre la ventana fértil", startTime: "08:00" },
  { offset: -5, badge: "🟡", title: "O-5: Ventana fértil baja", startTime: "08:02" },
  { offset: -4, badge: "🔴", title: "O-4: Inicio de días de mayor atención", startTime: "08:04" },
  { offset: -3, badge: "🔥", title: "O-3: Día pico estimado", startTime: "08:06" },
  { offset: -2, badge: "🔥", title: "O-2: Marcador muy alto estimado", startTime: "08:08" },
  { offset: -1, badge: "🔴", title: "O-1: Día previo a ovulación", startTime: "08:10" },
  { offset: 0, badge: "🥚", title: "Día de ovulación estimada", startTime: "08:12" },
  { offset: 1, badge: "🟡", title: "O+1: Cierre de ventana fértil", startTime: "08:15" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const TZ = "America/Argentina/Buenos_Aires";

export const OVULATION_SOURCE_LABELS: Record<string, string> = {
  calendar: "estimada por calendario",
  known: "fecha conocida",
  lh: "estimada por test LH",
  unsure: "estimación conservadora",
};

export const REGULARITY_LABELS: Record<CycleRegularity, string> = {
  regular: "Regular",
  algo_variable: "Algo variable",
  irregular: "Irregular",
  no_se: "No lo sé",
};

export const LH_RESULT_LABELS: Record<LhResult, string> = {
  low: "Bajo",
  high: "Alto",
  peak: "Pico",
};

export const RISK_LABELS: Record<RiskTone, string> = {
  "very-low": "Muy bajo",
  low: "Bajo",
  moderate: "Moderado",
  high: "Alto",
  "very-high": "Muy alto",
};

export const RISK_BAND_STYLES: Record<RiskTone, { border: string; fill: string; text: string }> = {
  "very-low": { border: "border-emerald-200", fill: "bg-emerald-50", text: "text-emerald-800" },
  low: { border: "border-amber-200", fill: "bg-amber-50", text: "text-amber-800" },
  moderate: { border: "border-orange-200", fill: "bg-orange-50", text: "text-orange-800" },
  high: { border: "border-rose-200", fill: "bg-rose-50", text: "text-rose-800" },
  "very-high": { border: "border-fuchsia-200", fill: "bg-fuchsia-50", text: "text-fuchsia-800" },
};

export function todayIsoDate() {
  return formatDateInput(new Date());
}

export function parseDate(value: string | undefined | null) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidDateString(value: string | undefined | null) {
  return Boolean(parseDate(value));
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLong(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatWeekdayShort(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "";
  return new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date);
}

export function formatMonthLabel(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function diffInDays(later: Date, earlier: Date) {
  return Math.round((startOfDay(later).getTime() - startOfDay(earlier).getTime()) / DAY_MS);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function safeNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export function formatPercent(value: number) {
  return `${value.toFixed(value >= 10 ? 1 : 1)}%`;
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getRelativeOffsetLabel(offset: number) {
  if (offset === 0) return "O";
  return offset > 0 ? `O+${offset}` : `O${offset}`;
}

export function getRiskTone(percent: number): RiskTone {
  if (percent >= 26) return "very-high";
  if (percent >= 20) return "high";
  if (percent >= 10) return "moderate";
  if (percent >= 4) return "low";
  return "very-low";
}

export function getRiskLabel(percent: number) {
  return RISK_LABELS[getRiskTone(percent)];
}

function escapeIcsText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function toIcsDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export function buildReminderEvents(ovulationDate: Date) {
  return REMINDER_TEMPLATES.map((template, index) => {
    const reminderDate = addDays(ovulationDate, template.offset);
    const [hours, minutes] = template.startTime.split(":").map(Number);
    const eventStart = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate(),
      hours,
      minutes,
      0,
    );
    const description = [
      "Recordatorio educativo de la ventana fértil.",
      "Este marcador no reemplaza consulta médica y no debe usarse como anticoncepción principal.",
      "La fecha y la intensidad son estimaciones basadas en el modelo del ciclo.",
    ].join(" ");

    return {
      id: `${toIcsDateTime(eventStart)}-${index}`,
      offset: template.offset,
      title: template.title,
      badge: template.badge,
      date: formatDateInput(reminderDate),
      timeLabel: formatTimeLabel(template.startTime),
      description,
      startIso: toIcsDateTime(eventStart),
    } satisfies ReminderEvent;
  });
}

export function buildIcsFile(events: ReminderEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ventana Fertil//Simulador Educativo//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:America/Argentina/Buenos_Aires",
  ];

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@ventana-fertil`,
      `DTSTAMP:${toIcsDateTime(new Date())}`,
      `DTSTART;TZID=${TZ}:${event.startIso}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(event.title)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

function selectRegularityPenalty(regularity: CycleRegularity) {
  switch (regularity) {
    case "regular":
      return 0;
    case "algo_variable":
      return 8;
    case "irregular":
      return 18;
    case "no_se":
      return 10;
    default:
      return 0;
  }
}

function selectMethodPenalty(method: string) {
  switch (method) {
    case "known":
      return 0;
    case "lh":
      return 8;
    case "calendar":
      return 14;
    case "unsure":
      return 18;
    default:
      return 12;
  }
}

function selectStressPenalty(level: BodySignals["stressLevel"]) {
  switch (level) {
    case "high":
      return 5;
    case "medium":
      return 2;
    default:
      return 0;
  }
}

function selectSleepPenalty(level: BodySignals["sleepQuality"]) {
  switch (level) {
    case "low":
      return 5;
    case "medium":
      return 2;
    default:
      return 0;
  }
}

function buildConfidenceHint(state: VentanaFertilState, uncertaintyScore: number) {
  const pieces: string[] = [];

  if (state.ovulationMethod === "known") {
    pieces.push("La ovulación está fechada de forma puntual.");
  } else if (state.ovulationMethod === "lh") {
    pieces.push("La referencia sale del pico de LH y sigue siendo una estimación.");
  } else if (state.ovulationMethod === "calendar") {
    pieces.push("La lectura depende del promedio del ciclo.");
  } else {
    pieces.push("La estimación usa calendario y conviene leerla con más margen.");
  }

  if (state.regularity === "irregular") {
    pieces.push("El ciclo se marcó como irregular.");
  } else if (state.regularity === "algo_variable") {
    pieces.push("Hay variabilidad que puede mover la ventana unos días.");
  }

  if (state.bodySignals.travelOrIllness) {
    pieces.push("Hubo viaje, enfermedad o un cambio de contexto corporal.");
  }

  if (state.bodySignals.basalBodyTemperature.trim()) {
    pieces.push("Hay temperatura basal cargada como apoyo retrospectivo.");
  }

  if (uncertaintyScore <= 25) {
    pieces.push("La incertidumbre general es baja.");
  } else if (uncertaintyScore >= 76) {
    pieces.push("La incertidumbre general es muy alta.");
  }

  return pieces.join(" ");
}

function buildUncertaintyHint(state: VentanaFertilState, uncertaintyScore: number) {
  const pieces: string[] = [];

  if (state.regularity === "irregular") pieces.push("Ciclo irregular.");
  if (state.regularity === "algo_variable") pieces.push("Ciclo algo variable.");
  if (state.ovulationMethod === "calendar") pieces.push("Ovulación por calendario.");
  if (state.ovulationMethod === "unsure") pieces.push("Ovulación no confirmada.");
  if (state.ovulationMethod === "lh") pieces.push("Ovulación estimada a partir de LH.");
  if (state.bodySignals.travelOrIllness) pieces.push("Viaje o enfermedad.");
  if (state.bodySignals.stressLevel === "high") pieces.push("Estrés alto.");
  if (state.bodySignals.sleepQuality === "low") pieces.push("Sueño bajo.");
  if (state.bodySignals.basalBodyTemperature.trim()) pieces.push("BBT disponible.");
  if (state.bodySignals.cervicalMucus) pieces.push("Moco cervical cargado.");

  if (pieces.length === 0) {
    pieces.push("Pocos factores que muevan la estimación.");
  }

  if (uncertaintyScore >= 76) {
    pieces.push("Lectura muy sensible a cambios del ciclo.");
  }

  return pieces.join(" ");
}

function collectUncertaintyScore(state: VentanaFertilState, varianceDays: number) {
  let score = 0;
  score += Math.min(28, varianceDays * 4);
  score += selectRegularityPenalty(state.regularity);
  score += selectMethodPenalty(state.ovulationMethod);

  if (state.ovulationMethod === "lh" && state.lhSurgeDate.trim()) score -= 4;
  if (state.ovulationMethod === "known" && state.knownOvulationDate.trim()) score -= 2;

  if (state.bodySignals.basalBodyTemperature.trim()) score -= 6;
  if (state.bodySignals.cervicalMucus) score -= 2;
  if (state.bodySignals.cervixPosition) score -= 1;
  if (state.bodySignals.restingHeartRate.trim()) score -= 1;
  if (state.bodySignals.wristTemperatureTrend.trim()) score -= 1;
  if (state.bodySignals.travelOrIllness) score += 7;
  score += selectStressPenalty(state.bodySignals.stressLevel);
  score += selectSleepPenalty(state.bodySignals.sleepQuality);

  return clamp(Math.round(score), 0, 100);
}

function buildRiskMarker(offset: number | null) {
  if (offset === null) {
    return {
      percent: 0,
      riskTone: "very-low" as RiskTone,
      riskLabel: "Muy bajo",
      windowLabel: "Sin ovulación calculada",
      explanation: "No hay fecha de ovulación suficiente para ubicar este día en la curva.",
      withinFertileWindow: false,
      withinPeakWindow: false,
    };
  }

  const point = RELATIVE_RISK_TABLE.find((entry) => entry.offset === offset);
  const percent = point?.percent ?? 0;
  const riskTone = getRiskTone(percent);
  const riskLabel = getRiskLabel(percent);
  const withinFertileWindow = offset >= -6 && offset <= 1;
  const withinPeakWindow = offset >= -4 && offset <= -1;
  let explanation = "Fuera de la ventana fértil base; el marcador educativo cae cerca de 0%.";

  if (withinFertileWindow) {
    explanation = "Este día cae dentro de la ventana fértil estimada. El pico suele concentrarse alrededor de O-3 y O-2.";
  } else if (offset < -6) {
    explanation = "Aún falta para la ventana fértil base.";
  } else if (offset > 1) {
    explanation = "Ya pasó la ventana fértil base.";
  }

  return {
    percent,
    riskTone,
    riskLabel,
    windowLabel: withinFertileWindow ? "Dentro de la ventana base" : "Fuera de la ventana base",
    explanation,
    withinFertileWindow,
    withinPeakWindow,
  };
}

function buildDayInsight(
  date: Date,
  state: VentanaFertilState,
  ovulationDate: Date | null,
  fertileWindowStart: Date | null,
  fertileWindowEnd: Date | null,
  conservativeWindowStart: Date | null,
  conservativeWindowEnd: Date | null,
  exposureMap: Map<string, ExposureEntry[]>,
) {
  const key = formatDateInput(date);
  const cycleStart = parseDate(state.lastPeriodStart);
  const cycleDay = cycleStart ? diffInDays(date, cycleStart) + 1 : null;
  const offset = ovulationDate ? diffInDays(date, ovulationDate) : null;
  const marker = buildRiskMarker(offset);
  const fertileWindow = Boolean(
    fertileWindowStart && fertileWindowEnd && date >= fertileWindowStart && date <= fertileWindowEnd,
  );
  const peakWindow = Boolean(
    ovulationDate &&
      date >= addDays(ovulationDate, -4) &&
      date <= addDays(ovulationDate, -1),
  );
  const conservativeWindow = Boolean(
    conservativeWindowStart &&
      conservativeWindowEnd &&
      date >= conservativeWindowStart &&
      date <= conservativeWindowEnd,
  );

  const exposureEntries = exposureMap.get(key) ?? [];
  const exposureMethods = exposureEntries.flatMap((entry) => entry.methods);
  const exposureNotes = exposureEntries
    .map((entry) => entry.notes.trim())
    .filter(Boolean);

  const bodySignals: string[] = [];
  const bodyNotes: string[] = [];
  const log = state.dailyLogs[key];
  if (log) {
    if (log.bbt.trim()) bodySignals.push(`BBT: ${log.bbt.trim()}`);
    if (log.lhResult) bodySignals.push(`LH: ${log.lhResult.toUpperCase()}`);
    if (log.mucus) bodySignals.push(`Moco: ${log.mucus}`);
    if (log.cervixPosition) bodySignals.push(`Cérvix: ${log.cervixPosition}`);
    if (log.stressLevel) bodySignals.push(`Estrés: ${log.stressLevel}`);
    if (log.sleepQuality) bodySignals.push(`Sueño: ${log.sleepQuality}`);
    if (log.travelOrIllness) bodySignals.push("Viaje o enfermedad");
    if (log.note.trim()) bodyNotes.push(log.note.trim());
    if (log.symptoms.trim()) bodyNotes.push(`Síntomas: ${log.symptoms.trim()}`);
    if (log.exposureNote.trim()) bodyNotes.push(`Exposición: ${log.exposureNote.trim()}`);
    if (log.sexMethods.length > 0) {
      bodyNotes.push(
        `Métodos: ${log.sexMethods
          .map((method) => method.replaceAll("_", " "))
          .join(", ")}`,
      );
    }
  }

  const offsetLabel = offset === null ? "Sin cálculo" : getRelativeOffsetLabel(offset);
  const windowLabel = fertileWindow
    ? "Dentro de la ventana fértil estimada"
    : conservativeWindow
      ? "Fuera de la ventana base, dentro del margen conservador"
      : "Fuera de la ventana fértil base";

  const whyItMatters = offset === null
    ? "No hay ovulación calculada para ubicar este día."
    : fertileWindow
      ? "La relación con la ovulación estimada es la que mueve el marcador educativo."
      : conservativeWindow
        ? "La variabilidad del ciclo puede mover esta fecha hacia la ventana fértil."
        : "El día queda lejos del rango con mayor marcador en este modelo.";

  const safetyNote =
    "Este simulador es educativo. No reemplaza anticoncepción, no es un dispositivo médico y no sustituye a ginecología, médica/o o farmacia.";

  return {
    date: key,
    cycleDay,
    offsetFromOvulation: offset,
    label: offsetLabel,
    markerPercent: marker.percent,
    riskTone: marker.riskTone,
    riskLabel: marker.riskLabel,
    windowLabel,
    explanation: marker.explanation,
    whyItMatters,
    safetyNote,
    conservativeWindow,
    fertileWindow,
    peakWindow,
    exposureMethods,
    exposureNotes,
    bodyNotes,
    bodySignals,
  } satisfies DayInsight;
}

function buildExposureInsight(
  exposure: ExposureEntry,
  ovulationDate: Date | null,
  cycleStart: Date | null,
) {
  const date = parseDate(exposure.date);
  const offset = date && ovulationDate ? diffInDays(date, ovulationDate) : null;
  const marker = buildRiskMarker(offset);
  const cycleDay = date && cycleStart ? diffInDays(date, cycleStart) + 1 : null;
  const methods = exposure.methods;
  const label = formatDateLong(exposure.date);
  const explanation =
    offset === null
      ? "No hay ovulación suficiente para ubicar esta exposición en la curva."
      : marker.withinFertileWindow
        ? "Queda dentro de la ventana fértil base y se ve con un marcador educativo más alto."
        : "Queda fuera de la ventana fértil base; el marcador educativo es bajo y depende de la incertidumbre del ciclo.";

  return {
    id: exposure.id,
    date: exposure.date,
    label,
    methods,
    notes: exposure.notes.trim(),
    cycleDay,
    offsetFromOvulation: offset,
    markerPercent: marker.percent,
    riskTone: marker.riskTone,
    riskLabel: marker.riskLabel,
    explanation,
  } satisfies ExposureInsight;
}

function buildDayMap(
  state: VentanaFertilState,
  ovulationDate: Date | null,
  fertileWindowStart: Date | null,
  fertileWindowEnd: Date | null,
  conservativeWindowStart: Date | null,
  conservativeWindowEnd: Date | null,
  exposureMap: Map<string, ExposureEntry[]>,
) {
  const map: Record<string, DayInsight> = {};
  const anchor = ovulationDate ?? parseDate(state.selectedDate) ?? new Date();
  const start = addDays(anchor, -60);
  const end = addDays(anchor, 60);

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    map[formatDateInput(cursor)] = buildDayInsight(
      cursor,
      state,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      conservativeWindowStart,
      conservativeWindowEnd,
      exposureMap,
    );
  }

  return map;
}

export function getDayInsightForDate(
  date: Date,
  state: VentanaFertilState,
  ovulationDate: Date | null,
  fertileWindowStart: Date | null,
  fertileWindowEnd: Date | null,
  conservativeWindowStart: Date | null,
  conservativeWindowEnd: Date | null,
  exposureMap: Map<string, ExposureEntry[]>,
) {
  return buildDayInsight(
    date,
    state,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    conservativeWindowStart,
    conservativeWindowEnd,
    exposureMap,
  );
}

export function calculateSimulation(state: VentanaFertilState): SimulationResult {
  const issues: string[] = [];
  const selectedDate = parseDate(state.selectedDate) ?? parseDate(todayIsoDate()) ?? new Date();
  const analysisDate = selectedDate;

  const averageCycleLength = safeNumber(state.averageCycleLength, 28);
  const minimumCycleLength = safeNumber(state.minimumCycleLength, 26);
  const maximumCycleLength = safeNumber(state.maximumCycleLength, 30);

  if (averageCycleLength < 21 || averageCycleLength > 45) {
    issues.push("La duración promedio del ciclo debe estar entre 21 y 45 días.");
  }
  if (minimumCycleLength > maximumCycleLength) {
    issues.push("La duración mínima del ciclo no puede superar la máxima.");
  }

  const cycleStart = parseDate(state.lastPeriodStart);
  const knownOvulationDate = parseDate(state.knownOvulationDate);
  const lhSurgeDate = parseDate(state.lhSurgeDate);

  if (state.ovulationMethod !== "known" && !cycleStart) {
    issues.push("El primer día de la última menstruación es obligatorio salvo que ya conozcas la ovulación.");
  }

  if (state.ovulationMethod === "known" && !knownOvulationDate) {
    issues.push("La fecha conocida de ovulación no es válida.");
  }

  if (state.ovulationMethod === "lh" && !lhSurgeDate) {
    issues.push("La fecha del pico LH no es válida.");
  }

  if (state.ovulationMethod === "lh" && !state.lhResult) {
    issues.push("Elegí si el resultado de LH fue bajo, alto o pico.");
  }

  const exposureMap = new Map<string, ExposureEntry[]>();
  for (const entry of state.exposureEntries) {
    if (!exposureMap.has(entry.date)) {
      exposureMap.set(entry.date, []);
    }
    exposureMap.get(entry.date)?.push(entry);
  }

  const ovulationDate = determineOvulationDate(state, cycleStart, knownOvulationDate, lhSurgeDate);
  const ovulationSource = state.ovulationMethod;

  const fertileWindowStart = ovulationDate ? addDays(ovulationDate, -6) : null;
  const fertileWindowEnd = ovulationDate ? addDays(ovulationDate, 1) : null;
  const peakWindowStart = ovulationDate ? addDays(ovulationDate, -4) : null;
  const peakWindowEnd = ovulationDate ? addDays(ovulationDate, -1) : null;

  const varianceDays = Math.max(
    Math.abs(averageCycleLength - minimumCycleLength),
    Math.abs(maximumCycleLength - averageCycleLength),
  );

  let conservativeExpansionDays = varianceDays;
  if (state.regularity === "algo_variable") conservativeExpansionDays = Math.max(conservativeExpansionDays, 2);
  if (state.regularity === "irregular") conservativeExpansionDays = Math.max(conservativeExpansionDays, 4);
  if (state.regularity === "no_se") conservativeExpansionDays = Math.max(conservativeExpansionDays, 3);
  if (state.ovulationMethod === "lh") conservativeExpansionDays = Math.max(conservativeExpansionDays, 1);
  if (state.ovulationMethod === "unsure") conservativeExpansionDays = Math.max(conservativeExpansionDays, 2);

  const conservativeWindowStart = ovulationDate ? addDays(ovulationDate, -6 - conservativeExpansionDays) : null;
  const conservativeWindowEnd = ovulationDate ? addDays(ovulationDate, 1 + conservativeExpansionDays) : null;

  const uncertaintyScore = ovulationDate ? collectUncertaintyScore(state, varianceDays) : 100;
  const confidenceScore = clamp(100 - uncertaintyScore, 0, 100);

  const confidenceBand =
    confidenceScore <= 25 ? "baja" : confidenceScore <= 50 ? "moderada" : confidenceScore <= 75 ? "alta" : "muy alta";
  const uncertaintyBand =
    uncertaintyScore <= 25 ? "baja" : uncertaintyScore <= 50 ? "moderada" : uncertaintyScore <= 75 ? "alta" : "muy alta";

  const selectedDateOffset = ovulationDate ? diffInDays(analysisDate, ovulationDate) : null;
  const selectedDateCycleDay = cycleStart ? diffInDays(analysisDate, cycleStart) + 1 : null;
  const cycleDayToday = selectedDateCycleDay;
  const marker = buildRiskMarker(selectedDateOffset);

  const selectedReason = buildSelectedReason(marker, selectedDateOffset, ovulationDate, conservativeWindowStart, conservativeWindowEnd);
  const confidenceHint = buildConfidenceHint(state, uncertaintyScore);
  const uncertaintyHint = buildUncertaintyHint(state, uncertaintyScore);

  const dayInsights = buildDayMap(
    state,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    conservativeWindowStart,
    conservativeWindowEnd,
    exposureMap,
  );
  const exposureInsights = state.exposureEntries
    .filter((entry) => Boolean(entry.date))
    .map((entry) => buildExposureInsight(entry, ovulationDate, cycleStart));

  const reminders = ovulationDate ? buildReminderEvents(ovulationDate) : [];

  return {
    valid: issues.length === 0 && Boolean(ovulationDate),
    issues,
    analysisDate: formatDateInput(analysisDate),
    selectedDate: formatDateInput(selectedDate),
    ovulationDate: ovulationDate ? formatDateInput(ovulationDate) : "",
    ovulationSource,
    fertileWindowStart: fertileWindowStart ? formatDateInput(fertileWindowStart) : "",
    fertileWindowEnd: fertileWindowEnd ? formatDateInput(fertileWindowEnd) : "",
    peakWindowStart: peakWindowStart ? formatDateInput(peakWindowStart) : "",
    peakWindowEnd: peakWindowEnd ? formatDateInput(peakWindowEnd) : "",
    conservativeWindowStart: conservativeWindowStart ? formatDateInput(conservativeWindowStart) : "",
    conservativeWindowEnd: conservativeWindowEnd ? formatDateInput(conservativeWindowEnd) : "",
    conservativeExpansionDays,
    uncertaintyScore,
    confidenceScore,
    confidenceBand,
    confidenceHint,
    uncertaintyBand,
    uncertaintyHint,
    cycleDayToday,
    selectedDateCycleDay,
    selectedDateOffset,
    selectedMarkerPercent: marker.percent,
    selectedRiskTone: marker.riskTone,
    selectedRiskLabel: marker.riskLabel,
    selectedReason,
    selectedWindowLabel: marker.windowLabel,
    riskTable: RELATIVE_RISK_TABLE,
    reminders,
    exposureInsights,
    dayInsights,
  };
}

function determineOvulationDate(
  state: VentanaFertilState,
  cycleStart: Date | null,
  knownOvulationDate: Date | null,
  lhSurgeDate: Date | null,
) {
  if (state.ovulationMethod === "known") return knownOvulationDate;
  if (state.ovulationMethod === "lh" && lhSurgeDate) {
    return addDays(lhSurgeDate, 1);
  }
  if (cycleStart) {
    return addDays(cycleStart, averageCycleToOvulationOffset(state.averageCycleLength));
  }
  return null;
}

function averageCycleToOvulationOffset(averageCycleLength: number) {
  // Cycle day N is an N-1 date offset from the first day of menstruation.
  return clamp(Math.round(averageCycleLength - 15), 6, 30);
}

function buildSelectedReason(
  marker: ReturnType<typeof buildRiskMarker>,
  selectedDateOffset: number | null,
  ovulationDate: Date | null,
  conservativeWindowStart: Date | null,
  conservativeWindowEnd: Date | null,
) {
  if (!ovulationDate || selectedDateOffset === null) {
    return "No hay fecha de ovulación suficiente para calcular un marcador educativo.";
  }

  if (marker.withinFertileWindow) {
    return "Este día cae dentro de la ventana fértil base. El marcador suele subir antes de ovular y concentrarse alrededor de O-3 y O-2.";
  }

  if (
    conservativeWindowStart &&
    conservativeWindowEnd &&
    selectedDateOffset >= diffInDays(conservativeWindowStart, ovulationDate) &&
    selectedDateOffset <= diffInDays(conservativeWindowEnd, ovulationDate)
  ) {
    return "Queda fuera de la ventana base, pero dentro del margen conservador. La variabilidad del ciclo puede mover la estimación.";
  }

  return "Queda fuera de la ventana fértil base. El marcador educativo se aproxima a 0% y la lectura depende de la incertidumbre del ciclo.";
}

export function buildExposureSummary(exposure: ExposureEntry) {
  return exposure.methods
    .map((method) => {
      switch (method) {
        case "sin_proteccion":
          return "Sin protección";
        case "retiro":
          return "Retiro";
        case "espermicida":
          return "Espermicida";
        case "preservativo":
          return "Preservativo";
        case "anticoncepcion_emergencia":
          return "Anticoncepción de emergencia";
        case "otro":
          return "Otro";
        default:
          return method;
      }
    })
    .join(" · ");
}

export function buildDailyLogSummary(state: VentanaFertilState, date: string) {
  const log = state.dailyLogs[date];
  if (!log) return [];
  const parts: string[] = [];
  if (log.note.trim()) parts.push(log.note.trim());
  if (log.symptoms.trim()) parts.push(`Síntomas: ${log.symptoms.trim()}`);
  if (log.bbt.trim()) parts.push(`BBT: ${log.bbt.trim()}`);
  if (log.lhResult) parts.push(`LH: ${LH_RESULT_LABELS[log.lhResult]}`);
  if (log.mucus) parts.push(`Moco: ${log.mucus}`);
  if (log.cervixPosition) parts.push(`Cérvix: ${log.cervixPosition}`);
  if (log.sexMethods.length > 0) {
    parts.push(
      `Métodos: ${log.sexMethods
        .map((method) => buildExposureSummary({ id: "x", date, methods: [method], notes: "" }))
        .join(", ")}`,
    );
  }
  return parts;
}

export function summarizeBodySignals(bodySignals: BodySignals) {
  const parts: string[] = [];
  if (bodySignals.basalBodyTemperature.trim()) parts.push(`BBT ${bodySignals.basalBodyTemperature.trim()}`);
  if (bodySignals.cervicalMucus) parts.push(`Moco ${bodySignals.cervicalMucus}`);
  if (bodySignals.cervixPosition) parts.push(`Cérvix ${bodySignals.cervixPosition}`);
  if (bodySignals.stressLevel) parts.push(`Estrés ${bodySignals.stressLevel}`);
  if (bodySignals.sleepQuality) parts.push(`Sueño ${bodySignals.sleepQuality}`);
  if (bodySignals.travelOrIllness) parts.push("viaje/enfermedad");
  if (bodySignals.restingHeartRate.trim()) parts.push(`RHR ${bodySignals.restingHeartRate.trim()}`);
  if (bodySignals.wristTemperatureTrend.trim()) parts.push(`wrist ${bodySignals.wristTemperatureTrend.trim()}`);
  return parts;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function dateFromMonthKey(key: string) {
  const parsed = parseDate(key);
  if (parsed) return parsed;
  return new Date();
}

export function buildMarkdownCopy(events: ReminderEvent[]) {
  return events
    .map((event) => `${event.title}\n${formatDateLong(event.date)} · ${event.timeLabel}\n${event.description}`)
    .join("\n\n");
}
