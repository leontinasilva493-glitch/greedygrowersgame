import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createDataRepository,
  loadDataBundle,
} from "../../features/data/repository";
import {
  buildSeedDetailModel,
  getSeedDetailStaticParams,
} from "./seed-detail-model";

describe("seed detail model", () => {
  it("returns only indexable seed params and keeps factual, range, chart, and risk gates separate", async () => {
    const directory = path.join(
      process.cwd(),
      "tests",
      "fixtures",
      "data",
      "valid",
    );
    const repository = createDataRepository(directory);
    const bundle = await loadDataBundle(directory);
    const indexableSeeds = await repository.getIndexableSeeds();
    const publicObservations = await repository.getPublicObservations();
    const publicGrowthMeasurements = await repository.getPublicGrowthMeasurements();

    expect(getSeedDetailStaticParams(indexableSeeds)).toEqual([
      { slug: "eligible-seed-1" },
      { slug: "eligible-seed-2" },
    ]);

    const eligibleModel = buildSeedDetailModel({
      currentVersion: bundle.gameVersion.version,
      indexableSeeds,
      publicObservations,
      publicGrowthMeasurements,
      seedSlug: "eligible-seed-1",
      sources: bundle.sources,
      computedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(eligibleModel?.seed.slug).toBe("eligible-seed-1");
    expect(eligibleModel?.factualPageEligible).toBe(true);
    expect(eligibleModel?.growthRangeGate).toBe(false);
    expect(eligibleModel?.growthChartGate).toBe(false);
    expect(eligibleModel?.seedRiskGate).toBe(false);
    expect(eligibleModel?.growthSummary.label).toBe(
      "Observed values among recorded survivors",
    );
    expect(eligibleModel?.rawObservationCount).toBe(2);
    expect(eligibleModel?.rawGrowthMeasurementCount).toBe(1);
    expect(eligibleModel?.relatedSeeds.map((seed) => seed.slug)).toEqual([
      "eligible-seed-2",
    ]);

    const ineligibleModel = buildSeedDetailModel({
      currentVersion: bundle.gameVersion.version,
      indexableSeeds,
      publicObservations,
      publicGrowthMeasurements,
      seedSlug: "ineligible-seed",
      sources: bundle.sources,
      computedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(ineligibleModel).toBeNull();
  });
});
