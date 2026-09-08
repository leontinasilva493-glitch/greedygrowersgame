import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy status and data-handling boundaries for Greedy Growers Calculator.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy / Current release"
      title="Privacy policy"
      description="This notice describes the services active in the current site shell and the requirements that must be met before evidence intake can be enabled."
      status="Last reviewed: 2026-09-08"
    >
      <ContentSection title="Calculator inputs">
        <p>
          The current calculator is designed to run in your browser. Values such
          as current value, future value, wait interval, risk, residual value,
          and wait cost should not be sent as analytics properties or used to
          identify you.
        </p>
      </ContentSection>

      <ContentSection title="Analytics and advertising status">
        <EvidenceNote>
          Microsoft Clarity loads only after you choose Allow analytics &amp; ads. It can
          collect page views, clicks, scrolling, device and browser details, and
          masked session-replay data to help improve the site. Calculator values,
          evidence URLs, moderation receipts, and direct identifiers are not sent
          as custom analytics events. The same choice can load one Adsterra native
          banner and a Popunder script from profitableratecpmnetwork.com on eligible
          content pages. Popunder ads can open another tab or window after a click.
          Adsterra may process device, browser, network, impression, and click data
          to select, deliver, measure, and protect advertising. Choosing Keep
          optional services off prevents these services from loading. If Popunder
          code is already active, the page reloads to discard its event handlers.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Evidence submissions">
        <p>
          Public evidence intake is not enabled by this release. Before it can
          open, the product owner must publish a pending-record retention period,
          a deletion-response timeline, and an owner-controlled contact channel.
        </p>
        <p>
          When evidence intake is introduced, submitted URLs and notes will go to
          a private moderation inbox and remain pending until manual review. A
          submission will never write directly to the public game dataset.
        </p>
        <p>
          Do not submit real names, email addresses, phone numbers, private chat,
          passwords, account credentials, or unrelated player information.
          Redact usernames and chat from gameplay evidence while keeping relevant
          HUD fields readable.
        </p>
      </ContentSection>

      <ContentSection title="Deletion and questions">
        <p>
          Because no public support channel or submission inbox is active, there
          is currently no stored submission to request deletion for. This section
          must be replaced with the approved contact and service-level timeline
          before evidence intake is enabled.
        </p>
        <InlineCta href="/contact">View contact status</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
