import { describe, expect, it } from "vitest";

import type { Observation, Source } from "../data/types";

import {
  CONFIDENCE_THRESHOLDS,
  QUERY_GATE,
  evaluateModelEligibility,
  evaluateRiskQuery,
} from "./model-gate";

const currentVersion = "2026-07-26";

const sources: Source[] = [
  {
    id: "source-1",
    type: "gameplay",
    title: "Source",
    url: "https://example.com/source",
    capturedAt: "2026-07-26T00:00:00.000Z",
    gameVersion: currentVersion,
  },
];

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

describe("evaluateModelEligibility", () => {
  it("rejects mixed-version, unverified, duplicate-session, and non-protocol records before counting", () => {
    const result = evaluateModelEligibility({
      currentVersion,
      observations: [
        observation("good-a", 30, "lightning"),
        observation("duplicate-session", 40, "censored", {
          serverSessionId: "session-good-a",
        }),
        observation("stale", 50, "censored", { gameVersion: "2026-07-25" }),
        observation("harvested", 60, "censored", {
          observationProtocol: "opportunistic",
          plannedStopSeconds: undefined,
          censorReason: "harvested",
          treeAgeAtStartSeconds: 10,
          treeAgeAtEndSeconds: 70,
        }),
      ],
      sources,
    });

    expect(result.eligible).toBe(false);
    expect(result.observationCount).toBe(1);
    expect(result.reasons.join(" ")).toMatch(/at least 30 approved observations/i);
  });

  it("returns medium confidence when the gate passes but thresholds stay below high", () => {
    const observations = [
      ...Array.from({ length: 25 }, (_, index) =>
        observation(`event-${index}`, 20 + index, "lightning"),
      ),
      ...Array.from({ length: 95 }, (_, index) =>
        observation(`censor-${index}`, 80 + index, "censored"),
      ),
    ];

    const result = evaluateModelEligibility({
      currentVersion,
      observations,
      sources,
    });

    expect(result.eligible).toBe(true);
    expect(result.confidence).toBe("medium");
    expect(result.eventCount).toBe(25);
    expect(result.censoredCount).toBe(95);
    expect(result.observationCount).toBe(120);
    expect(result.sessionCount).toBe(120);
    expect(result.gameVersion).toBe(currentVersion);
  });

  it("uses the published confidence boundaries", () => {
    expect(CONFIDENCE_THRESHOLDS.low.minimumObservations).toBe(100);
    expect(CONFIDENCE_THRESHOLDS.medium.minimumSessions).toBe(30);
  });
});

describe("evaluateRiskQuery", () => {
  const observations = [
    ...Array.from({ length: 40 }, (_, index) =>
      observation(`event-${index}`, 20 + index * 2, "lightning"),
    ),
    ...Array.from({ length: 140 }, (_, index) =>
      observation(`censor-${index}`, 120 + index * 2, "censored"),
    ),
  ];

  it("blocks a query when interval gates fail", () => {
    const result = evaluateRiskQuery({
      breakEvenProbability: 0.5,
      currentAgeSeconds: 5,
      currentVersion,
      observations,
      sources,
      waitSeconds: 5,
    });

    expect(result.available).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/at least/i);
  });

  it("returns MODEL_UNCERTAIN when the diagnostic interval crosses break-even", () => {
    const result = evaluateRiskQuery({
      breakEvenProbability: 0.1,
      currentAgeSeconds: 20,
      currentVersion,
      observations,
      sources,
      waitSeconds: 40,
    });

    expect(result.available).toBe(true);
    if (result.available) {
      expect(result.decision).toBe("MODEL_UNCERTAIN");
    }
  });

  it("returns deterministic WAIT or HARVEST NOW only when the interval stays on one side", () => {
    const waitResult = evaluateRiskQuery({
      breakEvenProbability: 0.2,
      currentAgeSeconds: 20,
      currentVersion,
      observations,
      sources,
      waitSeconds: 40,
    });
    expect(waitResult.available).toBe(true);
    if (waitResult.available) {
      expect(waitResult.decision).toBe("WAIT");
    }

    const harvestResult = evaluateRiskQuery({
      breakEvenProbability: 0.04,
      currentAgeSeconds: 20,
      currentVersion,
      observations,
      sources,
      waitSeconds: 40,
    });
    expect(harvestResult.available).toBe(true);
    if (harvestResult.available) {
      expect(harvestResult.decision).toBe("HARVEST_NOW");
    }
  });

  it("keeps the query gate constants versioned", () => {
    expect(QUERY_GATE.minAtRiskStart).toBe(20);
    expect(QUERY_GATE.maxWidth95).toBe(0.3);
  });
});
