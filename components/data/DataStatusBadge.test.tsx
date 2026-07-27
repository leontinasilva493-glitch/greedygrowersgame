import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DataStatusBadge } from "./DataStatusBadge";

describe("DataStatusBadge", () => {
  it("renders visible status text and distinct treatments for verified and estimated", () => {
    const verifiedMarkup = renderToStaticMarkup(
      createElement(DataStatusBadge, { status: "verified" }),
    );
    const estimatedMarkup = renderToStaticMarkup(
      createElement(DataStatusBadge, { status: "estimated" }),
    );

    expect(verifiedMarkup).toContain("Verified");
    expect(estimatedMarkup).toContain("Estimated");
    expect(verifiedMarkup).not.toBe(estimatedMarkup);
  });
});
