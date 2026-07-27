import { describe, expect, it } from "vitest";

import { getPageIndexability, type IndexabilitySnapshot } from "./indexability";

const empty: IndexabilitySnapshot = {
  currentVersion: "unverified",
  indexableSeedCount: 0,
  comparableSeedCount: 0,
  approvedRecordCount: 0,
  sourcedUpdateCount: 0,
  lightningGuideVerified: false,
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
  });

  it("keeps legal and submission routes out of the index", () => {
    for (const route of ["/contact", "/privacy", "/terms", "/submit-data"]) {
      expect(getPageIndexability(route, empty)).toMatchObject({
        index: false,
        follow: true,
        includeInSitemap: false,
      });
    }
  });

  it("keeps empty data pages noindex", () => {
    for (const route of ["/seeds", "/seeds/compare", "/lightning", "/updates", "/data-status", "/codes"]) {
      expect(getPageIndexability(route, empty).index).toBe(false);
    }
  });

  it("unlocks each data route only through its own gate", () => {
    const ready: IndexabilitySnapshot = {
      ...empty,
      currentVersion: "2026.07.27",
      indexableSeedCount: 3,
      comparableSeedCount: 2,
      approvedRecordCount: 1,
      sourcedUpdateCount: 1,
      lightningGuideVerified: true,
      codes: {
        redeemUiVerified: true,
        hasHttpsSource: true,
        fresh: true,
        usefulContent: true,
      },
    };

    for (const route of ["/seeds", "/seeds/compare", "/lightning", "/updates", "/data-status", "/codes"]) {
      expect(getPageIndexability(route, ready)).toMatchObject({
        index: true,
        includeInSitemap: true,
      });
    }
  });
});
