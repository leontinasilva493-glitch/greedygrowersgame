export interface IndexabilitySnapshot {
  currentVersion: string;
  phaseZeroEvidenceReady: boolean;
  beginnerGuideEvidenceReady: boolean;
  indexableSeedCount: number;
  comparableSeedCount: number;
  approvedRecordCount: number;
  sourcedUpdateCount: number;
  lightningGuideVerified: boolean;
  lightningModelEligible: boolean;
  mutationsGuideVerified: boolean;
  predictionPotionVerified?: boolean;
  petsGuideVerified?: boolean;
  ticketsGuideVerified?: boolean;
  rebirthGuideVerified?: boolean;
  bigTreeGuideVerified?: boolean;
  fertilizerGuideVerified?: boolean;
  wormsGuideVerified?: boolean;
  farmersMarketGuideVerified?: boolean;
  seedChairGuideVerified?: boolean;
  codes: {
    redeemUiVerified: boolean;
    hasHttpsSource: boolean;
    fresh: boolean;
    usefulContent: boolean;
  };
}

export interface PageIndexability {
  index: boolean;
  follow: boolean;
  includeInSitemap: boolean;
  reason: string;
  lastModified?: string;
}

const INDEXED_FIXED_ROUTES = new Set([
  "/",
  "/about",
  "/guides",
  "/guides/beginner-guide",
  "/guides/when-to-harvest",
  "/guides/how-to-make-money",
]);

const NOINDEX_FIXED_ROUTES = new Set([
  "/contact",
  "/privacy",
  "/terms",
  "/submit-data",
  "/data-status",
]);

function decision(index: boolean, reason: string): PageIndexability {
  return { index, follow: true, includeInSitemap: index, reason };
}

export function getPageIndexability(
  route: string,
  snapshot: IndexabilitySnapshot,
): PageIndexability {
  if (INDEXED_FIXED_ROUTES.has(route)) {
    return decision(true, "Unique public calculator or verified editorial content.");
  }
  if (NOINDEX_FIXED_ROUTES.has(route)) {
    return decision(false, "Utility, legal, or submission route.");
  }

  switch (route) {
    case "/seeds":
      return decision(
        snapshot.phaseZeroEvidenceReady && snapshot.indexableSeedCount >= 3,
        "Requires at least three evidence-eligible seeds.",
      );
    case "/seeds/compare":
      return decision(
        snapshot.phaseZeroEvidenceReady && snapshot.comparableSeedCount >= 2,
        "Requires at least two directly comparable evidence-eligible seeds.",
      );
    case "/lightning":
      return decision(
        snapshot.phaseZeroEvidenceReady &&
          snapshot.lightningGuideVerified &&
          snapshot.lightningModelEligible,
        "Requires a source-backed guide and an eligible current-version observation model.",
      );
    case "/guides/mutations":
      return decision(
        snapshot.mutationsGuideVerified,
        "Requires independently reviewed current-version gameplay and editorial sources.",
      );
    case "/guides/prediction-potion":
      return decision(
        snapshot.predictionPotionVerified === true,
        "Requires current-version gameplay plus independent support for acquisition, effect, consumption, duration, and version.",
      );
    case "/pets":
      return decision(
        snapshot.petsGuideVerified === true,
        "Requires a reviewed current-version pet, egg, acquisition, and passive evidence set.",
      );
    case "/guides/how-to-get-tickets":
      return decision(
        snapshot.ticketsGuideVerified === true,
        "Requires reviewed current-version earning, payout, refresh, and spending evidence.",
      );
    case "/guides/rebirth":
      return decision(
        snapshot.rebirthGuideVerified === true,
        "Requires a reviewed current-version before-and-after record of cost, resets, rewards, and unlocks.",
      );
    case "/guides/how-to-grow-big-trees":
      return decision(
        snapshot.bigTreeGuideVerified === true,
        "Requires current-version gameplay plus independent support for tree-size factors and outcomes.",
      );
    case "/guides/fertilizer":
      return decision(
        snapshot.fertilizerGuideVerified === true,
        "Requires a reviewed current-version fertilizer panel, application record, and controlled outcome.",
      );
    case "/guides/worms":
      return decision(
        snapshot.wormsGuideVerified === true,
        "Requires current-version worm acquisition, use, effect, duration, and consumption evidence.",
      );
    case "/guides/farmers-market":
      return decision(
        snapshot.farmersMarketGuideVerified === true,
        "Requires a reviewed current-version order, delivery, reward, and refresh cycle.",
      );
    case "/guides/seed-feeding-chair":
      return decision(
        snapshot.seedChairGuideVerified === true,
        "Requires a reviewed current-version request, seed consumption, progress, and completion record.",
      );
    case "/updates":
      return decision(
        snapshot.sourcedUpdateCount >= 1,
        "Requires at least one approved sourced update.",
      );
    case "/codes": {
      const codes = snapshot.codes;
      return decision(
        codes.redeemUiVerified &&
          codes.hasHttpsSource &&
          codes.fresh &&
          codes.usefulContent,
        "Requires verified redemption UI, a fresh HTTPS source, and useful content.",
      );
    }
    default:
      if (/^\/seeds\/[^/]+$/.test(route)) {
        return decision(
          snapshot.phaseZeroEvidenceReady && snapshot.indexableSeedCount >= 1,
          "Requires Phase 0 plus an evidence-eligible current-version seed record.",
        );
      }
      return decision(false, "Unknown or entity route without an explicit evidence gate.");
  }
}

export function metadataRobots(decisionValue: PageIndexability) {
  return { index: decisionValue.index, follow: decisionValue.follow };
}
