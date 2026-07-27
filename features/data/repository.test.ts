import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createDataRepository,
  loadDataBundle,
  resolveDefaultDataDirectory,
} from "./repository";

describe("data repository boundary", () => {
  it("loads the validated fixture repository outside production", async () => {
    const directory = path.join(process.cwd(), "tests", "fixtures", "data", "valid");
    const repository = createDataRepository(directory);
    const seeds = await repository.getSeeds();
    expect(seeds.map((seed) => seed.id)).toContain("eligible-seed-1");
    expect((await repository.getIndexableSeeds()).map((seed) => seed.id)).toEqual([
      "eligible-seed-1",
      "eligible-seed-2",
    ]);
    expect((await repository.getPublicObservations()).map((item) => item.id)).toEqual([
      "eligible-planned-stop",
      "eligible-lightning",
      "opportunistic",
    ]);
    expect(
      (await repository.getModelEligibleObservations()).map((item) => item.id),
    ).toEqual(["eligible-planned-stop", "eligible-lightning"]);
    expect(
      (await repository.getPublicGrowthMeasurements()).map((item) => item.id),
    ).toEqual(["growth-1"]);
  });

  it("never resolves fixture data in production", () => {
    expect(() =>
      resolveDefaultDataDirectory({
        cwd: process.cwd(),
        nodeEnv: "production",
        dataset: "fixtures",
      }),
    ).toThrow(/fixture/i);

    expect(
      resolveDefaultDataDirectory({
        cwd: process.cwd(),
        nodeEnv: "production",
      }),
    ).toBe(path.join(process.cwd(), "data"));
  });

  it("rejects the duplicate-record fixture before it can be queried", async () => {
    const directory = path.join(
      process.cwd(),
      "tests",
      "fixtures",
      "data",
      "invalid-duplicates",
    );
    await expect(loadDataBundle(directory)).rejects.toThrow(/duplicate id/i);
  });
});
