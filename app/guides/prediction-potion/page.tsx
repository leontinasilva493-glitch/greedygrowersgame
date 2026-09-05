import type { Metadata } from "next";

import { SourceLedger } from "@/components/content/SourceLedger";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/prediction-potion";
const title = "Greedy Growers Prediction Potion Guide";
const description =
  "Check what the Greedy Growers Prediction Potion may reveal, which community claims conflict, and the exact capture needed to verify its effect.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const verificationRows = [
  ["Exact item name", "Needs a current in-game inventory or reward-screen capture."],
  ["How it is obtained", "Needs the acquisition screen and the requirement shown before the reward is claimed."],
  ["Effect", "Needs a before-and-after recording that shows the field revealed by the item."],
  ["Consumption and duration", "Needs one complete use from activation until the effect ends."],
  ["Game version", "Needs a dated session tied to the current Roblox experience state."],
] as const;

export default async function PredictionPotionPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const pageGate = getPageIndexability(route, snapshot);

  return (
    <ContentPage
      eyebrow="Guide 04 / Item verification"
      title="What does the Prediction Potion do in Greedy Growers?"
      description="The current evidence set does not establish what the Prediction Potion does. This page separates the player question, the fields that still need proof, and the harvest decision you can make without it."
      status={`${pageGate.reason} Page is ${pageGate.index ? "index" : "noindex"}.`}
    >
      <ContentSection title="The direct answer">
        <p>
          The Prediction Potion is not verified in this project&apos;s current
          evidence set. Its acquisition route, displayed effect, consumption
          behavior, duration, and version all remain open questions. It is not
          an official lightning forecast, and this site will not turn a search
          snippet into a promise about the next strike.
        </p>
        <EvidenceNote>
          Community pages can help locate the relevant screen, but publication
          requires a reviewable in-game capture or independently corroborated
          current-version sources. Until then, this guide stays out of search
          and the sitemap.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Sources and claim status">
        <p>
          These sources answer different questions. Roblox establishes the
          baseline game identity and core loop; the forum shows player demand;
          the third-party guide supplies a lead about the item. None of them is
          a current, continuous recording of the potion being used.
        </p>
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official baseline",
              claimStatus: "Verified only for the public game description",
              note: "The creator-controlled page does not define the Prediction Potion, its source, or its effect.",
            },
            {
              sourceId: "reddit-player-questions",
              label: "Community report",
              claimStatus: "Demand signal only",
              note: "The discussion confirms players are asking about Greedy Growers systems, but it does not document a potion use.",
            },
            {
              sourceId: "prediction-potion-competitor-report",
              label: "Third-party guide",
              claimStatus: "Reported and explicitly unverified",
              note: "Useful for locating the reported Spin Wheel route and weather claim; both still need in-game proof.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection title="What must be verified before you rely on it">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Required proof</th>
              </tr>
            </thead>
            <tbody>
              {verificationRows.map(([field, proof]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{field}</th>
                  <td className="px-4 py-3">{proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Why current Prediction Potion claims conflict">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[660px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Community claim</th>
                <th className="px-4 py-3 font-semibold">What would verify it</th>
                <th className="px-4 py-3 font-semibold">Current status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-survey-line align-top">
                <th className="px-4 py-3 font-semibold text-foreground">It reveals upcoming weather</th>
                <td className="px-4 py-3">Item use, revealed field, and the later weather event in one continuous recording.</td>
                <td className="px-4 py-3">Unverified</td>
              </tr>
              <tr className="border-t border-survey-line align-top">
                <th className="px-4 py-3 font-semibold text-foreground">It reveals a tree&apos;s maximum size</th>
                <td className="px-4 py-3">The value shown at use and the same tree&apos;s final recorded state.</td>
                <td className="px-4 py-3">Unverified</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EvidenceNote>
          Neither claim is presented as game fact. The official Roblox
          description does not define this item, and conflicting community
          summaries are a reason to collect gameplay evidence, not to average
          the claims together.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="How to capture one complete use">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the screen that names the item and shows where it came from.</li>
          <li>Show the target tree and every visible value before activation.</li>
          <li>Use the item without cutting away from the tree or interface.</li>
          <li>Record every field that changes, then keep recording until the effect ends.</li>
          <li>Note whether the item leaves inventory and whether a reuse timer appears.</li>
        </ol>
        <p>
          A single edited highlight is not enough to establish the full
          mechanic. The useful record includes the state before use, the action,
          the revealed information, and the state afterward.
        </p>
      </ContentSection>

      <ContentSection title="Make the harvest decision without a prediction claim">
        <p>
          You can still compare harvesting now with one defined wait. Use the
          value visible in your own session, your own future-value estimate,
          and a low-to-high risk range. The result is a scenario comparison,
          not a forecast of the next lightning event.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/when-to-harvest">Read the harvest risk method</InlineCta>
          <InlineCta href="/#calculator">Run your own scenario</InlineCta>
          <InlineCta href="/guides/weather-events">Review reported weather fields</InlineCta>
          <InlineCta href="/pets/majestic-egg">Check the reported wheel reward</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Prediction Potion FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Does it predict lightning?</h3>
            <p className="mt-2">No verified source in the current evidence set establishes that claim.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Where do you get it?</h3>
            <p className="mt-2">That acquisition route still needs a current, unedited in-game capture.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Can it supply calculator defaults?</h3>
            <p className="mt-2">No. Any information it reveals must be entered by the player and kept separate from lightning probability.</p>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
