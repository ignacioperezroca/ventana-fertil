import { addDays, formatDateLong, formatDateShort, parseDate } from "@/lib/cycle";
import type { ExposureEntry, SimulationResult } from "@/types";

export interface ScenarioCard {
  id: string;
  title: string;
  shiftDays: number;
  ovulationLabel: string;
  fertileWindowLabel: string;
  peakLabel: string;
  exposureLabel: string;
  confidenceImpact: "Baja" | "Media" | "Alta";
  summary: string;
}

export interface SimpleScenarioPreviewCard {
  id: string;
  title: string;
  ovulationLabel: string;
  fertileWindowLabel: string;
  peakLabel: string;
  summary: string;
}

export function buildScenarioCards(simulation: SimulationResult, exposures: ExposureEntry[]) {
  const ovulationDate = parseDate(simulation.ovulationDate);
  if (!ovulationDate) return [] as ScenarioCard[];

  const shifts = [-4, -2, 0, 2, 4];
  return shifts.map((shiftDays) => {
    const shiftedOvulation = addDays(ovulationDate, shiftDays);
    const fertileStart = addDays(shiftedOvulation, -6);
    const fertileEnd = addDays(shiftedOvulation, 1);
    const peakStart = addDays(shiftedOvulation, -4);
    const peakEnd = addDays(shiftedOvulation, -1);
    const exposureCount = exposures.filter((entry) => {
      const date = parseDate(entry.date);
      return Boolean(date && date >= fertileStart && date <= fertileEnd);
    }).length;

    const confidenceImpact: ScenarioCard["confidenceImpact"] = Math.abs(shiftDays) >= 4 ? "Alta" : Math.abs(shiftDays) === 2 ? "Media" : "Baja";
    const direction = shiftDays === 0 ? "Estimación base" : shiftDays > 0 ? `Ovulación ${shiftDays} días después` : `Ovulación ${Math.abs(shiftDays)} días antes`;
    const exposureLabel = exposureCount > 0 ? `${exposureCount} fecha(s) relevante(s) dentro` : "Sin fechas relevantes dentro";

    return {
      id: `scenario-${shiftDays}`,
      title: direction,
      shiftDays,
      ovulationLabel: `Ovulación: ${formatDateShort(shiftedOvulation)}`,
      fertileWindowLabel: `${formatDateShort(fertileStart)} → ${formatDateShort(fertileEnd)}`,
      peakLabel: `${formatDateShort(peakStart)} → ${formatDateShort(peakEnd)}`,
      exposureLabel,
      confidenceImpact,
      summary: shiftDays === 0
        ? "Este es el escenario base que usa la simulación actual."
        : "Este simulador muestra por qué el calendario puede fallar cuando la ovulación se mueve.",
    } satisfies ScenarioCard;
  });
}

export function getScenarioSummary(scenario: ScenarioCard) {
  return `${scenario.title} · Ventana ${scenario.fertileWindowLabel} · Pico ${scenario.peakLabel}`;
}

export function getScenarioShiftLabel(shiftDays: number) {
  if (shiftDays === 0) return "Base";
  return shiftDays > 0 ? `+${shiftDays}` : `${shiftDays}`;
}

export function explainScenarioWindow(simulation: SimulationResult) {
  const ovulationDate = parseDate(simulation.ovulationDate);
  if (!ovulationDate) return "No hay una ovulación calculada para simular escenarios.";
  return `La ventana base va de ${formatDateLong(simulation.fertileWindowStart)} a ${formatDateLong(simulation.fertileWindowEnd)}.`;
}

export function getScenarioExposureState(scenario: ScenarioCard) {
  return scenario.exposureLabel;
}

export function getScenarioConfidenceHint(scenario: ScenarioCard) {
  return scenario.confidenceImpact === "Alta"
    ? "El corrimiento cambia bastante la lectura."
    : scenario.confidenceImpact === "Media"
      ? "La lectura cambia lo suficiente como para mirarla con cuidado."
      : "El corrimiento es pequeño y el escenario base casi no cambia.";
}

export function getScenarioWindowLabel(scenario: ScenarioCard) {
  return scenario.fertileWindowLabel;
}

export function getScenarioPeakLabel(scenario: ScenarioCard) {
  return scenario.peakLabel;
}

export function getScenarioExposureCount(scenario: ScenarioCard) {
  const match = scenario.exposureLabel.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function getScenarioShiftSummary() {
  return `La ventana fértil estimada se mueve si la ovulación se adelanta o atrasa.`;
}

export function buildSimpleScenarioPreviewCards(simulation: SimulationResult) {
  const ovulationDate = parseDate(simulation.ovulationDate);
  if (!ovulationDate) return [] as SimpleScenarioPreviewCard[];

  return [-2, 0, 2].map((shiftDays) => {
    const shiftedOvulation = addDays(ovulationDate, shiftDays);
    const fertileStart = addDays(shiftedOvulation, -6);
    const fertileEnd = addDays(shiftedOvulation, 1);
    const peakStart = addDays(shiftedOvulation, -4);
    const peakEnd = addDays(shiftedOvulation, -1);

    return {
      id: `simple-scenario-${shiftDays}`,
      title: shiftDays === 0 ? "Estimación base" : shiftDays > 0 ? `Ovulación ${shiftDays} días después` : `Ovulación ${Math.abs(shiftDays)} días antes`,
      ovulationLabel: `Ovulación: ${formatDateShort(shiftedOvulation)}`,
      fertileWindowLabel: `${formatDateShort(fertileStart)} al ${formatDateShort(fertileEnd)}`,
      peakLabel: `${formatDateShort(peakStart)} al ${formatDateShort(peakEnd)}`,
      summary: shiftDays === 0
        ? "Este es el escenario base de la simulación."
        : "Este escenario muestra cómo cambian los días si la ovulación se mueve.",
    } satisfies SimpleScenarioPreviewCard;
  });
}
