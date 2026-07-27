import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Greedy Growers Calculator separates official descriptions, observed evidence, estimates, and unknowns.",
  alternates: { canonical: "/about" },
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
