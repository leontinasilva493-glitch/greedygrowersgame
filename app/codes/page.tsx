import type { Metadata } from "next";
import { CircleAlert, ClipboardX } from "lucide-react";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Codes — Verification Status",
    description:
      "Check whether Greedy Growers codes and a redemption interface have been verified from attributable evidence.",
    canonical: "/codes",
    route: "/codes",
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default function CodesPage() {
  return (
    <ContentPage
      eyebrow="Codes / Evidence gate closed"
      title="Greedy Growers codes"
      description="A useful codes page starts by proving that the current game has a redemption interface. That evidence is not available yet."
      status="No verified redemption UI · Page is noindex"
    >
      <section className="border border-survey-line bg-surface p-5 sm:p-7" aria-labelledby="codes-zero-state">
        <ClipboardX aria-hidden="true" className="size-8 text-lightning" />
        <h2 id="codes-zero-state" className="mt-4 font-display text-2xl font-semibold text-foreground">
          No active Greedy Growers codes have been verified.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          We do not publish copied code lists, invented rewards, or redemption
          steps from third-party guides. The current official evidence does not
          establish where—or whether—codes can be redeemed.
        </p>
      </section>

      <ContentSection title="What would unlock this page">
        <ul className="grid gap-2 pl-5 marker:text-grow">
          <li>A current, continuous recording of the actual redemption UI.</li>
          <li>At least one valid HTTPS source attributable to the game creator.</li>
          <li>A fresh verification date and useful, unique instructions.</li>
        </ul>
        <EvidenceNote>
          A Discord server name or third-party article cannot authenticate an
          official code by itself.
        </EvidenceNote>
      </ContentSection>

      <div className="flex items-start gap-3 border-t border-dashed border-survey-line pt-6 text-sm text-muted-foreground">
        <CircleAlert aria-hidden="true" className="mt-1 size-5 shrink-0 text-risk" />
        <p>
          Until the gate passes, this route stays out of the sitemap and contains
          no copy button or redemption tutorial.
        </p>
      </div>
      <div className="mt-5 space-y-4">
        <InlineCta href="/guides">Read verified guides instead</InlineCta>
        <div>
          <InlineCta href="/updates">Check the sourced updates log</InlineCta>
        </div>
      </div>
    </ContentPage>
  );
}
