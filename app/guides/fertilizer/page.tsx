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

const route = "/guides/fertilizer";
const title = "Greedy Growers Fertilizer Guide";
const description =
  "Verify Greedy Growers fertilizer names, effects, duration, stacking, and value with a one-variable test instead of relying on unsupported boost claims.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const requiredFields = [
  ["Identity", "Exact item name and full in-game description"],
  ["Source", "Shop, reward, task, or drop screen plus displayed cost"],
  ["Target", "The tree, plot, seed, or account state affected"],
  ["Effect", "Visible field before and after use"],
  ["Duration", "Start, end, charges, cooldown, and consumption behavior"],
  ["Stacking", "One copy compared with a second use under the same setup"],
] as const;

export default async function FertilizerGuidePage() {
  const gate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 09 / Fertilizer test"
      title="What does fertilizer do in Greedy Growers?"
      description="No fertilizer catalog or effect formula appears in the official Roblox description. This guide shows how to identify an item, measure one effect, and avoid confusing growth, value, and mutation claims."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          The current evidence set does not verify a complete fertilizer list,
          where each item comes from, or what each one changes. The official
          experience page only describes the river-seed, plot, growth, lightning,
          and harvest loop; it does not define fertilizer mechanics.
        </p>
        <EvidenceNote>
          Names such as Miracle Grow appear in community discussion, but a name
          is not enough to publish an effect. Capture the current item card and
          a complete use before treating any boost claim as a game rule.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="What a verified fertilizer record needs">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Required capture</th>
              </tr>
            </thead>
            <tbody>
              {requiredFields.map(([field, capture]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{field}</th>
                  <td className="px-4 py-3">{capture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="How do I test one fertilizer?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the item name, wording, source, cost, and inventory count.</li>
          <li>Choose one seed and make a no-fertilizer baseline.</li>
          <li>Use the item on the same seed under the same elapsed-time rule.</li>
          <li>Record visible size, state, value, weather, and inventory after use.</li>
          <li>Repeat before claiming an effect, duration, percentage, or stack.</li>
        </ol>
        <p>
          Change only the fertilizer. A test that also changes the seed, pet,
          weather window, or harvest time cannot isolate the item&apos;s effect.
        </p>
        <InlineCta href="/guides/how-to-grow-big-trees">Return to the big-tree diagnosis</InlineCta>
      </ContentSection>

      <ContentSection title="Is fertilizer worth using?">
        <p>
          Compare the observed benefit with the item&apos;s displayed acquisition
          cost and the failure cost of waiting. Keep growth speed, sale value,
          mutation outcome, and convenience separate; one visible improvement
          does not prove every claimed benefit.
        </p>
        <InlineCta href="/#calculator">Compare your own cost and outcome</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
