import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/how-to-make-money";
const title = "How to Make Money Fast in Greedy Growers (Safe Routes)";
const description =
  "Build a repeatable Greedy Growers money loop using observed costs, harvest returns, cycle time, lightning losses, and your own calculator inputs.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const recordFields = [
  ["Money before", "The balance immediately before the first purchase."],
  ["Attempt cost", "Every seed, boost, or other visible cost used in one attempt."],
  ["Failed attempts", "Each paid attempt that does not produce the counted harvest."],
  ["Harvest return", "The money actually added after the successful sale or collection."],
  ["Elapsed time", "From the first purchase until the final result reaches the balance."],
] as const;

export default function MoneyGuidePage() {
  return (
    <ContentPage
      eyebrow="Guide 06 / Observed economy"
      title="How to make money fast in Greedy Growers"
      description="The fastest useful route is the one your account can repeat after costs, failed attempts, and time. Measure a complete cycle, then compare it with another cycle under the same rules."
      status="Indexable method guide · Player-entered values · No game presets"
    >
      <ContentSection title="The direct answer">
        <p>
          Start with a route you can afford to repeat. Record every purchase,
          every failed attempt, the money actually received, and the full time
          spent. Improve the route only when its observed net result or net per
          minute beats the alternative across several comparable runs.
        </p>
        <p className="overflow-x-auto border border-dashed border-survey-line bg-surface px-4 py-4 font-mono text-sm text-foreground">
          Observed net result = money after the cycle − money before the cycle
        </p>
        <EvidenceNote>
          No seed is ranked as universally best. This project has no verified
          current-version price table, growth curve, mutation rate, or
          lightning probability that could support that claim.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Record one complete money cycle">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">What to record</th>
              </tr>
            </thead>
            <tbody>
              {recordFields.map(([field, instruction]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{field}</th>
                  <td className="px-4 py-3">{instruction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          If a run uses a different boost, weather event, pet, update, or route,
          label it as a different setup. Combining unlike runs hides the reason
          one result changed.
        </p>
      </ContentSection>

      <ContentSection title="Choose one of three routes">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="border-l-2 border-grow bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">Safe route</h3>
            <p className="mt-2 text-sm leading-6">Protect enough money for the next attempt. Harvest or exit before one failure would end the session.</p>
          </article>
          <article className="border-l-2 border-lightning bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">Balanced route</h3>
            <p className="mt-2 text-sm leading-6">Keep the replacement reserve separate, then let only the surplus stay exposed for a defined interval.</p>
          </article>
          <article className="border-l-2 border-risk bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">Test route</h3>
            <p className="mt-2 text-sm leading-6">Risk one controlled attempt, record every loss, and compare the average with the safe route before scaling it.</p>
          </article>
        </div>
      </ContentSection>

      <ContentSection title="Include the failures that screenshots hide">
        <p>
          A final successful harvest does not show the full run. If each attempt
          has the same visible cost, total cost equals that cost multiplied by
          every failed attempt plus the successful attempt. The calculator then
          compares the final return with the full sequence cost and divides the
          result by elapsed minutes.
        </p>
        <p>
          Keep one-time codes, Tickets, and account unlocks in separate fields.
          They can change a session, but they are not proof that the same money
          route will pay again.
        </p>
        <InlineCta href="/#calculator">Open the calculator and choose Run profit</InlineCta>
      </ContentSection>

      <ContentSection title="Improve the route one variable at a time">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Repeat the baseline until the result is not dominated by one lucky run.</li>
          <li>Change one input: purchase choice, wait interval, plot usage, or another visible action.</li>
          <li>Use the same start and stop rule for the comparison run.</li>
          <li>Keep all failures and elapsed time in both samples.</li>
          <li>Prefer the route that remains affordable and repeatable, not the largest screenshot.</li>
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/how-to-get-tickets">Keep Tickets in a separate ledger</InlineCta>
          <InlineCta href="/guides/rebirth">Audit a Rebirth before resetting</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Money guide FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">What is the best seed for money?</h3>
            <p className="mt-2">There is no verified universal answer. Compare observed cost, return, time, and failure rate for seeds available in your session.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Should failed trees count?</h3>
            <p className="mt-2">Yes. A failed paid attempt is part of the sequence cost even when the final attempt succeeds.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Is the largest harvest the fastest route?</h3>
            <p className="mt-2">Not necessarily. Compare net result per minute and check whether the route leaves enough money to repeat it.</p>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
