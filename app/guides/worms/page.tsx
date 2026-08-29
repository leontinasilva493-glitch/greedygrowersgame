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
const title = "Greedy Growers Worms Guide";
const description =
  "Check how to verify Greedy Growers worm names, acquisition, targets, effects, duration, and mutation claims without inventing drop rates or bonuses.";

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
      title="What do worms do in Greedy Growers?"
      description="Players search for worm effects and acquisition routes, but the official game description does not define this system. Use the evidence ledger and controlled test before trusting an outcome."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          No current worm name, source, drop chance, target, duration, or effect
          has passed this project&apos;s gameplay evidence review. The official
          Roblox description does not document worms, so this page does not
          present community terminology as creator-confirmed mechanics.
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

      <ContentSection title="How do I verify a worm effect?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Capture the exact worm name, item card, source, and visible cost.</li>
          <li>Record the target tree before applying or equipping the worm.</li>
          <li>Keep the seed, pet, fertilizer, timer, and comparison method unchanged.</li>
          <li>Record the full action and every visible state change without edits.</li>
          <li>Repeat the baseline and worm run before describing a consistent effect.</li>
        </ol>
        <p>
          If the claim involves weather or mutations, also capture the named
          weather state and the exact mutation label. A changed tree appearance
          by itself does not prove which system caused it.
        </p>
        <InlineCta href="/guides/mutations">Check the mutation evidence ledger</InlineCta>
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
    </ContentPage>
  );
}
