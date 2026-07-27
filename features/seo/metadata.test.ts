import { describe, expect, it } from "vitest";

import type { IndexabilitySnapshot } from "./indexability";
import { createGatedMetadata } from "./metadata";

const openSnapshot: IndexabilitySnapshot = {
  currentVersion: "2026-07-27",
  indexableSeedCount: 4,
  comparableSeedCount: 3,
  approvedRecordCount: 20,
  sourcedUpdateCount: 2,
  lightningGuideVerified: true,
  codes: {
    redeemUiVerified: true,
    hasHttpsSource: true,
    fresh: true,
    usefulContent: true,
  },
};

describe("createGatedMetadata", () => {
  it.each(["/lightning", "/updates", "/codes", "/data-status"])(
    "opens robots metadata for %s when the central evidence gate opens",
    (route) => {
      const metadata = createGatedMetadata({
        title: "Evidence page",
        description: "Evidence description",
        canonical: route,
        route,
        snapshot: openSnapshot,
      });

      expect(metadata.robots).toMatchObject({ index: true, follow: true });
    },
  );
});
