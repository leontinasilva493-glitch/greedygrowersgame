import type { Metadata } from "next";

import { DataStatusBadge } from "@/components/data/DataStatusBadge";
import { buildDataStatusSnapshot } from "@/components/data/status-summary";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dataRepository } from "@/features/data/repository";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Data Status",
    description:
      "Public evidence counts, current version status, and moderation transparency for Greedy Growers Calculator.",
    canonical: "/data-status",
    route: "/data-status",
    snapshot: await getIndexabilitySnapshot(),
  });
}

const statusCards = [
  {
    title: "Factual seeds",
    status: "verified" as const,
    description: "Seeds that can support a factual public detail page.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.indexableSeedCount,
  },
  {
    title: "Public observations",
    status: "observed" as const,
    description: "Approved current-version observations with acceptable sources.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.publicObservationCount,
  },
  {
    title: "Public growth readings",
    status: "observed" as const,
    description: "Approved current-version value measurements used for raw evidence.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.publicGrowthMeasurementCount,
  },
  {
    title: "Estimated groups",
    status: "estimated" as const,
    description: "Approved records that remain explicitly estimated.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.lowConfidenceCount,
  },
  {
    title: "Conflicts",
    status: "conflicting" as const,
    description: "Approved records with unresolved evidence conflict.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.conflictCount,
  },
  {
    title: "Unknowns",
    status: "unknown" as const,
    description:
      "Facts still missing enough evidence to publish as observed or verified.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.unknownCount,
  },
  {
    title: "Needs recheck",
    status: "needs_recheck" as const,
    description:
      "Older-version or stale records that cannot be mixed into current results.",
    getValue: (snapshot: ReturnType<typeof buildDataStatusSnapshot>) =>
      snapshot.needsRecheckCount,
  },
] as const;

export default async function DataStatusPage() {
  const [
    seeds,
    observations,
    growthMeasurements,
    sources,
    updates,
    dataChangelog,
    codes,
    gameVersion,
  ] = await Promise.all([
    dataRepository.getSeeds(),
    dataRepository.getObservations(),
    dataRepository.getGrowthMeasurements(),
    dataRepository.getSources(),
    dataRepository.getUpdates(),
    dataRepository.getDataChangelog(),
    dataRepository.getCodes(),
    dataRepository.getCurrentGameVersion(),
  ]);

  const snapshot = buildDataStatusSnapshot({
    seeds,
    observations,
    growthMeasurements,
    sources,
    updates,
    dataChangelog,
    codes,
    gameVersion,
  });

  return (
    <ContentPage
      eyebrow="Data status / Public evidence"
      title="What the public dataset can prove today"
      description="This page exposes only reviewable public counts. Pending and rejected submissions never appear in these numbers."
      status={`Current version: ${snapshot.currentVersion} | Last source check: ${snapshot.lastSourceCheckAt.slice(0, 10)}`}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statusCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <DataStatusBadge status={card.status} />
              <CardTitle className="mt-3">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-bold text-foreground">
                {card.getValue(snapshot)}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-8">
        <EvidenceNote>
          Public counts are derived from approved current-version records and
          acceptable sources only. Submission inbox volume, rejected items, and
          pending moderation work are intentionally excluded.
        </EvidenceNote>
      </div>

      <ContentSection title="Recent public data changes">
        {snapshot.recentChanges.length === 0 ? (
          <p>
            No approved data change has been published yet. The empty state is
            intentional: source checks and moderation exist before public scale.
          </p>
        ) : (
          <ul className="grid gap-3">
            {snapshot.recentChanges.map((change) => (
              <li
                key={change.id}
                className="border-l-2 border-lightning bg-surface px-4 py-3"
              >
                <p className="font-semibold text-foreground">{change.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {change.changedAt.slice(0, 10)} | Reviewer {change.reviewer} |
                  {" "}Method {change.methodVersion}
                </p>
              </li>
            ))}
          </ul>
        )}
      </ContentSection>

      <ContentSection title="How this page stays conservative">
        <ul className="grid gap-2 pl-5 marker:text-lightning">
          <li>Pending and rejected records never enter public counts.</li>
          <li>Older-version records remain visible only as needs-recheck debt.</li>
          <li>Observed and verified are counted separately from estimated.</li>
          <li>Indexable seed pages require their own factual evidence gate.</li>
        </ul>
        <div className="mt-4">
          <InlineCta href="/about">Read the evidence method</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
