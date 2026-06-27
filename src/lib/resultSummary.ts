import { addDays, formatDateLong, formatDateShort, parseDate } from "@/lib/cycle";
import { getRegularityConfidence, getRegularityLabel } from "@/lib/fertility";
import type { SimpleRegularity } from "@/lib/simple-storage";
import type { SimulationResult } from "@/types";

export interface MonthlyActionPlan {
  title: string;
  summary: string;
  nextKeyDateLabel: string;
  fertileWindowLabel: string;
  peakDaysLabel: string;
  confidenceLabel: string;
  suggestedAction: string;
  stateLabel: "upcoming" | "inside" | "passed";
}

export interface ConfidenceExplainerData {
  label: "Alta" | "Media" | "Baja";
  summary: string;
  meter: number;
  details: string[];
}

export interface ScenarioPreviewCard {
  id: string;
  title: string;
  ovulationLabel: string;
  fertileWindowLabel: string;
  peakLabel: string;
  summary: string;
}

export function getNextPeriodDate(lastPeriodStart: string, averageCycleLength: number) {
  const start = parseDate(lastPeriodStart);
  if (!start || !Number.isFinite(averageCycleLength)) return null;
  return addDays(start, averageCycleLength);
}

function getPeakDaysLabel(simulation: SimulationResult) {
  const ovulation = parseDate(simulation.ovulationDate);
  if (!ovulation) return "—";
  const days = [-4, -3, -2, -1].map((offset) => formatDateShort(addDays(ovulation, offset)));
  return days.join(" · ");
}

export function buildMonthlyActionPlan(simulation: SimulationResult): MonthlyActionPlan | null {
  if (!simulation.valid) return null;

  const today = parseDate(simulation.selectedDate) ?? new Date();
  const fertileStart = parseDate(simulation.fertileWindowStart);
  const fertileEnd = parseDate(simulation.fertileWindowEnd);
  const peakStart = parseDate(simulation.peakWindowStart);
  const ovulation = parseDate(simulation.ovulationDate);

  if (!fertileStart || !fertileEnd || !ovulation) return null;

  let stateLabel: MonthlyActionPlan["stateLabel"] = "passed";
  let title = `La ventana fértil estimada de este ciclo ya pasó`;
  let suggestedAction = "Cargar próximo período cuando empiece";
  let nextKeyDateLabel = formatDateLong(ovulation);

  if (today < fertileStart) {
    stateLabel = "upcoming";
    title = `Tu próxima ventana fértil empieza el ${formatDateShort(fertileStart)}`;
    suggestedAction = "Guardá recordatorios";
    nextKeyDateLabel = formatDateLong(peakStart ?? fertileStart);
  } else if (today >= fertileStart && today <= fertileEnd) {
    stateLabel = "inside";
    title = "Estás dentro de la ventana fértil estimada";
    suggestedAction = "Ver días de mayor fertilidad";
    nextKeyDateLabel = formatDateLong(peakStart ?? ovulation);
  }

  return {
    title,
    summary: "Un resumen corto para saber qué mirar este mes sin leer una tabla larga.",
    nextKeyDateLabel,
    fertileWindowLabel: `${formatDateShort(fertileStart)} al ${formatDateShort(fertileEnd)}`,
    peakDaysLabel: getPeakDaysLabel(simulation),
    confidenceLabel: simulation.confidenceBand || "Media",
    suggestedAction,
    stateLabel,
  };
}

export function buildConfidenceExplainer(
  simulation: SimulationResult,
  entryCount: number,
  regularity: SimpleRegularity,
): ConfidenceExplainerData {
  const hasHistory = entryCount >= 3;
  const regularConfidence = getRegularityConfidence(regularity);

  if (hasHistory && regularity === "regular") {
    return {
      label: "Alta",
      meter: 86,
      summary: "Confianza alta: hay 3 o más ciclos guardados y la variación parece baja.",
      details: [
        "El historial local ayuda a afinar la lectura.",
        "La ovulación puede moverse, pero el margen es menor.",
        `Regularidad detectada: ${getRegularityLabel(regularity)}.`,
      ],
    };
  }

  if (regularity === "irregular") {
    return {
      label: "Baja",
      meter: 32,
      summary: "Confianza baja: si el ciclo es irregular, la ovulación puede moverse.",
      details: [
        "Hay poco historial local o el ciclo cambia más.",
        "La ventana fértil puede correrse algunos días.",
        `Regularidad detectada: ${getRegularityLabel(regularity)}.`,
      ],
    };
  }

  return {
    label: "Media",
    meter: 60,
    summary:
      simulation.confidenceBand === "Alta"
        ? "Confianza media-alta: usamos una duración promedio del ciclo."
        : "Confianza media: usamos una duración promedio del ciclo.",
    details: [
      `Confianza base del simulador: ${regularConfidence}.`,
      "La ovulación puede moverse si cambian las condiciones del ciclo.",
      "Más ciclos guardados ayudan a mejorar la lectura.",
    ],
  };
}

export function buildScenarioPreviewCopy(simulation: SimulationResult, shiftDays: number) {
  const ovulation = parseDate(simulation.ovulationDate);
  if (!ovulation) return null;

  const shiftedOvulation = addDays(ovulation, shiftDays);
  const fertileStart = addDays(shiftedOvulation, -6);
  const fertileEnd = addDays(shiftedOvulation, 1);
  const peakStart = addDays(shiftedOvulation, -4);
  const peakEnd = addDays(shiftedOvulation, -1);

  return {
    id: `scenario-${shiftDays}`,
    title: shiftDays === 0 ? "Estimación base" : shiftDays > 0 ? `Ovulación ${shiftDays} días después` : `Ovulación ${Math.abs(shiftDays)} días antes`,
    ovulationLabel: `Ovulación: ${formatDateShort(shiftedOvulation)}`,
    fertileWindowLabel: `${formatDateShort(fertileStart)} al ${formatDateShort(fertileEnd)}`,
    peakLabel: `${formatDateShort(peakStart)} al ${formatDateShort(peakEnd)}`,
    summary: shiftDays === 0
      ? "Este es el escenario base de la simulación."
      : "Este escenario muestra cómo cambian los días si la ovulación se mueve.",
  } satisfies ScenarioPreviewCard;
}

export function buildScenarioPreviewCards(simulation: SimulationResult) {
  return [-2, 0, 2].map((shiftDays) => buildScenarioPreviewCopy(simulation, shiftDays)).filter((card): card is ScenarioPreviewCard => Boolean(card));
}
