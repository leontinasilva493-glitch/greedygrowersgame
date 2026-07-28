import { expect, test } from "@playwright/test";

const visualRoutes = [
  {
    route: "/",
    scene: "home",
    alt: /thriving fruit tree.*lightning-struck tree/i,
    og: "/media/greedy-growers/og/home.png",
  },
  {
    route: "/seeds",
    scene: "seeds",
    alt: /riverside seed stall.*planting plots/i,
    og: "/media/greedy-growers/og/seeds.png",
  },
  {
    route: "/lightning",
    scene: "lightning",
    alt: /healthy tree.*lightning strike.*charred tree/i,
    og: "/media/greedy-growers/og/lightning.png",
  },
  {
    route: "/guides/beginner-guide",
    scene: "beginner",
    alt: /choosing a seed.*planting a plot.*growing a tree/i,
    og: "/media/greedy-growers/og/beginner-guide.png",
  },
] as const;

for (const { route, scene, alt } of visualRoutes) {
  test(`${route} renders its local game scene without horizontal overflow`, async ({
    page,
  }) => {
    await page.goto(route);

    const figure = page.locator(`[data-game-scene="${scene}"]`);
    const image = figure.getByRole("img", { name: alt });

    await expect(figure).toBeVisible();
    await expect(image).toBeVisible();
    await expect(figure.getByText("Fan-made illustration")).toBeVisible();
    await expect(image).toHaveJSProperty("complete", true);
    expect(
      await image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test("target routes publish page-specific social images", async ({ page }) => {
  for (const { route, og } of visualRoutes) {
    await page.goto(route);
    const content = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");

    expect(content, route).toContain(og);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Greedy Growers Calculator",
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "en_US",
    );
  }
});
