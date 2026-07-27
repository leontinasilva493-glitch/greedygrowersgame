import { describe, expect, it } from "vitest";

import type { GrowthMeasurement, Source } from "../data/types";

import {
  GROWTH_BUCKETS,
  buildGrowthBuckets,
  getRangeEligibleGrowthBuckets,
} from "./growth";

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

function measurement(
  id: string,
  treeAgeSeconds: number,
  value: number,
  serverSessionId: string,
  overrides: Partial<GrowthMeasurement> = {},
): GrowthMeasurement {
  return {
    id,
    seedId: "seed-a",
    treeInstanceId: `tree-${id}`,
    serverSessionId,
    gameVersion: currentVersion,
    treeAgeSeconds,
    value,
    currency: "coins",
    observedAt: "2026-07-26T00:00:00.000Z",
    sourceId: "source-1",
    evidenceUrl: `https://example.com/${id}`,
    status: "observed",
    reviewState: "approved",
    lastVerified: "2026-07-26T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildGrowthBuckets", () => {
  it("groups current-version approved values into fixed age buckets and computes quartiles", () => {
    const buckets = buildGrowthBuckets({
      currentVersion,
      measurements: [
        measurement("m1", 8, 20, "s1"),
        measurement("m2", 10, 24, "s2"),
        measurement("m3", 20, 40, "s1"),
        measurement("m4", 30, 44, "s2"),
        measurement("m5", 45, 60, "s3"),
        measurement("m6", 90, 90, "s4"),
        measurement("m7", 180, 150, "s5"),
      ],
      seedId: "seed-a",
      sources,
    });

    expect(buckets.map((bucket) => bucket.key)).toEqual(
      GROWTH_BUCKETS.map((bucket) => bucket.key),
    );
    expect(buckets[0]).toMatchObject({
      key: "0-10",
      measurementCount: 2,
      sessionCount: 2,
      median: 22,
      p25: 21,
      p75: 23,
    });
    expect(buckets[1]).toMatchObject({
      key: "10-30",
      measurementCount: 2,
      sessionCount: 2,
      median: 42,
      p25: 41,
      p75: 43,
    });
    expect(buckets[4]).toMatchObject({
      key: "120-plus",
      measurementCount: 1,
      sessionCount: 1,
      median: 150,
      p25: 150,
      p75: 150,
    });
  });

  it("requires five measurements from three sessions for a gated range and three gated buckets for a line", () => {
    const buckets = buildGrowthBuckets({
      currentVersion,
      measurements: [
        measurement("m1", 8, 10, "s1"),
        measurement("m2", 8, 11, "s2"),
        measurement("m3", 8, 12, "s3"),
        measurement("m4", 8, 13, "s1"),
        measurement("m5", 8, 14, "s2"),
        measurement("m6", 20, 20, "s1"),
        measurement("m7", 20, 21, "s2"),
        measurement("m8", 20, 22, "s3"),
        measurement("m9", 20, 23, "s1"),
        measurement("m10", 20, 24, "s2"),
        measurement("m11", 45, 40, "s1"),
        measurement("m12", 45, 41, "s2"),
        measurement("m13", 45, 42, "s3"),
        measurement("m14", 45, 43, "s1"),
        measurement("m15", 45, 44, "s2"),
      ],
      seedId: "seed-a",
      sources,
    });

    const eligible = getRangeEligibleGrowthBuckets(buckets);
    expect(eligible).toHaveLength(3);
    expect(eligible.every((bucket) => bucket.rangeEligible)).toBe(true);
    expect(eligible.every((bucket) => bucket.lineEligible)).toBe(true);
  });

  it("excludes stale, pending, estimated, wrong-seed, and broken-source measurements", () => {
    const buckets = buildGrowthBuckets({
      currentVersion,
      measurements: [
        measurement("good", 30, 40, "s1"),
        measurement("pending", 30, 42, "s2", { reviewState: "pending" }),
        measurement("estimated", 30, 44, "s3", { status: "estimated" }),
        measurement("stale", 30, 46, "s4", { gameVersion: "2026-07-25" }),
        measurement("wrong-seed", 30, 48, "s5", { seedId: "seed-b" }),
        measurement("bad-source", 30, 50, "s6", { sourceId: "missing-source" }),
      ],
      seedId: "seed-a",
      sources,
    });

    expect(buckets[1].measurementCount).toBe(1);
    expect(buckets[1].measurementIds).toEqual(["good"]);
  });
});
