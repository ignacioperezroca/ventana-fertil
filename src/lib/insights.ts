import { getRiskLabel } from "@/lib/cycle";

export interface DailyInsightInput {
  currentCycleDay: number | null;
  relationToOvulation: number | null;
  timingMarker: number;
  confidenceLevel: string;
  uncertaintyScore: number;
  cycleVariability: number;
  exposureDates?: string[];
  isDemo?: boolean;
}

export interface DailyInsightResult {
  title: string;
  summary: string;
  status: string;
  level: string;
  recommendedAction: string;
  visualLabel: string;
}

function hasHighUncertainty(input: DailyInsightInput) {
  return input.uncertaintyScore >= 70 || input.cycleVariability >= 4 || input.confidenceLevel === "low" || input.confidenceLevel === "very-low";
}

export function buildDailyInsight(input: DailyInsightInput): DailyInsightResult {
  const exposureCount = input.exposureDates?.length ?? 0;
  const markerLabel = getRiskLabel(input.timingMarker);

  if (hasHighUncertainty(input)) {
    return {
      title: "La estimación tiene alta incertidumbre",
      summary: input.cycleVariability >= 4
        ? "El ciclo varía lo suficiente como para que la ventana pueda moverse."
        : "Hay poco margen para leer este día con precisión; conviene mirar la ventana conservadora.",
      status: "Incertidumbre alta",
      level: markerLabel,
      recommendedAction: "Ver ventana conservadora",
      visualLabel: "Ventana móvil",
    };
  }

  if (input.relationToOvulation === null) {
    return {
      title: "Todavía no hay datos suficientes para leer hoy",
      summary: "Cuando completes el ciclo, vas a ver el día de hoy con más contexto.",
      status: "Sin datos suficientes",
      level: "Bajo",
      recommendedAction: input.isDemo ? "Usar mis datos" : "Cargar datos",
      visualLabel: "Lectura pendiente",
    };
  }

  if (input.relationToOvulation >= -3 && input.relationToOvulation <= -2) {
    return {
      title: "Hoy cae en una zona de mayor atención",
      summary: "Este momento suele quedar cerca del pico del marcador por timing.",
      status: "Zona pico",
      level: markerLabel,
      recommendedAction: "Ver explicación",
      visualLabel: "Pico estimado",
    };
  }

  if (input.relationToOvulation >= -1 && input.relationToOvulation <= 1) {
    return {
      title: "Hoy está muy cerca de la ovulación estimada",
      summary: "La lectura del calendario queda especialmente sensible al corrimiento de la ovulación.",
      status: "Cerca de ovulación",
      level: markerLabel,
      recommendedAction: "Revisar la incertidumbre",
      visualLabel: "Zona sensible",
    };
  }

  if (input.relationToOvulation < -6 || input.relationToOvulation > 1) {
    return {
      title: "Hoy parece estar fuera de la ventana fértil estimada",
      summary: "El marcador por timing es bajo si la ovulación estimada es correcta.",
      status: exposureCount > 0 ? "Fuera de ventana con contexto" : "Fuera de ventana estimada",
      level: markerLabel,
      recommendedAction: input.uncertaintyScore >= 45 ? "Revisá la incertidumbre del ciclo" : "Ver calendario",
      visualLabel: "Marcador bajo",
    };
  }

  return {
    title: "Hoy sigue dentro de la ventana fértil estimada",
    summary: "El marcador por timing todavía se lee con atención porque el ciclo está dentro del tramo base.",
    status: "Ventana fértil estimada",
    level: markerLabel,
    recommendedAction: "Ver explicación",
    visualLabel: "Ventana abierta",
  };
}
