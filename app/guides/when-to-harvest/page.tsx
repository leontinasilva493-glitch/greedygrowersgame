import type { Metadata } from "next";
import Link from "next/link";

import {
  ContentPage,
  ContentSection,
  EvidenceNote,
  InlineCta,
} from "@/components/layout/ContentPage";

export const metadata: Metadata = {
  title: "When to Harvest in Greedy Growers — Risk Strategy",
  description:
    "Compare harvesting now with waiting in Greedy Growers using expected value, break-even risk, practical scenarios, and a clear decision checklist.",
  alternates: { canonical: "/guides/when-to-harvest" },
};

const linkClassName = "font-semibold text-lightning hover:underline";

export default function WhenToHarvestPage() {
  return (
    <ContentPage
      eyebrow="Guide 02 / Decision method"
      title="When should you harvest in Greedy Growers?"
      description="Compare one certain harvest with one defined wait. The method shows what follows from your assumptions; it does not predict the next lightning strike or supply an official probability."
      status="Reviewed 2026-08-02 · Expected-value method · Player-entered risk"
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
          lightning probability for the exact interval you plan to wait.
          Future value is what you think the same tree could be worth after
          that interval. Residual value is what you assume remains after the
          bad outcome, and wait cost represents any opportunity cost in the
          same unit as the other values.
        </p>
        <p>
          Harvesting is the more defensible choice when Harvest EV is at least
          as large as Wait EV. Waiting is favored only when its expected value
          is higher. That rule avoids calling two equal options a reason to
          accept extra uncertainty.
        </p>
      </ContentSection>

      <ContentSection title="Find the break-even risk">
        <p>
          When future value is greater than residual value, the risk at which
          waiting and harvesting have equal expected value is:
        </p>
        <p className="overflow-x-auto border border-dashed border-survey-line bg-surface px-4 py-4 font-mono text-sm text-foreground">
          (future value − wait cost − current value) ÷ (future value − residual value)
        </p>
        <p>
          If your interval risk is below that threshold, waiting has the higher
          expected value under your inputs. If it reaches or exceeds the
          threshold, harvest. A threshold outside 0% to 100%, or a future value
          no greater than residual value, is reported as unavailable rather
          than converted into a misleading percentage.
        </p>
      </ContentSection>

      <ContentSection title="Three risk scenarios">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground">
              Scenario 1: a small gain does not cover the risk
            </h3>
            <p className="mt-2">
              Suppose the current value is 100 and the estimated value after
              waiting is 110. With 20% interval risk, zero residual value, and
              no wait cost, Wait EV is 88. Harvest EV is 100, so harvesting now
              leads by 12 units. The possible increase is too small to justify
              the assumed chance of losing value.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Scenario 2: growth leaves a margin for waiting
            </h3>
            <p className="mt-2">
              Suppose current value is 100, future value is 160, interval risk
              is 25%, residual value is zero, and wait cost is 5. Wait EV is
              115, giving waiting a 15-unit advantage. The break-even risk is
              about 34.38%, so the entered 25% remains below the decision
              boundary.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Scenario 3: uncertainty crosses the decision boundary
            </h3>
            <p className="mt-2">
              Suppose current value is 100 and future value is 200, with zero
              residual value and no wait cost. Break-even risk is 50%. A 45%
              estimate produces a Wait EV of 110, while 55% produces 90. If
              your honest risk range is 45% to 55%, it supports opposite
              choices. Do not hide that uncertainty behind a single precise
              number: retest both ends, shorten the interval, or harvest if you
              prefer the certain outcome.
            </p>
          </div>
        </div>
        <EvidenceNote>
          Every number in these scenarios is hypothetical. None is an official
          Greedy Growers price, payout, growth rate, or lightning probability.
        </EvidenceNote>
      </ContentSection>

      <ContentSection title="When to harvest immediately">
        <ol className="grid gap-3 pl-5 marker:font-mono marker:text-risk">
          <li>
            Harvest when Wait EV is equal to or below the current harvest
            value. Waiting offers no expected-value advantage in that scenario.
          </li>
          <li>
            Harvest when your interval-risk estimate reaches or exceeds the
            break-even risk shown by the calculator.
          </li>
          <li>
            Harvest when the future-value estimate is not credibly higher than
            the current value after accounting for wait cost.
          </li>
          <li>
            Harvest when a plausible range of inputs includes losses you are
            not willing to accept, even if the midpoint narrowly favors waiting.
          </li>
          <li>
            Recalculate before deciding if the tree value, planned wait, or
            risk estimate has changed. A result based on stale inputs answers
            an old question.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Harvest decision FAQ">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-foreground">
              Does this calculator know the official lightning chance?
            </h3>
            <p className="mt-1">
              No. The current evidence set does not establish a current,
              source-backed probability. You supply a risk estimate for one
              specific wait interval.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              What if lightning does not reduce the tree to zero?
            </h3>
            <p className="mt-1">
              Use residual value to model what you believe remains. Zero is a
              conservative editable assumption, not a verified game mechanic.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Why does equality favor harvesting?
            </h3>
            <p className="mt-1">
              Equal expected values give no mathematical advantage to waiting.
              The calculator therefore selects the certain option rather than
              accepting uncertainty without added expected value.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              How often should I recalculate?
            </h3>
            <p className="mt-1">
              Recalculate whenever a meaningful input changes. Keep the wait
              interval explicit because a risk estimate for one duration should
              not be silently reused for another.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Is expected value a promise about the next outcome?
            </h3>
            <p className="mt-1">
              No. It summarizes the average consequence of your assumptions.
              One play can still turn out differently, so use the result as a
              transparent comparison rather than a prediction.
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Run your own comparison">
        <p>
          Enter one scenario, calculate it, then change the least certain input
          to see whether the recommendation survives. If you need the confirmed
          gameplay boundary first, read the{" "}
          <Link href="/guides/beginner-guide" className={linkClassName}>
            beginner guide
          </Link>
          . You can also return to the{" "}
          <Link href="/guides" className={linkClassName}>
            Greedy Growers guide hub
          </Link>{" "}
          for the recommended reading order.
        </p>
        <InlineCta href="/#calculator">Open the harvest calculator</InlineCta>
      </ContentSection>
    </ContentPage>
  );
}
