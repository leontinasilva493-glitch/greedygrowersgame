import { dataRepository } from "@/features/data/repository";
import {
  currentEvidenceManifest,
} from "@/features/evidence/current";
import { evaluatePhaseZeroEvidence, type EvidenceManifest } from "@/features/evidence/manifest";
import { evaluateModelEligibility } from "@/features/lightning/model-gate";
import { getSeedCompareIndexability } from "@/features/seeds/compare";
import type { Source } from "@/features/data/types";

import type { IndexabilitySnapshot } from "./indexability";

const CODES_FRESH_DAYS = 30;

export function isLightningGuideVerified(
  manifest: EvidenceManifest,
  sources: Source[],
) {
  const approval = manifest.publicationApprovals;
  if (!approval.lightningGuideReviewed) return false;

  const sourceById = new Map(sources.map((source) => [source.id, source]));
  return (
    approval.lightningGuideSourceIds.length > 0 &&
    approval.lightningGuideSourceIds.every((sourceId) => {
      const source = sourceById.get(sourceId);
      return (
        source !== undefined &&
        ["official", "gameplay"].includes(source.type) &&
        source.url.startsWith("https://")
      );
    })
  );
}

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
  const phaseZeroEvidenceGate = evaluatePhaseZeroEvidence(
    currentEvidenceManifest,
    {
      officialSourceIds: sources
        .filter((source) => source.type === "official")
        .map((source) => source.id),
    },
  );
  const lightningEligibility = evaluateModelEligibility({
    currentVersion: gameVersion.version,
    observations,
    sources,
  });
  const compareGate = getSeedCompareIndexability({
    seeds,
    sources,
    growthMeasurements: measurements,
    currentVersion: gameVersion.version,
  });
  const codeAgeMs = Date.now() - Date.parse(codes.lastChecked);
  const codesFresh =
    Number.isFinite(codeAgeMs) &&
    codeAgeMs >= 0 &&
    codeAgeMs <= CODES_FRESH_DAYS * 24 * 60 * 60 * 1000;

  return {
    currentVersion: gameVersion.version,
    phaseZeroEvidenceReady: phaseZeroEvidenceGate.ready,
    beginnerGuideEvidenceReady:
      phaseZeroEvidenceGate.ready &&
      currentEvidenceManifest.publicationApprovals.beginnerGuideReviewed,
    indexableSeedCount: indexableSeeds.length,
    comparableSeedCount: compareGate.index ? 2 : 0,
    approvedRecordCount: observations.length + measurements.length + seeds.length,
    sourcedUpdateCount: updates.filter(
      (update) =>
        update.reviewState === "approved" &&
        update.sourceIds.some((id) => sourceById.get(id)?.url.startsWith("https://")),
    ).length,
    lightningGuideVerified:
      gameVersion.version !== "unverified" &&
      isLightningGuideVerified(currentEvidenceManifest, sources),
    lightningModelEligible: lightningEligibility.eligible,
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
