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

const route = "/guides/how-to-get-tickets";
const title = "How to Get Tickets in Greedy Growers";
const description =
  "Check reported Greedy Growers Ticket methods, the evidence needed to verify each payout, and a complete loop for measuring rewards and refreshes.";

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
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const pageGate = getPageIndexability(route, snapshot);

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

      <ContentSection title="What current coverage agrees on—and what it cannot prove">
        <p>
          Recent competitor coverage repeatedly connects Tickets with the
          Farmer&apos;s Market, codes, and pet eggs. The current source set does not
          establish the exact market payout, refresh interval, egg prices,
          whether balances persist through Rebirth, or whether any other earning
          route exists. Those are separate fields to test, not one combined fact.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/farmers-market">Capture a complete market order</InlineCta>
          <InlineCta href="/pets/majestic-egg">Review a reported Ticket spending path</InlineCta>
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

      <ContentSection title="Reported Ticket code lead">
        <p>
          Two independent editorial pages currently report the code
          <strong className="mx-1 text-foreground">ILOVECATS</strong>
          with a claimed reward of 100 Tickets. This is a research lead, not a
          verified working code: the project has not captured the live
          redemption interface, success message, or balance change.
        </p>
        <EvidenceNote>
          Check the codes page for the latest review date and source links. Do
          not treat a third-party listing as proof that the code still works on
          your account or in the current game build.
        </EvidenceNote>
        <InlineCta href="/codes">Review the reported code evidence</InlineCta>
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

      <ContentSection title="Sources and claim status">
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official baseline",
              claimStatus: "No Ticket system detail published",
              note: "The creator-controlled description does not define how Tickets are earned, spent, refreshed, or retained.",
            },
            {
              sourceId: "tickets-competitor-report",
              label: "Third-party guide",
              claimStatus: "Reported market, code, and egg route",
              note: "Useful for locating the interfaces to test. Payouts, timing, and prices remain unverified in this project.",
            },
            {
              sourceId: "codes-pcgamesn-report",
              label: "Independent editorial check",
              claimStatus: "Reported code reward only",
              note: "Supports one code lead but does not prove the broader Ticket economy or a current successful redemption.",
            },
          ]}
        />
      </ContentSection>
    </ContentPage>
  );
}
