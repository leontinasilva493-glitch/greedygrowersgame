import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the fan-made Greedy Growers Calculator.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms / Current release"
      title="Terms of use"
      description="Use this calculator as an explanatory scenario tool, not as a promise of a particular game result."
      status="Effective: 2026-07-26"
    >
      <ContentSection title="Fan-made resource">
        <p>{siteConfig.disclaimer}</p>
        <p>
          Roblox and Greedy Growers remain the property of their respective
          owners. Links to Roblox open a third-party service governed by its own
          terms and privacy practices.
        </p>
      </ContentSection>

      <ContentSection title="No outcome guarantee">
        <p>
          Calculator results depend on the values and risk assumptions entered.
          The site does not know or predict the next lightning event and does not
          guarantee currency, items, progression, availability, or any other
          in-game outcome.
        </p>
      </ContentSection>

      <ContentSection title="Data status and change">
        <p>
          Game mechanics can change. Observations may be incomplete, become stale,
          or conflict. Evidence labels and version gates are part of the result,
          not optional fine print. Do not treat an estimate as official data.
        </p>
      </ContentSection>

      <ContentSection title="Acceptable use">
        <p>
          Do not use this site to distribute exploits, scripts, stolen assets,
          private information, fraudulent evidence, or material you do not have
          permission to share. Automated abuse may be limited or blocked.
        </p>
        <InlineCta href="/about">Read our evidence method</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
