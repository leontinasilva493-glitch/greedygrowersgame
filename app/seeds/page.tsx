import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { GameScene } from "@/components/game/GameScene";
import { SeedTable } from "@/components/seeds";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";
import { gameSceneAssets } from "@/features/visuals/assets";

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
  return createGatedMetadata({
    title: "Greedy Growers Seed List, Prices & Rarities",
    description:
      "Browse a source-labelled Greedy Growers seed list with reported prices, rarities, river spawn chances, version warnings, and evidence status.",
    canonical: "/seeds",
    route: "/seeds",
    snapshot: await getIndexabilitySnapshot(),
    socialImage: {
      url: "/media/greedy-growers/og/seeds.png",
      width: 1200,
      height: 630,
      alt: gameSceneAssets.seeds.alt,
    },
  });
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
      visual={<GameScene asset={gameSceneAssets.seeds} preload />}
    >
      <ContentSection title="What seeds are reported in Greedy Growers?">
        <p>
          An independent Update 1.2 editorial report lists 20 seeds from Oak
          through Void. Roblox&apos;s official description confirms only that a
          player buys a seed from the river and plants it in a plot; it does not
          publish the roster, rarity, price, or spawn chance.
        </p>
        <p>
          The table therefore labels price and spawn values as reported. A newer
          Roblox publish occurred after the source article, so every entry stays
          Needs Recheck and no seed receives an indexable detail page yet.
        </p>
        <EvidenceNote>
          Reported price is not observed cost. Reported spawn chance is not a
          measured probability. Neither field is used as a calculator default.
        </EvidenceNote>
      </ContentSection>

      <SeedTable
        seeds={seeds}
        sources={sources}
        observations={observations}
        growthMeasurements={growthMeasurements}
        currentVersion={gameVersion.version}
      />

      <ContentSection title="How is the seed list verified?">
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

      <ContentSection title="What is the best seed in Greedy Growers?">
        <p>
          The current evidence cannot support one permanent best seed. Purchase
          price, growth time, tree-size outcome, lightning exposure, mutation,
          fertilizer cost, and failed attempts answer different questions and
          have not been measured together in the current build.
        </p>
        <p>
          Use the reported list to identify what exists, then compare one seed
          at a time with the same start balance, stop rule, and elapsed-time
          boundary. A future ranking should be split by budget and player goal,
          not copied from the most expensive row.
        </p>
        <InlineCta href="/guides/how-to-grow-big-trees">Test tree size without fake odds</InlineCta>
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
