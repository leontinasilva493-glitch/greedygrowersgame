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

test("homepage exposes focused metadata, a sequential outline, and substantial server-rendered guidance", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(await response?.text()).toContain(
    "How the Greedy Growers Calculator Works",
  );

  await expect(page).toHaveTitle(
    "Greedy Growers Calculator: Harvest Now or Wait?",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Use the Greedy Growers Calculator to compare harvest value, wait value, and lightning risk, see the break-even point, and decide whether to harvest or wait.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://greedygrowersgame.com",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://greedygrowersgame.com",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers Calculator: Harvest Now or Wait?",
  );
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Run the Greedy Growers Calculator",
    }),
  ).toBeVisible();

  const outline = await page.locator("main h1, main h2, main h3").evaluateAll(
    (headings) =>
      headings.map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent?.trim() ?? "",
      })),
  );
  expect(outline[0]).toEqual({
    level: 1,
    text: "Greedy Growers Calculator: Harvest Now or Wait?",
  });
  for (let index = 1; index < outline.length; index += 1) {
    expect(
      outline[index].level - outline[index - 1].level,
      `${outline[index - 1].text} -> ${outline[index].text}`,
    ).toBeLessThanOrEqual(1);
  }

  const mainText = await page.locator("main").innerText();
  const wordCount = mainText.trim().split(/\s+/).length;
  expect(wordCount).toBeGreaterThanOrEqual(1200);
  expect(mainText).toContain(
    "These examples use illustrative numbers, not official Greedy Growers values or lightning probabilities.",
  );
});

test("page has no horizontal overflow at the active viewport", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
