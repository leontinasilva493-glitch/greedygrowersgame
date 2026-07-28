import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContentPage } from "./ContentPage";

describe("ContentPage", () => {
  it("renders an optional visual inside the shared page header", () => {
    const markup = renderToStaticMarkup(
      <ContentPage
        eyebrow="Guide"
        title="Lightning field notes"
        description="A sourced explanation."
        status="Evidence checked"
        visual={<figure aria-label="Risk scene" />}
      >
        <p>Page body</p>
      </ContentPage>,
    );

    expect(markup.match(/<main/g)).toHaveLength(1);
    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Risk scene"');
    expect(markup.indexOf('aria-label="Risk scene"')).toBeLessThan(
      markup.indexOf("Page body"),
    );
  });
});
