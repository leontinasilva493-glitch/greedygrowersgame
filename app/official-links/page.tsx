import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { SourceLedger } from "@/components/content/SourceLedger";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/official-links";
const title = "Greedy Growers Roblox: Official Game & Link Status";
const description =
  "Open the verified Greedy Growers Roblox game and creator group, then check the current Discord, Trello, and official wiki link status.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const creatorGroupUrl = "https://www.roblox.com/communities/830072163/Banjo-Lady-Games";

const linkRows = [
  ["Roblox experience", "Verified", siteConfig.robloxGameUrl, "Roblox experience page attributed to Banjo Lady Games."],
  ["Creator group", "Verified", creatorGroupUrl, "Creator group linked by Roblox's public game identity."],
  ["Discord", "Not listed by a creator-owned source", undefined, "Search results and invite pages are not enough; wait for the game page or creator group to publish the exact invite."],
  ["Trello", "Not listed by a creator-owned source", undefined, "No creator-promoted board URL was found on the reviewed official surfaces."],
  ["Official wiki", "Not listed by a creator-owned source", undefined, "Several fan wikis exist, but none is labelled official by the reviewed creator surfaces."],
] as const;

export default async function OfficialLinksPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);

  return (
    <ContentPage
      eyebrow="Roblox / Official links"
      title="Greedy Growers Roblox official game and link status"
      description="Open the creator-owned Roblox destinations below. Discord, Trello, and wiki searches remain status checks—not endorsements—until a creator-controlled page publishes the exact URL."
      status={`Checked 2026-08-30 · Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="Where is the official Greedy Growers Roblox game?">
        <p>
          The reviewed destination is the Roblox experience attributed to Banjo
          Lady Games. Use that page and the creator group it identifies as the
          starting points for play links and future community-link checks.
        </p>
        <a
          href={siteConfig.robloxGameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-lightning hover:underline"
        >
          Open the Greedy Growers Roblox experience
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
        <EvidenceNote>
          A search result, video description, or fan guide can help locate a
          claim, but it cannot verify an official destination. Confirm the exact
          URL on a creator-controlled Roblox surface.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Verified and not-listed link status">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Why</th>
                <th className="px-4 py-3 font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
              {linkRows.map(([name, status, href, reason]) => (
                <tr key={name} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{name}</th>
                  <td className={`px-4 py-3 font-mono text-xs uppercase tracking-[0.1em] ${status === "Verified" ? "text-grow" : "text-lightning"}`}>
                    {status}
                  </td>
                  <td className="px-4 py-3">{reason}</td>
                  <td className="px-4 py-3">
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 font-semibold text-lightning hover:underline">
                        Open<ExternalLink aria-hidden="true" className="size-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No verified URL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EvidenceNote>
          “Not listed” does not prove that a community does not exist. It means
          the exact destination was not published by the reviewed Roblox game
          page or creator group on the checked date.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="How to check a Discord, Trello or wiki link">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Start on the Roblox experience page and confirm the creator identity.</li>
          <li>Open only the creator group shown by Roblox.</li>
          <li>Look for the exact outbound URL on those creator-controlled surfaces.</li>
          <li>Reject lookalike domains, forced downloads, Robux offers, and password prompts outside Roblox.</li>
          <li>Recheck the creator source after updates; community invites and boards can change.</li>
        </ol>
      </ContentSection>

      <ContentSection title="Sources and claim status">
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official source",
              claimStatus: "Verified experience destination",
              note: "Primary public destination for the experience title, play entry point, description, and creator attribution.",
            },
            {
              sourceId: "official-creator-group",
              label: "Official source",
              claimStatus: "Verified creator destination",
              note: "Roblox group used to check whether the creator publishes a Discord, Trello, or wiki URL.",
            },
            {
              sourceId: "official-links-competitor-status",
              label: "Third-party comparison",
              claimStatus: "Coverage reference only",
              note: "Shows the same search intent on a competitor site; it cannot make any community destination official.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection title="Safe next steps">
        <p>
          After opening the game, use the site route that matches your question.
          Reported systems stay clearly separated from confirmed navigation.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/beginner-guide">Start with the beginner guide</InlineCta>
          <InlineCta href="/guides">Browse the wiki and guide hub</InlineCta>
          <InlineCta href="/codes">Review reported codes safely</InlineCta>
          <InlineCta href="/updates">Check the Roblox publish signal</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
