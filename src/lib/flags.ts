export interface FeatureFlags {
  enableAdvancedSignals: boolean;
  enableShareCard: boolean;
  enableInstallPrompt: boolean;
  enableAnalyticsDebug: boolean;
  enableEducationCards: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableAdvancedSignals: true,
  enableShareCard: true,
  enableInstallPrompt: true,
  enableAnalyticsDebug: false,
  enableEducationCards: true,
};

function parseFlag(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function readLocalOverrides() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("ventana-fertil:flags");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getFeatureFlags(): FeatureFlags {
  const local = readLocalOverrides();

  return {
    enableAdvancedSignals: parseFlag(process.env.NEXT_PUBLIC_ENABLE_ADVANCED_SIGNALS, local.enableAdvancedSignals ?? DEFAULT_FLAGS.enableAdvancedSignals),
    enableShareCard: parseFlag(process.env.NEXT_PUBLIC_ENABLE_SHARE_CARD, local.enableShareCard ?? DEFAULT_FLAGS.enableShareCard),
    enableInstallPrompt: parseFlag(process.env.NEXT_PUBLIC_ENABLE_INSTALL_PROMPT, local.enableInstallPrompt ?? DEFAULT_FLAGS.enableInstallPrompt),
    enableAnalyticsDebug: parseFlag(process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_DEBUG, local.enableAnalyticsDebug ?? DEFAULT_FLAGS.enableAnalyticsDebug),
    enableEducationCards: parseFlag(process.env.NEXT_PUBLIC_ENABLE_EDUCATION_CARDS, local.enableEducationCards ?? DEFAULT_FLAGS.enableEducationCards),
  };
}
