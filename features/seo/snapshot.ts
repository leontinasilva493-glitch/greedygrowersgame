import { dataRepository } from "@/features/data/repository";

import type { IndexabilitySnapshot } from "./indexability";

const CODES_FRESH_DAYS = 30;

export async function getIndexabilitySnapshot(): Promise<IndexabilitySnapshot> {
  const [
    gameVersion,
    seeds,
    indexableSeeds,
    observations,
    measurements,
    sources,
    updates,
    codes,
  ] = await Promise.all([
    dataRepository.getCurrentGameVersion(),
    dataRepository.getSeeds(),
    dataRepository.getIndexableSeeds(),
    dataRepository.getPublicObservations(),
    dataRepository.getPublicGrowthMeasurements(),
    dataRepository.getSources(),
    dataRepository.getUpdates(),
    dataRepository.getCodes(),
  ]);

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const comparableSeedCount = indexableSeeds.filter((seed) => {
    if (seed.cost === undefined || !seed.currency) return false;
    const sessions = new Set(
      measurements
        .filter((measurement) => measurement.seedId === seed.id)
        .map((measurement) => measurement.serverSessionId),
    );
    return sessions.size >= 5;
  }).length;
  const codeAgeMs = Date.now() - Date.parse(codes.lastChecked);
  const codesFresh =
    Number.isFinite(codeAgeMs) &&
    codeAgeMs >= 0 &&
    codeAgeMs <= CODES_FRESH_DAYS * 24 * 60 * 60 * 1000;

  return {
    currentVersion: gameVersion.version,
    indexableSeedCount: indexableSeeds.length,
    comparableSeedCount,
    approvedRecordCount: observations.length + measurements.length + seeds.length,
    sourcedUpdateCount: updates.filter(
      (update) =>
        update.reviewState === "approved" &&
        update.sourceIds.some((id) => sourceById.get(id)?.url.startsWith("https://")),
    ).length,
    lightningGuideVerified:
      gameVersion.version !== "unverified" &&
      sources.some((source) => source.type === "official" && source.url.startsWith("https://")),
    codes: {
      redeemUiVerified: codes.redeemUiVerified,
      hasHttpsSource: codes.sourceIds.some((id) =>
        sourceById.get(id)?.url.startsWith("https://"),
      ),
      fresh: codesFresh,
      usefulContent:
        codes.active.length > 0 ||
        codes.expired.length > 0 ||
        codes.sourceIds.length > 0,
    },
  };
}
