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
const title = "Greedy Growers Pets, Eggs & Passives";
const description =
  "Check the evidence status of Greedy Growers pets, eggs, passives, Ticket costs, equip behavior, and stacking before spending resources.";

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

      <ContentSection title="Greedy Growers egg and hatching questions">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="border-l-2 border-lightning bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">Where do eggs come from?</h3>
            <p className="mt-2 text-sm leading-6">No complete current source list has passed review. Capture the shop, task, reward, or drop screen together with the displayed requirement.</p>
          </article>
          <article className="border-l-2 border-grow bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">How long does an egg take to hatch?</h3>
            <p className="mt-2 text-sm leading-6">The current evidence does not establish a universal timer. Record the trigger, start time, visible countdown, and hatch result in one sequence.</p>
          </article>
          <article className="border-l-2 border-risk bg-surface px-4 py-4">
            <h3 className="font-display text-xl font-semibold text-foreground">What happens when a duplicate pet hatches?</h3>
            <p className="mt-2 text-sm leading-6">Duplicate handling is unknown until the resulting inventory, slots, passive text, and any merge or replacement prompt are captured.</p>
          </article>
        </div>
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

      <ContentSection title="Test a pet passive against one goal">
        <div className="overflow-x-auto border border-survey-line bg-surface">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-surface-raised text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Player goal</th>
                <th className="px-4 py-3 font-semibold">Keep constant</th>
                <th className="px-4 py-3 font-semibold">Measure</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Faster growth", "Same seed, plot, fertilizer, and timer", "Visible size or stage at the same elapsed time"],
                ["Higher sale value", "Same seed and harvest point", "Cash before and after sale"],
                ["Mutation support", "Same tree and weather window", "Named mutation shown by the game UI"],
                ["Duplicate stacking", "One pet versus two copies", "The same visible output under both setups"],
              ].map(([goal, controls, measure]) => (
                <tr key={goal} className="border-t border-survey-line align-top">
                  <th className="px-4 py-3 font-semibold text-foreground">{goal}</th>
                  <td className="px-4 py-3">{controls}</td>
                  <td className="px-4 py-3">{measure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EvidenceNote>
          Community videos are useful for locating pet interfaces, but narration
          and edited highlights do not establish hidden odds or stacking. Record
          the visible in-game wording and a controlled before-and-after result.
        </EvidenceNote>
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
