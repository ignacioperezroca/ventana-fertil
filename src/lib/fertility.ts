import { addDays, buildIcsFile, calculateSimulation, clamp, diffInDays, formatDateInput, formatDateShort, getRiskLabel, getRiskTone, parseDate } from "@/lib/cycle";
import { createDefaultState } from "@/lib/storage";
import type { SimulationResult, VentanaFertilState } from "@/types";
import type { SimpleCoreState, SimpleRegularity } from "@/lib/simple-storage";

export function getRegularityLabel(regularity: SimpleRegularity) {
  if (regularity === "algo_variable") return "Algo variable";
  if (regularity === "irregular") return "Irregular / no sé";
  return "Regular";
}

export function getRegularityConfidence(regularity: SimpleRegularity) {
  if (regularity === "algo_variable") return "Media";
  if (regularity === "irregular") return "Baja";
  return "Media-alta";
}

export function buildFullState(simple: SimpleCoreState): VentanaFertilState {
  const today = new Date();
  const base = createDefaultState();
  const average = Number.isFinite(simple.averageCycleLength) ? simple.averageCycleLength : 28;
  const regularity = simple.regularity;
  const spread = regularity === "irregular" ? 4 : regularity === "algo_variable" ? 2 : 1;
  const minimumCycleLength = clamp(average - spread, 21, 45);
  const maximumCycleLength = clamp(average + spread, 21, 45);

  return {
    ...base,
    currentStep: 1,
    selectedDate: formatDateInput(today),
    calendarMonth: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    isDemo: simple.isDemo,
    lastPeriodStart: simple.lastPeriodStart,
    averageCycleLength: average,
    minimumCycleLength,
    maximumCycleLength,
    regularity,
    ovulationMethod: "calendar",
    knownOvulationDate: "",
    lhSurgeDate: "",
    lhResult: "",
    exposureEntries: [],
    dailyLogs: {},
  };
}

export function calculateSimpleSimulation(simple: SimpleCoreState) {
  const fullState = buildFullState(simple);
  const simulation = calculateSimulation(fullState);
  return {
    fullState,
    simulation,
    cycleStart: parseDate(simple.lastPeriodStart),
    ovulationDate: parseDate(simulation.ovulationDate),
    fertileStart: parseDate(simulation.fertileWindowStart),
    fertileEnd: parseDate(simulation.fertileWindowEnd),
    peakStart: parseDate(simulation.peakWindowStart),
    peakEnd: parseDate(simulation.peakWindowEnd),
    conservativeStart: parseDate(simulation.conservativeWindowStart),
    conservativeEnd: parseDate(simulation.conservativeWindowEnd),
    selectedDate: parseDate(simulation.selectedDate),
  };
}

export function getPeakDates(simulation: SimulationResult) {
  const ovulation = parseDate(simulation.ovulationDate);
  if (!ovulation) return [];
  return [-4, -3, -2, -1].map((offset) => formatDateInput(addDays(ovulation, offset)));
}

export function getFertileRangeText(simulation: SimulationResult) {
  const start = parseDate(simulation.fertileWindowStart);
  const end = parseDate(simulation.fertileWindowEnd);
  if (!start || !end) return "—";
  return `${formatDateShort(start)} al ${formatDateShort(end)}`;
}

export function getOvulationText(simulation: SimulationResult) {
  const date = parseDate(simulation.ovulationDate);
  return date ? formatDateShort(date) : "—";
}

export function getSimpleStatusLabel(simulation: SimulationResult) {
  if (!simulation.valid) return "Cargá tus datos";
  const today = parseDate(simulation.selectedDate) ?? new Date();
  const fertileStart = parseDate(simulation.fertileWindowStart);
  const fertileEnd = parseDate(simulation.fertileWindowEnd);
  const peakStart = parseDate(simulation.peakWindowStart);
  const peakEnd = parseDate(simulation.peakWindowEnd);
  const ovulation = parseDate(simulation.ovulationDate);
  if (ovulation && diffInDays(today, ovulation) === 0) return "Ovulación estimada";
  if (peakStart && peakEnd && today >= peakStart && today <= peakEnd) return "Día de mayor fertilidad";
  if (fertileStart && fertileEnd && today >= fertileStart && today <= fertileEnd) return "Ventana fértil estimada";
  if (fertileStart && today < fertileStart) return "Antes de la ventana";
  if (fertileEnd && today > fertileEnd) return "Después de la ventana";
  return "Ventana fértil estimada";
}

export function getTimingMarkerLabel(simulation: SimulationResult) {
  if (!simulation.valid) return "Sin datos";
  return `${simulation.selectedMarkerPercent.toFixed(1)}%`;
}

export function buildSimulationIcs(simulation: SimulationResult) {
  return buildIcsFile(simulation.reminders);
}

export function buildReminderPreview(simulation: SimulationResult) {
  return simulation.reminders.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    timeLabel: event.timeLabel,
  }));
}

export function projectSimulationShift(simulation: SimulationResult, shiftDays: number) {
  const ovulation = parseDate(simulation.ovulationDate);
  if (!ovulation || shiftDays === 0) return simulation;

  const shiftedOvulation = addDays(ovulation, shiftDays);
  const shiftDate = (value: string) => {
    const parsed = parseDate(value);
    return parsed ? formatDateInput(addDays(parsed, shiftDays)) : value;
  };

  const selectedDate = parseDate(simulation.selectedDate);
  const shiftedSelectedOffset = selectedDate ? diffInDays(selectedDate, shiftedOvulation) : simulation.selectedDateOffset;
  const marker = simulation.riskTable.find((entry) => entry.offset === shiftedSelectedOffset);
  const selectedMarkerPercent = marker?.percent ?? 0;
  const selectedRiskTone = getRiskTone(selectedMarkerPercent);
  const selectedRiskLabel = getRiskLabel(selectedMarkerPercent);

  return {
    ...simulation,
    ovulationDate: formatDateInput(shiftedOvulation),
    fertileWindowStart: shiftDate(simulation.fertileWindowStart),
    fertileWindowEnd: shiftDate(simulation.fertileWindowEnd),
    peakWindowStart: shiftDate(simulation.peakWindowStart),
    peakWindowEnd: shiftDate(simulation.peakWindowEnd),
    conservativeWindowStart: shiftDate(simulation.conservativeWindowStart),
    conservativeWindowEnd: shiftDate(simulation.conservativeWindowEnd),
    selectedDateOffset: shiftedSelectedOffset,
    selectedMarkerPercent,
    selectedRiskTone,
    selectedRiskLabel,
  } satisfies SimulationResult;
}
