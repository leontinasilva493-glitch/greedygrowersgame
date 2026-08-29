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
    title: "Greedy Growers Beginner Guide",
    description:
      "Learn the official Greedy Growers river-to-harvest loop, make a safer first lightning decision, and identify new systems that still need verification.",
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
      title="Greedy Growers beginner guide: your first 10 minutes"
      description="Follow the confirmed river-to-harvest loop, make one cautious first decision, and identify which newer systems still need evidence before you spend resources."
      status="Source: official Roblox experience description · Rechecked 2026-08-28"
      visual={<GameScene asset={gameSceneAssets.beginner} preload />}
    >
      <ContentSection title="Your first 10 minutes in Greedy Growers">
        <ol className="grid gap-3 pl-5 marker:font-mono marker:text-lightning">
          <li>Use the official Roblox experience page to enter the correct game.</li>
          <li>Buy one seed from the river and note the balance before the purchase.</li>
          <li>Plant that seed in your own plot and keep the first setup simple.</li>
          <li>Let the tree grow while watching only values the current interface shows.</li>
          <li>Choose a harvest point before adding unverified pets, items, or boosts.</li>
        </ol>
        <p>
          The river, seed, plot, growth, lightning, and harvest loop is supported
          by the public description. It does not publish a reward formula,
          identify a best seed, or explain what remains after a lightning strike.
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

      <ContentSection title="Which systems should a beginner verify before spending?">
        <p>
          Player discussions and third-party videos raise questions about Pets,
          Fertilizer, Worms, Tickets, Rebirth, a Farmer&apos;s Market, and a chair
          that requests seeds. None is defined by the official description used
          for this beginner loop. Read the live panel before spending a rare seed,
          item, or currency.
        </p>
        <div className="overflow-x-auto border border-survey-line">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">System</th>
                <th className="px-4 py-3 font-semibold">What is safe to say</th>
                <th className="px-4 py-3 font-semibold">What to capture</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Pets and eggs", "Research notes cover acquisition, hatching, passives, and stacking questions.", "Egg panel, hatch sequence, pet card, passive text, equip limit."],
                ["Farmer's Market", "A complete order, delivery, reward, and refresh cycle has not been verified.", "Order panel, requested item, delivery action, balance change, refresh state."],
                ["Seed-feeding chair", "A community question prompted a dedicated capture checklist.", "Exact label, requested seed, progress state, completion result."],
                ["Fertilizer and Worms", "Names and effects remain research leads until current use is captured.", "Item card, acquisition, use action, effect, duration, consumption."],
              ].map(([system, safe, capture]) => (
                <tr key={system} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{system}</th>
                  <td className="px-4 py-3 text-muted-foreground">{safe}</td>
                  <td className="px-4 py-3 text-muted-foreground">{capture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InlineCta href="/pets">Review the Pets evidence page</InlineCta>
          <InlineCta href="/guides/farmers-market">Review the Farmer&apos;s Market checklist</InlineCta>
          <InlineCta href="/guides/seed-feeding-chair">Review the seed-chair checklist</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Greedy Growers beginner FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">Where do beginners get a seed?</h3>
            <p className="mt-1">The official experience description says players buy a seed from the river. Use the current in-game label and price shown in your own server.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">When should I harvest my first tree?</h3>
            <p className="mt-1">There is no verified universal timer. Compare the value available now with one defined wait and only the risk estimate you are willing to use.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Does lightning always remove the whole tree?</h3>
            <p className="mt-1">The current evidence does not establish that outcome. Keep residual value editable until a complete current-version strike recording shows what remains.</p>
          </div>
        </div>
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
