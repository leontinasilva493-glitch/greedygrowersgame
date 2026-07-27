import { describe, expect, it } from "vitest";

import type {
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
} from "../data/types";

const currentVersion = "2026-07-27";

async function loadSelectors() {
  const loadedModule = await import("./selectors").catch(() => null);
  expect(loadedModule).not.toBeNull();
  return loadedModule as NonNullable<typeof loadedModule>;
}

const sources: Source[] = [
  {
    id: "source-image",
    type: "gameplay",
    title: "Image",
    url: "https://example.com/image",
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  },
  {
    id: "source-fact-a",
    type: "official",
    title: "Fact A",
    url: "https://example.com/fact-a",
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  },
  {
    id: "source-fact-b",
    type: "community",
    title: "Fact B",
    url: "https://example.com/fact-b",
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  },
  {
    id: "source-fact-c",
    type: "gameplay",
    title: "Fact C",
    url: "https://example.com/fact-c",
    capturedAt: "2026-07-27T00:00:00.000Z",
    gameVersion: currentVersion,
  },
];

function createSeed(overrides: Partial<Seed> & Pick<Seed, "id" | "slug" | "name">): Seed {
  const { id, slug, name, ...rest } = overrides;
  return {
    imageUrl: "https://example.com/seed.webp",
    imageSourceId: "source-image",
    rarity: "rare",
    acquisition: "river",
    cost: 10,
    currency: "coins",
    facts: [
      { key: "origin", value: "river", sourceIds: ["source-fact-a"] },
      { key: "growth", value: "tree", sourceIds: ["source-fact-b"] },
      { key: "yield", value: "coins", sourceIds: ["source-fact-c"] },
    ],
    status: "verified",
    gameVersion: currentVersion,
    lastVerified: "2026-07-27T00:00:00.000Z",
    sourceIds: ["source-image", "source-fact-a", "source-fact-b", "source-fact-c"],
    indexing: "index",
    indexingReason: "Verified seed",
    ...rest,
    id,
    slug,
    name,
  };
}

function createMeasurement(
  seedId: string,
  sessionSuffix: string,
  value: number,
  overrides: Partial<GrowthMeasurement> = {},
): GrowthMeasurement {
  return {
    id: `measurement-${seedId}-${sessionSuffix}-${value}`,
    seedId,
    treeInstanceId: `tree-${seedId}-${sessionSuffix}`,
    serverSessionId: `session-${seedId}-${sessionSuffix}`,
    gameVersion: currentVersion,
    treeAgeSeconds: 30,
    value,
    currency: "coins",
    observedAt: "2026-07-27T00:00:30.000Z",
    sourceId: "source-fact-c",
    evidenceUrl: `https://example.com/${seedId}/${sessionSuffix}/${value}`,
    status: "observed",
    reviewState: "approved",
    reviewedAt: "2026-07-27T01:00:00.000Z",
    lastVerified: "2026-07-27T01:00:00.000Z",
    ...overrides,
  };
}

function createObservation(
  seedId: string,
  sessionSuffix: string,
  overrides: Partial<Observation> = {},
): Observation {
  return {
    id: `observation-${seedId}-${sessionSuffix}`,
    seedId,
    treeInstanceId: `tree-${seedId}-${sessionSuffix}`,
    serverSessionId: `session-${seedId}-${sessionSuffix}`,
    gameVersion: currentVersion,
    startedAt: "2026-07-27T00:00:00.000Z",
    endedAt: "2026-07-27T00:01:00.000Z",
    treeAgeAtStartSeconds: 0,
    treeAgeAtEndSeconds: 60,
    exposureSeconds: 60,
    plannedStopSeconds: 60,
    observationProtocol: "precommitted_window",
    event: "censored",
    censorReason: "planned_stop",
    sourceId: "source-fact-c",
    evidenceUrl: `https://example.com/observation/${seedId}/${sessionSuffix}`,
    status: "observed",
    reviewState: "approved",
    reviewedAt: "2026-07-27T01:00:00.000Z",
    lastVerified: "2026-07-27T01:00:00.000Z",
    ...overrides,
  };
}

