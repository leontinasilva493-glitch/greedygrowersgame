import {
  getEffectiveStatus,
  isAcceptableSource,
  isSeedIndexable,
} from "../data/eligibility";
import type { GrowthMeasurement, Seed, Source } from "../data/types";

export const AGE_BUCKETS = [
  { key: "age-0-10", label: "0-10 seconds", includes: (age: number) => age >= 0 && age <= 10 },
  { key: "age-10-30", label: "10-30 seconds", includes: (age: number) => age > 10 && age <= 30 },
  { key: "age-30-60", label: "30-60 seconds", includes: (age: number) => age > 30 && age <= 60 },
  { key: "age-60-120", label: "60-120 seconds", includes: (age: number) => age > 60 && age <= 120 },
  { key: "age-120-plus", label: "120+ seconds", includes: (age: number) => age > 120 },
] as const;

export type AgeBucketKey = (typeof AGE_BUCKETS)[number]["key"];
export type ComparisonMetric = "gross_value" | "net_value" | "roi";

export interface ComparisonSelection {
  leftSeedId: string;
  rightSeedId: string;
  ageBucketKey: AgeBucketKey;
  metric: ComparisonMetric;
}

export interface ComparisonSide {
  seedId: string;
  seedName: string;
  currency: string;
  valueLabel: string;
  median: number;
  q1: number;
  q3: number;
  independentSessionCount: number;
  measurementCount: number;
  sourceLinks: Array<{ id: string; title: string; url: string }>;
  lastVerified: string;
  evidenceCoverageLabel: string;
  winner: null;
}

export type ComparisonResult =
  | {
      status: "ready";
      metric: ComparisonMetric;
      metricLabel: string;
      ageBucketKey: AgeBucketKey;
      ageBucketLabel: string;
      left: ComparisonSide;
      right: ComparisonSide;
    }
  | {
      status: "invalid";
      reason:
        | "same_seed"
        | "seed_unavailable"
        | "missing_measurements"
        | "bucket_mismatch"
        | "currency_mismatch"
        | "insufficient_sessions"
        | "missing_cost";
    };

export interface PageIndexability {
  index: boolean;
  follow: boolean;
  reason: string;
}

function quantile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 1) return sortedValues[0]!;

  const position = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = sortedValues[lowerIndex]!;
  const upper = sortedValues[upperIndex]!;

  if (lowerIndex === upperIndex) return lower;
  return lower + (upper - lower) * (position - lowerIndex);
}

