import type { Observation, Seed, Source, GrowthMeasurement } from "../../features/data/types";
import {
  buildGrowthBuckets,
  getRangeEligibleGrowthBuckets,
} from "../../features/lightning/growth";

export interface SeedDetailModel {
  seed: Seed;
  factualPageEligible: boolean;
  growthRangeGate: boolean;
  growthChartGate: boolean;
  seedRiskGate: boolean;
  growthBuckets: ReturnType<typeof buildGrowthBuckets>;
  growthSummary: {
    label: string;
    computedAt: string;
    methodVersion: string;
    lineEligible: boolean;
    sourceIds: string[];
  };
  rawObservationCount: number;
  rawGrowthMeasurementCount: number;
  observations: Observation[];
  growthMeasurements: GrowthMeasurement[];
  relatedSeeds: Seed[];
  sources: Source[];
}

export function getSeedDetailStaticParams({
  indexableSeeds,
  phaseZeroEvidenceReady,
}: {
  indexableSeeds: Seed[];
  phaseZeroEvidenceReady: boolean;
}) {
  if (!phaseZeroEvidenceReady) return [];

  return indexableSeeds.map((seed) => ({ slug: seed.slug }));
}

export function buildSeedDetailModel({
  currentVersion,
  indexableSeeds,
  publicObservations,
  publicGrowthMeasurements,
  seedSlug,
  sources,
  computedAt,
}: {
  currentVersion: string;
  indexableSeeds: Seed[];
  publicObservations: Observation[];
  publicGrowthMeasurements: GrowthMeasurement[];
  seedSlug: string;
  sources: Source[];
  computedAt: string;
}): SeedDetailModel | null {
  const seed = indexableSeeds.find((candidate) => candidate.slug === seedSlug);
  if (!seed) {
    return null;
  }

  const growthBuckets = buildGrowthBuckets({
    currentVersion,
    measurements: publicGrowthMeasurements,
    seedId: seed.id,
    sources,
  });
  const seedObservations = publicObservations.filter(
    (observation) => observation.seedId === seed.id,
  );
  const seedGrowthMeasurements = publicGrowthMeasurements.filter(
    (measurement) => measurement.seedId === seed.id,
  );
  const gatedBuckets = getRangeEligibleGrowthBuckets(growthBuckets);

  return {
    seed,
    factualPageEligible: true,
    growthRangeGate: gatedBuckets.length > 0,
    growthChartGate: gatedBuckets.length >= 3,
    seedRiskGate: false,
    growthBuckets,
    growthSummary: {
      label: "Observed values among recorded survivors",
      computedAt,
      methodVersion: "growth-v1",
      lineEligible: gatedBuckets.length >= 3,
      sourceIds: [...new Set(growthBuckets.flatMap((bucket) => bucket.sourceIds))],
    },
    rawObservationCount: seedObservations.length,
    rawGrowthMeasurementCount: seedGrowthMeasurements.length,
    observations: seedObservations,
    growthMeasurements: seedGrowthMeasurements,
    relatedSeeds: indexableSeeds.filter((candidate) => candidate.id !== seed.id).slice(0, 3),
    sources,
  };
}
