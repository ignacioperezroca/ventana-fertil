export interface StoryCardContent {
  id: string;
  title: string;
  icon: string;
  slides: string[];
  takeaway: string;
}

export const storyCards: StoryCardContent[] = [
  {
    id: "pico-antes",
    title: "Por qué el pico aparece antes de ovular?",
    icon: "🔥",
    slides: [
      "El marcador por timing sube antes del día O.",
      "O-3 y O-2 suelen quedar cerca del punto más alto.",
      "Después de ovular, la curva vuelve a bajar.",
    ],
    takeaway: "La lectura fuerte suele venir antes de la ovulación estimada.",
  },
  {
    id: "ovulacion-mueve",
    title: "Qué significa que la ovulación se mueva?",
    icon: "🌊",
    slides: [
      "El calendario se apoya en una fecha estimada.",
      "Si la ovulación cambia, toda la ventana se corre.",
      "Por eso la incertidumbre importa tanto como el marcador.",
    ],
    takeaway: "No hay una fecha fija: hay una estimación con margen.",
  },
  {
    id: "calendario-no-alcanza",
    title: "Por qué el calendario no alcanza?",
    icon: "🗓️",
    slides: [
      "El ciclo real no siempre repite el promedio.",
      "Sueño, estrés, viaje o enfermedad pueden moverlo.",
      "La app suma contexto para leer mejor ese margen.",
    ],
    takeaway: "El calendario ayuda, pero no ve todo solo.",
  },
  {
    id: "datos-ayudan",
    title: "Qué datos ayudan a estimar mejor?",
    icon: "📍",
    slides: [
      "BBT, LH y notas cortas aportan contexto útil.",
      "Las señales corporales no son una orden: son pistas.",
      "Con pocos datos ya podés empezar a leer el ciclo.",
    ],
    takeaway: "Más contexto suele mejorar la lectura, sin volverla exacta.",
  },
  {
    id: "consultar",
    title: "Cuándo consultar?",
    icon: "💬",
    slides: [
      "Si algo te preocupa, no esperes a que la app lo resuelva.",
      "Los cambios importantes del ciclo merecen consulta profesional.",
      "La app acompaña; no reemplaza una evaluación médica.",
    ],
    takeaway: "La app orienta; la consulta te da contexto clínico.",
  },
];
