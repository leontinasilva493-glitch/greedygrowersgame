import { describe, expect, it } from "vitest";

import { observationSchema } from "./schemas";
import { validateDataBundle } from "./validation";

const version = "2026-07-27";
const source = {
  id: "source-1",
  type: "gameplay" as const,
  title: "Recording",
  url: "https://example.com/recording",
  capturedAt: "2026-07-27T00:00:00.000Z",
  gameVersion: version,
};
const observation = {
  id: "observation-1",
  seedId: "seed-1",
  treeInstanceId: "tree-1",
  serverSessionId: "session-1",
  gameVersion: version,
  startedAt: "2026-07-27T00:00:00.000Z",
  endedAt: "2026-07-27T00:01:00.000Z",
  treeAgeAtStartSeconds: 0,
  treeAgeAtEndSeconds: 60,
  exposureSeconds: 60,
  plannedStopSeconds: 60,
  observationProtocol: "precommitted_window" as const,
  event: "censored" as const,
  censorReason: "planned_stop" as const,
  sourceId: source.id,
  evidenceUrl: source.url,
  status: "observed" as const,
  reviewState: "approved" as const,
  reviewedAt: "2026-07-27T00:02:00.000Z",
  lastVerified: "2026-07-27T00:02:00.000Z",
};

const bundle = {
  seeds: [],
  observations: [observation],
  growthMeasurements: [],
  sources: [source],
  updates: [],
  dataChangelog: [],
  codes: {
    redeemUiVerified: false,
    lastChecked: "2026-07-27T00:00:00.000Z",
    active: [],
    expired: [],
    sourceIds: [],
  },
  gameVersion: {
    version,
    checkedAt: "2026-07-27T00:00:00.000Z",
    sourceIds: [source.id],
  },
};

describe("canonical data validation", () => {
  it("accepts a consistent precommitted planned-stop observation", () => {
    expect(observationSchema.safeParse(observation).success).toBe(true);
  });

  it.each([
    ["timestamp duration", { exposureSeconds: 59 }],
    ["age duration", { treeAgeAtEndSeconds: 59 }],
    ["lightning with censor reason", { event: "lightning", censorReason: "planned_stop" }],
    ["censored without reason", { censorReason: undefined }],
    ["opportunistic planned stop", { observationProtocol: "opportunistic" }],
  ])("rejects an invalid %s combination", (_label, change) => {
    expect(observationSchema.safeParse({ ...observation, ...change }).success).toBe(
      false,
    );
  });

  it("rejects duplicate IDs and broken references", () => {
    const errors = validateDataBundle({
      ...bundle,
      observations: [
        observation,
        { ...observation, sourceId: "missing-source" },
      ],
    });
    expect(errors.some((error) => error.includes("duplicate id"))).toBe(true);
    expect(errors.some((error) => error.includes("missing-source"))).toBe(true);
  });

  it("rejects duplicate evidence segments and overlapping tree intervals", () => {
    const errors = validateDataBundle({
      ...bundle,
      observations: [
        observation,
        {
          ...observation,
          id: "observation-2",
          startedAt: "2026-07-27T00:00:30.000Z",
          endedAt: "2026-07-27T00:01:30.000Z",
        },
      ],
    });
    expect(errors.some((error) => error.includes("reused evidence"))).toBe(true);
    expect(errors.some((error) => error.includes("overlapping"))).toBe(true);
  });

  it("rejects multiple analysis-eligible trees from one server session", () => {
    const errors = validateDataBundle({
      ...bundle,
      observations: [
        observation,
        {
          ...observation,
          id: "observation-2",
          treeInstanceId: "tree-2",
          evidenceUrl: "https://example.com/recording-2",
        },
      ],
    });
    expect(
      errors.some((error) => error.includes("multiple analysis-eligible trees")),
    ).toBe(true);
  });
});
