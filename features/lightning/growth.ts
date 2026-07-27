import { getEffectiveStatus, isAcceptableSource } from "../data/eligibility";
import type { DerivedProvenance, GrowthMeasurement, Source } from "../data/types";

export const GROWTH_BUCKETS = [
  { key: "0-10", label: "0 to 10 seconds", minExclusive: -1, maxInclusive: 10 },
  { key: "10-30", label: "Over 10 to 30 seconds", minExclusive: 10, maxInclusive: 30 },
  { key: "30-60", label: "Over 30 to 60 seconds", minExclusive: 30, maxInclusive: 60 },
  { key: "60-120", label: "Over 60 to 120 seconds", minExclusive: 60, maxInclusive: 120 },
  { key: "120-plus", label: "Over 120 seconds", minExclusive: 120, maxInclusive: null },
] as const;

export type GrowthBucketKey = (typeof GROWTH_BUCKETS)[number]["key"];

export interface GrowthBucket extends DerivedProvenance {
  key: GrowthBucketKey;
  label: string;
  measurementCount: number;
  sessionCount: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
  rangeEligible: boolean;
  lineEligible: boolean;
  measurementIds: string[];
}

function quantile(values: number[], percentile: number): number | null {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return values[0];
  }

  const index = (values.length - 1) * percentile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return values[lowerIndex];
  }

  const weight = index - lowerIndex;
  return values[lowerIndex] * (1 - weight) + values[upperIndex] * weight;
}

function resolveBucket(treeAgeSeconds: number) {
  return GROWTH_BUCKETS.find((bucket) => {
    const aboveMin = treeAgeSeconds > bucket.minExclusive;
    const belowMax =
      bucket.maxInclusive === null || treeAgeSeconds <= bucket.maxInclusive;
    return aboveMin && belowMax;
  });
}

export function buildGrowthBuckets({
  currentVersion,
  measurements,
  seedId,
  sources,
}: {
  currentVersion: string;
  measurements: GrowthMeasurement[];
  seedId: string;
  sources: Source[];
}): GrowthBucket[] {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const eligibleMeasurements = measurements.filter((measurement) => {
    const effectiveStatus = getEffectiveStatus(
      measurement.status,
      measurement.gameVersion,
      currentVersion,
    );

    return (
      measurement.seedId === seedId &&
      measurement.reviewState === "approved" &&
      ["verified", "observed"].includes(effectiveStatus) &&
      measurement.gameVersion === currentVersion &&
      isAcceptableSource(sourceMap.get(measurement.sourceId), currentVersion)
    );
  });

  const computedAt = new Date().toISOString();
  const methodVersion = "growth-v1";
  const buckets = GROWTH_BUCKETS.map((bucket) => {
    const matches = eligibleMeasurements
      .filter(
        (measurement) =>
          resolveBucket(measurement.treeAgeSeconds)?.key === bucket.key,
      )
      .sort(
        (left, right) => left.value - right.value || left.id.localeCompare(right.id),
      );
    const values = matches.map((measurement) => measurement.value);
    const sessionCount = new Set(
      matches.map((measurement) => measurement.serverSessionId),
    ).size;
    const rangeEligible = matches.length >= 5 && sessionCount >= 3;

    return {
      key: bucket.key,
      label: bucket.label,
      measurementCount: matches.length,
      sessionCount,
      median: quantile(values, 0.5),
      p25: quantile(values, 0.25),
      p75: quantile(values, 0.75),
      rangeEligible,
      lineEligible: false,
      measurementIds: matches.map((measurement) => measurement.id),
      sourceIds: [...new Set(matches.map((measurement) => measurement.sourceId))],
      methodVersion,
      computedAt,
    } satisfies GrowthBucket;
  });

  const gatedBucketCount = buckets.filter((bucket) => bucket.rangeEligible).length;
  return buckets.map((bucket) => ({
    ...bucket,
    lineEligible: bucket.rangeEligible && gatedBucketCount >= 3,
  }));
}

export function getRangeEligibleGrowthBuckets(buckets: GrowthBucket[]) {
  return buckets.filter((bucket) => bucket.rangeEligible);
}
