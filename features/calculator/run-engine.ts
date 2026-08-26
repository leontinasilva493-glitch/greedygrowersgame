import { z } from "zod";

import type { ObservedRunInput, ObservedRunResult } from "./types";

const safeNonNegativeNumber = z
  .number()
  .finite()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

const observedRunInputSchema = z.object({
  attemptCost: safeNonNegativeNumber,
  harvestValue: safeNonNegativeNumber,
  failedAttempts: z
    .number()
    .finite()
    .int()
    .nonnegative()
    .max(1000),
  elapsedMinutes: z
    .number()
    .finite()
    .positive()
    .max(100000),
});

export function calculateObservedRun(
  input: ObservedRunInput,
): ObservedRunResult {
  const parsed = observedRunInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "invalid",
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const { attemptCost, harvestValue, failedAttempts, elapsedMinutes } =
    parsed.data;
  const attempts = failedAttempts + 1;
  const totalCost = attemptCost * attempts;
  const cleanProfit = harvestValue - attemptCost;
  const netAfterFailures = harvestValue - totalCost;

  return {
    status: "valid",
    outcome:
      netAfterFailures > 0
        ? "PROFITABLE"
        : netAfterFailures < 0
          ? "LOSS"
          : "BREAK_EVEN",
    attempts,
    totalCost,
    cleanProfit,
    netAfterFailures,
    netPerMinute: netAfterFailures / elapsedMinutes,
    cleanRoiPercent:
      attemptCost === 0 ? null : (cleanProfit / attemptCost) * 100,
    breakEvenHarvest: totalCost,
    recoverableFailedAttempts:
      attemptCost === 0
        ? null
        : Math.max(0, Math.floor(cleanProfit / attemptCost)),
  };
}
