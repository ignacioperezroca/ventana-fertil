import { describe, expect, it } from "vitest";

import { FREE_LIMITS, isFreeLimitReached } from "@/lib/limits";

describe("límites gratuitos", () => {
  it("limita registros diarios en 30", () => {
    expect(isFreeLimitReached("dailyLogs", FREE_LIMITS.cloudDailyLogs - 1)).toBe(false);
    expect(isFreeLimitReached("dailyLogs", FREE_LIMITS.cloudDailyLogs)).toBe(true);
  });
});
