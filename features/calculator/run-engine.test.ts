import { describe, expect, it } from "vitest";

import { calculateObservedRun } from "./run-engine";

describe("calculateObservedRun", () => {
  it("includes every failed attempt in net profit and break-even", () => {
    expect(
      calculateObservedRun({
        attemptCost: 100,
        harvestValue: 600,
        failedAttempts: 2,
        elapsedMinutes: 10,
      }),
    ).toEqual({
      status: "valid",
      outcome: "PROFITABLE",
      attempts: 3,
      totalCost: 300,
      cleanProfit: 500,
      netAfterFailures: 300,
      netPerMinute: 30,
      cleanRoiPercent: 500,
      breakEvenHarvest: 300,
      recoverableFailedAttempts: 5,
    });
  });

  it("returns break-even when the harvest exactly covers every attempt", () => {
    expect(
      calculateObservedRun({
        attemptCost: 50,
        harvestValue: 150,
        failedAttempts: 2,
        elapsedMinutes: 5,
      }),
    ).toMatchObject({
      status: "valid",
      outcome: "BREAK_EVEN",
      netAfterFailures: 0,
      netPerMinute: 0,
    });
  });

  it.each([
    ["fractional failures", { failedAttempts: 0.5 }],
    ["negative cost", { attemptCost: -1 }],
    ["zero time", { elapsedMinutes: 0 }],
  ])("rejects %s", (_label, change) => {
    expect(
      calculateObservedRun({
        attemptCost: 100,
        harvestValue: 200,
        failedAttempts: 0,
        elapsedMinutes: 1,
        ...change,
      }),
    ).toMatchObject({ status: "invalid" });
  });

  it("keeps ROI and recoverable failures unavailable for a free attempt", () => {
    expect(
      calculateObservedRun({
        attemptCost: 0,
        harvestValue: 50,
        failedAttempts: 4,
        elapsedMinutes: 2,
      }),
    ).toMatchObject({
      status: "valid",
      cleanRoiPercent: null,
      recoverableFailedAttempts: null,
    });
  });
});
