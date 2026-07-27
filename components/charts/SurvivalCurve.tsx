import type { SurvivalPoint } from "@/features/lightning/kaplan-meier";

export function SurvivalCurve({ points }: { points: SurvivalPoint[] }) {
  return (
    <section
      aria-labelledby="survival-curve-heading"
      className="border border-survey-line bg-surface p-5"
    >
      <h2
        id="survival-curve-heading"
        className="font-display text-2xl font-semibold text-foreground"
      >
        Community survival curve
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Right-continuous Kaplan-Meier output. Events are applied before censored
        trees at the same timestamp.
      </p>

      {points.length === 0 ? (
        <p className="mt-5 border border-dashed border-survey-line p-4 text-sm leading-6 text-muted-foreground">
          No survival probabilities are shown yet. Until the evidence gate opens,
          this page reports raw counts only.
        </p>
      ) : (

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-survey-line text-muted-foreground">
              <th className="px-3 py-2 font-medium">Age</th>
              <th className="px-3 py-2 font-medium">At risk</th>
              <th className="px-3 py-2 font-medium">Events</th>
              <th className="px-3 py-2 font-medium">Censored</th>
              <th className="px-3 py-2 font-medium">Survival</th>
              <th className="px-3 py-2 font-medium">95% interval</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.ageSeconds} className="border-b border-survey-line/60">
                <td className="px-3 py-3 text-foreground">{point.ageSeconds}s</td>
                <td className="px-3 py-3 text-muted-foreground">{point.atRisk}</td>
                <td className="px-3 py-3 text-muted-foreground">{point.events}</td>
                <td className="px-3 py-3 text-muted-foreground">{point.censored}</td>
                <td className="px-3 py-3 text-foreground">
                  {(point.survival * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {(point.lower95 * 100).toFixed(2)}% to {(point.upper95 * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sr-only">
          Sources: {[...new Set(points.flatMap((point) => point.sourceIds))].join(", ")}
        </p>
      </div>
      )}
    </section>
  );
}
