import path from "node:path";
import { readFile } from "node:fs/promises";

import {
  codesDatasetSchema,
  dataChangelogSchema,
  gameVersionSchema,
  growthMeasurementsSchema,
  observationsSchema,
  seedsSchema,
  sourcesSchema,
  updatesSchema,
} from "./schemas";
import {
  getEffectiveStatus,
  isAcceptableSource,
  isSeedIndexable,
  selectModelEligibleObservations,
} from "./eligibility";
import type { DataBundle } from "./validation";
import { validateDataBundle } from "./validation";

async function readJson(directory: string, fileName: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(directory, fileName), "utf8"));
}

export async function loadDataBundle(directory: string): Promise<DataBundle> {
  const [seeds, observations, growthMeasurements, sources, updates, dataChangelog, codes, gameVersion] =
    await Promise.all([
      readJson(directory, "seeds.json").then((value) => seedsSchema.parse(value)),
      readJson(directory, "observations.json").then((value) => observationsSchema.parse(value)),
      readJson(directory, "growth-measurements.json").then((value) => growthMeasurementsSchema.parse(value)),
      readJson(directory, "sources.json").then((value) => sourcesSchema.parse(value)),
      readJson(directory, "updates.json").then((value) => updatesSchema.parse(value)),
      readJson(directory, "data-changelog.json").then((value) => dataChangelogSchema.parse(value)),
      readJson(directory, "codes.json").then((value) => codesDatasetSchema.parse(value)),
      readJson(directory, "game-version.json").then((value) => gameVersionSchema.parse(value)),
    ]);
  const bundle = { seeds, observations, growthMeasurements, sources, updates, dataChangelog, codes, gameVersion };
  const errors = validateDataBundle(bundle);
  if (errors.length > 0) throw new Error(`Data validation failed:\n${errors.join("\n")}`);
  return bundle;
}

export function createDataRepository(dataDirectory: string) {
  let cached: Promise<DataBundle> | undefined;
  const getBundle = () => (cached ??= loadDataBundle(dataDirectory));
  return {
    getSeeds: async () => (await getBundle()).seeds,
    getObservations: async () => (await getBundle()).observations,
    getGrowthMeasurements: async () => (await getBundle()).growthMeasurements,
    getSources: async () => (await getBundle()).sources,
    getUpdates: async () => (await getBundle()).updates,
    getDataChangelog: async () => (await getBundle()).dataChangelog,
    getCodes: async () => (await getBundle()).codes,
    getCurrentGameVersion: async () => (await getBundle()).gameVersion,
    getIndexableSeeds: async () => {
      const bundle = await getBundle();
      return bundle.seeds.filter((seed) =>
        isSeedIndexable(seed, bundle.sources, bundle.gameVersion.version),
      );
    },
    getPublicObservations: async () => {
      const bundle = await getBundle();
      return bundle.observations.filter(
        (observation) =>
          observation.reviewState === "approved" &&
          ["verified", "observed"].includes(
            getEffectiveStatus(
              observation.status,
              observation.gameVersion,
              bundle.gameVersion.version,
            ),
          ) &&
          isAcceptableSource(
            bundle.sources.find((source) => source.id === observation.sourceId),
            bundle.gameVersion.version,
          ),
      );
    },
    getPublicGrowthMeasurements: async () => {
      const bundle = await getBundle();
      return bundle.growthMeasurements.filter(
        (measurement) =>
          measurement.reviewState === "approved" &&
          ["verified", "observed"].includes(
            getEffectiveStatus(
              measurement.status,
              measurement.gameVersion,
              bundle.gameVersion.version,
            ),
          ) &&
          isAcceptableSource(
            bundle.sources.find((source) => source.id === measurement.sourceId),
            bundle.gameVersion.version,
          ),
      );
    },
    getModelEligibleObservations: async () => {
      const bundle = await getBundle();
      return selectModelEligibleObservations(
        bundle.observations,
        bundle.sources,
        bundle.gameVersion.version,
      );
    },
  };
}

interface ResolveOptions {
  cwd: string;
  nodeEnv?: string;
  dataset?: string;
}

export function resolveDefaultDataDirectory({ cwd, nodeEnv, dataset }: ResolveOptions) {
  if (dataset === "fixtures") {
    if (nodeEnv === "production") {
      throw new Error("Fixture data is forbidden in production.");
    }
    return path.join(cwd, "tests", "fixtures", "data", "valid");
  }
  if (dataset) throw new Error(`Unknown GREEDY_DATASET value: ${dataset}`);
  return path.join(cwd, "data");
}

export const dataRepository = createDataRepository(
  resolveDefaultDataDirectory({
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    dataset: process.env.GREEDY_DATASET,
  }),
);
