import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
} from "@/components/layout/ContentPage";
import { GrowthCurve } from "@/components/charts/GrowthCurve";
import { DataStatusBadge } from "@/components/data/DataStatusBadge";
import {
  buildSeedDetailModel,
  getSeedDetailStaticParams,
} from "@/components/data/seed-detail-model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability, metadataRobots } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

export const dynamicParams = false;

async function loadSeedDetailModel(seedSlug: string) {
  const snapshot = await getIndexabilitySnapshot();
  if (!snapshot.phaseZeroEvidenceReady) return null;

  const [indexableSeeds, publicObservations, publicGrowthMeasurements, sources, gameVersion] =
    await Promise.all([
      dataRepository.getIndexableSeeds(),
      dataRepository.getPublicObservations(),
      dataRepository.getPublicGrowthMeasurements(),
      dataRepository.getSources(),
      dataRepository.getCurrentGameVersion(),
    ]);

  return buildSeedDetailModel({
    currentVersion: gameVersion.version,
    indexableSeeds,
    publicObservations,
    publicGrowthMeasurements,
    seedSlug,
    sources,
    computedAt: "2026-07-26T00:00:00.000Z",
  });
}

export async function generateStaticParams() {
  const [indexableSeeds, snapshot] = await Promise.all([
    dataRepository.getIndexableSeeds(),
    getIndexabilitySnapshot(),
  ]);

  return getSeedDetailStaticParams({
    indexableSeeds,
    phaseZeroEvidenceReady: snapshot.phaseZeroEvidenceReady,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [model, snapshot] = await Promise.all([
    loadSeedDetailModel(slug),
    getIndexabilitySnapshot(),
  ]);

  if (!model) {
    return {
      title: "Seed not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${model.seed.name} - Value, Growth & Harvest Time`,
    description: `Evidence-first facts, raw observations, and growth gates for ${model.seed.name} in Greedy Growers.`,
    alternates: { canonical: `/seeds/${model.seed.slug}` },
    robots: metadataRobots(
      getPageIndexability(`/seeds/${model.seed.slug}`, snapshot),
    ),
  };
}

export default async function SeedDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadSeedDetailModel(slug);

  if (!model) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Seeds",
        item: "/seeds",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: model.seed.name,
        item: `/seeds/${model.seed.slug}`,
      },
    ],
  };

  return (
    <ContentPage
      eyebrow="Seed detail / Evidence first"
      title={model.seed.name}
      description="Each section shows its own gate. Raw evidence, derived ranges, and any future seed-specific risk model are intentionally separated."
      status={`Last verified: ${model.seed.lastVerified.slice(0, 10)} · Version: ${model.seed.gameVersion}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/guides" className="hover:text-foreground">
          Guides
        </Link>{" "}
        / <span>Seed detail</span> /{" "}
        <span className="text-foreground">{model.seed.name}</span>
      </nav>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick facts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Acquisition:</span>{" "}
              {model.seed.acquisition ?? "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Cost:</span>{" "}
              {model.seed.cost !== undefined
                ? `${model.seed.cost} ${model.seed.currency ?? ""}`.trim()
                : "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Facts:</span>{" "}
              {model.seed.facts.length}
            </p>
            <p>
              <span className="font-semibold text-foreground">Calculator link:</span>{" "}
              <Link href={`/?seedId=${model.seed.id}`} className="text-lightning hover:underline">
                Open with seed ID
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gate status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Factual page</span>
              <DataStatusBadge status="verified" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Growth range</span>
              <DataStatusBadge status={model.growthRangeGate ? "observed" : "unknown"} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Growth chart</span>
              <DataStatusBadge status={model.growthChartGate ? "observed" : "unknown"} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Seed lightning risk</span>
              <DataStatusBadge status={model.seedRiskGate ? "observed" : "unknown"} />
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="mt-8">
        <GrowthCurve buckets={model.growthBuckets} seedName={model.seed.name} />
      </div>

      <ContentSection title="Raw evidence">
        <p>
          Raw public observations: {model.rawObservationCount}. Raw public growth
          measurements: {model.rawGrowthMeasurementCount}.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[6px] border border-survey-line bg-surface p-4">
            <h3 className="font-semibold text-foreground">Facts</h3>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {model.seed.facts.map((fact) => (
                <li key={fact.key}>
                  <span className="font-semibold text-foreground">{fact.key}:</span>{" "}
                  {fact.value} · Sources {fact.sourceIds.join(", ")}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[6px] border border-survey-line bg-surface p-4">
            <h3 className="font-semibold text-foreground">Observation log</h3>
            {model.observations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No public observation has cleared the current-version gate for this seed yet.
              </p>
            ) : (
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {model.observations.map((observation) => (
                  <li key={observation.id}>
                    {observation.event} · age {observation.treeAgeAtEndSeconds}s · source{" "}
                    {observation.sourceId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Limits and related seeds">
        <EvidenceNote>
          The page never upgrades one raw reading into a promised range. Growth
          range, chart, and any future seed-specific risk model remain separate
          gates.
        </EvidenceNote>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Related eligible seeds:
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            {model.relatedSeeds.length === 0 ? (
              <li className="text-muted-foreground">No other eligible seeds yet.</li>
            ) : (
              model.relatedSeeds.map((seed) => (
                <li key={seed.id}>
                  <Link href={`/seeds/${seed.slug}`} className="text-lightning hover:underline">
                    {seed.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
