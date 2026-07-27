"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, ExternalLink } from "lucide-react";

import type { GrowthMeasurement, Seed, Source } from "../../features/data/types";
import {
  AGE_BUCKETS,
  buildSeedComparison,
  getSeedCompareIndexability,
  type AgeBucketKey,
  type ComparisonMetric,
} from "../../features/seeds/compare";
import { getSeedsPageIndexability } from "../../features/seeds/selectors";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const metricOptions: Array<{ value: ComparisonMetric; label: string }> = [
  { value: "gross_value", label: "Gross value" },
  { value: "net_value", label: "Net value" },
  { value: "roi", label: "ROI" },
];

export function SeedCompare({
  seeds,
  sources,
  growthMeasurements,
  currentVersion,
}: {
  seeds: Seed[];
  sources: Source[];
  growthMeasurements: GrowthMeasurement[];
  currentVersion: string;
}) {
  const listGate = useMemo(
    () => getSeedsPageIndexability(seeds, sources, currentVersion),
    [currentVersion, seeds, sources],
  );
  const compareGate = useMemo(
    () =>
      getSeedCompareIndexability({
        seeds,
        sources,
        growthMeasurements,
        currentVersion,
      }),
    [currentVersion, growthMeasurements, seeds, sources],
  );
  const indexableSeeds = useMemo(
    () => seeds.filter((seed) => seed.indexing === "index"),
    [seeds],
  );

  const [leftSeedId, setLeftSeedId] = useState(indexableSeeds[0]?.id ?? "");
  const [rightSeedId, setRightSeedId] = useState(indexableSeeds[1]?.id ?? "");
  const [ageBucketKey, setAgeBucketKey] = useState<AgeBucketKey>(
    AGE_BUCKETS[1]?.key ?? AGE_BUCKETS[0].key,
  );
  const [metric, setMetric] = useState<ComparisonMetric>("gross_value");

  const comparison = useMemo(
    () =>
      buildSeedComparison({
        seeds,
        sources,
        growthMeasurements,
        currentVersion,
        selection: { leftSeedId, rightSeedId, ageBucketKey, metric },
      }),
    [ageBucketKey, currentVersion, growthMeasurements, leftSeedId, metric, rightSeedId, seeds, sources],
  );

  return (
    <div className="space-y-6">
      <section className="border border-survey-line bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-lightning">
              Client-only comparison state
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Selections stay in browser state and always canonicalize to
              <code className="mx-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs text-foreground">
                /seeds/compare
              </code>
              without crawlable query combinations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/seeds">Back to seed list</Link>
            </Button>
            <Button asChild>
              <Link href="/">Load in calculator</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <SelectField
            label="Left seed"
            value={leftSeedId}
            disabled={indexableSeeds.length < 2}
            onChange={setLeftSeedId}
            options={indexableSeeds.map((seed) => ({
              value: seed.id,
              label: seed.name,
            }))}
          />
          <SelectField
            label="Right seed"
            value={rightSeedId}
            disabled={indexableSeeds.length < 2}
            onChange={setRightSeedId}
            options={indexableSeeds.map((seed) => ({
              value: seed.id,
              label: seed.name,
            }))}
          />
          <SelectField
            label="Age bucket"
            value={ageBucketKey}
            onChange={(nextValue) => setAgeBucketKey(nextValue as AgeBucketKey)}
            options={AGE_BUCKETS.map((bucket) => ({
              value: bucket.key,
              label: bucket.label,
            }))}
          />
          <SelectField
            label="Metric"
            value={metric}
            onChange={(nextValue) => setMetric(nextValue as ComparisonMetric)}
            options={metricOptions}
          />
        </div>
      </section>

      <section className="border border-survey-line bg-surface p-4 sm:p-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Compare gate
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Seed list gate: {listGate.reason} Compare gate: {compareGate.reason}
        </p>
      </section>

      {comparison.status === "invalid" ? (
        <InvalidCompareState reason={comparison.reason} />
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <SeedHeroCard
              title={comparison.left.seedName}
              metricLabel={comparison.metricLabel}
              valueLabel={comparison.left.valueLabel}
              sessions={comparison.left.independentSessionCount}
              evidenceCoverage={comparison.left.evidenceCoverageLabel}
              lastVerified={comparison.left.lastVerified}
            />
            <div className="grid place-items-center">
              <div className="flex size-12 items-center justify-center rounded-[4px] border border-lightning/50 bg-surface-raised text-lightning">
                <ArrowRightLeft aria-hidden="true" className="size-5" />
              </div>
            </div>
            <SeedHeroCard
              title={comparison.right.seedName}
              metricLabel={comparison.metricLabel}
              valueLabel={comparison.right.valueLabel}
              sessions={comparison.right.independentSessionCount}
              evidenceCoverage={comparison.right.evidenceCoverageLabel}
              lastVerified={comparison.right.lastVerified}
            />
          </section>

          <Table aria-label="Seed comparison metrics">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Field</TableHead>
                <TableHead scope="col">{comparison.left.seedName}</TableHead>
                <TableHead scope="col">{comparison.right.seedName}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <CompareRow
                label={`Median ${comparison.metricLabel.toLowerCase()}`}
                left={formatMetricValue(comparison.metric, comparison.left.median, comparison.left.currency)}
                right={formatMetricValue(comparison.metric, comparison.right.median, comparison.right.currency)}
              />
              <CompareRow
                label="Interquartile range"
                left={formatRange(comparison.metric, comparison.left.q1, comparison.left.q3, comparison.left.currency)}
                right={formatRange(comparison.metric, comparison.right.q1, comparison.right.q3, comparison.right.currency)}
              />
              <CompareRow
                label="Independent sessions"
                left={String(comparison.left.independentSessionCount)}
                right={String(comparison.right.independentSessionCount)}
              />
              <CompareRow
                label="Measurement count"
                left={String(comparison.left.measurementCount)}
                right={String(comparison.right.measurementCount)}
              />
              <CompareRow
                label="Evidence coverage"
                left={comparison.left.evidenceCoverageLabel}
                right={comparison.right.evidenceCoverageLabel}
              />
              <CompareRow
                label="Last verified"
                left={formatDate(comparison.left.lastVerified)}
                right={formatDate(comparison.right.lastVerified)}
              />
              <CompareRow
                label="Age bucket"
                left={comparison.ageBucketLabel}
                right={comparison.ageBucketLabel}
              />
            </TableBody>
          </Table>

          <div className="grid gap-4 lg:grid-cols-2">
            <SourcePanel title={comparison.left.seedName} links={comparison.left.sourceLinks} />
            <SourcePanel title={comparison.right.seedName} links={comparison.right.sourceLinks} />
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <select
        className="mt-1 min-h-11 w-full rounded-[4px] border border-input bg-surface-raised px-3 py-2 text-base text-foreground outline-none transition-[border-color,box-shadow,background-color] focus-visible:border-lightning focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        disabled={disabled}
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

function InvalidCompareState({ reason }: { reason: string }) {
  const messageMap: Record<string, string> = {
    same_seed: "Choose two different seeds before comparing.",
    seed_unavailable:
      "One selected seed is not currently indexable with matching current-version evidence.",
    missing_measurements:
      "The selected seeds do not yet have enough approved measurements for any comparison.",
    bucket_mismatch:
      "The selected seeds do not share approved measurements in the same exact age bucket.",
    currency_mismatch:
      "Both sides must use the same currency before comparison is allowed.",
    insufficient_sessions:
      "Each side needs at least five independent sessions in the selected bucket.",
    missing_cost:
      "Net value and ROI require a cost on both seeds.",
  };

  return (
    <section className="border border-risk/60 bg-surface px-5 py-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-risk">
        Comparison unavailable
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
        This pair is not comparable yet.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {messageMap[reason] ?? "Comparison is unavailable with the current selection."}
      </p>
    </section>
  );
}

function SeedHeroCard({
  title,
  metricLabel,
  valueLabel,
  sessions,
  evidenceCoverage,
  lastVerified,
}: {
  title: string;
  metricLabel: string;
  valueLabel: string;
  sessions: number;
  evidenceCoverage: string;
  lastVerified: string;
}) {
  return (
    <article className="border border-survey-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-lightning">
        {metricLabel}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-4 text-2xl font-semibold text-grow">{valueLabel}</p>
      <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Sessions</dt>
          <dd className="font-semibold text-foreground">{sessions}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Evidence</dt>
          <dd className="text-right font-semibold text-foreground">
            {evidenceCoverage}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Last verified</dt>
          <dd className="font-semibold text-foreground">{formatDate(lastVerified)}</dd>
        </div>
      </dl>
    </article>
  );
}

function CompareRow({
  label,
  left,
  right,
}: {
  label: string;
  left: string;
  right: string;
}) {
  return (
    <TableRow>
      <TableCell className="whitespace-normal font-semibold text-foreground">
        {label}
      </TableCell>
      <TableCell className="whitespace-normal">{left}</TableCell>
      <TableCell className="whitespace-normal">{right}</TableCell>
    </TableRow>
  );
}

function SourcePanel({
  title,
  links,
}: {
  title: string;
  links: Array<{ id: string; title: string; url: string }>;
}) {
  return (
    <section className="border border-survey-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-lightning">
        Source links
      </p>
      <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
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
    </section>
  );
}

function formatMetricValue(
  metric: ComparisonMetric,
  value: number,
  currency: string,
) {
  if (metric === "roi") {
    return `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value * 100)}%`;
  }
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

function formatRange(
  metric: ComparisonMetric,
  low: number,
  high: number,
  currency: string,
) {
  return `${formatMetricValue(metric, low, currency)} to ${formatMetricValue(metric, high, currency)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
