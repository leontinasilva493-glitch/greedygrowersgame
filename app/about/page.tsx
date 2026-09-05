import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Greedy Growers Calculator",
  description:
    "Learn how Greedy Growers Calculator uses official Roblox information, labels community evidence, protects unknowns, and verifies guide updates.",
  alternates: { canonical: "/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About / Method before volume"
      title="A calculator that shows its assumptions"
      description="Greedy Growers creates a simple but sharp decision: collect a certain result now, or wait for more while lightning remains possible. This fan-made site makes that trade-off inspectable."
      status="Independent fan resource · Current game version unverified"
    >
      <ContentSection title="Why this exists">
        <p>
          Search results can make uncertain game mechanics look exact. This site
          takes the opposite approach: the calculator works with your own
          scenario before a community model exists, and every future data page
          must pass an evidence gate before it can be indexed.
        </p>
        <InlineCta href="/guides">Read the published field notes</InlineCta>
      </ContentSection>

      <ContentSection title="How claims are classified">
        <ul className="grid gap-3">
          <li><strong className="text-foreground">Official:</strong> supported by a creator-controlled Roblox page or attributable creator update.</li>
          <li><strong className="text-foreground">Observed:</strong> captured in reviewable gameplay evidence with session, time, and version context.</li>
          <li><strong className="text-foreground">Estimated:</strong> derived by a published method and labeled as an estimate.</li>
          <li><strong className="text-foreground">Unknown:</strong> not yet supported strongly enough to publish as fact.</li>
        </ul>
        <EvidenceNote>
          A page written by this site is not automatically verified. Verification
          must point back to official material, repeatable gameplay, or reviewed
          evidence.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Official game and creator links">
        <p>
          The official Roblox experience page is the primary source for the
          published game description and creator identity. Roblox currently
          attributes the experience to Banjo Lady Games. That official page
          does not publish a complete seed catalog, pet table, potion guide, or
          patch notes, so those details require additional evidence.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a href={siteConfig.robloxGameUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-lightning hover:underline">
            Open the official Greedy Growers experience
          </a>
          <a href="https://www.roblox.com/communities/830072163/Banjo-Lady-Games" target="_blank" rel="noopener noreferrer" className="font-semibold text-lightning hover:underline">
            Open the official Banjo Lady Games group
          </a>
        </div>
        <EvidenceNote>
          No official Discord or Trello link has been verified for publication.
          Avoid login prompts or downloads from sites that imitate Roblox or
          claim to be an official Greedy Growers resource without a creator link.
        </EvidenceNote>
        <InlineCta href="/official-links">Check Discord, Trello and wiki status</InlineCta>
      </ContentSection>

      <ContentSection title="Independence and trademarks">
        <p>{siteConfig.disclaimer}</p>
        <p>
          Greedy Growers and Roblox are referenced only to identify the game and
          platform. This site does not imitate the Roblox logo, sell access to
          the experience, or guarantee an in-game outcome.
        </p>
        <InlineCta href="/data-status">Review the data status</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
