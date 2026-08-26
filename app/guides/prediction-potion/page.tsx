import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/prediction-potion";
const title = "Greedy Growers Prediction Potion: Effect & How to Get It";
const description =
  "Learn how the Prediction Potion works, where it comes from, when to use it, and what it does not predict, with current-version evidence.";

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
  const pageGate = getPageIndexability(route, await getIndexabilitySnapshot());

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
