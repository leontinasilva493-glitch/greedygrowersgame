import { AlertTriangle, Check, Gauge, Minus, Timer, Zap } from "lucide-react";

import type { CalculatorResult } from "../../features/calculator/types";

interface RecommendationCardProps {
  result: CalculatorResult | null;
  waitSeconds: number | null;
  communityModel?: CommunityModel;
}

interface CommunityModel {
  mode: "community";
  available: boolean;
  decision?: "WAIT" | "HARVEST_NOW" | "MODEL_UNCERTAIN";
  estimate?: number;
  lower95?: number;
  upper95?: number;
  nAtRiskStart?: number;
  nAtRiskEnd?: number;
  intervalEvents?: number;
  confidence?: "low" | "medium" | "high";
  gameVersion?: string;
  methodVersion?: string;
  computedAt?: string;
  reasons?: string[];
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatSigned(value: number) {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

export function RecommendationCard({
  result,
  waitSeconds,
  communityModel,
}: RecommendationCardProps) {
  if (!result) {
    return (
      <section
        aria-label="Harvest decision"
        aria-live="polite"
        className="flex min-h-[28rem] flex-col justify-between border border-survey-line bg-surface px-5 py-6 sm:px-6"
      >
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lightning">
            Decision pending
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
            Ready for your field notes
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Enter what you can see in game and your own risk estimate. The
            result compares immediate value with the expected value of waiting.
          </p>
        </div>
        <p className="border-t border-dashed border-survey-line pt-5 text-sm text-muted-foreground">
          No community lightning probability is applied automatically.
        </p>
      </section>
    );
  }

  if (result.status === "invalid") {
    return (
      <section
        aria-label="Harvest decision"
        aria-live="polite"
        className="min-h-[28rem] border border-risk/70 bg-surface px-5 py-6 sm:px-6"
      >
        <div className="flex size-11 items-center justify-center rounded-[4px] border border-risk/60 bg-risk/10 text-risk">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-risk">
          Check the field notes
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
          NOT ENOUGH INPUT
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Add valid non-negative values before making a harvest decision.
        </p>
        <ul className="mt-5 space-y-2 border-t border-dashed border-survey-line pt-4 text-sm text-muted-foreground">
          {result.errors.slice(0, 4).map((error) => (
            <li key={error} className="flex gap-2">
              <Minus aria-hidden="true" className="mt-1 size-4 shrink-0 text-risk" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const isWaiting = result.recommendation === "WAIT";
  const breakEvenPercent =
    result.breakEvenProbability === null
      ? null
      : result.breakEvenProbability * 100;

  return (
    <section
      aria-label="Harvest decision"
      aria-live="polite"
      className={`min-h-[28rem] border bg-surface px-5 py-6 sm:px-6 ${
        isWaiting ? "border-grow/70" : "border-risk/70"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-[4px] border ${
            isWaiting
              ? "border-grow/60 bg-grow/10 text-grow"
              : "border-risk/60 bg-risk/10 text-risk"
          }`}
        >
          {isWaiting ? (
            <Check aria-hidden="true" className="size-6" />
          ) : (
            <Zap aria-hidden="true" className="size-6" />
          )}
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Custom risk model
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Decision
      </p>
      <h2
        className={`mt-1 font-display text-4xl font-semibold tracking-[-0.025em] ${
          isWaiting ? "text-grow" : "text-risk"
        }`}
      >
        {isWaiting ? "WAIT" : "HARVEST NOW"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {result.reason}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px border border-survey-line bg-survey-line">
        <Metric
          label="Harvest EV"
          testId="harvest-ev"
          value={formatNumber(result.harvestEv)}
        />
        <Metric
          label="Wait EV"
          testId="wait-ev"
          value={formatNumber(result.waitEv)}
        />
        <Metric
          label="Wait advantage"
          testId="wait-advantage"
          value={formatSigned(result.waitAdvantage)}
        />
        <Metric
          label="Wait interval"
          value={waitSeconds === null ? "--" : `${formatNumber(waitSeconds)} seconds`}
        />
      </dl>

      <div className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Gauge aria-hidden="true" className="size-4" />
              Break-even risk
            </p>
            <p
              data-testid="break-even-risk"
              className="mt-1 font-mono text-lg text-foreground"
            >
              {breakEvenPercent === null
                ? "Unavailable"
                : `${formatNumber(breakEvenPercent)}%`}
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer aria-hidden="true" className="size-4" />
            Exact wait interval
          </p>
        </div>

        <div
          role="img"
          aria-label={
            breakEvenPercent === null
              ? "Break-even lightning risk is unavailable."
              : `Break-even lightning risk is ${formatNumber(
                  breakEvenPercent,
                )}%. Lower risk favors waiting; higher risk favors harvesting.`
          }
          className="mt-3"
        >
          <div className="relative h-8 border-x border-survey-line bg-[repeating-linear-gradient(90deg,var(--survey-line)_0_1px,transparent_1px_10%)]">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-grow via-lightning to-risk" />
            {breakEvenPercent !== null ? (
              <span
                aria-hidden="true"
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-ink bg-lightning shadow-[0_0_0_3px_rgb(244_201_93_/_0.18)]"
                style={{ left: `${Math.min(100, Math.max(0, breakEvenPercent))}%` }}
              />
            ) : null}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted-foreground">
            <span>Wait</span>
            <span>Harvest</span>
          </div>
        </div>
      </div>

      <details
        className="mt-6 border-t border-dashed border-survey-line pt-4 text-sm text-muted-foreground"
        open
      >
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40">
          Formula and assumptions
        </summary>
        <div className="space-y-3 pb-1 pt-2 leading-6">
          <p className="break-words font-mono text-xs text-foreground">
            Wait EV = (1 - p) x future value + p x residual value - wait cost
          </p>
          <p className="font-mono text-xs text-foreground">
            Harvest EV = current value
          </p>
          <p>
            Your inputs are estimates. Lightning risk applies only to the wait
            interval shown above and is not an official strike prediction.
          </p>
        </div>
      </details>

      {communityModel?.available ? (
        <aside className="mt-6 border-t border-dashed border-survey-line pt-4 text-sm text-muted-foreground">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-lightning">
            Community model
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-foreground">
            {communityModel.decision === "MODEL_UNCERTAIN"
              ? "MODEL UNCERTAIN"
              : communityModel.decision?.replace("_", " ")}
          </p>
          {communityModel.lower95 !== undefined &&
          communityModel.upper95 !== undefined ? (
            <p className="mt-2">
              95% diagnostic range: {(communityModel.lower95 * 100).toFixed(1)}% to{" "}
              {(communityModel.upper95 * 100).toFixed(1)}%. At risk: {communityModel.nAtRiskStart ?? "--"} at start and{" "}
              {communityModel.nAtRiskEnd ?? "--"} at end.
            </p>
          ) : null}
          <p className="mt-2">
            This diagnostic does not replace the custom risk assumption used above.
          </p>
        </aside>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div className="min-w-0 bg-surface-raised px-3 py-3 sm:px-4">
      <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd
        data-testid={testId}
        className="mt-1 break-words font-mono text-base font-semibold text-foreground"
      >
        {value}
      </dd>
    </div>
  );
}
