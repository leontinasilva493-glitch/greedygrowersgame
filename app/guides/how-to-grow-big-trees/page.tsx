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

const route = "/guides/how-to-grow-big-trees";
const title = "How to Grow Big Trees in Greedy Growers";
const description =
  "Diagnose why a Greedy Growers tree stays small, control seed and boost tests, and separate official growth rules from unverified size and RNG claims.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const diagnosisRows = [
  ["Seed changed", "Return to the same seed before comparing size."],
  ["Timer changed", "Measure both trees at the same elapsed growth time."],
  ["Boost changed", "Remove pets, items, and fertilizer from the baseline run."],
  ["Weather changed", "Record visible weather and lightning separately."],
  ["Tree was harvested", "Use a new tree and define one stop point in advance."],
] as const;

export default async function BigTreeGuidePage() {
  const gate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 08 / Growth diagnosis"
      title="How to grow big trees in Greedy Growers"
      description="The official game page confirms that seeds grow after planting, but it does not publish maximum sizes, growth odds, or a best-boost formula. Use controlled comparisons before attributing a large tree to one item."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          Get a seed from the river, plant it on your plot, and let it grow: that
          is the growth loop described by the official Roblox experience page.
          No creator-published source currently establishes a guaranteed method,
          size cap, growth probability, or specific boost for making a tree huge.
        </p>
        <EvidenceNote>
          Large-tree videos and player discussions show a real demand question,
          but the visible outcome alone cannot prove whether seed type, elapsed
          time, weather, a pet, fertilizer, or random variation caused it.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Why is my tree not growing big?">
        <p>
          First check whether the comparison actually used the same seed and
          growth window. If several inputs changed together, the result cannot
          identify a cause. Treat “small” as an observation and record the tree
          at fixed times instead of waiting for an undefined feeling of maximum size.
        </p>
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Possible confounder</th>
                <th className="px-4 py-3 font-semibold">Next check</th>
              </tr>
            </thead>
            <tbody>
              {diagnosisRows.map(([cause, check]) => (
                <tr key={cause} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{cause}</th>
                  <td className="px-4 py-3">{check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Run a one-variable growth test">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Choose one seed and record its exact in-game name.</li>
          <li>Plant a baseline without optional pets, items, or fertilizer.</li>
          <li>Capture the tree at fixed elapsed times and record weather or strikes.</li>
          <li>Repeat with only one input changed.</li>
          <li>Compare visible size, sale result, and failures without inventing an odds percentage.</li>
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/seeds">Check the reported seed reference</InlineCta>
          <InlineCta href="/guides/fertilizer">Test fertilizer as one controlled variable</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="When to stop waiting for more growth">
        <p>
          Bigger is not automatically better if waiting exposes the current tree
          to more lightning risk. Record the value available now, define one
          additional wait interval, and compare that upside with a range of
          possible failure costs using your own session values.
        </p>
        <InlineCta href="/guides/when-to-harvest">Use the harvest decision method</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
