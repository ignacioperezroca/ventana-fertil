export { SEO_DESCRIPTION, SEO_TITLE } from "@/lib/metadata";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Qué es la ventana fértil?",
    answer: "Es el tramo del ciclo en el que el día se lee con más atención porque se acerca la ovulación estimada.",
  },
  {
    question: "Cómo se estima la ovulación?",
    answer: "Con el primer día del último período y la duración promedio del ciclo, usando una simulación educativa.",
  },
  {
    question: "Cuáles suelen ser los días más fértiles?",
    answer: "Suelen aparecer en los días previos a la ovulación estimada, con un pico alrededor de O-3 a O-1.",
  },
  {
    question: "Por qué la ovulación puede moverse?",
    answer: "Porque el ciclo puede cambiar por estrés, enfermedad, viajes, sueño o variaciones hormonales.",
  },
  {
    question: "Esto sirve como anticoncepción?",
    answer: "No. Es una herramienta educativa y no debe usarse como anticoncepción ni reemplaza consulta médica.",
  },
  {
    question: "Qué significa marcador estimado?",
    answer: "Es un nivel educativo por día, no una lectura personal definitiva.",
  },
  {
    question: "Puedo compartir el resultado?",
    answer: "Sí, podés compartir el resultado por WhatsApp o copiar un resumen que no expone datos íntimos por defecto.",
  },
  {
    question: "Puedo guardar recordatorios?",
    answer: "Sí, podés bajar eventos .ics para el mes actual y un recordatorio del próximo período.",
  },
  {
    question: "Cuándo conviene consultar?",
    answer: "Si la lectura genera dudas, si hubo una situación reciente de preocupación o si querés una orientación profesional.",
  },
];

export function buildFaqJsonLd(items: FaqItem[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
