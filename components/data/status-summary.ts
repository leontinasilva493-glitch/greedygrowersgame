import { getEffectiveStatus, isAcceptableSource, isSeedIndexable } from "../../features/data/eligibility";
import type { DataBundle } from "../../features/data/validation";

export interface DataStatusSnapshot {
  currentVersion: string;
  lastSourceCheckAt: string;
  indexableSeedCount: number;
  publicObservationCount: number;
  publicGrowthMeasurementCount: number;
  lowConfidenceCount: number;
  conflictCount: number;
  unknownCount: number;
  needsRecheckCount: number;
  recentChanges: DataBundle["dataChangelog"];
}

export function buildDataStatusSnapshot(bundle: DataBundle): DataStatusSnapshot {
  const currentVersion = bundle.gameVersion.version;
  const publicObservations = bundle.observations.filter(
    (observation) =>
      observation.reviewState === "approved" &&
      ["verified", "observed"].includes(
        getEffectiveStatus(observation.status, observation.gameVersion, currentVersion),
      ) &&
      isAcceptableSource(
        bundle.sources.find((source) => source.id === observation.sourceId),
        currentVersion,
      ),
  );
  const publicGrowthMeasurements = bundle.growthMeasurements.filter(
    (measurement) =>
      measurement.reviewState === "approved" &&
      ["verified", "observed"].includes(
        getEffectiveStatus(measurement.status, measurement.gameVersion, currentVersion),
      ) &&
      isAcceptableSource(
        bundle.sources.find((source) => source.id === measurement.sourceId),
        currentVersion,
      ),
  );

  const records = [
    ...bundle.seeds.map((seed) =>
      getEffectiveStatus(seed.status, seed.gameVersion, currentVersion),
    ),
    ...bundle.observations.map((observation) =>
      getEffectiveStatus(observation.status, observation.gameVersion, currentVersion),
    ),
    ...bundle.growthMeasurements.map((measurement) =>
      getEffectiveStatus(measurement.status, measurement.gameVersion, currentVersion),
    ),
    ...bundle.updates.map((update) =>
      getEffectiveStatus(update.status, update.gameVersion, currentVersion),
    ),
  ];
  const sourceTimes = bundle.sources.map((source) => source.capturedAt);

  return {
    currentVersion,
    lastSourceCheckAt: [bundle.gameVersion.checkedAt, ...sourceTimes]
      .sort((left, right) => right.localeCompare(left))[0] ?? bundle.gameVersion.checkedAt,
    indexableSeedCount: bundle.seeds.filter((seed) =>
      isSeedIndexable(seed, bundle.sources, currentVersion),
    ).length,
    publicObservationCount: publicObservations.length,
    publicGrowthMeasurementCount: publicGrowthMeasurements.length,
    lowConfidenceCount: records.filter((status) => status === "estimated").length,
    conflictCount: records.filter((status) => status === "conflicting").length,
    unknownCount: records.filter((status) => status === "unknown").length,
    needsRecheckCount: records.filter((status) => status === "needs_recheck").length,
    recentChanges: bundle.dataChangelog
      .slice()
      .sort((left, right) => right.changedAt.localeCompare(left.changedAt))
      .slice(0, 10),
  };
}
