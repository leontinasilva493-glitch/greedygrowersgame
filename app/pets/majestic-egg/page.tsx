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

const route = "/pets/majestic-egg";
const title = "Greedy Growers Majestic Egg Guide";
const description =
  "Compare reported Greedy Growers Majestic Egg methods, possible pets and passives, source limits, spending warnings, and the captures still needed.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const reportedMethods = [
  ["Shop purchase", "Editorial guides report a direct Robux purchase.", "Capture the product panel, exact price, purchase result, and inventory change."],
  ["Spin Wheel", "Editorial guides report the egg in a wheel reward pool after a progression unlock.", "Capture the locked and unlocked wheel, spin cost, full reward table, result, and inventory."],
  ["Magpie passive", "One guide reports that a pet passive can find eggs, including this one.", "Capture the full passive wording and one uninterrupted find from trigger to inventory."],
] as const;

const reportedPets = [
  ["Flamingo", "Reported to affect fruit size"],
  ["Hedgehog", "Reported to find a Worm"],
  ["Elephant", "Reported to interact with an Ivory mutation"],
  ["Horse", "Reported as a rideable pet with a timer-related passive"],
  ["Pegasus", "Reported as a flying mount that buffs other pets"],
] as const;

export default async function MajesticEggPage() {
  const [snapshot, sources] = await Promise.all([
    getIndexabilitySnapshot(),
    dataRepository.getSources(),
  ]);
  const gate = getPageIndexability(route, snapshot);

  return (
    <ContentPage
      eyebrow="Pets / Limited egg field note"
      title="How to get the Majestic Egg in Greedy Growers"
      description="Three acquisition routes and five possible pets are repeated across recent guide coverage. This page keeps that useful map while separating every reported detail from current gameplay proof."
      status={`Reviewed 2026-08-30 · Page is ${gate.index ? "index" : "noindex"}: ${gate.reason}`}
    >
      <ContentSection title="The direct answer">
        <p>
          Third-party guides report three ways to obtain the Majestic Egg: a
          Shop purchase, the Spin Wheel, and a Magpie pet passive. All
          acquisition methods, costs, odds, and pet passives remain third-party
          reports in this project because Roblox&apos;s public description does not
          document the egg and no current continuous capture has passed review.
        </p>
        <EvidenceNote>
          Do not spend Robux or Tickets based on this page alone. Open the live
          purchase or reward panel first, confirm the exact item and requirement,
          and use Roblox&apos;s own confirmation screen for any paid action.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Reported ways to get the Majestic Egg">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Reported method</th>
                <th className="px-4 py-3 font-semibold">What guides say</th>
                <th className="px-4 py-3 font-semibold">What to verify before acting</th>
              </tr>
            </thead>
            <tbody>
              {reportedMethods.map(([method, report, proof]) => (
                <tr key={method} className="border-t border-survey-line align-top">
                  <th scope="row" className="px-4 py-3 font-semibold text-foreground">{method}</th>
                  <td className="px-4 py-3">{report}</td>
                  <td className="px-4 py-3">{proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Reported pets in the Majestic Egg">
        <p>
          Recent editorial coverage agrees on a five-pet pool. The names below
          are preserved as reported leads; hatch chances, passive strength,
          cooldowns, stacking, and mount behavior are not verified here.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reportedPets.map(([name, report]) => (
            <article key={name} className="border-l-2 border-lightning bg-surface px-4 py-4">
              <h3 className="font-display text-xl font-semibold text-foreground">{name}</h3>
              <p className="mt-2 text-sm leading-6">{report}</p>
              <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-risk">Reported · needs capture</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Verify one acquisition without losing the context">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Show the current server, item name, and full acquisition panel.</li>
          <li>Record the balance, unlock state, or pet passive before the attempt.</li>
          <li>Keep recording through the purchase, spin, or passive trigger.</li>
          <li>Open inventory and show the resulting item plus every balance change.</li>
          <li>If hatching, keep the egg identity, hatch result, and full pet card in the same sequence.</li>
        </ol>
      </ContentSection>

      <ContentSection title="Sources and claim status">
        <SourceLedger
          sources={sources}
          entries={[
            {
              sourceId: "official-game-page",
              label: "Official baseline",
              claimStatus: "No Majestic Egg detail published",
              note: "Confirms the experience and core loop only; it does not list the egg, pets, costs, odds, or passives.",
            },
            {
              sourceId: "majestic-egg-allthings-report",
              label: "Third-party guide",
              claimStatus: "Reported acquisition and pet pool",
              note: "Detailed lead for the three methods and five reported pets. Exact values still require current gameplay.",
            },
            {
              sourceId: "majestic-egg-pgg-report",
              label: "Independent editorial check",
              claimStatus: "Corroborating report, not gameplay proof",
              note: "A second guide helps identify overlap and conflicts but cannot verify the live purchase or hatch UI.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection title="Continue the progression check">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/pets">Open the pet evidence hub</InlineCta>
          <InlineCta href="/guides/how-to-get-tickets">Plan the Ticket evidence route</InlineCta>
          <InlineCta href="/guides/rebirth">Audit the reported unlock path</InlineCta>
          <InlineCta href="/guides/prediction-potion">Inspect the other reported wheel item</InlineCta>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
