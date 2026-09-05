import type { Metadata } from "next";

import { SourceLedger } from "@/components/content/SourceLedger";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/weather-events";
const title = "Greedy Growers Weather Events Guide";
const description =
  "Review reported Greedy Growers weather events, mutation links and affected targets, then use a safe event checklist without trusting unverified timers or values.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const reportedWeather = [
  ["Misty", "Dewy", "2×", "Seeds, plants, or fruit are reported targets"],
  ["Thunderstorm", "Shocked / Charged", "2.5× / 7.5×", "Lightning and threshold details conflict across reports"],
  ["Radioactive / Acid Rain", "Radioactive", "5×", "The event name itself needs a current UI capture"],
  ["Rainbow", "Golden", "25×", "Reported to affect exposed crops during the event"],
  ["Meteor Shower", "Cosmic", "100×", "Reported as the highest-value event relationship"],
] as const;

export default async function WeatherEventsPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);

  return (
    <ContentPage
      eyebrow="Guide 12 / Weather field map"
      title="Greedy Growers weather events explained"
      description="Recent guides connect named weather windows with mutations, but the official description does not publish the event table. Use this page to react safely and capture the live rules."
      status={`Reviewed 2026-08-30 · Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          Every event name, duration, trigger and multiplier below is reported,
          not creator-published or gameplay-verified by this project. Current
          guides broadly describe Misty, storm, radioactive, Rainbow, and Meteor
          Shower windows linked to mutations. The exact event names, timers,
          target rules, probabilities, and value effects still need current
          continuous captures.
        </p>
        <EvidenceNote>
          Weather does not supply a lightning forecast or a guaranteed mutation.
          Protect a harvest you cannot afford to lose, and do not buy a forced
          event based only on third-party values.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Reported weather and mutation map">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Reported weather</th>
                <th className="px-4 py-3 font-semibold">Reported mutation</th>
                <th className="px-4 py-3 font-semibold">Reported multiplier</th>
                <th className="px-4 py-3 font-semibold">Open evidence question</th>
              </tr>
            </thead>
            <tbody>
              {reportedWeather.map(([weather, mutation, multiplier, question]) => (
                <tr key={weather} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{weather}</th>
                  <td className="px-4 py-3">{mutation}</td>
                  <td className="px-4 py-3">{multiplier}</td>
                  <td className="px-4 py-3">{question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="What to do when weather starts">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the event name, visible timer, sky state, and server time before acting.</li>
          <li>Protect any tree whose current value you are not willing to risk.</li>
          <li>Capture river seeds, planted trees, and fruit separately so affected targets are not mixed together.</li>
          <li>Record the exact mutation label before and after the event.</li>
          <li>Keep the harvest or sale result attached to the same crop instance.</li>
        </ol>
        <p>
          This checklist remains useful even when a reported event table is
          wrong. It captures the state needed to update the page without turning
          one lucky result into a probability.
        </p>
      </ContentSection>

      <ContentSection title="Separate four claims in every weather report">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Event identity", "The exact in-game name and visible start/end state."],
            ["Target", "Whether a river seed, planted seed, tree, or fruit changed."],
            ["Mutation", "The label shown by the game rather than a visual guess."],
            ["Value effect", "The sale result tied to the same item, with no stacking assumed."],
          ].map(([name, detail]) => (
            <article key={name} className="border border-survey-line bg-surface px-4 py-4">
              <h3 className="font-display text-xl font-semibold text-foreground">{name}</h3>
              <p className="mt-2 text-sm leading-6">{detail}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Sources and claim status">
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official baseline",
              claimStatus: "No weather table published",
              note: "Confirms lightning as part of the core loop but does not name weather events, timers, mutations, or multipliers.",
            },
            {
              sourceId: "weather-competitor-report",
              label: "Third-party guide",
              claimStatus: "Reported events, duration, targets, and values",
              note: "Primary content-collection lead for this field map. Its claims are not calculator defaults or guaranteed outcomes.",
            },
            {
              sourceId: "mutations-pgg-report",
              label: "Independent editorial check",
              claimStatus: "Reported mutation relationships",
              note: "Used to compare names and claimed triggers; conflicts and exact mechanics still require current gameplay.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection title="Related system checks">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/mutations">Review mutation claims</InlineCta>
          <InlineCta href="/guides/worms">Test a worm effect</InlineCta>
          <InlineCta href="/guides/fertilizer">Test fertilizer separately</InlineCta>
          <InlineCta href="/pets">Keep pet passives out of the baseline</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
