import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadDataBundle } from "../../features/data/repository";
import { buildDataStatusSnapshot } from "./status-summary";

describe("buildDataStatusSnapshot", () => {
  it("derives public-facing counts and excludes pending and rejected records", async () => {
    const directory = path.join(
      process.cwd(),
      "tests",
      "fixtures",
      "data",
      "valid",
    );
    const bundle = await loadDataBundle(directory);

    const snapshot = buildDataStatusSnapshot(bundle);

    expect(snapshot.currentVersion).toBe("2026-07-27");
    expect(snapshot.lastSourceCheckAt).toBe("2026-07-27T00:00:00.000Z");
    expect(snapshot.indexableSeedCount).toBe(2);
    expect(snapshot.publicObservationCount).toBe(3);
    expect(snapshot.publicGrowthMeasurementCount).toBe(1);
    expect(snapshot.lowConfidenceCount).toBe(1);
    expect(snapshot.conflictCount).toBe(0);
    expect(snapshot.unknownCount).toBe(1);
    expect(snapshot.needsRecheckCount).toBe(1);
    expect(snapshot.recentChanges).toEqual([]);
  });
});
