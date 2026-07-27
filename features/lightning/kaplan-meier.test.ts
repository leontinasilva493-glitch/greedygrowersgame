import { describe, expect, it } from "vitest";

import type { Observation } from "../data/types";

import {
  buildKaplanMeierCurve,
  estimateConditionalRisk,
  type SurvivalPoint,
} from "./kaplan-meier";

const currentVersion = "2026-07-26";

function observation(
  id: string,
  exposureSeconds: number,
  event: Observation["event"],
  overrides: Partial<Observation> = {},
): Observation {
  return {
    id,
    treeInstanceId: `tree-${id}`,
    serverSessionId: `session-${id}`,
    gameVersion: currentVersion,
    startedAt: "2026-07-26T00:00:00.000Z",
    endedAt: new Date(
      Date.parse("2026-07-26T00:00:00.000Z") + exposureSeconds * 1000,
    ).toISOString(),
    treeAgeAtStartSeconds: 0,
    treeAgeAtEndSeconds: exposureSeconds,
    exposureSeconds,
    plannedStopSeconds: Math.max(exposureSeconds, 60),
    observationProtocol: "precommitted_window",
    event,
    censorReason: event === "censored" ? "planned_stop" : undefined,
    sourceId: "source-1",
    evidenceUrl: `https://example.com/${id}`,
    status: "observed",
    reviewState: "approved",
    lastVerified: "2026-07-26T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildKaplanMeierCurve", () => {
  it("builds a right-continuous curve with event-before-censor ties", () => {
    const points = buildKaplanMeierCurve([
      observation("event-1", 10, "lightning"),
      observation("censor-1", 10, "censored"),
      observation("event-2", 20, "lightning"),
      observation("censor-2", 30, "censored"),
    ]);

    expect(points).toHaveLength(3);
    expect(points[0]).toMatchObject({
      ageSeconds: 10,
      atRisk: 4,
      events: 1,
      censored: 1,
      survival: 0.75,
      remainingAfterTime: 2,
    });
    expect(points[1]).toMatchObject({
      ageSeconds: 20,
      atRisk: 2,
      events: 1,
      censored: 0,
      survival: 0.375,
      remainingAfterTime: 1,
    });
    expect(points[2]).toMatchObject({
      ageSeconds: 30,
      atRisk: 1,
      events: 0,
      censored: 1,
      survival: 0.375,
      remainingAfterTime: 0,
    });
  });

  it("handles all censored and all-event cohorts without NaN confidence intervals", () => {
    const allCensored = buildKaplanMeierCurve([
      observation("c1", 10, "censored"),
      observation("c2", 20, "censored"),
    ]);
    expect(allCensored.every((point) => point.survival === 1)).toBe(true);
    expect(allCensored.every((point) => point.lower95 === 1 && point.upper95 === 1)).toBe(
      true,
    );

    const allEvents = buildKaplanMeierCurve([
      observation("e1", 10, "lightning"),
      observation("e2", 20, "lightning"),
    ]);
    expect(allEvents.at(-1)).toMatchObject({
      survival: 0,
      lower95: 0,
      upper95: 0,
    });
  });
});

describe("estimateConditionalRisk", () => {
  function makePoints(): SurvivalPoint[] {
    return buildKaplanMeierCurve([
      observation("a", 10, "lightning"),
      observation("b", 20, "censored"),
      observation("c", 30, "lightning"),
      observation("d", 40, "censored"),
    ]);
  }

  it("returns zero risk for a zero-second wait within observed range", () => {
    const result = estimateConditionalRisk(makePoints(), 10, 0);
    expect(result.available).toBe(true);
    if (result.available) {
      expect(result.estimate).toBe(0);
      expect(result.intervalEvents).toBe(0);
    }
  });

  it("uses right-continuous survival values and reports diagnostics", () => {
    const result = estimateConditionalRisk(makePoints(), 10, 20);
    expect(result.available).toBe(true);
    if (result.available) {
      expect(result.nAtRiskStart).toBe(4);
      expect(result.nAtRiskEnd).toBe(2);
      expect(result.intervalEvents).toBe(1);
      expect(result.estimate).toBeCloseTo(0.5, 6);
      expect(result.lower95).toBeGreaterThanOrEqual(0);
      expect(result.upper95).toBeLessThanOrEqual(1);
    }
  });

  it("returns unavailable outside the observed range or after survival reaches zero", () => {
    const outOfRange = estimateConditionalRisk(makePoints(), 35, 10);
    expect(outOfRange).toMatchObject({
      available: false,
      reason: expect.stringMatching(/observed range/i),
    });

    const zeroSurvival = estimateConditionalRisk(
      buildKaplanMeierCurve([observation("e1", 10, "lightning")]),
      10,
      0,
    );
    expect(zeroSurvival).toMatchObject({
      available: false,
      reason: expect.stringMatching(/positive/i),
    });
  });
});
