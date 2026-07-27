import type { DataStatus, Seed, Source } from "./types";

export function getEffectiveStatus(
  status: DataStatus,
  recordVersion: string,
  currentVersion: string,
): DataStatus {
  return currentVersion === "unverified" ||
    recordVersion === "unverified" ||
    recordVersion !== currentVersion
    ? "needs_recheck"
    : status;
}

export function isAcceptableSource(
  source: Source | undefined,
  currentVersion: string,
) {
  if (!source || !source.url.startsWith("https://")) {
    return false;
  }

  return !source.gameVersion || source.gameVersion === currentVersion;
}

export function isAnalysisEligibleObservation(
  observation: import("./types").Observation,
  sources: Source[],
  currentVersion: string,
): boolean {
  const effectiveStatus = getEffectiveStatus(
    observation.status,
    observation.gameVersion,
    currentVersion,
  );
  const hasEligibleOutcome =
    (observation.event === "lightning" &&
      observation.censorReason === undefined &&
      observation.plannedStopSeconds !== undefined &&
      observation.exposureSeconds <= observation.plannedStopSeconds) ||
    (observation.event === "censored" &&
      observation.censorReason === "planned_stop" &&
      observation.plannedStopSeconds === observation.exposureSeconds);

  return (
    currentVersion !== "unverified" &&
    observation.reviewState === "approved" &&
    ["verified", "observed"].includes(effectiveStatus) &&
    observation.observationProtocol === "precommitted_window" &&
    observation.treeAgeAtStartSeconds === 0 &&
    hasEligibleOutcome &&
    isAcceptableSource(
      sources.find((source) => source.id === observation.sourceId),
      currentVersion,
    )
  );
}

export function selectModelEligibleObservations(
  observations: import("./types").Observation[],
  sources: Source[],
  currentVersion: string,
) {
  const selected = new Map<string, import("./types").Observation>();
  for (const observation of observations
    .filter((candidate) =>
      isAnalysisEligibleObservation(candidate, sources, currentVersion),
    )
    .sort(
      (left, right) =>
        left.startedAt.localeCompare(right.startedAt) ||
        left.id.localeCompare(right.id),
    )) {
    if (!selected.has(observation.serverSessionId)) {
      selected.set(observation.serverSessionId, observation);
    }
  }
  return [...selected.values()];
}

export function isSeedIndexable(
  seed: Seed,
  sources: Source[],
  currentVersion: string,
): boolean {
  if (
    currentVersion === "unverified" ||
    seed.gameVersion !== currentVersion ||
    !["verified", "observed"].includes(
      getEffectiveStatus(seed.status, seed.gameVersion, currentVersion),
    ) ||
    seed.indexing !== "index" ||
    seed.indexingReason.trim() === "" ||
    !seed.imageUrl?.startsWith("https://") ||
    !seed.imageSourceId ||
    (!seed.acquisition?.trim() && seed.cost === undefined)
  ) {
    return false;
  }

  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  if (!isAcceptableSource(sourceMap.get(seed.imageSourceId), currentVersion)) {
    return false;
  }

  const uniqueFactKeys = new Set(seed.facts.map((fact) => fact.key));
  if (uniqueFactKeys.size < 3 || uniqueFactKeys.size !== seed.facts.length) {
    return false;
  }

  const requiredSourceIds = new Set([
    ...seed.sourceIds,
    ...seed.facts.flatMap((fact) => fact.sourceIds),
  ]);
  if (
    seed.facts.some(
      (fact) =>
        fact.key.trim() === "" ||
        fact.value.trim() === "" ||
        fact.sourceIds.length === 0,
    )
  ) {
    return false;
  }

  return [...requiredSourceIds].every((sourceId) =>
    isAcceptableSource(sourceMap.get(sourceId), currentVersion),
  );
}
