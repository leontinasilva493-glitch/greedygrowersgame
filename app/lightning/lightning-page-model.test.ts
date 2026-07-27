import { describe, expect, it } from "vitest";

import type {
  GameVersion,
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
} from "@/features/data/types";

async function loadModel() {
  const loadedModule = await import("./lightning-page-model").catch(() => null);
  expect(loadedModule).not.toBeNull();
  return loadedModule as NonNullable<typeof loadedModule>;
}

const currentVersion = "2026-07-26";

const gameVersion: GameVersion = {
  version: currentVersion,
  checkedAt: "2026-07-26T00:00:00.000Z",
  sourceIds: ["source-1"],
};

const sources: Source[] = [
  {
    id: "source-1",
    type: "gameplay",
    title: "Gameplay capture",
    url: "https://example.com/source-1",
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
    seedId: "seed-1",
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
    plannedStopSeconds: Math.max(60, exposureSeconds),
    observationProtocol: "precommitted_window",
    event,
    censorReason: event === "censored" ? "planned_stop" : undefined,
    sourceId: "source-1",
    evidenceUrl: `https://example.com/${id}`,
    status: "observed",
    reviewState: "approved",
    reviewedAt: "2026-07-26T01:00:00.000Z",
    lastVerified: "2026-07-26T01:00:00.000Z",
    ...overrides,
  };
}

function measurement(
  id: string,
  seedId: string,
  sessionId: string,
  ageSeconds: number,
  value: number,
): GrowthMeasurement {
  return {
    id,
    seedId,
    treeInstanceId: `tree-${id}`,
    serverSessionId: sessionId,
    gameVersion: currentVersion,
    treeAgeSeconds: ageSeconds,
    value,
    currency: "coins",
    observedAt: "2026-07-26T00:00:00.000Z",
    sourceId: "source-1",
    evidenceUrl: `https://example.com/measurement/${id}`,
    status: "observed",
    reviewState: "approved",
    reviewedAt: "2026-07-26T01:00:00.000Z",
    lastVerified: "2026-07-26T01:00:00.000Z",
  };
}

function seed(id: string, name: string): Seed {
  return {
    id,
    slug: id,
    name,
    imageUrl: `https://example.com/${id}.webp`,
    imageSourceId: "source-1",
    cost: 10,
    currency: "coins",
    acquisition: "River",
    facts: [
      { key: "origin", value: "river", sourceIds: ["source-1"] },
      { key: "growth", value: "tree", sourceIds: ["source-1"] },
      { key: "yield", value: "coins", sourceIds: ["source-1"] },
    ],
    status: "observed",
    gameVersion: currentVersion,
    lastVerified: "2026-07-26T01:00:00.000Z",
    sourceIds: ["source-1"],
    indexing: "index",
    indexingReason: "Verified enough for public facts",
  };
}

describe("buildLightningPageModel", () => {
  it("keeps production-empty data in raw-count mode with no probability or seed estimate", async () => {
    const { buildLightningPageModel } = await loadModel();

    const model = buildLightningPageModel({
      gameVersion,
      observations: [],
      growthMeasurements: [],
      seeds: [],
      sources,
    });

    expect(model.probability.available).toBe(false);
    expect(model.seedMode.available).toBe(false);
    expect(model.curve).toEqual([]);
    expect(model.rawRows).toEqual([]);
  });

  it("returns exact interval diagnostics and a gated seed-mode candidate when data is eligible", async () => {
    const { buildLightningPageModel } = await loadModel();

    const observations = [
      ...Array.from({ length: 40 }, (_, index) =>
        observation(`event-${index}`, 20 + index * 2, "lightning"),
      ),
      ...Array.from({ length: 140 }, (_, index) =>
        observation(`censor-${index}`, 120 + index * 2, "censored"),
      ),
    ];
    const growthMeasurements = [
      measurement("m1", "seed-1", "session-1", 30, 80),
      measurement("m2", "seed-1", "session-2", 30, 90),
      measurement("m3", "seed-1", "session-3", 30, 100),
      measurement("m4", "seed-1", "session-4", 30, 110),
      measurement("m5", "seed-1", "session-5", 30, 120),
    ];

    const model = buildLightningPageModel({
      gameVersion,
      observations,
      growthMeasurements,
      seeds: [seed("seed-1", "Eligible Seed One")],
      sources,
    });

    expect(model.probability.available).toBe(true);
    if (model.probability.available) {
      expect(model.probability.decision).toBe("MODEL_UNCERTAIN");
      expect(model.probability.intervalEvents).toBeGreaterThanOrEqual(3);
      expect(model.probability.nAtRiskStart).toBeGreaterThanOrEqual(20);
      expect(model.probability.nAtRiskEnd).toBeGreaterThanOrEqual(10);
      expect(model.probability.upper95).toBeGreaterThanOrEqual(
        model.probability.lower95,
      );
    }

    expect(model.seedMode.available).toBe(true);
    if (model.seedMode.available) {
      expect(model.seedMode.candidates[0]?.seed.name).toBe("Eligible Seed One");
      expect(model.seedMode.candidates[0]?.bucket.measurementCount).toBe(5);
    }
  });
});
