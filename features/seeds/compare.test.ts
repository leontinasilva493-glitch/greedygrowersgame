import { describe, expect, it } from "vitest";

import type { GrowthMeasurement, Seed, Source } from "../data/types";

const currentVersion = "2026-07-27";

async function loadCompare() {
  const loadedModule = await import("./compare").catch(() => null);
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
    id: `measurement-${seedId}-${sessionSuffix}`,
    seedId,
    treeInstanceId: `tree-${seedId}-${sessionSuffix}`,
    serverSessionId: `session-${seedId}-${sessionSuffix}`,
    gameVersion: currentVersion,
    treeAgeSeconds: 30,
    value,
    currency: "coins",
    observedAt: "2026-07-27T00:00:30.000Z",
    sourceId: "source-fact-c",
    evidenceUrl: `https://example.com/${seedId}/${sessionSuffix}`,
    status: "observed",
    reviewState: "approved",
    reviewedAt: "2026-07-27T01:00:00.000Z",
    lastVerified: "2026-07-27T01:00:00.000Z",
    ...overrides,
  };
}

describe("seed comparison", () => {
  it("compares two complete seeds only when metric, bucket, version, currency, and session thresholds all match", async () => {
    const { AGE_BUCKETS, buildSeedComparison, getSeedCompareIndexability } =
      await loadCompare();

    const seeds = [
      createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout", cost: 10 }),
      createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine", cost: 20 }),
    ];
    const growthMeasurements = [
      createMeasurement("seed-alpha", "1", 80),
      createMeasurement("seed-alpha", "2", 90),
      createMeasurement("seed-alpha", "3", 100),
      createMeasurement("seed-alpha", "4", 110),
      createMeasurement("seed-alpha", "5", 120),
      createMeasurement("seed-beta", "1", 100),
      createMeasurement("seed-beta", "2", 110),
      createMeasurement("seed-beta", "3", 120),
      createMeasurement("seed-beta", "4", 130),
      createMeasurement("seed-beta", "5", 140),
    ];

    const comparison = buildSeedComparison({
      seeds,
      sources,
      growthMeasurements,
      currentVersion,
      selection: {
        leftSeedId: "seed-alpha",
        rightSeedId: "seed-beta",
        ageBucketKey: AGE_BUCKETS[1].key,
        metric: "gross_value",
      },
    });

    expect(comparison.status).toBe("ready");
    if (comparison.status === "ready") {
      expect(comparison.metricLabel).toBe("Gross value");
      expect(comparison.left.independentSessionCount).toBe(5);
      expect(comparison.right.independentSessionCount).toBe(5);
      expect(comparison.left.median).toBe(100);
      expect(comparison.right.median).toBe(120);
      expect(comparison.right.winner).toBeNull();
    }

    const gate = getSeedCompareIndexability({
      seeds,
      sources,
      growthMeasurements,
      currentVersion,
    });
    expect(gate.index).toBe(true);
  });

  it.each([
    [
      "mixed currency",
      [
        createMeasurement("seed-beta", "1", 100, { currency: "gems" }),
        createMeasurement("seed-beta", "2", 110, { currency: "gems" }),
        createMeasurement("seed-beta", "3", 120, { currency: "gems" }),
        createMeasurement("seed-beta", "4", 130, { currency: "gems" }),
        createMeasurement("seed-beta", "5", 140, { currency: "gems" }),
      ],
      "currency_mismatch",
    ],
    [
      "different age bucket",
      [
        createMeasurement("seed-beta", "1", 100, { treeAgeSeconds: 90 }),
        createMeasurement("seed-beta", "2", 110, { treeAgeSeconds: 90 }),
        createMeasurement("seed-beta", "3", 120, { treeAgeSeconds: 90 }),
        createMeasurement("seed-beta", "4", 130, { treeAgeSeconds: 90 }),
        createMeasurement("seed-beta", "5", 140, { treeAgeSeconds: 90 }),
      ],
      "bucket_mismatch",
    ],
    [
      "different version",
      [
        createMeasurement("seed-beta", "1", 100, { gameVersion: "2026-07-26" }),
        createMeasurement("seed-beta", "2", 110, { gameVersion: "2026-07-26" }),
        createMeasurement("seed-beta", "3", 120, { gameVersion: "2026-07-26" }),
        createMeasurement("seed-beta", "4", 130, { gameVersion: "2026-07-26" }),
        createMeasurement("seed-beta", "5", 140, { gameVersion: "2026-07-26" }),
      ],
      "seed_unavailable",
    ],
    [
      "fewer than five independent sessions",
      [
        createMeasurement("seed-beta", "1", 100),
        createMeasurement("seed-beta", "2", 110),
        createMeasurement("seed-beta", "3", 120),
        createMeasurement("seed-beta", "4", 130),
      ],
      "insufficient_sessions",
    ],
  ])(
    "rejects %s",
    async (_label, replacementMeasurements, reason) => {
      const { AGE_BUCKETS, buildSeedComparison } = await loadCompare();

      const seeds = [
        createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout", cost: 10 }),
        createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine", cost: 20 }),
      ];
      const alphaMeasurements = [
        createMeasurement("seed-alpha", "1", 80),
        createMeasurement("seed-alpha", "2", 90),
        createMeasurement("seed-alpha", "3", 100),
        createMeasurement("seed-alpha", "4", 110),
        createMeasurement("seed-alpha", "5", 120),
      ];

      const comparison = buildSeedComparison({
          seeds,
          sources,
          growthMeasurements: [...alphaMeasurements, ...replacementMeasurements],
          currentVersion,
          selection: {
            leftSeedId: "seed-alpha",
            rightSeedId: "seed-beta",
            ageBucketKey: AGE_BUCKETS[1].key,
            metric: "gross_value",
          },
        });

      expect(comparison.status).toBe("invalid");
      if (comparison.status === "invalid") {
        expect(comparison.reason).toBe(reason);
      }
    },
  );

  it("rejects missing cost, missing measurements, same-seed comparisons, and non-indexable selections", async () => {
    const { AGE_BUCKETS, buildSeedComparison, getSeedCompareIndexability } =
      await loadCompare();

    const seeds = [
      createSeed({ id: "seed-alpha", slug: "seed-alpha", name: "Alpha Sprout", cost: undefined, currency: undefined }),
      createSeed({ id: "seed-beta", slug: "seed-beta", name: "Beta Vine", cost: 20 }),
      createSeed({
        id: "seed-gamma",
        slug: "seed-gamma",
        name: "Gamma Root",
        indexing: "noindex",
        indexingReason: "Insufficient evidence",
      }),
    ];
    const growthMeasurements = [
      createMeasurement("seed-alpha", "1", 80),
      createMeasurement("seed-alpha", "2", 90),
      createMeasurement("seed-alpha", "3", 100),
      createMeasurement("seed-alpha", "4", 110),
      createMeasurement("seed-alpha", "5", 120),
      createMeasurement("seed-beta", "1", 100),
      createMeasurement("seed-beta", "2", 110),
      createMeasurement("seed-beta", "3", 120),
      createMeasurement("seed-beta", "4", 130),
      createMeasurement("seed-beta", "5", 140),
    ];

    const missingCost = buildSeedComparison({
      seeds,
      sources,
      growthMeasurements,
      currentVersion,
      selection: {
        leftSeedId: "seed-alpha",
        rightSeedId: "seed-beta",
        ageBucketKey: AGE_BUCKETS[1].key,
        metric: "roi",
      },
    });
    expect(missingCost.status).toBe("invalid");
    if (missingCost.status === "invalid") {
      expect(missingCost.reason).toBe("missing_cost");
    }

    const missingGrowth = buildSeedComparison({
      seeds,
      sources,
      growthMeasurements: [],
      currentVersion,
      selection: {
        leftSeedId: "seed-alpha",
        rightSeedId: "seed-beta",
        ageBucketKey: AGE_BUCKETS[1].key,
        metric: "gross_value",
      },
    });
    expect(missingGrowth.status).toBe("invalid");
    if (missingGrowth.status === "invalid") {
      expect(missingGrowth.reason).toBe("missing_measurements");
    }

    const sameSeed = buildSeedComparison({
      seeds,
      sources,
      growthMeasurements,
      currentVersion,
      selection: {
        leftSeedId: "seed-alpha",
        rightSeedId: "seed-alpha",
        ageBucketKey: AGE_BUCKETS[1].key,
        metric: "gross_value",
      },
    });
    expect(sameSeed.status).toBe("invalid");
    if (sameSeed.status === "invalid") {
      expect(sameSeed.reason).toBe("same_seed");
    }

    const nonIndexable = buildSeedComparison({
      seeds,
      sources,
      growthMeasurements,
      currentVersion,
      selection: {
        leftSeedId: "seed-gamma",
        rightSeedId: "seed-beta",
        ageBucketKey: AGE_BUCKETS[1].key,
        metric: "gross_value",
      },
    });
    expect(nonIndexable.status).toBe("invalid");
    if (nonIndexable.status === "invalid") {
      expect(nonIndexable.reason).toBe("seed_unavailable");
    }

    const gate = getSeedCompareIndexability({
      seeds: seeds.slice(0, 2),
      sources,
      growthMeasurements: growthMeasurements.slice(0, 8),
      currentVersion,
    });
    expect(gate.index).toBe(false);
  });
});
