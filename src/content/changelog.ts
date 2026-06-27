export interface ChangelogEntry {
  version: string;
  title: string;
  summary: string;
}

export const CHANGELOG_ITEMS: ChangelogEntry[] = [
  {
    version: "1",
    title: "Cálculo simple de ventana fértil",
    summary: "Un input, un resultado claro y marcadores educativos por timing.",
  },
  {
    version: "2",
    title: "Compartir por WhatsApp",
    summary: "Resultados listos para compartir sin exponer datos íntimos por defecto.",
  },
  {
    version: "3",
    title: "Recordatorios de calendario",
    summary: "Eventos .ics para tu ventana fértil y el próximo período estimado.",
  },
  {
    version: "4",
    title: "Privacidad local",
    summary: "Los datos quedan en este navegador y podés borrarlos cuando quieras.",
  },
];