describe("seed selectors", () => {
  it("supports search, filters, cost sorting, and keeps unknown values at the bottom", async () => {
    const { buildSeedRows } = await loadSelectors();

    const seeds = [
      createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout", rarity: "epic", cost: 80 }),
      createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine", rarity: "common", cost: 10 }),
      createSeed({
        id: "seed-unknown",
        slug: "seed-unknown",
        name: "Mystery Seed",
        rarity: undefined,
        acquisition: undefined,
        cost: undefined,
        currency: undefined,
        status: "unknown",
        indexing: "noindex",
        indexingReason: "Unknown seed",
      }),
    ];

    const rows = buildSeedRows({
      seeds,
      sources,
      observations: [],
      growthMeasurements: [],
      currentVersion,
      filters: {
        search: "seed",
        rarity: "all",
        sourceType: "all",
        status: "all",
      },
      sort: "cost-desc",
    });

    expect(rows.map((row) => row.seedId)).toEqual([
      "seed-alpha",
      "seed-beta",
      "seed-unknown",
    ]);

    const filtered = buildSeedRows({
      seeds,
      sources,
      observations: [],
      growthMeasurements: [],
      currentVersion,
      filters: {
        search: "vine",
        rarity: "common",
        sourceType: "official",
        status: "observed_or_verified",
      },
      sort: "name-asc",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.seedId).toBe("seed-beta");
  });

  it("counts only current-version approved observations and growth measurements, and withholds ranges below the gate", async () => {
    const { buildSeedRows } = await loadSelectors();

    const seeds = [createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout" })];
    const growthMeasurements = [
      createMeasurement("seed-alpha", "1", 90),
      createMeasurement("seed-alpha", "2", 100),
      createMeasurement("seed-alpha", "3", 110),
      createMeasurement("seed-alpha", "4", 120, { reviewState: "pending" }),
      createMeasurement("seed-alpha", "5", 130, { gameVersion: "2026-07-26" }),
      createMeasurement("seed-alpha", "6", 140, { status: "estimated" }),
    ];
    const observations = [
      createObservation("seed-alpha", "1"),
      createObservation("seed-alpha", "2"),
      createObservation("seed-alpha", "3", { reviewState: "pending" }),
      createObservation("seed-alpha", "4", { status: "estimated" }),
      createObservation("seed-alpha", "5", { gameVersion: "2026-07-26" }),
    ];

    const [row] = buildSeedRows({
      seeds,
      sources,
      observations,
      growthMeasurements,
      currentVersion,
      filters: {
        search: "",
        rarity: "all",
        sourceType: "all",
        status: "all",
      },
      sort: "name-asc",
    });

    expect(row.measurementCount).toBe(3);
    expect(row.observationCount).toBe(2);
    expect(row.independentSessionCount).toBe(3);
    expect(row.rangeLabel).toBeNull();
    expect(row.rangeGatePassed).toBe(false);
  });

  it("returns an observed range only when at least five measurements from three sessions are available", async () => {
    const { buildSeedRows, getSeedsPageIndexability } = await loadSelectors();

    const seeds = [
      createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout" }),
      createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine" }),
      createSeed({ id: "seed-gamma", slug: "seed-gamma", name: "Gamma Root" }),
    ];
    const growthMeasurements = [
      createMeasurement("seed-alpha", "1", 80),
      createMeasurement("seed-alpha", "2", 90),
      createMeasurement("seed-alpha", "3", 100),
      createMeasurement("seed-alpha", "4", 110),
      createMeasurement("seed-alpha", "5", 120),
    ];

    const [alpha] = buildSeedRows({
      seeds,
      sources,
      observations: [createObservation("seed-alpha", "1")],
      growthMeasurements,
      currentVersion,
      filters: {
        search: "",
        rarity: "all",
        sourceType: "all",
        status: "all",
      },
      sort: "name-asc",
    });

    expect(alpha.rangeGatePassed).toBe(true);
    expect(alpha.rangeLabel).toBe("80-120 coins");

    const gate = getSeedsPageIndexability(seeds, sources, currentVersion);
    expect(gate.index).toBe(true);
  });

  it("keeps the list noindex below three indexable seeds and returns an empty result for empty data", async () => {
    const { buildSeedRows, getSeedsPageIndexability } = await loadSelectors();

    expect(
      buildSeedRows({
        seeds: [],
        sources,
        observations: [],
        growthMeasurements: [],
        currentVersion,
        filters: {
          search: "",
          rarity: "all",
          sourceType: "all",
          status: "all",
        },
        sort: "name-asc",
      }),
    ).toEqual([]);

    const gate = getSeedsPageIndexability(
      [
        createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout" }),
        createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine" }),
      ],
      sources,
      currentVersion,
    );

    expect(gate.index).toBe(false);
  });
});
