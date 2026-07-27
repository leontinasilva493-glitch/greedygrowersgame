import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
} from "@/components/layout/ContentPage";

import { SubmitDataForm } from "./SubmitDataForm";
import { createLocalInboxConfig } from "@/features/submissions/local-inbox";

export const metadata: Metadata = {
  title: "Submit Greedy Growers Evidence",
  description:
    "Submit gameplay evidence for manual moderation without making unsupported mechanics public by default.",
  alternates: { canonical: "/submit-data" },
  robots: { index: false, follow: true },
};

export function getSubmissionConfig({
  cwd = process.cwd(),
  environment = process.env,
  nodeEnv = process.env.NODE_ENV,
}: {
  cwd?: string;
  environment?: Record<string, string | undefined>;
  nodeEnv?: string;
} = {}) {
  const webhookUrl = environment.DATA_SUBMISSION_WEBHOOK_URL?.trim();
  const webhookToken = environment.DATA_SUBMISSION_WEBHOOK_TOKEN?.trim();
  const retentionDays = environment.SUBMISSION_RETENTION_DAYS?.trim() ?? null;
  const localInbox = createLocalInboxConfig({
    cwd,
    driver: environment.MODERATION_INBOX_DRIVER,
    nodeEnv,
    retentionDays: environment.SUBMISSION_RETENTION_DAYS,
  });

  const missing: string[] = [];

  if (!localInbox && (!webhookUrl || !webhookToken)) {
    missing.push("webhook delivery");
  }
  if (!retentionDays) {
    missing.push("retention settings");
  }

  return {
    enabled: missing.length === 0,
    retentionDays,
    disabledReason:
      missing.length === 0
        ? null
        : `The moderation inbox is disabled until ${missing.join(" and ")} are configured.`,
  };
}

export default async function SubmitDataPage({
  searchParams,
}: PageProps<"/submit-data">) {
  const params = await searchParams;
  const previewMode =
    process.env.NODE_ENV !== "production" && params.preview === "enabled";
  const config = getSubmissionConfig();
  const enabled = config.enabled || previewMode;

  return (
    <ContentPage
      eyebrow="Submit data / Manual moderation only"
      title="Submit gameplay evidence"
      description="Use this page to send canonical observation or growth evidence into a private moderation inbox. Nothing here publishes automatically."
      status={enabled ? "Manual review enabled" : "Manual review disabled"}
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <SubmitDataForm
          disabledReason={config.disabledReason}
          enabled={enabled}
          previewMode={previewMode}
          retentionDays={config.retentionDays}
        />

        <div className="grid gap-6">
          <section className="rounded-[6px] border border-survey-line bg-surface p-5">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              What reviewers need
            </h2>
            <ul className="mt-4 grid gap-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-lightning">
              <li>Tree and server identifiers</li>
              <li>Exact or explicitly estimated timing</li>
              <li>Game version context</li>
              <li>HTTPS evidence URL with readable HUD details</li>
              <li>Manual consent for moderation review</li>
            </ul>
          </section>

          <section className="rounded-[6px] border border-survey-line bg-surface p-5">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Privacy boundaries
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Do not submit real names, personal contact details, unrelated chat
              logs, or private account information. Reviewers redact or reject
              sensitive material before any public promotion.
            </p>
          </section>
        </div>
      </div>

      <div className="mt-8">
        <EvidenceNote>
          Every accepted submission is manually reviewed before it can enter the
          public dataset. Pending submissions stay private, and the receipt is
          the deletion lookup key.
        </EvidenceNote>
      </div>

      <ContentSection title="Why this page is noindex">
        <p>
          This is an operational trust surface, not an acquisition page. It
          stays out of search until the moderation pipeline and privacy contract
          are fully governed.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
