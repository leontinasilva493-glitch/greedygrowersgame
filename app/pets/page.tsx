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

const route = "/pets";
const title = "Greedy Growers Pets: All Pets, Eggs & Passives (2026)";
const description =
  "See every Greedy Growers pet, egg source, Ticket cost, passive effect, and verification date, plus how to hatch and equip pets.";

export async function generateMetadata(): Promise<Metadata> {
  return createGatedMetadata({
    title,
    description,
    canonical: route,
    route,
    snapshot: await getIndexabilitySnapshot(),
  });
}

const captureFields = [
  ["Pet identity", "Name, visible rarity, and the exact egg or source shown in game."],
  ["Acquisition", "Ticket price or other requirement, plus the screen where the purchase happens."],
  ["Passive", "Full in-game wording, trigger condition, target, and any displayed timer."],
  ["Equip behavior", "Available slots, duplicate behavior, stacking, and what persists after leaving."],
  ["Version binding", "Capture date, platform, and the current experience state for every record."],
] as const;

export default async function PetsPage() {
  const pageGate = getPageIndexability(route, await getIndexabilitySnapshot());

  return (
    <ContentPage
      eyebrow="Field index / Pets"
      title="Greedy Growers pets: eggs, passives, and evidence"
      description="No complete current-version pet catalog has passed review. This hub shows the exact fields needed for a useful pet list and keeps unverified names, prices, odds, and rankings out of the record."
      status={`${pageGate.reason} Page is ${pageGate.index ? "index" : "noindex"}.`}
    >
      <ContentSection title="What is verified right now">
        <p>
          The official Roblox description currently supports the river seed,
          plot, growth, lightning, and harvest loop. It does not publish a pet
          catalog, egg table, passive list, or best-pet ranking. Those newer
          systems need current in-game captures before this project presents
          them as game facts.
        </p>
        <EvidenceNote>
          No complete current-version pet catalog has passed review. A pet name
          appearing on several guide sites is a research lead, not a verified
          record for this page.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Verified pet catalog">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Pet</th>
                <th className="px-4 py-3 font-semibold">Egg</th>
                <th className="px-4 py-3 font-semibold">Passive</th>
                <th className="px-4 py-3 font-semibold">Evidence</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-survey-line">
                <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                  Verified pet records will appear here after their identity,
                  source, passive wording, and current-version capture pass
                  review. Empty is more accurate than a copied list.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="What each pet record must contain">
        <div className="grid gap-3 sm:grid-cols-2">
          {captureFields.map(([field, requirement]) => (
            <article key={field} className="border border-survey-line bg-surface px-4 py-4">
              <h3 className="font-display text-xl font-semibold text-foreground">{field}</h3>
              <p className="mt-2 text-sm leading-6">{requirement}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="How to document an egg and hatch">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Record the shop or reward screen before spending anything.</li>
          <li>Show the egg name, displayed price, currency, and stated contents.</li>
          <li>Keep the recording continuous through purchase, placement, and hatch.</li>
          <li>Open the resulting pet card and capture the complete passive wording.</li>
          <li>Equip it and record the visible behavior without inferring hidden odds.</li>
        </ol>
        <p>
          Repeating this for independent hatches helps separate a stable rule
          from one lucky result. Drop rates require a defined sample, not a
          percentage copied from a single screen or article.
        </p>
      </ContentSection>

      <ContentSection title="Choose a pet without a fabricated tier list">
        <p>
          Start with the task the pet must help: protect working capital, shorten
          a repeatable cycle, support a visible resource, or reduce a measured
          failure cost. Compare only effects you can see and record. Rarity,
          price, and community popularity do not prove a pet is best for your
          current run.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <InlineCta href="/guides/how-to-get-tickets">Plan the Ticket route</InlineCta>
          <InlineCta href="/submit-data">Submit a current pet capture</InlineCta>
        </div>
      </ContentSection>

      <ContentSection title="Greedy Growers pets FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">How many pets are in the game?</h3>
            <p className="mt-2">The current evidence set does not establish a complete count.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Which pet is best?</h3>
            <p className="mt-2">No evidence-backed universal ranking is available. The useful choice depends on a verified passive and your current task.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Do pet passives stack?</h3>
            <p className="mt-2">That behavior needs a controlled equip test with the same target and otherwise unchanged conditions.</p>
          </div>
        </div>
      </ContentSection>
    </ContentPage>
  );
}
