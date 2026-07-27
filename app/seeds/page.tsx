import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { SeedTable } from "@/components/seeds";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability, metadataRobots } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

async function loadSeedsPageData() {
  const [seeds, sources, observations, growthMeasurements, gameVersion] =
    await Promise.all([
      dataRepository.getSeeds(),
      dataRepository.getSources(),
      dataRepository.getObservations(),
      dataRepository.getGrowthMeasurements(),
      dataRepository.getCurrentGameVersion(),
    ]);

  return { seeds, sources, observations, growthMeasurements, gameVersion };
}

export async function generateMetadata(): Promise<Metadata> {
  const gate = getPageIndexability("/seeds", await getIndexabilitySnapshot());

  return {
    title: "Greedy Growers Seeds - Evidence Database",
    description:
      "Browse sourced Greedy Growers seed records with current-version counts, observed value ranges, and evidence links.",
    alternates: { canonical: "/seeds" },
    robots: metadataRobots(gate),
  };
}

export default async function SeedsPage() {
  const [{ seeds, sources, observations, growthMeasurements, gameVersion }, snapshot] =
    await Promise.all([loadSeedsPageData(), getIndexabilitySnapshot()]);
  const gate = getPageIndexability("/seeds", snapshot);

  return (
    <ContentPage
      eyebrow="Seeds / Evidence-first directory"
      title="Greedy Growers seeds"
      description="This list stays useful even before every seed earns a detail page. Search, filter, and compare only what the current evidence can support."
      status={`${gate.reason} Page is ${gate.index ? "index" : "noindex"}.`}
    >
      <SeedTable
        seeds={seeds}
        sources={sources}
        observations={observations}
        growthMeasurements={growthMeasurements}
        currentVersion={gameVersion.version}
      />

      <ContentSection title="Methodology">
        <p>
          Search and sort are interface tools only. They never promote stale,
          pending, rejected, or unsupported records into sample counts.
        </p>
        <p>
          An observed range appears only when at least five approved
          measurements from three independent sessions exist for that seed.
          Otherwise the list shows raw measurement count only.
        </p>
        <EvidenceNote>
          A seed can appear here for transparency while still remaining
          non-indexable for a detail page.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Next step">
        <InlineCta href="/seeds/compare">Compare two seeds side by side</InlineCta>
        <div className="mt-4">
          <InlineCta href="/">Open the harvest calculator</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
