const MOTION_PREFERENCE_KEY = "ventana-fertil:motion-preference";

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
    // Ignore storage failures; the app still works with defaults.
  }
}

export function loadMotionPreference() {
  return safeGetItem(MOTION_PREFERENCE_KEY) === "true";
}

export function saveMotionPreference(reduceMotion: boolean) {
  safeSetItem(MOTION_PREFERENCE_KEY, reduceMotion ? "true" : "false");
}

export function getSystemReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getEffectiveReducedMotion(reduceMotionPreference: boolean) {
  return reduceMotionPreference || getSystemReducedMotion();
}
