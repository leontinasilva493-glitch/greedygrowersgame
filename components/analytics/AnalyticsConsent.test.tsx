import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AnalyticsConsent } from "./AnalyticsConsent";

describe("AnalyticsConsent", () => {
  it("limits the privacy-page preference to analytics", () => {
    const markup = renderToStaticMarkup(<AnalyticsConsent />);

    expect(markup).toContain("Optional analytics");
    expect(markup).toContain("Allow analytics");
    expect(markup).toContain("Keep analytics off");
    expect(markup).not.toContain("Allow analytics &amp; ads");
  });
});
