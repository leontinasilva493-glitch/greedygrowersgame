import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { GameScene } from "@/components/game/GameScene";
import { VideoEvidenceCard } from "@/components/content/VideoEvidenceCard";
import { lightningLossVideo } from "@/features/guides/video-evidence";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";
import { gameSceneAssets } from "@/features/visuals/assets";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Beginner Guide: First Harvest & Lightning Risk",
    description:
      "Start with the confirmed Greedy Growers river, plot, growth, harvest, and lightning loop without relying on invented mechanics.",
    canonical: "/guides/beginner-guide",
    route: "/guides/beginner-guide",
    snapshot: await getIndexabilitySnapshot(),
    socialImage: {
      url: "/media/greedy-growers/og/beginner-guide.png",
      width: 1200,
      height: 630,
      alt: gameSceneAssets.beginner.alt,
    },
  });
}

export default function BeginnerGuidePage() {
  return (
    <ContentPage
      eyebrow="Guide 01 / Beginner"
      title="Greedy Growers beginner guide: your first seed-to-harvest loop"
      description="Learn the confirmed first loop, see why lightning changes the decision, and use a simple method for choosing when to collect."
      status="Source: official Roblox experience description · Reviewed 2026-08-02"
      visual={<GameScene asset={gameSceneAssets.beginner} preload />}
    >
      <ContentSection title="The confirmed loop">
        <ol className="grid gap-3 pl-5 marker:font-mono marker:text-lightning">
          <li>Buy a seed from the river.</li>
          <li>Plant it in your own plot.</li>
          <li>Let the tree grow.</li>
          <li>Choose when to harvest while lightning remains a risk.</li>
        </ol>
        <p>
          Those four steps are supported by the public description. It also
          identifies harvesting as a player action, but does not publish a
          reward formula or explain what remains after a lightning strike.
        </p>
      </ContentSection>

      <ContentSection title="See one lightning-loss outcome before you make your first big wait">
        <p>
          This third-party player recording shows the emotional side of the core
          loop: a tree can look worth waiting for until the risk becomes real.
          Watch it for context, then make your own decision with values you can
          see in your session.
        </p>
        <p>
          One player video is not a lightning-rate sample. It cannot prove a
          universal harvest timer, a safe multiplier, or what every strike
          leaves behind.
        </p>
        <div className="mt-5">
          <VideoEvidenceCard video={lightningLossVideo} />
        </div>
      </ContentSection>

      <ContentSection title="What to observe before making a decision">
        <p>
          After seeing the risk in a real player session, look for values the current game interface actually exposes. The
          public evidence does not yet establish whether current harvest value,
          tree age, height, seed cost, or a timer can be read in game.
        </p>
        <p>
          If you use the calculator now, treat current value and future value as
          your own scenario inputs. The entered lightning risk applies only to
          the exact waiting interval you chose.
        </p>
        <EvidenceNote>
          Do not assume that lightning causes a total loss. A residual value of
          zero is an editable calculator assumption until an uninterrupted
          strike recording proves the actual outcome.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="What this guide does not claim">
        <ul className="grid gap-2 pl-5 marker:text-risk">
          <li>No seed name, rarity, price, currency, or ranking is verified.</li>
          <li>No lightning chance, schedule, countdown, or target rule is known.</li>
          <li>No Codes redemption interface has been verified.</li>
          <li>
            Fertilizer, mutations, Rebirth, trading, pets, and market systems
            are not confirmed by the evidence used here.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Your next useful step">
        <p>
          Run one transparent scenario instead of searching for a false exact
          answer. Enter what you can observe or reasonably estimate, then test
          how much risk the extra growth would justify.
        </p>
        <InlineCta href="/#calculator">Calculate a harvest decision</InlineCta>
        <div className="mt-4">
          <InlineCta href="/guides/when-to-harvest">
            See the formula behind the decision
          </InlineCta>
        </div>
        <div className="mt-4">
          <InlineCta href="/guides">Browse all Greedy Growers guides</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
