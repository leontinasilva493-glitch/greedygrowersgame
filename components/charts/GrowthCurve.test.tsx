import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GrowthCurve } from "./GrowthCurve";

describe("GrowthCurve", () => {
  it("renders an evidence-first textual alternative even when the line gate is closed", () => {
    const markup = renderToStaticMarkup(
      createElement(GrowthCurve, {
        buckets: [
          {
            key: "0-10",
            label: "0 to 10 seconds",
            measurementCount: 2,
            sessionCount: 2,
            median: 20,
            p25: 15,
            p75: 25,
            rangeEligible: false,
            lineEligible: false,
            measurementIds: ["m1", "m2"],
            sourceIds: ["source-1"],
            methodVersion: "growth-v1",
            computedAt: "2026-07-26T12:00:00.000Z",
          },
        ],
        seedName: "Eligible Seed One",
      }),
    );

    expect(markup).toContain("Observed values among recorded survivors");
    expect(markup).toContain("Range gate closed");
    expect(markup).toContain("0 to 10 seconds");
    expect(markup).toContain("source-1");
  });
});
