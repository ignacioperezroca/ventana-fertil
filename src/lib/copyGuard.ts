const FORBIDDEN_PHRASES = [
  "días seguros",
  "sin riesgo",
  "podés tener sexo sin protección",
  "evitá embarazo",
  "probabilidad exacta",
  "método anticonceptivo",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function scanForForbiddenCopy(texts: string[]) {
  const hits: string[] = [];
  for (const text of texts) {
    const normalized = normalize(text);
    for (const phrase of FORBIDDEN_PHRASES) {
      if (normalized.includes(normalize(phrase))) {
        hits.push(phrase);
      }
    }
  }
  return Array.from(new Set(hits));
}

export function warnForbiddenCopy(texts: string[], scope = "Ventana Fértil") {
  if (process.env.NODE_ENV === "production") return [];
  const hits = scanForForbiddenCopy(texts);
  if (hits.length > 0 && typeof console !== "undefined") {
    console.warn(`[copy-guard:${scope}] Forbidden phrases detected:`, hits.join(", "));
  }
  return hits;
}
