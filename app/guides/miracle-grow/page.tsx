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

const route = "/guides/miracle-grow";
const title = "Greedy Growers Miracle Grow: Uses & How to Get";
const description =
  "Learn what evidence is still needed to identify, obtain, use, and test Miracle Grow in Greedy Growers without treating community claims as verified mechanics.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const verificationFields = [
  ["Identity", "Exact item name, icon, description, and inventory label"],
  ["Acquisition", "The uninterrupted action, screen, and balance change that produced it"],
  ["Target", "The selected seed, tree, fruit, plot, or other visible target"],
  ["Effect", "The same observable field immediately before and after use"],
  ["Duration and consumption", "Timer, charges, inventory count, and end state"],
  ["Version", "Capture date, publish context, device, and server session"],
] as const;

export default async function MiracleGrowGuidePage() {
  const gate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 14 / Miracle Grow evidence"
      title="What does Miracle Grow do in Greedy Growers?"
      description="Miracle Grow is a player search term that needs a current item card and one complete, reviewable use before this guide can publish its acquisition route or effect as a game fact."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          No current-version Miracle Grow use has passed review. That means
          this guide cannot yet confirm what the item targets, what changes
          after use, how long any change lasts, or whether the item is consumed.
        </p>
        <EvidenceNote>
          Search demand and community wording can identify a question to test;
          they cannot establish the answer. Until the full sequence is captured,
          treat the item&apos;s identity, source, and behavior as unknown.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="What must be captured before this answer changes">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Required evidence</th>
              </tr>
            </thead>
            <tbody>
              {verificationFields.map(([field, evidence]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{field}</th>
                  <td className="px-4 py-3">{evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="How do I capture one complete Miracle Grow use?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Start on the item card and record its exact name and full wording.</li>
          <li>Show how the item enters the inventory and any displayed cost.</li>
          <li>Record the target&apos;s visible state before selecting the item.</li>
          <li>Keep the use action and every visible response in one continuous clip.</li>
          <li>Show the target, timer, charges, and inventory again after the action.</li>
          <li>Repeat with a comparable baseline before describing a consistent result.</li>
        </ol>
        <p>
          Keep the seed, pet loadout, weather state, fertilizer state, and elapsed
          time unchanged. If several variables move together, the recording
          cannot show which one caused the observed difference.
        </p>
      </ContentSection>

      <ContentSection title="Miracle Grow and fertilizer are not interchangeable terms">
        <p>
          A reported item name does not prove that it belongs to the game&apos;s
          fertilizer category or shares the behavior of another item. Record the
          menu category and item wording before using a general fertilizer rule
          to explain Miracle Grow.
        </p>
        <InlineCta href="/guides/fertilizer">Use the fertilizer test framework</InlineCta>
      </ContentSection>

      <ContentSection title="Why might a Miracle Grow test appear to fail?">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Was the target eligible?", "Show the selected target and any prompt or refusal message."],
            ["Did another system change?", "Keep pets, weather, mutations, and other items visible in the baseline."],
            ["Was the item consumed?", "Compare the item count or charges before and after the action."],
            ["Was the result delayed?", "Keep recording long enough to show any timer or later state change."],
          ].map(([question, guidance]) => (
            <div key={question} className="border border-survey-line bg-surface p-4">
              <h3 className="font-semibold text-foreground">{question}</h3>
              <p className="mt-2 text-sm leading-6">{guidance}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Related checks and next steps">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InlineCta href="/pets">Keep pet effects out of the baseline</InlineCta>
          <InlineCta href="/guides/weather-events">Record the active weather state</InlineCta>
          <InlineCta href="/submit-data">Submit a current Miracle Grow capture</InlineCta>
          <InlineCta href="/guides">Browse the Greedy Growers guide hub</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
