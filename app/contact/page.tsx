import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact and correction status for the fan-made Greedy Growers Calculator.",
  alternates: { canonical: "/contact" },
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact / Trust route"
      title="Questions, corrections, and evidence"
      description="This page never invents a support address or implies that a submission channel is active before it has been configured and documented."
      status={
        siteConfig.supportEmail
          ? "Support email configured"
          : "Public support email not yet configured"
      }
    >
      <ContentSection title="Current contact channel">
        {siteConfig.supportEmail ? (
          <p>
            Email{" "}
            <a
              className="font-semibold text-lightning underline-offset-4 hover:underline"
              href={`mailto:${siteConfig.supportEmail}`}
            >
              {siteConfig.supportEmail}
            </a>
            . Do not include passwords, payment details, real names, or private
            account information.
          </p>
        ) : (
          <EvidenceNote>
            No public support email or contact form is active on this release.
            A real owner-controlled address must be configured before an email
            link appears here.
          </EvidenceNote>
        )}
      </ContentSection>

      <ContentSection title="Before reporting game data">
        <p>
          Evidence intake is separate from general contact. It must publish its
          review rules, retention period, deletion timeline, and privacy terms
          before accepting files or URLs. Submissions never become public data
          automatically.
        </p>
        <InlineCta href="/submit-data">Check submission availability</InlineCta>
      </ContentSection>

      <ContentSection title="For calculation questions">
        <p>
          The harvest guide explains every input and formula. If a result looks
          surprising, first check that the probability applies to the same wait
          interval and that residual value and wait cost use the same value unit.
        </p>
        <InlineCta href="/guides/when-to-harvest">
          Read the decision method
        </InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
