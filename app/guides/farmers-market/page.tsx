import type { Metadata } from "next";

import { SourceLedger } from "@/components/content/SourceLedger";
import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";
import { siteConfig } from "@/config/site";
import { dataRepository } from "@/features/data/repository";
import { getPageIndexability } from "@/features/seo/indexability";
import { createGatedMetadata } from "@/features/seo/metadata";
import { getIndexabilitySnapshot } from "@/features/seo/snapshot";

const route = "/guides/farmers-market";
const title = "Greedy Growers Farmer's Market Guide";
const description =
  "Use a Greedy Growers Farmer's Market checklist to capture one order, delivery, reward, and refresh cycle without publishing unverified Ticket payouts.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const orderFields = [
  ["Market identity", "Exact panel or location name shown in the current server"],
  ["Request", "Item name, quantity, quality, and any visible time limit"],
  ["Starting state", "Inventory and currency balances before delivery"],
  ["Delivery", "The action used to submit the requested item"],
  ["Result", "Confirmation message plus every balance or inventory change"],
  ["Refresh", "Displayed timer, replacement order, or unchanged state after delivery"],
] as const;

export default async function FarmersMarketPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);

  return (
    <ContentPage
      eyebrow="Guide 11 / Market evidence"
      title="How does the Farmer's Market work in Greedy Growers?"
      description="The current evidence does not establish a complete market order or Ticket payout. Use this page to inspect the live panel and record one delivery from request to refresh."
      status={`Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          No current recording verifies a complete Farmer&apos;s Market order.
          The order requirements, delivery action, reward, Ticket connection,
          and refresh behavior remain open questions in this project.
        </p>
        <EvidenceNote>
          The official Roblox experience description does not define a
          Farmer&apos;s Market system. Treat the name as a research lead until the
          current game interface and one complete transaction can be reviewed.
        </EvidenceNote>
        <a
          href={siteConfig.robloxGameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lightning hover:underline"
        >
          Open the official Greedy Growers experience
        </a>
      </ContentSection>

      <ContentSection title="Farmer's Market order checklist">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">What to capture</th>
              </tr>
            </thead>
            <tbody>
              {orderFields.map(([field, capture]) => (
                <tr key={field} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                    {field}
                  </th>
                  <td className="px-4 py-3">{capture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="How to capture one complete delivery">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Show the full market panel before moving or spending an item.</li>
          <li>Record the requested item and every visible requirement.</li>
          <li>Show the starting inventory and currency balances.</li>
          <li>Deliver the item without cutting away from the interface.</li>
          <li>Keep recording through the confirmation, reward, and refresh state.</li>
        </ol>
        <p>
          If the order cannot be completed, record the rejection message and
          unchanged balances. A failed delivery is still useful evidence when it
          shows which requirement was missing.
        </p>
      </ContentSection>

      <ContentSection title="How should a reward be reported?">
        <p>
          Report only the balance or inventory change visible in the same
          sequence. Keep money, Tickets, items, and unlocks in separate fields.
          One completed order cannot establish a permanent payout, a refresh
          schedule, or the best item to submit.
        </p>
        <InlineCta href="/guides/how-to-get-tickets">Review the Ticket evidence ledger</InlineCta>
      </ContentSection>

      <ContentSection title="Reported market loop versus verified fields">
        <p>
          Competitor pages describe a request board, growing the named fruit,
          delivering it, receiving Tickets, and waiting for a refresh. This is
          a useful interface map, but the request rules, eligible fruit state,
          reward amount, refresh timing, and repeatability are still unverified.
          Capture each field instead of copying a claimed maximum payout.
        </p>
      </ContentSection>

      <ContentSection title="Farmer's Market FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">Does the Farmer&apos;s Market give Tickets?</h3>
            <p className="mt-1">No current reviewed delivery proves a Ticket payout. Record the balance before and after one complete order.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Do market orders refresh?</h3>
            <p className="mt-1">The refresh rule is unverified. Capture any visible timer and the next state without inferring a schedule from one visit.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Which order should I complete first?</h3>
            <p className="mt-1">Compare only visible requirements and rewards. Do not spend a rare item when the current panel does not show a result you are willing to accept.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Add the missing evidence">
        <p>
          A useful submission shows the request, delivery, result, and refresh
          state in one current-version sequence. Redact usernames or chat while
          keeping the relevant interface readable.
        </p>
        <InlineCta href="/submit-data">Submit a Farmer&apos;s Market capture</InlineCta>
      </ContentSection>

      <ContentSection title="Sources and claim status">
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official baseline",
              claimStatus: "No market mechanic published",
              note: "The public game description confirms the seed-to-harvest loop but does not describe requests, deliveries, Tickets, or refreshes.",
            },
            {
              sourceId: "tickets-competitor-report",
              label: "Third-party guide",
              claimStatus: "Reported market loop and values",
              note: "Used to identify the panel and transaction fields to capture. It is not a reviewed current gameplay record.",
            },
            {
              sourceId: "reddit-player-questions",
              label: "Community report",
              claimStatus: "Player-question signal only",
              note: "Forum discussion helps prioritize confusing systems but does not establish a complete Farmer's Market transaction.",
            },
          ]}
        />
      </ContentSection>
    </ContentPage>
  );
}
