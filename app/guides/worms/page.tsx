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

const route = "/guides/worms";
const title = "Greedy Growers Worms: What They Do & How to Get";
const description =
  "Learn what evidence is needed to identify, obtain, use, and test Greedy Growers worms without inventing drop rates, effects, or bonuses.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const wormLedger = [
  ["Lucky Worm", "Community research lead", "Identity, source screen, exact effect text, and target"],
  ["Dewy Worm", "Community research lead", "Identity, source screen, weather or mutation wording, and target"],
] as const;

export default async function WormsGuidePage() {
  const gate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 10 / Worm evidence"
      title="What do worms do and how do you get them in Greedy Growers?"
      description="Players want to know where worms come from, what they target, how to use them, and whether they are consumed. Those answers remain unverified until one current acquisition and use sequence passes review."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          No current worm name, acquisition route, target, duration, consumption
          behavior, or effect has passed this project&apos;s gameplay evidence
          review. The official Roblox description does not document worms, so
          this page cannot yet provide a confirmed effect or how-to-get answer.
        </p>
        <EvidenceNote>
          Keep “not collected” separate from “zero.” An absent verified worm
          record means the evidence is incomplete, not that the item has no
          effect or cannot be obtained.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Worm research ledger">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Reported name</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Evidence still needed</th>
              </tr>
            </thead>
            <tbody>
              {wormLedger.map(([name, status, needed]) => (
                <tr key={name} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{name}</th>
                  <td className="px-4 py-3">{status}</td>
                  <td className="px-4 py-3">{needed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="How do I capture one complete worm use?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Start with the exact worm name, full item card, and inventory count.</li>
          <li>Show the uninterrupted action or screen that supplies the worm.</li>
          <li>Record the selected target and its visible state before use.</li>
          <li>Keep the seed, pet, fertilizer, timer, and comparison method unchanged.</li>
          <li>Record the full use action and every visible response without edits.</li>
          <li>Show the target, inventory, timer, and charges again after the action.</li>
          <li>Repeat the baseline and worm run before describing a consistent effect.</li>
        </ol>
        <p>
          If the claim involves weather or mutations, also capture the named
          weather state and the exact mutation label. A changed tree appearance
          by itself does not prove which system caused it.
        </p>
      </ContentSection>

      <ContentSection title="How to report a drop or acquisition route">
        <p>
          Show the starting inventory, the action that produced the item, the
          result message, and the ending inventory in one sequence. A drop-rate
          claim also needs a declared sample with attempts and observed drops;
          one successful clip cannot establish odds.
        </p>
        <InlineCta href="/submit-data">Submit a current worm capture</InlineCta>
      </ContentSection>

      <ContentSection title="Related systems to keep visible">
        <p>
          A worm test is only useful when other systems that could change the
          same outcome remain visible. Record them rather than assuming the worm
          caused a change.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InlineCta href="/pets">Hold the pet loadout constant</InlineCta>
          <InlineCta href="/guides/mutations">Compare exact mutation labels</InlineCta>
          <InlineCta href="/guides/weather-events">Record the named weather state</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
