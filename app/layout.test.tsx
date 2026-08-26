import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/analytics/Analytics", () => ({
  Analytics: () => <div data-testid="global-analytics" />,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("mounts consent-gated analytics across the site", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>Page content</main>
      </RootLayout>,
    );

    expect(markup).toContain('data-testid="global-analytics"');
  });
});
