import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BeginnerGuidePage from "./page";

describe("BeginnerGuidePage", () => {
  it("labels the lightning video as third-party evidence and states its limit", () => {
    const markup = renderToStaticMarkup(<BeginnerGuidePage />);

    expect(markup).toContain("Third-party gameplay reference");
    expect(markup).toContain("not a lightning-rate sample");
  });
});
