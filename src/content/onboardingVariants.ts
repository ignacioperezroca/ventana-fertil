export type OnboardingVariant = "A" | "B" | "C";

export interface OnboardingVariantCopy {
  headline: string;
  subheadline: string;
}

export const ONBOARDING_VARIANT_KEY = "ventana-fertil:onboarding-variant";

export const ONBOARDING_VARIANTS: Record<OnboardingVariant, OnboardingVariantCopy> = {
  A: {
    headline: "Calculá tus días más fértiles del mes en segundos.",
    subheadline: "Ingresá cuándo te vino y estimamos tu ventana fértil.",
  },
  B: {
    headline: "Entendé tu ciclo sin vueltas.",
    subheadline: "Una simulación simple, visual y privada.",
  },
  C: {
    headline: "Poné cuándo te vino. Te mostramos el resto.",
    subheadline: "Ovulación estimada, ventana fértil y días clave.",
  },
};

function safeGetItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable on some browsers or private modes.
  }
}

export function getOnboardingVariantCopy(variant: OnboardingVariant) {
  return ONBOARDING_VARIANTS[variant];
}

export function loadOnboardingVariant() {
  const cached = safeGetItem(ONBOARDING_VARIANT_KEY);
  if (cached === "A" || cached === "B" || cached === "C") return cached;
  return null;
}

export function getOrCreateOnboardingVariant() {
  const cached = loadOnboardingVariant();
  if (cached) return cached;

  const variants: OnboardingVariant[] = ["A", "B", "C"];
  const selected = variants[Math.floor(Math.random() * variants.length)] ?? "A";
  safeSetItem(ONBOARDING_VARIANT_KEY, selected);
  return selected;
}
