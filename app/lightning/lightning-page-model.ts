import type {
  GameVersion,
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
} from "@/features/data/types";
import { buildGrowthBuckets, type GrowthBucket } from "@/features/lightning/growth";
import {
  buildKaplanMeierCurve,
  estimateConditionalRisk,
} from "@/features/lightning/kaplan-meier";
import { evaluateModelEligibility } from "@/features/lightning/model-gate";

export type LightningProbability =
  | { available: false; reasons: string[] }
  | {
      available: true;
      decision: "MODEL_UNCERTAIN";
      estimate: number;
      lower95: number;
      upper95: number;
      nAtRiskStart: number;
      nAtRiskEnd: number;
      intervalEvents: number;
      confidence: "low" | "medium" | "high";
      gameVersion: string;
      methodVersion: string;
      computedAt: string;
      sourceIds: string[];
    };

export type LightningSeedMode =
  | { available: false; reasons: string[] }
  | {
      available: true;
      candidates: Array<{ seed: Seed; bucket: GrowthBucket }>;
    };

export function buildLightningPageModel({
  gameVersion,
  observations,
  growthMeasurements,
  seeds,
  sources,
}: {
  gameVersion: GameVersion;
  observations: Observation[];
  growthMeasurements: GrowthMeasurement[];
  seeds: Seed[];
  sources: Source[];
}) {
  const eligibility = evaluateModelEligibility({
    currentVersion: gameVersion.version,
    observations,
    sources,
  });
  const eligibleObservations = observations.filter((observation) =>
    eligibility.observationIds?.includes(observation.id),
  );
  const curve = eligibility.eligible
    ? buildKaplanMeierCurve(eligibleObservations)
    : [];
  const startAge = curve[0]?.ageSeconds ?? 0;
  const interval =
    curve.length > 0
      ? estimateConditionalRisk(curve, startAge, 30)
      : { available: false as const, reason: "Model gate is closed." };

  const probability: LightningProbability =
    eligibility.eligible && interval.available
      ? {
          available: true,
          decision: "MODEL_UNCERTAIN",
          estimate: interval.estimate,
          lower95: interval.lower95,
          upper95: interval.upper95,
          nAtRiskStart: interval.nAtRiskStart,
          nAtRiskEnd: interval.nAtRiskEnd,
          intervalEvents: interval.intervalEvents,
          confidence: eligibility.confidence,
          gameVersion: gameVersion.version,
          methodVersion: eligibility.methodVersion,
          computedAt: eligibility.computedAt,
          sourceIds: interval.sourceIds,
        }
      : {
          available: false,
          reasons: eligibility.eligible
            ? [interval.available ? "No interval is available." : interval.reason]
            : eligibility.reasons,
        };

  const candidates = seeds.flatMap((seed) => {
    const bucket = buildGrowthBuckets({
      currentVersion: gameVersion.version,
      measurements: growthMeasurements,
      seedId: seed.id,
      sources,
    }).find((candidate) => candidate.rangeEligible);

    return bucket ? [{ seed, bucket }] : [];
  });
  const seedMode: LightningSeedMode =
    candidates.length > 0
      ? { available: true, candidates }
      : {
          available: false,
          reasons: [
            "No seed has five approved measurements from three sessions in one age bucket.",
          ],
        };

  return {
    eligibility,
    probability,
    seedMode,
    curve,
    rawRows: eligibleObservations.map((observation) => ({
      id: observation.id,
      event: observation.event,
      exposureSeconds: observation.exposureSeconds,
      sourceId: observation.sourceId,
    })),
  };
}
