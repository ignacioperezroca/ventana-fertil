export type EducationLevel = "basic" | "intermediate";

export interface EducationCard {
  id: string;
  title: string;
  short: string;
  body: string;
  level: EducationLevel;
  tags: string[];
}

export const educationContentGroups = {
  ventanaFertil: [
    {
      id: "ventana-fertil-que-es",
      title: "Qué es la ventana fértil?",
      short: "Es el tramo del ciclo donde el marcador por timing suele subir.",
      body: "Es una estimación visual del período alrededor de la ovulación. No es una predicción exacta ni reemplaza consulta médica.",
      level: "basic",
      tags: ["ventana fértil", "timing"],
    },
    {
      id: "ventana-fertil-pico",
      title: "Por qué el mayor marcador suele aparecer antes de ovular?",
      short: "Porque el pico del modelo se concentra en los días previos.",
      body: "En el modelo de timing, el marcador sube alrededor de O-3 y O-2 y luego baja después de ovular.",
      level: "basic",
      tags: ["ovulación", "marcador"],
    },
  ],
  ovulacion: [
    {
      id: "ovulacion-move",
      title: "Por qué puede moverse la ovulación?",
      short: "Porque el ciclo no repite siempre el mismo patrón.",
      body: "Estrés, viaje, enfermedad y variaciones propias del ciclo pueden mover la estimación algunos días.",
      level: "basic",
      tags: ["ovulación", "variabilidad"],
    },
    {
      id: "ovulacion-datos",
      title: "Qué datos ayudan a mejorar contexto?",
      short: "LMP, LH, BBT y notas pueden dar más contexto, sin volverlo exacto.",
      body: "Cuanto mejor sea el registro, más útil es la explicación, aunque la herramienta sigue siendo educativa.",
      level: "intermediate",
      tags: ["LH", "BBT", "contexto"],
    },
  ],
  incertidumbre: [
    {
      id: "incertidumbre-que-es",
      title: "Qué significa incertidumbre del ciclo?",
      short: "Es el margen que puede mover la ventana estimada.",
      body: "Si el ciclo es variable o irregular, el calendario necesita leerse con más margen y menos confianza.",
      level: "basic",
      tags: ["incertidumbre", "confianza"],
    },
    {
      id: "incertidumbre-consulta",
      title: "Cuándo conviene consultar?",
      short: "Si el ciclo cambia mucho o algo te preocupa.",
      body: "Si hay dolor importante, dudas sobre anticoncepción o necesidad de una mirada clínica, conviene hablar con ginecología, médica/o o farmacia.",
      level: "basic",
      tags: ["consulta", "seguridad"],
    },
  ],
  timing: [
    {
      id: "timing-cluster",
      title: "Qué significa el timing alrededor de la ovulación?",
      short: "El marcador por timing mira el día relativo a O.",
      body: "La ventana base va de O-6 a O+1 y el cluster pico se concentra de O-4 a O-1.",
      level: "basic",
      tags: ["timing", "O-day"],
    },
    {
      id: "timing-emergencia",
      title: "Qué hacer si hubo una situación reciente de preocupación?",
      short: "Consultar pronto ayuda a decidir el siguiente paso.",
      body: "Si hubo sexo sin protección en los últimos 5 días, conviene consultar a farmacia o ginecología cuanto antes para hablar de anticoncepción de emergencia.",
      level: "basic",
      tags: ["urgencia", "consulta"],
    },
  ],
  recordatorios: [
    {
      id: "recordatorios-ics",
      title: "Para qué sirven los recordatorios?",
      short: "Ayudan a seguir la simulación sin tener que volver a pensarla cada día.",
      body: "Los recordatorios .ics son una ayuda práctica. No cambian la interpretación de la herramienta.",
      level: "basic",
      tags: ["ics", "recordatorios"],
    },
    {
      id: "recordatorios-test",
      title: "Cuándo puede servir un test de embarazo?",
      short: "Suele tener más sentido desde el primer día de atraso.",
      body: "Como orientación general, muchas personas lo hacen desde el primer día de atraso o unos 14 días después de la relación.",
      level: "basic",
      tags: ["test", "atraso"],
    },
  ],
  privacidad: [
    {
      id: "privacidad-local",
      title: "Por qué esto es privado?",
      short: "Porque los datos quedan en tu navegador.",
      body: "No hay cuenta, no hay backend para el MVP y podés exportar o borrar todo cuando quieras.",
      level: "basic",
      tags: ["privacidad", "local"],
    },
  ],
  cuandoConsultar: [
    {
      id: "consultar-dolor",
      title: "Cuándo conviene consultar?",
      short: "Si algo te preocupa o el ciclo cambió mucho.",
      body: "La app acompaña, pero no reemplaza una consulta cuando hay síntomas importantes, dudas de salud o necesidad de anticoncepción.",
      level: "basic",
      tags: ["consulta", "salud"],
    },
  ],
} satisfies Record<string, EducationCard[]>;
