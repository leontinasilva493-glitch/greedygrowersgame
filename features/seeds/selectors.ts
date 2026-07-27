import {
  getEffectiveStatus,
  isAcceptableSource,
  isSeedIndexable,
} from "../data/eligibility";
import type {
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
} from "../data/types";

export type SeedStatusFilter =
  | "all"
  | "observed_or_verified"
  | "needs_recheck"
  | "unknown";
export type SeedSourceTypeFilter = Source["type"] | "all";
export type SeedSort = "name-asc" | "cost-asc" | "cost-desc" | "samples-desc";

export interface SeedFilters {
  search: string;
  rarity: string | "all";
  sourceType: SeedSourceTypeFilter;
  status: SeedStatusFilter;
}

export interface SeedRow {
  seedId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  rarity: string | null;
  acquisition: string | null;
  cost: number | null;
  currency: string | null;
  costLabel: string;
  effectiveStatus: ReturnType<typeof getEffectiveStatus>;
  lastVerified: string;
  sourceIds: string[];
  sourceLinks: Array<{ id: string; title: string; url: string; type: Source["type"] }>;
  observationCount: number;
  measurementCount: number;
  independentSessionCount: number;
  rangeGatePassed: boolean;
  rangeLabel: string | null;
  isIndexableSeed: boolean;
}

