import { AlertTriangle, Check, Minus, ReceiptText } from "lucide-react";

import type { ObservedRunResult } from "../../features/calculator/types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatSigned(value: number) {
  return value > 0 ? `+${formatNumber(value)}` : formatNumber(value);
}

export function ProfitResultCard({ result }: { result: ObservedRunResult | null }) {
  if (!result) {
    return (
      <section
        aria-label="Observed run result"
        aria-live="polite"
        className="flex min-h-[28rem] flex-col justify-between border border-survey-line bg-surface px-5 py-6 sm:px-6"
      >
        <div>
          <ReceiptText aria-hidden="true" className="size-10 text-lightning" />
          <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lightning">
            Run record pending
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
            Add your run values
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Record one completed run. Failed attempts count as real costs, so a
            later successful harvest does not hide earlier lightning losses.
          </p>
        </div>
        <p className="border-t border-dashed border-survey-line pt-5 text-sm text-muted-foreground">
          Nothing is read from Roblox or saved until you choose Save scenario.
        </p>
      </section>
    );
  }

  if (result.status === "invalid") {
    return (
      <section
        aria-label="Observed run result"
        aria-live="polite"
        className="min-h-[28rem] border border-risk/70 bg-surface px-5 py-6 sm:px-6"
      >
        <AlertTriangle aria-hidden="true" className="size-10 text-risk" />
        <h2 className="mt-5 font-display text-3xl font-semibold text-foreground">
          Check your run values
        </h2>
        <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
          {result.errors.slice(0, 4).map((error) => (
            <li key={error} className="flex gap-2">
              <Minus aria-hidden="true" className="mt-1 size-4 shrink-0 text-risk" />
              {error}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const textTone =
    result.outcome === "PROFITABLE"
      ? "text-grow"
      : result.outcome === "LOSS"
        ? "text-risk"
        : "text-lightning";
  const borderTone =
    result.outcome === "PROFITABLE"
      ? "border-grow/70"
      : result.outcome === "LOSS"
        ? "border-risk/70"
        : "border-lightning/70";

  return (
    <section
      aria-label="Observed run result"
      aria-live="polite"
      className={`min-h-[28rem] border bg-surface px-5 py-6 sm:px-6 ${borderTone}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className={`flex size-11 items-center justify-center rounded-[4px] border bg-background ${textTone} ${borderTone}`}>
          <Check aria-hidden="true" className="size-6" />
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Observed run math
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Result after recorded losses
      </p>
      <h2 className={`mt-1 font-display text-4xl font-semibold ${textTone}`}>
        {result.outcome.replace("_", " ")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {result.attempts} total attempt{result.attempts === 1 ? "" : "s"} are included in this result.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px border border-survey-line bg-survey-line">
        <Metric label="Net after failures" testId="run-net-profit" value={formatSigned(result.netAfterFailures)} />
        <Metric label="Net / minute" testId="run-profit-per-minute" value={formatSigned(result.netPerMinute)} />
        <Metric label="Break-even harvest" testId="run-break-even" value={formatNumber(result.breakEvenHarvest)} />
        <Metric label="Total cost" value={formatNumber(result.totalCost)} />
        <Metric label="Clean-run profit" value={formatSigned(result.cleanProfit)} />
        <Metric
          label="Clean ROI"
          value={result.cleanRoiPercent === null ? "Unavailable" : `${formatNumber(result.cleanRoiPercent)}%`}
        />
      </dl>

      <details className="mt-6 border-t border-dashed border-survey-line pt-4 text-sm text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-foreground">
          Formula and limits
        </summary>
        <div className="space-y-2 pt-2 leading-6">
          <p className="font-mono text-xs text-foreground">net = harvest - cost × (failed attempts + 1)</p>
          <p className="font-mono text-xs text-foreground">net / minute = net ÷ elapsed minutes</p>
          <p>This describes one run you entered. It is not a seed ranking or future-income forecast.</p>
        </div>
      </details>
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
      <dd data-testid={testId} className="mt-1 break-words font-mono text-base font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
