import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/rebirth";
const title = "Greedy Growers Rebirth Guide";
const description =
  "Use a before-and-after Greedy Growers Rebirth checklist to verify costs, resets, persistent items, rewards, and unlocks without risking assumptions.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const beforeFields = [
  "Current money and other visible currency balances",
  "Owned seeds, inventory, active trees, and plot state",
  "Pets, eggs, boosts, items, and equipped effects",
  "The full Rebirth confirmation panel and its stated cost",
  "Every reset, reward, multiplier, and unlock named by the panel",
] as const;

const afterFields = [
  "New balances and inventory state",
  "Plot, tree, and equipped-effect state",
  "Rebirth counter or progression marker",
  "Newly visible shops, interfaces, or locked systems",
  "The next Rebirth panel without completing another reset",
] as const;

export default async function RebirthGuidePage() {
  const pageGate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 07 / Reset audit"
      title="Greedy Growers Rebirth guide"
      description="No current Rebirth cost, reward, reset list, or unlock order has passed review. Use this before-and-after audit to protect progress and produce evidence that another player can inspect."
      status={`${pageGate.reason} Page is ${pageGate.index ? "index" : "noindex"}.`}
    >
      <ContentSection title="The direct answer">
        <p>
          Do not Rebirth from an old cost table or a generic promise that a
          reset is always worth it. Read the confirmation panel in your current
          session, protect anything the panel does not clearly describe, and
          record the account state before and after the reset.
        </p>
        <EvidenceNote>
          Rebirth advice is version-sensitive and destructive to in-game
          progress. This page stays out of search until a reviewed recording
          establishes the exact cost, reset behavior, reward, unlocks, and
          current version.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Verified Rebirth ledger">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Rebirth step</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Reset</th>
                <th className="px-4 py-3 font-semibold">Reward</th>
                <th className="px-4 py-3 font-semibold">Evidence</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-survey-line">
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  No Rebirth step has a complete current-version before-and-after
                  capture. Verified rows will be added only after the reset and
                  persistence fields can be reviewed together.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Capture before you confirm">
        <ul className="list-disc space-y-3 pl-5">
          {beforeFields.map((field) => <li key={field}>{field}</li>)}
        </ul>
        <p>
          Scroll the panel if necessary and capture every line. If the interface
          omits an important field, label that field unknown instead of assuming
          it persists.
        </p>
      </ContentSection>

      <ContentSection title="Capture immediately after">
        <ul className="list-disc space-y-3 pl-5">
          {afterFields.map((field) => <li key={field}>{field}</li>)}
        </ul>
        <p>
          The first post-reset minute is part of the evidence. It distinguishes
          an immediate reward from an unlock that appears only after another
          action, and it shows whether the rebuild starts with the state the
          confirmation panel promised.
        </p>
      </ContentSection>

      <ContentSection title="Rebirth persistence matrix">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Before</th>
                <th className="px-4 py-3 font-semibold">After</th>
                <th className="px-4 py-3 font-semibold">Current evidence</th>
              </tr>
            </thead>
            <tbody>
              {["Money", "Seeds and inventory", "Pets and equipped effects", "Tickets", "Plots and unlocks"].map((state) => (
                <tr key={state} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{state}</th>
                  <td className="px-4 py-3">Record visible value</td>
                  <td className="px-4 py-3">Record immediately</td>
                  <td className="px-4 py-3">Unknown until captured</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Decide when a verified Rebirth is worth it">
        <p>
          Once cost and reward are known, compare the time needed to rebuild
          with the time the persistent benefit is expected to save. Keep the
          result in time and observed money rather than converting an unknown
          multiplier into a guaranteed payoff.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Measure one ordinary money route before the reset.</li>
          <li>Complete the verified Rebirth and rebuild to the same milestone.</li>
          <li>Run the same route again under the same start and stop rules.</li>
          <li>Compare rebuild time, net result, and any newly unlocked task separately.</li>
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/how-to-make-money">Measure the money route</InlineCta>
          <InlineCta href="/guides/how-to-get-tickets">Check the Ticket evidence</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Rebirth FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">What does Rebirth reset?</h3>
            <p className="mt-2">The current evidence set does not establish a complete reset list. Use the live confirmation panel and a before-and-after inventory capture.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Do pets or Tickets persist?</h3>
            <p className="mt-2">That persistence must be shown directly after a current-version reset; older community claims are not enough.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">When should I Rebirth?</h3>
            <p className="mt-2">Only after the visible reward is worth the measured rebuild time and the reset cannot remove progress you are unwilling to lose.</p>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