export interface PageIndexability {
  index: boolean;
  follow: boolean;
  reason: string;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function buildSourceMap(sources: Source[]) {
  return new Map(sources.map((source) => [source.id, source]));
}

function matchesSearch(seed: Seed, search: string): boolean {
  const query = search.trim().toLocaleLowerCase("en-US");
  if (!query) return true;

  return [
    seed.name,
    seed.slug,
    seed.rarity ?? "",
    seed.acquisition ?? "",
    ...seed.facts.map((fact) => `${fact.key} ${fact.value}`),
  ]
    .join(" ")
    .toLocaleLowerCase("en-US")
    .includes(query);
}

function matchesStatus(
  effectiveStatus: ReturnType<typeof getEffectiveStatus>,
  filter: SeedStatusFilter,
) {
  if (filter === "all") return true;
  if (filter === "observed_or_verified") {
    return effectiveStatus === "observed" || effectiveStatus === "verified";
  }
  return effectiveStatus === filter;
}

function sortNullableNumber(
  left: number | null,
  right: number | null,
  direction: "asc" | "desc",
) {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
}

function getSeedSourceIds(seed: Seed) {
  return unique([
    ...seed.sourceIds,
    ...seed.facts.flatMap((fact) => fact.sourceIds),
    ...(seed.imageSourceId ? [seed.imageSourceId] : []),
  ]);
}

function collectPublicMeasurements(
  measurements: GrowthMeasurement[],
  sources: Source[],
  currentVersion: string,
) {
  const sourceMap = buildSourceMap(sources);
  return measurements.filter((measurement) => {
    const effectiveStatus = getEffectiveStatus(
      measurement.status,
      measurement.gameVersion,
      currentVersion,
    );
    return (
      measurement.reviewState === "approved" &&
      (effectiveStatus === "verified" || effectiveStatus === "observed") &&
      isAcceptableSource(sourceMap.get(measurement.sourceId), currentVersion)
    );
  });
}

function collectPublicObservations(
  observations: Observation[],
  sources: Source[],
  currentVersion: string,
) {
  const sourceMap = buildSourceMap(sources);
  return observations.filter((observation) => {
    const effectiveStatus = getEffectiveStatus(
      observation.status,
      observation.gameVersion,
      currentVersion,
    );
    return (
      observation.reviewState === "approved" &&
      (effectiveStatus === "verified" || effectiveStatus === "observed") &&
      isAcceptableSource(sourceMap.get(observation.sourceId), currentVersion)
    );
  });
}

export function buildSeedRows({
  seeds,
  sources,
  observations,
  growthMeasurements,
  currentVersion,
  filters,
  sort,
}: {
  seeds: Seed[];
  sources: Source[];
  observations: Observation[];
  growthMeasurements: GrowthMeasurement[];
  currentVersion: string;
  filters: SeedFilters;
  sort: SeedSort;
}): SeedRow[] {
  const sourceMap = buildSourceMap(sources);
  const publicMeasurements = collectPublicMeasurements(
    growthMeasurements,
    sources,
    currentVersion,
  );
  const publicObservations = collectPublicObservations(
    observations,
    sources,
    currentVersion,
  );

  const rows = seeds.map((seed) => {
    const effectiveStatus = getEffectiveStatus(
      seed.status,
      seed.gameVersion,
      currentVersion,
    );
    const seedSourceIds = getSeedSourceIds(seed);
    const seedSources = seedSourceIds
      .map((sourceId) => sourceMap.get(sourceId))
      .filter((source): source is Source => Boolean(source));

    const eligibleMeasurements = publicMeasurements.filter(
      (measurement) =>
        measurement.seedId === seed.id &&
        (seed.currency ? measurement.currency === seed.currency : true),
    );
    const eligibleObservations = publicObservations.filter(
      (observation) => observation.seedId === seed.id,
    );
    const independentSessionCount = new Set(
      eligibleMeasurements.map((measurement) => measurement.serverSessionId),
    ).size;
    const rangeGatePassed =
      eligibleMeasurements.length >= 5 && independentSessionCount >= 3;
    const sortedValues = eligibleMeasurements
      .map((measurement) => measurement.value)
      .sort((left, right) => left - right);
    const rangeLabel =
      rangeGatePassed && sortedValues.length > 0
        ? `${formatNumber(sortedValues[0]!)}-${formatNumber(sortedValues.at(-1)!)} ${
            eligibleMeasurements[0]!.currency
          }`
        : null;

    return {
      seedId: seed.id,
      slug: seed.slug,
      name: seed.name,
      imageUrl: seed.imageUrl ?? null,
      rarity: seed.rarity ?? null,
      acquisition: seed.acquisition ?? null,
      cost: seed.cost ?? null,
      currency: seed.currency ?? null,
      costLabel:
        seed.cost !== undefined && seed.currency
          ? `${formatNumber(seed.cost)} ${seed.currency}`
          : "Unknown",
      effectiveStatus,
      lastVerified: seed.lastVerified,
      sourceIds: seedSourceIds,
      sourceLinks: seedSources.map((source) => ({
        id: source.id,
        title: source.title,
        url: source.url,
        type: source.type,
      })),
      observationCount: eligibleObservations.length,
      measurementCount: eligibleMeasurements.length,
      independentSessionCount,
      rangeGatePassed,
      rangeLabel,
      isIndexableSeed: isSeedIndexable(seed, sources, currentVersion),
    };
  });

  const filtered = rows.filter((row) => {
    const seed = seeds.find((candidate) => candidate.id === row.seedId);
    if (!seed) return false;

    if (!matchesSearch(seed, filters.search)) return false;
    if (
      filters.rarity !== "all" &&
      (row.rarity ?? "").toLocaleLowerCase("en-US") !==
        filters.rarity.toLocaleLowerCase("en-US")
    ) {
      return false;
    }
    if (!matchesStatus(row.effectiveStatus, filters.status)) return false;
    if (
      filters.sourceType !== "all" &&
      !row.sourceLinks.some((source) => source.type === filters.sourceType)
    ) {
      return false;
    }
    return true;
  });

  return filtered.sort((left, right) => {
    if (sort === "name-asc") {
      return left.name.localeCompare(right.name, "en-US");
    }
    if (sort === "cost-asc") {
      return (
        sortNullableNumber(left.cost, right.cost, "asc") ||
        left.name.localeCompare(right.name, "en-US")
      );
    }
    if (sort === "cost-desc") {
      return (
        sortNullableNumber(left.cost, right.cost, "desc") ||
        left.name.localeCompare(right.name, "en-US")
      );
    }
    return (
      sortNullableNumber(
        left.independentSessionCount,
        right.independentSessionCount,
        "desc",
      ) || left.name.localeCompare(right.name, "en-US")
    );
  });
}

export function getSeedsPageIndexability(
  seeds: Seed[],
  sources: Source[],
  currentVersion: string,
): PageIndexability {
  const indexableCount = seeds.filter((seed) =>
    isSeedIndexable(seed, sources, currentVersion),
  ).length;

  if (indexableCount >= 3) {
    return {
      index: true,
      follow: true,
      reason: "Three or more current-version indexable seeds are available.",
    };
  }

  return {
    index: false,
    follow: true,
    reason: "Fewer than three current-version indexable seeds are available.",
  };
}
