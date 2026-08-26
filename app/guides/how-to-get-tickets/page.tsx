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

const route = "/guides/how-to-get-tickets";
const title = "How to Get Tickets in Greedy Growers Fast (All Methods)";
const description =
  "Compare every verified way to earn Farmer’s Tickets, current payout rules, refresh timing, and what Tickets buy in Greedy Growers.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const methodLedger = [
  ["Farmer’s Market", "Not verified", "Offer screen, requested item, delivered item, balance before and after, and refresh state."],
  ["Codes", "Not verified", "Redemption interface, exact code, result message, reward, and one-account behavior."],
  ["Update or event rewards", "Not collected", "Named event screen, eligibility, claim action, and reward receipt."],
  ["Pet or item effects", "Not collected", "Full passive wording plus a continuous balance or egg-acquisition record."],
] as const;

export default async function TicketsGuidePage() {
  const pageGate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Guide 05 / Currency route"
      title="How to get Tickets in Greedy Growers"
      description="Map every earning step before optimizing it. No current payout, refresh timer, or spending price has passed review."
      status={`${pageGate.reason} Page is ${pageGate.index ? "index" : "noindex"}.`}
    >
      <ContentSection title="The direct answer">
        <p>
          This project does not yet have a reviewed current-version recording
          that proves a complete Ticket route. Community coverage points to
          several places worth checking, but the earning method, payout,
          refresh behavior, and spending sink must all be visible in the same
          evidence chain before they become instructions here.
        </p>
        <EvidenceNote>
          Do not spend money, redeem a limited reward, or discard requested
          items only because a guide claims a Ticket payout. Open the live
          interface first and record the requirement it shows.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Ticket method ledger">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">What to capture</th>
              </tr>
            </thead>
            <tbody>
              {methodLedger.map(([method, status, capture]) => (
                <tr key={method} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{method}</th>
                  <td className="px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-lightning">{status}</td>
                  <td className="px-4 py-3">{capture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Record one complete earning loop">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Show the Ticket balance and the earning interface before taking the task.</li>
          <li>Capture the exact requirement, requested item, and any visible timer.</li>
          <li>Complete the task without cutting away from the relevant inventory state.</li>
          <li>Show the result message and the balance immediately after completion.</li>
          <li>Reopen the interface to record whether the offer is gone, replaced, or timed.</li>
        </ol>
        <p>
          The useful output is not a large reward screenshot. It is a repeatable
          route with a visible input, action, result, and elapsed time.
        </p>
      </ContentSection>

      <ContentSection title="Separate Tickets from run profit">
        <p>
          Keep each currency in its own ledger. A Ticket reward should not be
          converted into money unless the game exposes a stable exchange. For a
          farming run, record seed and boost costs, cash received, elapsed time,
          failed attempts, and Tickets separately. This prevents a one-time
          reward from making a repeatable route look more profitable than it is.
        </p>
        <InlineCta href="/guides/how-to-make-money">Build a repeatable money route</InlineCta>
      </ContentSection>

      <ContentSection title="What Tickets buy">
        <p>
          Egg, pet, wheel, or other spending claims remain unverified until the
          current shop screen is captured. When that evidence is available,
          this section will compare the cost, requirement, intended use, and
          verification date without turning price into a best-item ranking.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/pets">Open the pet evidence hub</InlineCta>
          <InlineCta href="/codes">Check code verification status</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Tickets FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">What is the fastest Ticket method?</h3>
            <p className="mt-2">No current method has a reviewed payout-and-time sample, so a fastest ranking would be invented.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Do codes give Tickets?</h3>
            <p className="mt-2">The redemption interface and reward receipt must be rechecked in the live game before that answer is published.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Do offers refresh?</h3>
            <p className="mt-2">Capture the same interface before and after its displayed timer or state change; do not infer a schedule from an old article.</p>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
