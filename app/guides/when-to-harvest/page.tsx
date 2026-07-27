import type { Metadata } from "next";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";

export const metadata: Metadata = {
  title: "When to Harvest in Greedy Growers – Lightning Risk Strategy",
  description:
    "Use expected value and a break-even risk threshold to compare harvesting now with waiting in Greedy Growers.",
  alternates: { canonical: "/guides/when-to-harvest" },
};

export default function WhenToHarvestPage() {
  return (
    <ContentPage
      eyebrow="Guide 02 / Decision method"
      title="When is waiting worth the lightning risk?"
      description="The calculator compares one certain scenario with one uncertain scenario. It does not predict the next strike or supply an official probability."
      status="Method: expected value · Risk source: your interval estimate"
    >
      <ContentSection title="The two outcomes being compared">
        <div className="grid gap-3 font-mono text-sm text-foreground">
          <p className="border-l-2 border-grow bg-surface px-4 py-3">
            Harvest EV = current value
          </p>
          <p className="border-l-2 border-lightning bg-surface px-4 py-3">
            Wait EV = (1 − p) × future value + p × residual value − wait cost
          </p>
        </div>
        <p>
          Here, <code className="text-foreground">p</code> is your estimated
          lightning probability for the exact wait interval. Residual value is
          what you assume remains after lightning. Wait cost is an optional
          opportunity cost expressed in the same unit as the values.
        </p>
      </ContentSection>

      <ContentSection title="Find the break-even risk">
        <p>
          When future value is greater than residual value, the risk at which
          waiting and harvesting are equal is:
        </p>
        <p className="overflow-x-auto border border-dashed border-survey-line bg-surface px-4 py-4 font-mono text-sm text-foreground">
          (future value − wait cost − current value) ÷ (future value − residual value)
        </p>
        <p>
          If your interval risk is below that threshold, waiting has the higher
          expected value. At equality, the calculator chooses harvest because
          waiting offers no expected-value advantage. A threshold outside 0% to
          100%, or a future value no greater than residual value, is reported as
          unavailable rather than forced into a misleading percentage.
        </p>
      </ContentSection>

      <ContentSection title="A hypothetical example">
        <p>
          Suppose the current value is 100, the estimated future value is 160,
          the risk over your planned wait is 25%, the residual value is zero,
          and the wait cost is 5. Wait EV is 115, compared with a Harvest EV of
          100. Under those assumptions, waiting has a 15-unit advantage.
        </p>
        <p>
          The break-even risk is about 34.38%. This is an illustration of the
          formula—not a Greedy Growers price, payout, or lightning estimate.
        </p>
        <EvidenceNote>
          The current evidence does not establish an official or community
          lightning probability. The calculator must stay in custom-risk mode
          until a current game version and sufficient approved observations are
          available.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="Use the result as a scenario, not a promise">
        <p>
          Expected value describes the average consequence of your assumptions.
          A single game outcome can still differ. Recalculate when your current
          value, planned wait, or risk estimate changes, and keep the formula
          visible when sharing the result.
        </p>
        <InlineCta href="/">Try the transparent calculator</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
