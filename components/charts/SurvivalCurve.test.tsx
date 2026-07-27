import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SurvivalCurve } from "./SurvivalCurve";

describe("SurvivalCurve", () => {
  it("renders an empty-state explanation when the probability gate is closed", () => {
    const markup = renderToStaticMarkup(
      createElement(SurvivalCurve, {
        points: [],
      }),
    );

    expect(markup).toContain("No survival probabilities are shown yet");
    expect(markup).toContain("raw counts only");
  });

  it("renders diagnostic counts and confidence bounds when points are available", () => {
    const markup = renderToStaticMarkup(
      createElement(SurvivalCurve, {
        points: [
          {
            ageSeconds: 20,
            atRisk: 40,
            events: 4,
            censored: 1,
            survival: 0.9,
            lower95: 0.8,
            upper95: 0.95,
            remainingAfterTime: 35,
            observationIds: ["o1", "o2"],
            sourceIds: ["source-1"],
            methodVersion: "kaplan-meier-v1",
            computedAt: "2026-07-26T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(markup).toContain("At risk");
    expect(markup).toContain("40");
    expect(markup).toContain("90.00%");
    expect(markup).toContain("80.00% to 95.00%");
    expect(markup).toContain("source-1");
  });
});
