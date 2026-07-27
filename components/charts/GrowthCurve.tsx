import type { GrowthBucket } from "@/features/lightning/growth";

export function GrowthCurve({
  buckets,
  seedName,
}: {
  buckets: GrowthBucket[];
  seedName: string;
}) {
  const gatedBuckets = buckets.filter((bucket) => bucket.rangeEligible);

  return (
    <section
      aria-labelledby="growth-curve-heading"
      className="border border-survey-line bg-surface p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="growth-curve-heading"
            className="font-display text-2xl font-semibold text-foreground"
          >
            {seedName} growth evidence
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Observed values among recorded survivors.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {gatedBuckets.length >= 3 ? "Line gate open" : "Range gate closed"}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-survey-line text-muted-foreground">
              <th className="px-3 py-2 font-medium">Age bucket</th>
              <th className="px-3 py-2 font-medium">Median</th>
              <th className="px-3 py-2 font-medium">IQR</th>
              <th className="px-3 py-2 font-medium">Measurements</th>
              <th className="px-3 py-2 font-medium">Sessions</th>
              <th className="px-3 py-2 font-medium">Sources</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.key} className="border-b border-survey-line/60">
                <td className="px-3 py-3 text-foreground">{bucket.label}</td>
                <td className="px-3 py-3 text-foreground">
                  {bucket.median === null ? "Not enough data" : bucket.median.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {bucket.p25 === null || bucket.p75 === null
                    ? "Unavailable"
                    : `${bucket.p25.toFixed(2)} to ${bucket.p75.toFixed(2)}`}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{bucket.measurementCount}</td>
                <td className="px-3 py-3 text-muted-foreground">{bucket.sessionCount}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {bucket.sourceIds.join(", ") || "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
