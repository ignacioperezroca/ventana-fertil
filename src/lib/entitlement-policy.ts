export const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export interface UserEntitlements {
  plan: "free" | "premium";
  hasPremium: boolean;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  features: {
    cloudSync: boolean;
    unlimitedLogs: boolean;
    cycleHistory: boolean;
    dataExport: boolean;
    advancedInsights: boolean;
  };
}

export function mapSubscriptionToEntitlements(subscription: {
  status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
} | null): UserEntitlements {
  const status = subscription?.status ?? "none";
  const hasPremium = PREMIUM_STATUSES.has(status);
  return {
    plan: hasPremium ? "premium" : "free",
    hasPremium,
    subscriptionStatus: status,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
    features: {
      cloudSync: true,
      unlimitedLogs: hasPremium,
      cycleHistory: hasPremium,
      dataExport: hasPremium,
      advancedInsights: hasPremium,
    },
  };
}
