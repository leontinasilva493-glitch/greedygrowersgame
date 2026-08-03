import { describe, expect, it } from "vitest";

import { getPageIndexability, type IndexabilitySnapshot } from "./indexability";

const empty: IndexabilitySnapshot = {
  currentVersion: "unverified",
  phaseZeroEvidenceReady: false,
  beginnerGuideEvidenceReady: false,
  indexableSeedCount: 0,
  comparableSeedCount: 0,
  approvedRecordCount: 0,
  sourcedUpdateCount: 0,
  lightningGuideVerified: false,
  lightningModelEligible: false,
  mutationsGuideVerified: false,
  codes: {
    redeemUiVerified: false,
    hasHttpsSource: false,
    fresh: false,
    usefulContent: false,
  },
};

describe("getPageIndexability", () => {
  it("indexes useful fixed acquisition pages", () => {
    expect(getPageIndexability("/", empty).index).toBe(true);
    expect(getPageIndexability("/guides", empty).includeInSitemap).toBe(true);
    expect(getPageIndexability("/about", empty).index).toBe(true);
    expect(getPageIndexability("/guides/beginner-guide", empty)).toMatchObject({
      index: true,
      follow: true,
      includeInSitemap: true,
    });
  });

  it("keeps legal and submission routes out of the index", () => {
    for (const route of ["/contact", "/privacy", "/terms", "/submit-data", "/data-status"]) {
      expect(getPageIndexability(route, empty)).toMatchObject({
        index: false,
        follow: true,
        includeInSitemap: false,
      });
    }
  });

  it("keeps empty data pages noindex", () => {
    for (const route of ["/seeds", "/seeds/compare", "/lightning", "/updates", "/codes"]) {
      expect(getPageIndexability(route, empty).index).toBe(false);
    }
  });

  it("unlocks each data route only through its own gate", () => {
    const ready: IndexabilitySnapshot = {
      ...empty,
      currentVersion: "2026.07.27",
      phaseZeroEvidenceReady: true,
      beginnerGuideEvidenceReady: true,
      indexableSeedCount: 3,
      comparableSeedCount: 2,
      approvedRecordCount: 1,
      sourcedUpdateCount: 1,
      lightningGuideVerified: true,
      lightningModelEligible: true,
      codes: {
        redeemUiVerified: true,
        hasHttpsSource: true,
        fresh: true,
        usefulContent: true,
      },
    };

    for (const route of ["/seeds", "/seeds/compare", "/lightning", "/updates", "/codes"]) {
      expect(getPageIndexability(route, ready)).toMatchObject({
        index: true,
        includeInSitemap: true,
      });
    }
    expect(getPageIndexability("/seeds/eligible-seed", ready)).toMatchObject({
      index: true,
      includeInSitemap: true,
    });
  });

  it("keeps lightning noindex until both the guide and model evidence gates pass", () => {
    expect(
      getPageIndexability("/lightning", {
        ...empty,
        currentVersion: "2026.07.27",
        lightningGuideVerified: true,
        lightningModelEligible: false,
      }),
    ).toMatchObject({ index: false, includeInSitemap: false });
  });

  it("keeps evidence-driven acquisition pages closed before Phase 0 passes", () => {
    const dataReadyButEvidenceMissing: IndexabilitySnapshot = {
      ...empty,
      currentVersion: "2026.07.27",
      indexableSeedCount: 3,
      comparableSeedCount: 2,
      lightningGuideVerified: true,
      lightningModelEligible: true,
      phaseZeroEvidenceReady: false,
    };

    for (const route of ["/seeds", "/seeds/compare", "/lightning"]) {
      expect(getPageIndexability(route, dataReadyButEvidenceMissing)).toMatchObject({
        index: false,
        includeInSitemap: false,
      });
    }
  });

  it("keeps the editorial beginner guide open without Phase 0 recordings", () => {
    expect(
      getPageIndexability("/guides/beginner-guide", {
        ...empty,
        phaseZeroEvidenceReady: false,
        beginnerGuideEvidenceReady: false,
      }),
    ).toMatchObject({ index: true, follow: true, includeInSitemap: true });
  });

  it("keeps the mutations guide noindex until its independent video and editorial sources are reviewed", () => {
    expect(
      getPageIndexability("/guides/mutations", {
        ...empty,
        currentVersion: "2026.08.03",
        mutationsGuideVerified: false,
      } as IndexabilitySnapshot),
    ).toMatchObject({ index: false, follow: true, includeInSitemap: false });

    expect(
      getPageIndexability("/guides/mutations", {
        ...empty,
        currentVersion: "2026.08.03",
        mutationsGuideVerified: true,
      } as IndexabilitySnapshot),
    ).toMatchObject({ index: true, follow: true, includeInSitemap: true });
  });
});
