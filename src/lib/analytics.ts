type AnalyticsPropertyValue = string | number | boolean | null | undefined;

export type DeviceCategory = "mobile" | "tablet" | "desktop";

export interface AnalyticsProperties {
  hasSimulation?: boolean;
  hasResult?: boolean;
  confidenceLevel?: string;
  confidenceBucket?: "high" | "medium" | "low";
  resultState?: "upcoming" | "current" | "past" | "lowConfidence" | "neutral";
  uncertaintyBucket?: string;
  tabName?: string;
  source?: string;
  isDemo?: boolean;
  deviceCategory?: DeviceCategory;
  eventVersion?: string;
  variant?: "A" | "B" | "C";
  feedbackRating?: "yes" | "neutral" | "no";
}

const ALLOWED_KEYS = new Set<keyof AnalyticsProperties>([
  "hasSimulation",
  "hasResult",
  "confidenceLevel",
  "confidenceBucket",
  "resultState",
  "uncertaintyBucket",
  "tabName",
  "source",
  "isDemo",
  "deviceCategory",
  "eventVersion",
  "variant",
  "feedbackRating",
]);

const ALLOWED_EVENTS = new Set([
  "app_loaded",
  "calculate_clicked",
  "result_generated",
  "demo_loaded",
  "whatsapp_share_clicked",
  "share_result_clicked",
  "share_app_clicked",
  "whatsapp_result_clicked",
  "whatsapp_app_clicked",
  "copy_result_clicked",
  "generic_share_clicked",
  "calendar_window_downloaded",
  "calendar_downloaded",
  "ics_downloaded",
  "next_period_reminder_downloaded",
  "faq_opened",
  "tab_viewed",
  "onboarding_started",
  "onboarding_variant_seen",
  "onboarding_completed",
  "cycle_saved",
  "timing_viewed",
  "calendar_day_opened",
  "date_shortcut_selected",
  "data_exported",
  "data_imported",
  "data_deleted",
  "privacy_panel_opened",
  "share_card_generated",
  "daily_insight_viewed",
  "scenario_simulator_opened",
  "scenario_preview_opened",
  "low_anxiety_mode_enabled",
  "partner_share_copied",
  "cycle_snapshot_saved",
  "daily_checkin_saved",
  "story_card_viewed",
  "public_share_clicked",
  "privacy_details_opened",
  "trust_drawer_opened",
  "feedback_clicked",
  "feedback_submitted",
  "privacy_opened",
  "install_prompt_clicked",
]);

const ENABLED_IN_PRODUCTION = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";

export function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => ALLOWED_KEYS.has(key as keyof AnalyticsProperties))
      .map(([key, value]) => [key, sanitizeValue(value)]),
  ) as Record<string, AnalyticsPropertyValue>;
}

function sanitizeValue(value: AnalyticsPropertyValue) {
  if (typeof value === "string" || typeof value === "boolean" || typeof value === "number" || value == null) {
    return value;
  }
  return undefined;
}

function canTrack() {
  return typeof window !== "undefined" && (process.env.NODE_ENV !== "production" || ENABLED_IN_PRODUCTION);
}

export function getDeviceCategory(): DeviceCategory {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}) {
  if (!canTrack()) return;
  if (!ALLOWED_EVENTS.has(eventName)) return;

  const safeProperties = sanitizeAnalyticsProperties({
    ...properties,
    deviceCategory: properties.deviceCategory ?? getDeviceCategory(),
    eventVersion: properties.eventVersion ?? "g1",
  });

  // Important: Never send dates, notes, LH, BBT, exposure details, or any other sensitive reproductive data.
  // Analytics is only allowed to observe product-level usage, not health content.
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", eventName, safeProperties);
  } else if (ENABLED_IN_PRODUCTION) {
    console.info("[analytics]", eventName, safeProperties);
  }
}
