import { parseDate, diffInDays } from "@/lib/cycle";
import type { SimpleRegularity } from "@/lib/simple-storage";
import type { SimulationResult } from "@/types";

export type PersonalizedStatusTone = "neutral" | "upcoming" | "current" | "past" | "lowConfidence";
export type PersonalResultState = "upcoming" | "current" | "past";

export interface PersonalizationContext {
  hasResult: boolean;
  confidenceLabel?: string;
  cycleRegularity?: SimpleRegularity;
  isDemo?: boolean;
  historyCount?: number;
  resultState?: PersonalResultState;
}

export interface PersonalizedResultMessage {
  title: string;
  subtitle: string;
  actionLabel: string;
  statusTone: PersonalizedStatusTone;
}

export function getResultStateFromSimulation(simulation: SimulationResult): PersonalResultState {
  const today = parseDate(simulation.selectedDate) ?? new Date();
  const fertileStart = parseDate(simulation.fertileWindowStart);
  const fertileEnd = parseDate(simulation.fertileWindowEnd);
  if (!fertileStart || !fertileEnd) return "current";

  if (today < fertileStart) return "upcoming";
  if (today > fertileEnd) return "past";
  return "current";
}

export function getPersonalizedResultMessage(context: PersonalizationContext): PersonalizedResultMessage {
  const lowConfidence =
    context.confidenceLabel?.toLowerCase().includes("baja") ||
    context.cycleRegularity === "irregular" ||
    (typeof context.historyCount === "number" && context.historyCount < 1);

  if (!context.hasResult) {
    return {
      title: "Cargá cuándo te vino para ver tu ventana fértil estimada",
      subtitle: "Con un dato simple te mostramos el resultado del mes, los días más fértiles y el próximo paso.",
      actionLabel: "Calcular ahora",
      statusTone: "neutral",
    };
  }

  if (lowConfidence) {
    return {
      title: "La estimación puede moverse",
      subtitle: context.isDemo
        ? "Es un ejemplo visual para probar la app. La ovulación real puede variar."
        : "Confianza baja: si el ciclo cambia, la ventana fértil puede moverse algunos días.",
      actionLabel: "Ver escenarios",
      statusTone: "lowConfidence",
    };
  }

  switch (context.resultState) {
    case "upcoming":
      return {
        title: "Tu ventana fértil estimada empieza pronto",
        subtitle: "Guardá recordatorios para mirar los días clave con tiempo.",
        actionLabel: "Guardar recordatorios",
        statusTone: "upcoming",
      };
    case "past":
      return {
        title: "La ventana fértil estimada de este ciclo ya pasó",
        subtitle: "Cuando vuelva a venirte, cargá el nuevo período para actualizar la lectura.",
        actionLabel: "Cargar próximo período",
        statusTone: "past",
      };
    default:
      return {
        title: "Estás dentro de tu ventana fértil estimada",
        subtitle: "Mirar los días de mayor fertilidad te ayuda a leer mejor el mes.",
        actionLabel: "Ver días de mayor fertilidad",
        statusTone: "current",
      };
  }
}

export function getConfidenceBucket(label?: string) {
  const normalized = label?.toLowerCase() ?? "";
  if (normalized.includes("baja")) return "low";
  if (normalized.includes("alta")) return "high";
  return "medium";
}

export function getResultStateFromDates(selectedDate: string, fertileStart: string, fertileEnd: string): PersonalResultState {
  const current = parseDate(selectedDate) ?? new Date();
  const start = parseDate(fertileStart);
  const end = parseDate(fertileEnd);
  if (!start || !end) return "current";
  if (diffInDays(current, start) < 0) return "upcoming";
  if (diffInDays(current, end) > 0) return "past";
  return "current";
}
