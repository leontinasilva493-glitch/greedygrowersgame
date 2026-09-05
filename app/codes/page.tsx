import type { Metadata } from "next";
import { CircleAlert, ExternalLink, ShieldCheck } from "lucide-react";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { dataRepository } from "@/features/data/repository";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getPageIndexability } from "@/features/seo/indexability";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/codes";
const title = "Greedy Growers Codes (Sep 2026): Reported";
const description =
  "Check reported Greedy Growers codes for September 2026, see working and expired status separately, and follow a safe current-game redemption check.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default async function CodesPage() {
  const [snapshot, codes, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getCodes(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const statusSummary = [
    {
      label: "Working",
      count: codes.active.length,
      detail:
        codes.active.length > 0
          ? "Passed the current gameplay redemption gate."
          : "No current gameplay redemption has passed review.",
    },
    {
      label: "Reported",
      count: codes.reported.length,
      detail: "Independent-source leads that still need a live redemption.",
    },
    {
      label: "Expired",
      count: codes.expired.length,
      detail:
        codes.expired.length > 0
          ? "Recorded as failed or expired with dated evidence."
          : "No code has a reviewed expired record yet.",
    },
  ] as const;

  return (
    <ContentPage
      eyebrow="Codes / Freshness checked"
      title="Greedy Growers codes: reported and working status"
      description="No code is labelled active until a current in-game redemption succeeds. Independent reports are still useful leads, so they are listed separately with claimed rewards and source dates."
      status={`Checked ${formatDate(codes.lastChecked)} · ${gate.reason} Page is ${gate.index ? "index" : "noindex"}.`}
    >
      <section className="border border-survey-line bg-surface p-5 sm:p-7" aria-labelledby="codes-answer">
        <ShieldCheck aria-hidden="true" className="size-8 text-lightning" />
        <h2 id="codes-answer" className="mt-4 font-display text-2xl font-semibold text-foreground">
          No active code has passed a current gameplay redemption check.
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          Two independent editorial sources currently report the same code lead.
          That agreement raises confidence that the lead is worth testing, but it
          does not prove that the code still works in the current server build.
        </p>
      </section>

      <ContentSection title="Working, reported, and expired status">
        <div className="grid gap-3 sm:grid-cols-3">
          {statusSummary.map((item) => (
            <article
              key={item.label}
              className="border border-survey-line bg-surface px-4 py-4"
            >
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-lightning">
                {item.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                {item.count}
              </p>
              <p className="mt-2 text-sm leading-6">{item.detail}</p>
            </article>
          ))}
        </div>
        <EvidenceNote>
          Working means this project captured the current code field, response,
          and reward change in one uninterrupted check. Reported means a lead is
          ready to test. Expired requires a dated failed or expired result; it is
          not inferred from age alone.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Reported Greedy Growers code leads">
        <div className="overflow-x-auto border border-survey-line">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Reported code</th>
                <th className="px-4 py-3 font-semibold">Claimed reward</th>
                <th className="px-4 py-3 font-semibold">Verification status</th>
                <th className="px-4 py-3 font-semibold">Checked</th>
                <th className="px-4 py-3 font-semibold">Sources</th>
              </tr>
            </thead>
            <tbody>
              {codes.reported.map((entry) => (
                <tr key={entry.code} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-mono font-semibold text-foreground">
                    {entry.code}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">{entry.reward ?? "Not reported"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Reported by independent editorial sources; not gameplay-verified
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.checkedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {entry.sourceIds.map((sourceId) => {
                        const source = sourceById.get(sourceId);
                        return source ? (
                          <a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 border border-survey-line px-2 text-xs font-semibold text-lightning hover:border-lightning/60">
                            {source.title}<ExternalLink aria-hidden="true" className="size-3" />
                          </a>
                        ) : null;
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EvidenceNote>
          Reported is not active. The code remains outside a copy button and
          outside the active-code count until an uninterrupted current-version
          recording shows the Settings field, submission, and resulting reward.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Working Greedy Growers codes">
        {codes.active.length > 0 ? (
          <ul className="grid gap-3">
            {codes.active.map((entry) => (
              <li key={entry.code} className="border border-survey-line bg-surface px-4 py-4">
                <span className="font-mono font-semibold text-foreground">{entry.code}</span>
                <span className="ml-3 text-sm">Verified {formatDate(entry.checkedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No gameplay-verified working code is available. Reported leads stay
            outside this section until the complete redemption path is recorded.
          </p>
        )}
      </ContentSection>

      <ContentSection title="Expired Greedy Growers codes">
        {codes.expired.length > 0 ? (
          <ul className="grid gap-3">
            {codes.expired.map((entry) => (
              <li key={entry.code} className="border border-survey-line bg-surface px-4 py-4">
                <span className="font-mono font-semibold text-foreground">{entry.code}</span>
                <span className="ml-3 text-sm">Checked {formatDate(entry.checkedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No code has a reviewed expired record. An untested or old report is
            still reported, not automatically expired.
          </p>
        )}
      </ContentSection>

      <ContentSection title="How should I redeem a reported code safely?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Open Greedy Growers from the official Roblox experience page.</li>
          <li>Inspect the current Settings menu for a code field; do not assume an older screenshot still matches.</li>
          <li>Enter the lead exactly as shown and record the response before spending any claimed reward.</li>
          <li>Never enter Roblox credentials on a third-party code website.</li>
        </ol>
        <p>
          Editorial sources describe a Settings-and-Submit path, but this site
          has not yet captured that interface in the current build. Treat the
          steps above as a safe verification procedure rather than a promise.
        </p>
      </ContentSection>

      <ContentSection title="What turns a report into a working code?">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the current server and open the code field in Settings.</li>
          <li>Show the relevant balance or inventory before submission.</li>
          <li>Enter the exact reported text without cutting the recording.</li>
          <li>Capture the game response and the resulting balance or inventory.</li>
          <li>Bind the result to the check date before moving the code between statuses.</li>
        </ol>
        <p>
          A working label describes that complete observation. It does not come
          from the number of sites repeating the same code.
        </p>
      </ContentSection>

      <ContentSection title="Why is a Greedy Growers code not working?">
        <ul className="grid gap-3 pl-5 marker:text-risk">
          <li>The code may have expired after the last editorial check.</li>
          <li>Capitalization or whitespace may not match the reported text.</li>
          <li>The current server may be running a different publish than the source checked.</li>
          <li>A tracker may have copied a claim without redeeming it.</li>
          <li>The code may already have been redeemed on the account.</li>
        </ul>
      </ContentSection>

      <div className="flex items-start gap-3 border-t border-dashed border-survey-line pt-6 text-sm text-muted-foreground">
        <CircleAlert aria-hidden="true" className="mt-1 size-5 shrink-0 text-risk" />
        <p>
          This route remains noindex while the redemption UI is unverified.
          Fresh editorial agreement improves the research lead, not the evidence gate.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <InlineCta href="/guides/how-to-get-tickets">Review Ticket evidence</InlineCta>
        <InlineCta href="/updates">Check the publish log</InlineCta>
        <InlineCta href="/official-links">Open verified Roblox links</InlineCta>
        <InlineCta href="/guides">Browse the Greedy Growers wiki</InlineCta>
      </div>
    </ContentPage>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
