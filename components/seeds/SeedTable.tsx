"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search, SlidersHorizontal } from "lucide-react";

import type {
  GrowthMeasurement,
  Observation,
  Seed,
  Source,
} from "../../features/data/types";
import {
  buildSeedRows,
  type SeedFilters,
  type SeedSort,
} from "../../features/seeds/selectors";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const defaultFilters: SeedFilters = {
  search: "",
  rarity: "all",
  sourceType: "all",
  status: "all",
};

export function SeedTable({
  seeds,
  sources,
  observations,
  growthMeasurements,
  currentVersion,
}: {
  seeds: Seed[];
  sources: Source[];
  observations: Observation[];
  growthMeasurements: GrowthMeasurement[];
  currentVersion: string;
}) {
  const [filters, setFilters] = useState<SeedFilters>(defaultFilters);
  const [sort, setSort] = useState<SeedSort>("samples-desc");

  const rows = useMemo(
    () =>
      buildSeedRows({
        seeds,
        sources,
        observations,
        growthMeasurements,
        currentVersion,
        filters,
        sort,
      }),
    [currentVersion, filters, growthMeasurements, observations, seeds, sort, sources],
  );

  const rarityOptions = useMemo(
    () =>
      [...new Set(seeds.map((seed) => seed.rarity).filter(Boolean))].sort(
        (left, right) => left!.localeCompare(right!, "en-US"),
      ),
    [seeds],
  );

  return (
    <div className="space-y-6">
      <section className="border border-survey-line bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-lightning">
              Search and filter
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Counts and ranges use only current-version approved records with
              acceptable HTTPS evidence. Below the range gate, we show raw
              measurement count instead of a derived value band.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/seeds/compare">Compare two seeds</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
          <div className="min-w-0">
            <label
              htmlFor="seed-search"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Search aria-hidden="true" className="size-4 text-lightning" />
              Search
            </label>
            <Input
              id="seed-search"
              value={filters.search}
              placeholder="Seed name, rarity, acquisition, or fact"
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </div>
          <SelectField
            label="Rarity"
            value={filters.rarity}
            onChange={(nextValue) =>
              setFilters((current) => ({ ...current, rarity: nextValue }))
            }
            options={[
              { value: "all", label: "All rarities" },
              ...rarityOptions.map((rarity) => ({
                value: rarity!,
                label: rarity!,
              })),
            ]}
          />
          <SelectField
            label="Source type"
            value={filters.sourceType}
            onChange={(nextValue) =>
              setFilters((current) => ({
                ...current,
                sourceType: nextValue as SeedFilters["sourceType"],
              }))
            }
            options={[
              { value: "all", label: "All source types" },
              { value: "official", label: "Official" },
              { value: "gameplay", label: "Gameplay" },
              { value: "community", label: "Community" },
              { value: "editorial", label: "Editorial" },
            ]}
          />
          <SelectField
            label="Status"
            value={filters.status}
            onChange={(nextValue) =>
              setFilters((current) => ({
                ...current,
                status: nextValue as SeedFilters["status"],
              }))
            }
            options={[
              { value: "all", label: "All statuses" },
              { value: "observed_or_verified", label: "Observed or verified" },
              { value: "needs_recheck", label: "Needs recheck" },
              { value: "unknown", label: "Unknown" },
            ]}
          />
          <SelectField
            label="Sort"
            value={sort}
            onChange={(nextValue) => setSort(nextValue as SeedSort)}
            options={[
              { value: "samples-desc", label: "Most sessions" },
              { value: "name-asc", label: "Name A-Z" },
              { value: "cost-asc", label: "Lowest cost" },
              { value: "cost-desc", label: "Highest cost" },
            ]}
          />
        </div>
      </section>

      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {rows.length} displayed seed{rows.length === 1 ? "" : "s"} · Current game
        version {currentVersion}
      </p>

      <div className="hidden md:block">
        <Table aria-label="Greedy Growers seed evidence table">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Seed</TableHead>
              <TableHead scope="col">Rarity</TableHead>
              <TableHead scope="col">Acquisition</TableHead>
              <TableHead scope="col">Cost</TableHead>
              <TableHead scope="col">Observed range</TableHead>
              <TableHead scope="col">Sessions</TableHead>
              <TableHead scope="col">Observations</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Last verified</TableHead>
              <TableHead scope="col">Sources</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="whitespace-normal py-8 text-center text-muted-foreground">
                  No seeds match the current filter set.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.seedId}>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{row.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.isIndexableSeed
                          ? "Indexable factual record"
                          : "Listed for evidence transparency only"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{row.rarity ?? "Unknown"}</TableCell>
                  <TableCell className="whitespace-normal">
                    {row.acquisition ?? "Unknown"}
                  </TableCell>
                  <TableCell>{row.costLabel}</TableCell>
                  <TableCell className="whitespace-normal">
                    {row.rangeGatePassed && row.rangeLabel
                      ? row.rangeLabel
                      : `${row.measurementCount} raw measurements`}
                  </TableCell>
                  <TableCell>{row.independentSessionCount}</TableCell>
                  <TableCell>{row.observationCount}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.effectiveStatus} />
                  </TableCell>
                  <TableCell>{formatDate(row.lastVerified)}</TableCell>
                  <TableCell className="whitespace-normal">
                    <SourceLinks links={row.sourceLinks} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.length === 0 ? (
          <div className="border border-survey-line bg-surface p-5 text-sm text-muted-foreground">
            No seeds match the current filter set.
          </div>
        ) : (
          rows.map((row) => (
            <article
              key={row.seedId}
              className="overflow-hidden border border-survey-line bg-surface"
            >
              <div className="border-b border-dashed border-survey-line px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {row.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.rarity ?? "Unknown rarity"} · {row.acquisition ?? "Unknown acquisition"}
                    </p>
                  </div>
                  <StatusBadge status={row.effectiveStatus} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-px bg-survey-line">
                <CardMetric label="Cost" value={row.costLabel} />
                <CardMetric
                  label="Observed range"
                  value={
                    row.rangeGatePassed && row.rangeLabel
                      ? row.rangeLabel
                      : `${row.measurementCount} raw measurements`
                  }
                />
                <CardMetric
                  label="Sessions"
                  value={String(row.independentSessionCount)}
                />
                <CardMetric
                  label="Observations"
                  value={String(row.observationCount)}
                />
              </dl>
              <div className="space-y-3 px-4 py-4 text-sm text-muted-foreground">
                <p>
                  Last verified {formatDate(row.lastVerified)}.
                  {row.isIndexableSeed
                    ? " This seed is eligible for public factual indexing."
                    : " This seed remains visible here for transparency, without a detail page."}
                </p>
                <SourceLinks links={row.sourceLinks} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="min-w-0">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SlidersHorizontal aria-hidden="true" className="size-4 text-lightning" />
        {label}
      </label>
      <select
        className="min-h-11 w-full rounded-[4px] border border-input bg-surface-raised px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-lightning focus-visible:ring-[3px] focus-visible:ring-ring/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "verified" || status === "observed"
      ? "border-grow/50 text-grow"
      : status === "needs_recheck"
        ? "border-lightning/50 text-lightning"
        : "border-risk/50 text-risk";

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-[4px] border px-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${tone}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function SourceLinks({
  links,
}: {
  links: Array<{ id: string; title: string; url: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-8 items-center gap-1 rounded-[4px] border border-survey-line px-2 text-xs font-semibold text-lightning hover:border-lightning/60"
        >
          {link.title}
          <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      ))}
    </div>
  );
}

function CardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-raised px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
