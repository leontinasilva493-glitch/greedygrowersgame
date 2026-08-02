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
