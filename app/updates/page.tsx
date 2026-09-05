import type { Metadata } from "next";
import { ExternalLink, FileClock } from "lucide-react";

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

const route = "/updates";
const title = "Greedy Growers Publish Status & Retest Log";
const description =
  "Track the latest Greedy Growers publish status, what Roblox's official API proves, what remains unknown, and which gameplay claims need current retesting.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

export default async function UpdatesPage() {
  const [snapshot, updates, sources, gameVersion] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getUpdates(),
    dataRepository.getSources(),
    dataRepository.getCurrentGameVersion(),
  ]);
  const gate = getPageIndexability(route, snapshot);
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return (
    <ContentPage
      eyebrow="Updates / Publish status"
      title="Greedy Growers publish status and retest log"
      description="Roblox exposes an experience publish timestamp, not patch notes. This page records the official signal, states what it cannot prove, and identifies the gameplay topics that need a fresh check."
      status={`Checked ${formatDate(gameVersion.checkedAt)} · Version label remains ${gameVersion.version} · Page is ${gate.index ? "index" : "noindex"}.`}
    >
      <section className="border border-survey-line bg-surface p-5 sm:p-7" aria-labelledby="latest-publish">
        <FileClock aria-hidden="true" className="size-8 text-lightning" />
        <h2 id="latest-publish" className="mt-4 font-display text-2xl font-semibold text-foreground">
          What changed in Greedy Growers?
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          The verified answer is limited: Roblox&apos;s official API shows that a
          new experience publish occurred. It does not describe patch contents,
          balance changes, new items, or a public version name. Those details
          remain unknown until a creator-controlled note or current gameplay
          capture identifies them.
        </p>
      </section>

      <ContentSection title="Latest verified Roblox publish signal">
        <div className="overflow-x-auto border border-survey-line">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Official publish signal</th>
                <th className="px-4 py-3 font-semibold">What is verified</th>
                <th className="px-4 py-3 font-semibold">What is not verified</th>
                <th className="px-4 py-3 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update) => (
                <tr key={update.id} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-mono font-semibold text-foreground">
                    {update.publishedAt}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">A Roblox experience publish occurred.</td>
                  <td className="px-4 py-3 text-muted-foreground">Patch contents, balance changes, and the current version label.</td>
                  <td className="px-4 py-3">
                    {update.sourceIds.map((sourceId) => {
                      const source = sourceById.get(sourceId);
                      return source ? (
                        <a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 border border-survey-line px-2 text-xs font-semibold text-lightning hover:border-lightning/60">
                          Roblox API<ExternalLink aria-hidden="true" className="size-3" />
                        </a>
                      ) : null;
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="What must be retested after this publish?">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Codes", "Settings redemption UI, reported code response, and reward."],
            ["Seeds", "Current roster, rarity, river price, and reported spawn chance."],
            ["Pets", "Egg pools, passive text, equip limit, and stacking behavior."],
            ["Tree size", "Displayed size, multiplier, final value, fertilizer, and RNG boundaries."],
            ["Mutations", "Weather trigger, seed-versus-fruit effect, multiplier, and stacking."],
            ["Progression", "Ticket earning, Rebirth confirmation, reset list, and retained items."],
          ].map(([name, check]) => (
            <div key={name} className="border-l-2 border-lightning bg-surface px-4 py-4">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="mt-2 text-sm leading-6">{check}</p>
            </div>
          ))}
        </div>
        <EvidenceNote>
          Older records are not deleted. A new publish marks affected claims
          Needs Recheck until a current capture confirms they still apply.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Where can I verify Greedy Growers updates?">
        <p>
          Use the official Roblox experience page for the creator description
          and Roblox&apos;s public API for the publish timestamp. Community videos
          and discussions can identify what to test, but they do not replace a
          creator-controlled announcement or current gameplay capture.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <InlineCta href="/about">Open the official-source policy</InlineCta>
          <InlineCta href="/official-links">Open verified official links</InlineCta>
          <InlineCta href="/data-status">Review the data gate</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Greedy Growers publish status FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">Is the Roblox updated timestamp a patch note?</h3>
            <p className="mt-1">No. It confirms a publish signal, but it does not name the features, fixes, balance changes, or version label inside that publish.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Why do older guide claims need another check?</h3>
            <p className="mt-1">A later publish can change interfaces or mechanics. A previously reported value stays a historical lead until the current experience shows it again.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Where should I look for confirmed update details?</h3>
            <p className="mt-1">Start with creator-controlled Roblox pages or announcements, then use continuous current gameplay captures to verify the affected fields.</p>
          </div>
        </div>
      </ContentSection>
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