function metricLabel(metric: ComparisonMetric): string {
  if (metric === "gross_value") return "Gross value";
  if (metric === "net_value") return "Net value";
  return "ROI";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function getAgeBucket(ageBucketKey: AgeBucketKey) {
  return AGE_BUCKETS.find((bucket) => bucket.key === ageBucketKey)!;
}

function buildSourceMap(sources: Source[]) {
  return new Map(sources.map((source) => [source.id, source]));
}

function collectPublicMeasurements(
  growthMeasurements: GrowthMeasurement[],
  sources: Source[],
  currentVersion: string,
) {
  const sourceMap = buildSourceMap(sources);
  return growthMeasurements.filter((measurement) => {
    const effectiveStatus = getEffectiveStatus(
      measurement.status,
      measurement.gameVersion,
      currentVersion,
    );
    return (
      measurement.reviewState === "approved" &&
      (effectiveStatus === "verified" || effectiveStatus === "observed") &&
      isAcceptableSource(sourceMap.get(measurement.sourceId), currentVersion)
    );
  });
}

function deriveMetricValues(
  measurements: GrowthMeasurement[],
  seed: Seed,
  metric: ComparisonMetric,
) {
  if (metric !== "gross_value" && (seed.cost === undefined || !seed.currency)) {
    return null;
  }

  return measurements.map((measurement) => {
    if (metric === "gross_value") return measurement.value;
    if (metric === "net_value") return measurement.value - (seed.cost ?? 0);
    return (measurement.value - (seed.cost ?? 0)) / (seed.cost ?? 1);
  });
}

function getComparableMeasurements(
  measurements: GrowthMeasurement[],
  seedId: string,
  ageBucketKey: AgeBucketKey,
) {
  const bucket = getAgeBucket(ageBucketKey);
  return measurements.filter(
    (measurement) =>
      measurement.seedId === seedId && bucket.includes(measurement.treeAgeSeconds),
  );
}

function buildComparisonSide(
  seed: Seed,
  measurements: GrowthMeasurement[],
  sources: Source[],
  metric: ComparisonMetric,
): ComparisonSide | "currency_mismatch" | "insufficient_sessions" | "missing_cost" {
  const currencies = [...new Set(measurements.map((measurement) => measurement.currency))];
  if (currencies.length !== 1) return "currency_mismatch";

  const independentSessionCount = new Set(
    measurements.map((measurement) => measurement.serverSessionId),
  ).size;
  if (independentSessionCount < 5) return "insufficient_sessions";

  const metricValues = deriveMetricValues(measurements, seed, metric);
  if (!metricValues) return "missing_cost";

  const sortedValues = [...metricValues].sort((left, right) => left - right);
  const sourceMap = buildSourceMap(sources);
  const sourceLinks = [...new Set(measurements.map((measurement) => measurement.sourceId))]
    .map((sourceId) => sourceMap.get(sourceId))
    .filter((source): source is Source => Boolean(source))
    .map((source) => ({ id: source.id, title: source.title, url: source.url }));

  return {
    seedId: seed.id,
    seedName: seed.name,
    currency: currencies[0]!,
    valueLabel:
      metric === "roi"
        ? `${formatNumber(quantile(sortedValues, 0.5) * 100)}% median`
        : `${formatNumber(quantile(sortedValues, 0.5))} ${currencies[0]!}`,
    median: quantile(sortedValues, 0.5),
    q1: quantile(sortedValues, 0.25),
    q3: quantile(sortedValues, 0.75),
    independentSessionCount,
    measurementCount: measurements.length,
    sourceLinks,
    lastVerified: measurements
      .map((measurement) => measurement.lastVerified)
      .sort()
      .at(-1)!,
    evidenceCoverageLabel: `${measurements.length} measurements from ${independentSessionCount} sessions`,
    winner: null,
  };
}

export function buildSeedComparison({
  seeds,
  sources,
  growthMeasurements,
  currentVersion,
  selection,
}: {
  seeds: Seed[];
  sources: Source[];
  growthMeasurements: GrowthMeasurement[];
  currentVersion: string;
  selection: ComparisonSelection;
}): ComparisonResult {
  if (selection.leftSeedId === selection.rightSeedId) {
    return { status: "invalid", reason: "same_seed" };
  }

  const seedMap = new Map(seeds.map((seed) => [seed.id, seed]));
  const leftSeed = seedMap.get(selection.leftSeedId);
  const rightSeed = seedMap.get(selection.rightSeedId);

  if (
    !leftSeed ||
    !rightSeed ||
    !isSeedIndexable(leftSeed, sources, currentVersion) ||
    !isSeedIndexable(rightSeed, sources, currentVersion)
  ) {
    return { status: "invalid", reason: "seed_unavailable" };
  }

  const publicMeasurements = collectPublicMeasurements(
    growthMeasurements,
    sources,
    currentVersion,
  );
  if (publicMeasurements.length === 0) {
    return { status: "invalid", reason: "missing_measurements" };
  }

  const leftMeasurements = getComparableMeasurements(
    publicMeasurements,
    leftSeed.id,
    selection.ageBucketKey,
  );
  const rightMeasurements = getComparableMeasurements(
    publicMeasurements,
    rightSeed.id,
    selection.ageBucketKey,
  );

  if (leftMeasurements.length === 0 || rightMeasurements.length === 0) {
    const leftAnyCurrent = publicMeasurements.some(
      (measurement) => measurement.seedId === leftSeed.id,
    );
    const rightAnyCurrent = publicMeasurements.some(
      (measurement) => measurement.seedId === rightSeed.id,
    );
    const leftAnyRaw = growthMeasurements.some(
      (measurement) => measurement.seedId === leftSeed.id,
    );
    const rightAnyRaw = growthMeasurements.some(
      (measurement) => measurement.seedId === rightSeed.id,
    );

    if (!leftAnyCurrent || !rightAnyCurrent) {
      return {
        status: "invalid",
        reason:
          leftAnyRaw || rightAnyRaw ? "seed_unavailable" : "missing_measurements",
      };
    }

    return {
      status: "invalid",
      reason: "bucket_mismatch",
    };
  }

  const leftSide = buildComparisonSide(
    leftSeed,
    leftMeasurements,
    sources,
    selection.metric,
  );
  if (typeof leftSide === "string") {
    return { status: "invalid", reason: leftSide };
  }

  const rightSide = buildComparisonSide(
    rightSeed,
    rightMeasurements,
    sources,
    selection.metric,
  );
  if (typeof rightSide === "string") {
    return { status: "invalid", reason: rightSide };
  }

  if (leftSide.currency !== rightSide.currency) {
    return { status: "invalid", reason: "currency_mismatch" };
  }

  return {
    status: "ready",
    metric: selection.metric,
    metricLabel: metricLabel(selection.metric),
    ageBucketKey: selection.ageBucketKey,
    ageBucketLabel: getAgeBucket(selection.ageBucketKey).label,
    left: leftSide,
    right: rightSide,
  };
}

export function getSeedCompareIndexability({
  seeds,
  sources,
  growthMeasurements,
  currentVersion,
}: {
  seeds: Seed[];
  sources: Source[];
  growthMeasurements: GrowthMeasurement[];
  currentVersion: string;
}): PageIndexability {
  const indexableSeeds = seeds.filter((seed) =>
    isSeedIndexable(seed, sources, currentVersion),
  );

  for (let index = 0; index < indexableSeeds.length; index += 1) {
    for (let inner = index + 1; inner < indexableSeeds.length; inner += 1) {
      for (const ageBucket of AGE_BUCKETS) {
        const result = buildSeedComparison({
          seeds: indexableSeeds,
          sources,
          growthMeasurements,
          currentVersion,
          selection: {
            leftSeedId: indexableSeeds[index]!.id,
            rightSeedId: indexableSeeds[inner]!.id,
            ageBucketKey: ageBucket.key,
            metric: "gross_value",
          },
        });
        if (result.status === "ready") {
          return {
            index: true,
            follow: true,
            reason: "Two comparable indexable seeds are available.",
          };
        }
      }
    }
  }

  return {
    index: false,
    follow: true,
    reason: "Fewer than two comparable indexable seeds are available.",
  };
}
