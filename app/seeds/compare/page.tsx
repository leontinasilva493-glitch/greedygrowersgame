import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { SeedCompare } from "@/components/seeds";
import { dataRepository } from "@/features/data/repository";
import { getSeedCompareIndexability } from "@/features/seeds/compare";

async function loadSeedCompareData() {
  const [seeds, sources, growthMeasurements, gameVersion] = await Promise.all([
    dataRepository.getSeeds(),
    dataRepository.getSources(),
    dataRepository.getGrowthMeasurements(),
    dataRepository.getCurrentGameVersion(),
  ]);

  return { seeds, sources, growthMeasurements, gameVersion };
}

export async function generateMetadata(): Promise<Metadata> {
  const { seeds, sources, growthMeasurements, gameVersion } =
    await loadSeedCompareData();
  const gate = getSeedCompareIndexability({
    seeds,
    sources,
    growthMeasurements,
    currentVersion: gameVersion.version,
  });

  return {
    title: "Greedy Growers Seed Compare - Source-backed Pair View",
    description:
      "Compare two Greedy Growers seeds only when current-version evidence, exact age bucket, metric definition, and session thresholds match.",
    alternates: { canonical: "/seeds/compare" },
    robots: { index: gate.index, follow: gate.follow },
  };
}

export default async function SeedComparePage() {
  const { seeds, sources, growthMeasurements, gameVersion } =
    await loadSeedCompareData();
  const gate = getSeedCompareIndexability({
    seeds,
    sources,
    growthMeasurements,
    currentVersion: gameVersion.version,
  });

  return (
    <ContentPage
      eyebrow="Seeds / Pair comparison"
      title="Compare two seeds"
      description="This tool compares like with like only: same current version, same currency, same age bucket, named metric, and enough independent sessions on both sides."
      status={`${gate.reason} Page is ${gate.index ? "index" : "noindex"}.`}
    >
      <SeedCompare
        seeds={seeds}
        sources={sources}
        growthMeasurements={growthMeasurements}
        currentVersion={gameVersion.version}
      />

      <ContentSection title="Why the gate is strict">
        <p>
          This page does not choose a statistical winner or claim superiority.
          It only places two comparable evidence slices side by side.
        </p>
        <EvidenceNote>
          Comparison confidence is separate from any future lightning model.
          Missing cost, mixed currency, or mismatched age buckets keep the pair
          out of comparison mode.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Related tools">
        <InlineCta href="/seeds">Return to the seed database</InlineCta>
        <div className="mt-4">
          <InlineCta href="/">Open the harvest calculator</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
