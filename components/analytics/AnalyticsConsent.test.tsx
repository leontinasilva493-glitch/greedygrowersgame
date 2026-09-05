import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AnalyticsConsent } from "./AnalyticsConsent";

describe("AnalyticsConsent", () => {
  it("explains that one optional choice controls analytics and advertising", () => {
    const markup = renderToStaticMarkup(<AnalyticsConsent />);

    expect(markup).toContain("Optional analytics &amp; ads");
    expect(markup).toContain("Allow analytics &amp; ads");
    expect(markup).toContain("Keep optional services off");
  });
});
