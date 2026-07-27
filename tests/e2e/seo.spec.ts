import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/guides",
  "/guides/beginner-guide",
  "/guides/when-to-harvest",
  "/codes",
  "/updates",
  "/seeds",
  "/seeds/compare",
  "/lightning",
  "/data-status",
  "/submit-data",
];

test("public routes render one H1 without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1"), route).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test("calculator alias is an exact permanent redirect", async ({ request }) => {
  const response = await request.get("/calculator", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("/");
});

test("robots and sitemap expose only eligible production URLs", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(xml).toContain("/guides");
  expect(xml).not.toContain("/submit-data");
  expect(xml).not.toContain("/seeds/compare");
  expect(xml).not.toContain("/guides/beginner-guide");
  expect(xml).not.toContain("/seeds</loc>");
  expect(xml).not.toContain("/lightning</loc>");
  expect(xml).not.toContain("/data-status</loc>");
});

test("evidence-driven pages remain noindex while Phase 0 is closed", async ({ page }) => {
  for (const route of [
    "/guides/beginner-guide",
    "/seeds",
    "/seeds/compare",
    "/lightning",
    "/data-status",
  ]) {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]'), route).toHaveAttribute(
      "content",
      /noindex/i,
    );
  }
});

test("homepage JSON-LD is valid and contains no rating schema", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks.length).toBeGreaterThanOrEqual(2);
  const parsed = blocks.map((block) => JSON.parse(block) as { "@type": string });
  expect(parsed.map((block) => block["@type"])).toEqual(
    expect.arrayContaining(["WebSite", "WebApplication"]),
  );
  expect(blocks.join(" ")).not.toContain("AggregateRating");
});

test("page has no horizontal overflow at the active viewport", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
