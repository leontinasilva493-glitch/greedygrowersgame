import { isAnalysisEligibleObservation, isSeedIndexable } from "./eligibility";
import type {
  CodesDataset,
  DataChange,
  GameVersion,
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
  Update,
} from "./types";

export interface DataBundle {
  seeds: Seed[];
  observations: Observation[];
  growthMeasurements: GrowthMeasurement[];
  sources: Source[];
  updates: Update[];
  dataChangelog: DataChange[];
  codes: CodesDataset;
  gameVersion: GameVersion;
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  return new Set(values.filter((value) => (seen.has(value) ? true : !seen.add(value))));
}

function intervalsOverlap(left: Observation, right: Observation) {
  return (
    Date.parse(left.startedAt) < Date.parse(right.endedAt) &&
    Date.parse(right.startedAt) < Date.parse(left.endedAt)
  );
}

export function validateDataBundle(bundle: DataBundle): string[] {
  const errors: string[] = [];
  const allRecords = [
    ...bundle.seeds,
    ...bundle.observations,
    ...bundle.growthMeasurements,
    ...bundle.sources,
    ...bundle.updates,
    ...bundle.dataChangelog,
  ];
  for (const duplicate of duplicateValues(allRecords.map((record) => record.id))) {
    errors.push(`duplicate id: ${duplicate}`);
  }
  for (const duplicate of duplicateValues(bundle.seeds.map((seed) => seed.slug))) {
    errors.push(`duplicate slug: ${duplicate}`);
  }

  const sources = new Map(bundle.sources.map((source) => [source.id, source]));
  const seeds = new Set(bundle.seeds.map((seed) => seed.id));
  const requireSource = (sourceId: string, owner: string) => {
    if (!sources.has(sourceId)) errors.push(`${owner} references missing source ${sourceId}`);
  };

  bundle.gameVersion.sourceIds.forEach((id) => requireSource(id, "game version"));
  for (const seed of bundle.seeds) {
    seed.sourceIds.forEach((id) => requireSource(id, seed.id));
    seed.facts.flatMap((fact) => fact.sourceIds).forEach((id) => requireSource(id, seed.id));
    if (seed.imageSourceId) requireSource(seed.imageSourceId, seed.id);
    if (seed.indexing === "index" && !isSeedIndexable(seed, bundle.sources, bundle.gameVersion.version)) {
      errors.push(`indexed seed ${seed.id} fails eligibility`);
    }
  }
  for (const observation of bundle.observations) {
    requireSource(observation.sourceId, observation.id);
    if (observation.seedId && !seeds.has(observation.seedId)) {
      errors.push(`${observation.id} references missing seed ${observation.seedId}`);
    }
  }
  for (const measurement of bundle.growthMeasurements) {
    requireSource(measurement.sourceId, measurement.id);
    if (!seeds.has(measurement.seedId)) {
      errors.push(`${measurement.id} references missing seed ${measurement.seedId}`);
    }
  }
  bundle.updates.forEach((update) =>
    update.sourceIds.forEach((id) => requireSource(id, update.id)),
  );
  bundle.dataChangelog.forEach((change) =>
    change.sourceIds.forEach((id) => requireSource(id, change.id)),
  );
  bundle.codes.sourceIds.forEach((id) => requireSource(id, "codes"));
  [...bundle.codes.active, ...bundle.codes.expired].forEach((code) =>
    code.sourceIds.forEach((id) => requireSource(id, `code ${code.code}`)),
  );

  const identityKeys = bundle.observations.map(
    (item) =>
      `${item.serverSessionId}|${item.treeInstanceId}|${item.treeAgeAtStartSeconds}|${item.treeAgeAtEndSeconds}`,
  );
  for (const duplicate of duplicateValues(identityKeys)) {
    errors.push(`duplicate tree/session/age interval: ${duplicate}`);
  }
  const evidenceKeys = bundle.observations.map(
    (item) => `${item.evidenceUrl}|${item.startedAt}|${item.endedAt}`,
  );
  for (const duplicate of duplicateValues(evidenceKeys)) {
    errors.push(`reused evidence segment: ${duplicate}`);
  }
  for (let leftIndex = 0; leftIndex < bundle.observations.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < bundle.observations.length; rightIndex += 1) {
      const left = bundle.observations[leftIndex];
      const right = bundle.observations[rightIndex];
      if (
        left.serverSessionId === right.serverSessionId &&
        left.treeInstanceId === right.treeInstanceId &&
        intervalsOverlap(left, right)
      ) {
        errors.push(`overlapping observation intervals: ${left.id}, ${right.id}`);
      }
      if (
        left.evidenceUrl === right.evidenceUrl &&
        intervalsOverlap(left, right) &&
        !errors.some((error) =>
          error.includes(`reused evidence segment: ${left.evidenceUrl}`),
        )
      ) {
        errors.push(
          `reused evidence segment: ${left.evidenceUrl} (${left.id}, ${right.id})`,
        );
      }
    }
  }

  const eligibleBySession = new Map<string, Set<string>>();
  for (const observation of bundle.observations) {
    if (
      isAnalysisEligibleObservation(
        observation,
        bundle.sources,
        bundle.gameVersion.version,
      )
    ) {
      const trees = eligibleBySession.get(observation.serverSessionId) ?? new Set();
      trees.add(observation.treeInstanceId);
      eligibleBySession.set(observation.serverSessionId, trees);
    }
  }
  for (const [sessionId, trees] of eligibleBySession) {
    if (trees.size > 1) {
      errors.push(`multiple analysis-eligible trees in server session ${sessionId}`);
    }
  }

  const measurementKeys = bundle.growthMeasurements.map(
    (item) => `${item.serverSessionId}|${item.treeInstanceId}|${item.treeAgeSeconds}`,
  );
  for (const duplicate of duplicateValues(measurementKeys)) {
    errors.push(`duplicate growth measurement: ${duplicate}`);
  }
  return errors;
}
