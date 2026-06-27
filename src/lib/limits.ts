export const FREE_LIMITS = {
  activeCycles: 1,
  cloudDailyLogs: 30,
  cloudExposures: 10,
  cycleHistory: 1,
} as const;

export type MeteredFeature = "dailyLogs" | "exposures" | "cycleHistory";

export function isFreeLimitReached(feature: MeteredFeature, count: number) {
  const limit = feature === "dailyLogs"
    ? FREE_LIMITS.cloudDailyLogs
    : feature === "exposures"
      ? FREE_LIMITS.cloudExposures
      : FREE_LIMITS.cycleHistory;
  return count >= limit;
}
