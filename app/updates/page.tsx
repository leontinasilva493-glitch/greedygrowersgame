import type { Metadata } from "next";
import { FileClock } from "lucide-react";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title: "Greedy Growers Updates — Evidence Log",
    description:
      "Separate sourced Greedy Growers game updates from changes to this site's data and methods.",
    canonical: "/updates",
    route: "/updates",
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default async function UpdatesPage() {
  const gate = getPageIndexability("/updates", await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Updates / Empty approved log"
      title="Game and data updates"
      description="Game changes and changes to this site's evidence are different records. Neither should be inferred from a generic page timestamp."
      status={`${gate.reason} Page is ${gate.index ? "index" : "noindex"}.`}
    >
      <section className="border border-survey-line bg-surface p-5 sm:p-7" aria-labelledby="updates-zero-state">
        <FileClock aria-hidden="true" className="size-8 text-lightning" />
        <h2 id="updates-zero-state" className="mt-4 font-display text-2xl font-semibold text-foreground">
          No sourced update has been published yet.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          Roblox metadata timestamps currently conflict across official endpoints
          and do not identify a gameplay-data version. They are not promoted to
          patch notes or used to mix observations.
        </p>
      </section>

      <ContentSection title="Two logs, two responsibilities">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border-l-2 border-grow bg-surface px-4 py-4">
            <h3 className="font-semibold text-foreground">Game update</h3>
            <p className="mt-2 text-sm leading-6">
              A creator-published or game-visible change, with source, date,
              version context, and affected mechanics.
            </p>
          </div>
          <div className="border-l-2 border-lightning bg-surface px-4 py-4">
            <h3 className="font-semibold text-foreground">Data update</h3>
            <p className="mt-2 text-sm leading-6">
              A change to this site’s records, calculator, eligibility rules, or
              methodology, preserved in a reviewable changelog.
            </p>
          </div>
        </div>
        <EvidenceNote>
          A future game update that invalidates prior data must mark older records
          Needs Recheck without rewriting their historical raw status.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Index gate">
        <p>
          This route remains out of the sitemap until at least one approved,
          sourced update exists. The empty state is available for transparency,
          not search acquisition.
        </p>
        <InlineCta href="/data-status">Review current data status</InlineCta>
        <div className="mt-4">
          <InlineCta href="/about">Read how evidence is classified</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
