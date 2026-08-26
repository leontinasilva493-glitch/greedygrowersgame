import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  it("discloses consent-gated Microsoft Clarity collection", () => {
    const markup = renderToStaticMarkup(<PrivacyPage />);

    expect(markup).toContain("Microsoft Clarity");
    expect(markup).toContain("only after you choose Allow analytics");
  });
});
