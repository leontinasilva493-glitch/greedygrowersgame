import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";

export const metadata: Metadata = {
  title: "Greedy Growers Beginner Guide – First Harvest & Progression",
  description:
    "Start with the confirmed Greedy Growers river, plot, growth, harvest, and lightning loop without relying on invented mechanics.",
  alternates: { canonical: "/guides/beginner-guide" },
};

export default function BeginnerGuidePage() {
  return (
    <ContentPage
      eyebrow="Guide 01 / Beginner"
      title="A careful first loop in Greedy Growers"
      description="The creator's public description confirms only a compact loop. This guide stays inside that boundary and marks everything the current evidence cannot answer."
      status="Source: official Roblox experience description · Captured 2026-07-26"
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

      <ContentSection title="What to observe before making a decision">
        <p>
          Look for values the current game interface actually exposes. The
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
        <InlineCta href="/">Calculate a harvest decision</InlineCta>
        <div className="mt-4">
          <InlineCta href="/guides/when-to-harvest">
            See the formula behind the decision
          </InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
