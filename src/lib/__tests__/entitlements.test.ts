import { describe, expect, it } from "vitest";

import { mapSubscriptionToEntitlements, PREMIUM_STATUSES } from "@/lib/entitlement-policy";

describe("entitlements", () => {
  it.each(["active", "trialing"])("habilita premium para %s", (status) => {
    expect(PREMIUM_STATUSES.has(status)).toBe(true);
    expect(mapSubscriptionToEntitlements({ status }).hasPremium).toBe(true);
  });

  it.each(["past_due", "unpaid", "incomplete", "incomplete_expired", "paused", "canceled", "none"])("revoca premium para %s", (status) => {
    expect(mapSubscriptionToEntitlements({ status }).hasPremium).toBe(false);
  });
});
