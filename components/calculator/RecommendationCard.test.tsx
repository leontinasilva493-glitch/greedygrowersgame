import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecommendationCard } from "./RecommendationCard";

describe("RecommendationCard community model", () => {
  it("renders MODEL_UNCERTAIN diagnostics without substituting a deterministic community recommendation", () => {
    const markup = renderToStaticMarkup(
      createElement(RecommendationCard, {
        result: {
          status: "valid",
          harvestEv: 100,
          waitEv: 106.8,
          waitAdvantage: 6.8,
          breakEvenProbability: 0.5278,
          recommendation: "WAIT",
          reason: "Waiting has a positive expected-value advantage.",
        },
        waitSeconds: 30,
        communityModel: {
          mode: "community",
          available: true,
          decision: "MODEL_UNCERTAIN",
          estimate: 0.12,
          lower95: 0.05,
          upper95: 0.6,
          nAtRiskStart: 26,
          nAtRiskEnd: 18,
          intervalEvents: 5,
          confidence: "medium",
          gameVersion: "2026-07-26",
          methodVersion: "community-risk-v1",
          computedAt: "2026-07-26T00:00:00.000Z",
          reasons: [],
        },
      }),
    );

    expect(markup).toContain("Community model");
    expect(markup).toContain("MODEL UNCERTAIN");
    expect(markup).toContain("95% diagnostic range");
    expect(markup).toContain("26");
    expect(markup).toContain("18");
  });
});
