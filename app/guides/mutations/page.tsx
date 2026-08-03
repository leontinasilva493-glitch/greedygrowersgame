import type { Metadata } from "next";

import { VideoEvidenceCard } from "@/components/content/VideoEvidenceCard";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { mutationsGuideVideo } from "@/features/guides/video-evidence";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const reportedMutations = [
  ["Dewy", "Misty weather", "2×"],
  ["Shocked", "Lightning below the reported 25× threshold", "2.5×"],
  ["Radioactive", "Acid rain weather", "5×"],
  ["Charged", "Lightning above the reported 25× threshold", "7.5×"],
  ["Golden", "Rainbow weather", "25×"],
  ["Cosmic", "Meteor shower weather", "100×"],
] as const;

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Mutations: Reported Effects and Evidence",
    description:
      "Compare third-party reports about Greedy Growers mutations, weather triggers, and value multipliers without treating reports as official game data.",
    canonical: "/guides/mutations",
    route: "/guides/mutations",
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default async function MutationsGuidePage() {
  const snapshot = await getIndexabilitySnapshot();
  const gate = getPageIndexability("/guides/mutations", snapshot);

  return (
    <ContentPage
      eyebrow="Guide 03 / Mutation field notes"
      title="Greedy Growers mutations: reported effects, separated from verified facts"
      description="Third-party guides describe weather-linked mutations and multipliers. This field note preserves those reports while keeping unsupported values out of the calculator."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="What players are currently reporting">
        <p>
          Current third-party guides describe six mutation names: Dewy, Shocked,
          Radioactive, Charged, Golden, and Cosmic. Those names and effects are
          reported current-version claims, not official rules published by the
          game creator.
        </p>
        <p>
          The source used for this first field note is a July 28, 2026 Pro Game
          Guides article. It is useful for tracking the discussion, but one
          editorial source cannot by itself establish a mechanic, probability,
          or calculator input.
        </p>
        <a
          href="https://progameguides.com/roblox/greedy-growers-mutations-multipliers-how-to-get/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lightning hover:underline"
        >
          Read the reported mutation source on Pro Game Guides
        </a>
      </ContentSection>

      <ContentSection title="Watch the reported mutation system in play">
        <p>
          This walkthrough is a map of the claims players are discussing. Review
          visible in-game UI and outcomes separately from narration; unsupported
          narration remains reported rather than verified.
        </p>
        <div className="mt-5">
          <VideoEvidenceCard video={mutationsGuideVideo} />
        </div>
      </ContentSection>

      <ContentSection title="Third-party reported mutation reference">
        <div className="overflow-x-auto border border-survey-line">
          <table className="min-w-[650px] w-full text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Mutation</th>
                <th className="px-4 py-3 font-semibold">Reported trigger</th>
                <th className="px-4 py-3 font-semibold">Reported multiplier</th>
                <th className="px-4 py-3 font-semibold">Evidence status</th>
              </tr>
            </thead>
            <tbody>
              {reportedMutations.map(([name, trigger, multiplier]) => (
                <tr key={name} className="border-t border-survey-line align-top text-muted-foreground">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{name}</th>
                  <td className="px-4 py-3">{trigger}</td>
                  <td className="px-4 py-3">{multiplier}</td>
                  <td className="px-4 py-3">Reported by one editorial source</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EvidenceNote>
          These values are not calculator defaults. They remain reported until
          current-version video and editorial sources are independently reviewed.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Why lightning may not always mean the same outcome">
        <p>
          The beginner loop makes lightning the central risk. Third-party
          mutation reports suggest that a strike may sometimes be discussed as a
          different outcome rather than a simple zero-value loss. Until that
          behavior is recorded across the current version, keep residual value
          editable in the calculator.
        </p>
        <InlineCta href="/guides/when-to-harvest">Read the harvest decision method</InlineCta>
      </ContentSection>

      <ContentSection title="How this page earns a stronger confidence label">
        <ol className="grid gap-3 pl-5 marker:font-mono marker:text-lightning">
          <li>A current-version recording shows the relevant game UI or outcome.</li>
          <li>A second independent editorial or gameplay source supports the same claim.</li>
          <li>The source, review date, and unresolved gaps remain visible on the page.</li>
        </ol>
        <div className="mt-5">
          <InlineCta href="/submit-data">Submit current-version evidence</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
