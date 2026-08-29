import type { Metadata } from "next";

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

const route = "/guides/seed-feeding-chair";
const title = "Greedy Growers Seed-feeding Chair Guide";
const description =
  "Use a Greedy Growers seed-feeding chair checklist to verify its request, seed consumption, progress state, completion result, and current evidence limits.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const requestFields = [
  ["Identity", "Exact chair, task, or interface label shown in game"],
  ["Location", "A continuous route from a recognizable area to the chair"],
  ["Request", "Seed name, quantity, quality, and any replacement rule"],
  ["Starting state", "Seed inventory and progress before interaction"],
  ["Consumption", "Whether the submitted seed leaves inventory"],
  ["Completion", "Progress change, message, reward, unlock, or unchanged state"],
] as const;

export default async function SeedFeedingChairPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);
  const communityLead = sources.find((source) => source.id === "reddit-player-questions");

  return (
    <ContentPage
      eyebrow="Guide 12 / Chair evidence"
      title="What does the seed-feeding chair do in Greedy Growers?"
      description="A community question points to a chair that may request seeds, but the current evidence does not establish its official name, cost, progress rule, or reward."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          No current recording verifies the chair&apos;s full request or reward.
          Its exact name, location, seed requirement, consumption behavior,
          progress rule, and completion result remain unverified.
        </p>
        <EvidenceNote>
          A community discussion raised the player question; it does not prove a
          stable mechanic. This page stays outside search and the sitemap until
          current gameplay and independent support can be reviewed together.
        </EvidenceNote>
        {communityLead ? (
          <a
            href={communityLead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-lightning hover:underline"
          >
            Open the community question that prompted this checklist
          </a>
        ) : null}
      </ContentSection>

      <ContentSection title="Seed-feeding chair request checklist">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Required capture</th>
              </tr>
            </thead>
            <tbody>
              {requestFields.map(([field, capture]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                    {field}
                  </th>
                  <td className="px-4 py-3">{capture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="How to test the chair without losing an unknown seed">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the chair label, request, and current progress before selecting a seed.</li>
          <li>Show the exact seed and inventory quantity before confirmation.</li>
          <li>Use the lowest-risk seed that satisfies the visible request.</li>
          <li>Keep the recording continuous through consumption and progress changes.</li>
          <li>Capture the final message and inventory even when nothing changes.</li>
        </ol>
        <p>
          Do not infer a total requirement from one submission. A partial
          progress change, a rejected seed, and a completed request describe
          different outcomes and should remain separate records.
        </p>
        <InlineCta href="/seeds">Check the source-labelled seed reference</InlineCta>
      </ContentSection>

      <ContentSection title="Seed-feeding chair FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">Which seeds does the chair accept?</h3>
            <p className="mt-1">No accepted-seed list has passed review. Use the exact current request rather than an older community list.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Does the chair consume the seed?</h3>
            <p className="mt-1">That behavior needs a continuous inventory recording before and after confirmation.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">What happens when the chair is complete?</h3>
            <p className="mt-1">The completion result is unverified. Record the final progress state, message, reward, unlock, and inventory together.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Add the missing evidence">
        <p>
          Submit one uninterrupted sequence that shows the request, selected
          seed, inventory change, progress, and completion result. Keep the UI
          readable and redact unrelated player information.
        </p>
        <InlineCta href="/submit-data">Submit a seed-chair capture</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
