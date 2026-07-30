const sectionClass =
  "border border-survey-line bg-surface px-5 py-7 shadow-[inset_0_1px_0_rgb(244_240_227_/_0.04)] sm:px-7";
const headingClass =
  "font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl";
const subheadingClass =
  "font-display text-xl font-semibold tracking-[-0.015em] text-foreground";
const bodyClass = "mt-3 text-base leading-7 text-muted-foreground";

export function CalculatorGuide() {
  return (
    <div className="mt-10 grid gap-6">
      <section className={sectionClass} aria-labelledby="calculator-method">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
          Method
        </p>
        <h2 id="calculator-method" className={`${headingClass} mt-3`}>
          How the Greedy Growers Calculator Works
        </h2>
        <p className={bodyClass}>
          The Greedy Growers Calculator compares two choices: take the current
          harvest value now, or accept lightning risk in exchange for a
          potentially higher value later. It does not know when lightning will
          strike. Instead, it applies the probability you enter to the exact
          wait interval you are considering.
        </p>
        <p className={bodyClass}>
          Harvest expected value is the current value. Wait expected value
          combines the future value when the tree survives, the residual value
          when lightning strikes, and any cost created by waiting. The tool
          recommends waiting only when that probability-weighted result is
          higher. When both choices are equal, it favors harvesting now so you
          do not accept extra risk without an expected-value advantage.
        </p>
        <div className="mt-5 border border-dashed border-survey-line bg-background px-4 py-4">
          <p className="break-words font-mono text-sm leading-7 text-foreground">
            Wait EV = (1 - p) × future value + p × residual value - wait cost
          </p>
          <p className="font-mono text-sm leading-7 text-foreground">
            Harvest EV = current harvest value
          </p>
        </div>
        <p className={bodyClass}>
          Because the lightning percentage is your estimate, the result is a
          transparent scenario comparison rather than a prediction. Try a
          reasonable low, middle, and high risk estimate. If all three produce
          the same decision, the scenario is more stable than one that changes
          after a small adjustment.
        </p>
      </section>

      <section className={sectionClass} aria-labelledby="calculator-inputs">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
          Inputs
        </p>
        <h2 id="calculator-inputs" className={`${headingClass} mt-3`}>
          What Each Calculator Input Means
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <InputExplanation title="Current harvest value">
            Use the value available if you harvest immediately. This is the
            certain option in the comparison and becomes the Harvest EV shown
            in the result. Read it from the same in-game situation you are
            evaluating instead of mixing values from different trees or runs.
          </InputExplanation>
          <InputExplanation title="Value after waiting">
            Enter the value you expect after the specific wait interval. Do not
            use an unlimited future target: the number should correspond to the
            seconds entered below. If you are unsure, compare several plausible
            future values and watch whether the recommendation changes.
          </InputExplanation>
          <InputExplanation title="Wait time and lightning risk">
            Wait time defines the interval being evaluated. Lightning risk must
            describe that same interval, not an entire play session. A risk
            estimate for the next ten seconds should not be reused unchanged
            for a much longer wait, because it represents a different scenario.
          </InputExplanation>
          <InputExplanation title="Residual value and wait cost">
            Residual value is anything you expect to keep after a strike. Wait
            cost is value lost simply because you chose not to harvest now,
            such as an opportunity cost you want to model. Zero is allowed, but
            these assumptions remain visible so the result can be audited.
          </InputExplanation>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby="calculator-results">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
          Results
        </p>
        <h2 id="calculator-results" className={`${headingClass} mt-3`}>
          How to Read Your Calculator Result
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ResultExplanation title="Harvest EV and Wait EV">
            Harvest EV is the value available now. Wait EV is the
            probability-weighted value of the future outcome after residual
            value and waiting cost are included. Comparing these two figures is
            the core of the harvest-or-wait decision.
          </ResultExplanation>
          <ResultExplanation title="Wait advantage">
            Wait advantage is Wait EV minus Harvest EV. A positive number means
            waiting has the stronger expected value under your assumptions. A
            zero or negative number means the calculator favors harvesting now.
          </ResultExplanation>
          <ResultExplanation title="Break-even risk">
            Break-even risk is the lightning probability at which the choices
            have equal expected value. Risk below that point favors waiting;
            risk above it favors harvesting. It is a threshold, not a forecast
            of the next strike.
          </ResultExplanation>
        </div>
        <p className={bodyClass}>
          A WAIT result does not mean the tree is safe. It means waiting has the
          higher expected value under the numbers entered. HARVEST NOW does not
          mean lightning is guaranteed; it means the potential increase is not
          large enough to compensate for the assumed risk and costs.
        </p>
      </section>

      <section className={sectionClass} aria-labelledby="calculator-examples">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
          Worked scenarios
        </p>
        <h2 id="calculator-examples" className={`${headingClass} mt-3`}>
          Greedy Growers Calculator Examples
        </h2>
        <p className={bodyClass}>
          These examples use illustrative numbers, not official Greedy Growers
          values or lightning probabilities. Replace every number with values
          you can justify from your own game session.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Example title="Example 1: waiting has the advantage">
            Suppose the current harvest value is 100, the expected value after
            waiting is 600, and the estimated lightning risk is 25%. With zero
            residual value and zero wait cost, Wait EV is 450. Because 450 is
            greater than the certain value of 100, the calculator recommends
            waiting for this scenario.
          </Example>
          <Example title="Example 2: harvesting has the advantage">
            Suppose the current value is 500, the future value is 600, and the
            lightning-risk estimate is 30%. With zero residual value and zero
            wait cost, Wait EV is 420. The certain value of 500 is higher, so
            the calculator recommends harvesting now.
          </Example>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby="calculator-faq">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-lightning">
          Quick answers
        </p>
        <h2 id="calculator-faq" className={`${headingClass} mt-3`}>
          Greedy Growers Calculator FAQ
        </h2>
        <div className="mt-6 divide-y divide-survey-line border-y border-survey-line">
          <Faq question="What does the Greedy Growers Calculator calculate?">
            It compares the expected value of harvesting now with the expected
            value of waiting. The result depends on the current value, future
            value, lightning risk, residual value, and wait cost you enter.
          </Faq>
          <Faq question="Does the calculator predict lightning?">
            No. It does not predict the next strike and does not apply an
            official lightning probability. The percentage is a scenario
            assumption supplied by the player for one wait window.
          </Faq>
          <Faq question="Where should I get the current and future values?">
            Use values visible in your own Greedy Growers session or supported
            by notes you trust. Do not treat the example numbers on this page as
            verified game data.
          </Faq>
          <Faq question="What happens when Harvest EV and Wait EV are equal?">
            The calculator recommends harvesting now. Waiting would add risk
            without providing an expected-value advantage under the assumptions
            entered.
          </Faq>
          <Faq question="Should residual value always be zero?">
            Not necessarily. Use zero only when your scenario assumes lightning
            removes all relevant future value. If something remains recoverable,
            enter that amount instead.
          </Faq>
          <Faq question="How accurate is the result?">
            The arithmetic is deterministic, but the usefulness of the decision
            depends on the quality of your inputs. Test a range of plausible
            risk estimates to see whether the recommendation is sensitive.
          </Faq>
        </div>
      </section>
    </div>
  );
}
function InputExplanation({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="border-t border-dashed border-survey-line pt-4">
      <h3 className={subheadingClass}>{title}</h3>
      <p className={bodyClass}>{children}</p>
    </article>
  );
}

function ResultExplanation({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-surface-raised px-4 py-5">
      <h3 className={subheadingClass}>{title}</h3>
      <p className={bodyClass}>{children}</p>
    </article>
  );
}

function Example({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="border border-survey-line bg-surface-raised px-4 py-5">
      <h3 className={subheadingClass}>{title}</h3>
      <p className={bodyClass}>{children}</p>
    </article>
  );
}

function Faq({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <article className="py-5">
      <h3 className={subheadingClass}>{question}</h3>
      <p className={bodyClass}>{children}</p>
    </article>
  );
}
