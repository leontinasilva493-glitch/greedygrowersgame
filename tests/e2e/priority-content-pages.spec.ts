import { expect, test } from "@playwright/test";

test("Miracle Grow guide owns the item query without inventing an effect", async ({
  page,
  request,
}) => {
  const response = await page.goto("/guides/miracle-grow");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Miracle Grow: Uses & How to Get | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What does Miracle Grow do in Greedy Growers?",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  await expect(
    page.getByRole("heading", {
      name: "What must be captured before this answer changes",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Miracle Grow and fertilizer are not interchangeable terms",
    }),
  ).toBeVisible();
  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain(
    "No current-version Miracle Grow use has passed review",
  );
  expect(mainText).not.toMatch(/instantly grows|guaranteed|\b\d+(?:\.\d+)?%\b/i);
  for (const href of [
    "/guides/fertilizer",
    "/pets",
    "/guides/weather-events",
    "/submit-data",
    "/guides",
  ]) {
    await expect(page.locator(`main a[href="${href}"]`), href).toHaveCount(1);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("/guides/miracle-grow");
});

test("prediction potion guide answers the query without inventing a prediction mechanic", async ({
  page,
}) => {
  const response = await page.goto("/guides/prediction-potion");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Prediction Potion Guide | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What does the Prediction Potion do in Greedy Growers?",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain(
    "The current evidence set does not establish what the Prediction Potion does.",
  );
  expect(mainText).toContain("It is not an official lightning forecast");
  expect(mainText).not.toMatch(/\b\d+(?:\.\d+)?%\b/);
  await expect(page.locator('main a[href="/guides/when-to-harvest"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/#calculator"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Sources and claim status" })).toBeVisible();
  await expect(page.getByText("Official baseline", { exact: true })).toBeVisible();
  await expect(page.getByText("Community report", { exact: true })).toBeVisible();
  await expect(page.getByText("Third-party guide", { exact: true })).toBeVisible();
  await expect(page.locator('main a[href="/pets/majestic-egg"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/weather-events"]')).toHaveCount(1);
});

test("pets hub exposes a complete verification structure without a fabricated pet list", async ({
  page,
}) => {
  const response = await page.goto("/pets");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Pets: Eggs, Passives & Best Uses | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers pets: eggs, passives, and best uses",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  await expect(page.getByRole("columnheader", { name: "Pet" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Egg" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Passive" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Evidence" })).toBeVisible();

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain(
    "No complete current-version pet catalog has passed review.",
  );
  expect(mainText).toContain("Verified pet records will appear here");
  expect(mainText).not.toMatch(/best pet(?:s)? (?:is|are)/i);
  await expect(page.locator('main a[href="/guides/how-to-get-tickets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/pets/majestic-egg"]')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Sources and claim status" })).toBeVisible();
});

test("Majestic Egg page answers acquisition intent without publishing reported odds as facts", async ({
  page,
}) => {
  const response = await page.goto("/pets/majestic-egg");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Greedy Growers Majestic Egg Guide | GG Calc");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "How to get the Majestic Egg in Greedy Growers",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  await expect(page.getByRole("heading", { name: "Reported ways to get the Majestic Egg" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reported pets in the Majestic Egg" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources and claim status" })).toBeVisible();
  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain("All acquisition methods, costs, odds, and pet passives remain third-party reports");
  expect(mainText).toContain("Do not spend Robux or Tickets based on this page alone");
  await expect(page.locator('main a[href="/pets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/prediction-potion"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/how-to-get-tickets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/rebirth"]')).toHaveCount(1);
});

test("official links page publishes verified links and explicit not-listed states", async ({
  page,
  request,
}) => {
  const response = await page.goto("/official-links");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Roblox: Official Game & Link Status | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers Roblox official game and link status",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/i,
  );
  await expect(page.getByRole("rowheader", { name: "Roblox experience" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Creator group" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Discord" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Trello" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Official wiki" })).toBeVisible();
  await expect(page.getByText("Verified", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Not listed by a creator-owned source", { exact: true })).toHaveCount(3);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/official-links");
});

test("weather events page separates reported event claims from an evidence-safe checklist", async ({
  page,
}) => {
  const response = await page.goto("/guides/weather-events");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Greedy Growers Weather Events Guide | GG Calc");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers weather events explained",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  await expect(page.getByRole("heading", { name: "Reported weather and mutation map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to do when weather starts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources and claim status" })).toBeVisible();
  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain("Every event name, duration, trigger and multiplier below is reported");
  await expect(page.locator('main a[href="/guides/mutations"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/worms"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/fertilizer"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/pets"]')).toHaveCount(1);
});

test("tickets guide maps the earning loop while keeping payouts unverified", async ({
  page,
}) => {
  const response = await page.goto("/guides/how-to-get-tickets");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "How to Get Tickets in Greedy Growers | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "How to get Tickets in Greedy Growers",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  await expect(page.getByRole("columnheader", { name: "Method" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "What to capture" })).toBeVisible();

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain(
    "No current payout, refresh timer, or spending price has passed review.",
  );
  expect(mainText).not.toMatch(/up to \d+/i);
  await expect(page.locator('main a[href="/pets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/codes"]')).toHaveCount(1);
});

test("money guide answers with a repeatable profit-per-run method instead of a fastest-route claim", async ({
  page,
  request,
}) => {
  const response = await page.goto("/guides/how-to-make-money");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Money Guide: Profit per Run | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers money guide: measure profit per run",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/i,
  );

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain("Observed net result = money after the cycle − money before the cycle");
  expect(mainText).toContain("Build a three-run baseline");
  expect(mainText).toContain("Compare three money routes");
  expect(mainText).toContain("Choose the faster repeatable route");
  expect(mainText).toContain("No seed is ranked as universally best");
  expect(mainText).not.toMatch(/guaranteed fastest|fastest seed/i);
  await expect(page.locator('main a[href="/#calculator"]')).toHaveCount(1);

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/guides/how-to-make-money");
});

test("rebirth guide provides a before-and-after audit without invented costs", async ({
  page,
}) => {
  const response = await page.goto("/guides/rebirth");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Rebirth Guide | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers Rebirth guide",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  for (const heading of ["Rebirth step", "Cost", "Reset", "Reward", "Evidence"]) {
    await expect(page.getByRole("columnheader", { name: heading, exact: true })).toBeVisible();
  }

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain(
    "No current Rebirth cost, reward, reset list, or unlock order has passed review.",
  );
  expect(mainText).toContain("Capture before you confirm");
  expect(mainText).toContain("Capture immediately after");
  expect(mainText).not.toMatch(/\$\d/);
  await expect(page.locator('main a[href="/guides/how-to-make-money"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/how-to-get-tickets"]')).toHaveCount(1);
});

test("guide hub separates player-ready methods from evidence-gated research notes", async ({
  page,
}) => {
  await page.goto("/guides");

  await expect(page).toHaveTitle(
    "Greedy Growers Wiki: Codes, Seeds, Pets & Guides | GG Calc",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers wiki and guide hub",
  );
  await expect(page.getByRole("heading", { name: "Start and decide" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research notes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse by player task" })).toBeVisible();
  await expect(page.locator('main a[href="/guides/how-to-make-money"]')).toHaveCount(2);
  await expect(page.locator('main a[href="/guides/farmers-market"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/seed-feeding-chair"]')).toHaveCount(1);
  await expect(page.getByText("Research note · noindex")).toHaveCount(2);
});

test("closed system pages are discoverable only through relevant contextual links", async ({
  page,
}) => {
  await page.goto("/guides/when-to-harvest");
  await expect(page.locator('main a[href="/guides/prediction-potion"]')).toHaveCount(1);

  await page.goto("/guides/how-to-make-money");
  await expect(page.locator('main a[href="/guides/how-to-get-tickets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/rebirth"]')).toHaveCount(1);
});

test("P0-P2 intent pages keep unique TDH, canonical URLs, and evidence-aware robots", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const routes = [
    ["/codes", "Greedy Growers Codes (Sep 2026): Reported | GG Calc", "Greedy Growers codes: reported and working status", "noindex"],
    ["/updates", "Greedy Growers Publish Status & Retest Log | GG Calc", "Greedy Growers publish status and retest log", "index"],
    ["/seeds", "Greedy Growers Seeds: Prices, Rarity & Spawns | GG Calc", "Greedy Growers seeds: prices, rarity and spawn chance", "noindex"],
    ["/guides/beginner-guide", "Greedy Growers Beginner Guide | GG Calc", "Greedy Growers beginner guide: your first 10 minutes", "index"],
    ["/guides/how-to-grow-big-trees", "How to Grow Big Trees in Greedy Growers | GG Calc", "How to grow big trees in Greedy Growers", "noindex"],
    ["/pets", "Greedy Growers Pets: Eggs, Passives & Best Uses | GG Calc", "Greedy Growers pets: eggs, passives, and best uses", "noindex"],
    ["/guides/mutations", "Greedy Growers Mutations & Weather | GG Calc", "Greedy Growers mutations: reported effects, separated from verified facts", "noindex"],
    ["/guides/prediction-potion", "Greedy Growers Prediction Potion Guide | GG Calc", "What does the Prediction Potion do in Greedy Growers?", "noindex"],
    ["/guides/fertilizer", "Greedy Growers Fertilizer Guide | GG Calc", "What does fertilizer do in Greedy Growers?", "noindex"],
    ["/guides/worms", "Greedy Growers Worms: What They Do & How to Get | GG Calc", "What do worms do and how do you get them in Greedy Growers?", "noindex"],
    ["/guides/how-to-get-tickets", "How to Get Tickets in Greedy Growers | GG Calc", "How to get Tickets in Greedy Growers", "noindex"],
    ["/guides/rebirth", "Greedy Growers Rebirth Guide | GG Calc", "Greedy Growers Rebirth guide", "noindex"],
    ["/guides/farmers-market", "Greedy Growers Farmer's Market Guide | GG Calc", "How does the Farmer's Market work in Greedy Growers?", "noindex"],
    ["/guides/seed-feeding-chair", "Greedy Growers Seed-feeding Chair Guide | GG Calc", "What does the seed-feeding chair do in Greedy Growers?", "noindex"],
    ["/pets/majestic-egg", "Greedy Growers Majestic Egg Guide | GG Calc", "How to get the Majestic Egg in Greedy Growers", "noindex"],
    ["/official-links", "Greedy Growers Roblox: Official Game & Link Status | GG Calc", "Greedy Growers Roblox official game and link status", "index"],
    ["/guides/weather-events", "Greedy Growers Weather Events Guide | GG Calc", "Greedy Growers weather events explained", "noindex"],
    ["/guides/miracle-grow", "Greedy Growers Miracle Grow: Uses & How to Get | GG Calc", "What does Miracle Grow do in Greedy Growers?", "noindex"],
    ["/guides", "Greedy Growers Wiki: Codes, Seeds, Pets & Guides | GG Calc", "Greedy Growers wiki and guide hub", "index"],
    ["/about", "About Greedy Growers Calculator | GG Calc", "A calculator that shows its assumptions", "index"],
  ] as const;

  const seenTitles = new Set<string>();
  const seenDescriptions = new Set<string>();

  for (const [route, title, h1, robots] of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page, route).toHaveTitle(title);
    await expect(page.getByRole("heading", { level: 1 }), route).toHaveText(h1);
    await expect(page.locator('link[rel="canonical"]'), route).toHaveAttribute(
      "href",
      new RegExp(`${route.replaceAll("/", "\\/")}$`),
    );
    const robotsMeta = page.locator('meta[name="robots"]');
    const robotsContent = (await robotsMeta.count())
      ? await robotsMeta.getAttribute("content")
      : null;
    if (robots === "noindex") {
      expect(robotsContent, route).toMatch(/noindex, follow/i);
    } else {
      expect(robotsContent ?? "index, follow", route).toMatch(/index, follow/i);
      expect(robotsContent ?? "", route).not.toMatch(/noindex/i);
    }

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(title.length, `${route} title length`).toBeLessThanOrEqual(60);
    expect(description?.length, `${route} description length`).toBeGreaterThanOrEqual(110);
    expect(description?.length, `${route} description length`).toBeLessThanOrEqual(165);
    expect(seenTitles.has(title), `${route} duplicate title`).toBe(false);
    expect(seenDescriptions.has(description ?? ""), `${route} duplicate description`).toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `${route} horizontal overflow`,
    ).toBe(true);
    seenTitles.add(title);
    seenDescriptions.add(description ?? "");
  }
});

test("P0 data pages show reported leads without upgrading them to verified mechanics", async ({
  page,
}) => {
  await page.goto("/codes");
  await expect(page.getByRole("rowheader", { name: "ILOVECATS" })).toBeVisible();
  await expect(page.getByText("Reported by independent editorial sources; not gameplay-verified")).toBeVisible();

  await page.goto("/updates");
  await expect(page.getByText("2026-08-27T11:39:48.1483969Z")).toBeVisible();
  await expect(page.getByText(/does not describe patch contents/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "What changed in Greedy Growers?" })).toBeVisible();

  await page.goto("/seeds");
  await expect(page.getByText("20 displayed seeds")).toBeVisible();
  await expect(page.locator("th:visible, dt:visible").filter({ hasText: /^Reported price$/ }).first()).toBeVisible();
  await expect(page.locator("th:visible, dt:visible").filter({ hasText: /^Reported spawn$/ }).first()).toBeVisible();
});

test("new research pages answer one intent each and expose contextual next steps", async ({ page }) => {
  await page.goto("/guides/how-to-grow-big-trees");
  await expect(page.getByRole("heading", { name: "Why is my tree not growing big?" })).toBeVisible();
  await expect(page.locator('main a[href="/guides/fertilizer"]')).toHaveCount(1);

  await page.goto("/guides/fertilizer");
  await expect(page.getByRole("heading", { name: "How do I test one fertilizer?" })).toBeVisible();
  await expect(page.locator('main a[href="/guides/how-to-grow-big-trees"]')).toHaveCount(1);

  await page.goto("/guides/worms");
  await expect(
    page.getByRole("heading", { name: "How do I capture one complete worm use?" }),
  ).toBeVisible();
  await expect(page.locator('main a[href="/guides/mutations"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/pets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/weather-events"]')).toHaveCount(1);

  await page.goto("/guides/farmers-market");
  await expect(page.getByRole("heading", { name: "Farmer's Market order checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Farmer's Market FAQ" })).toBeVisible();
  await expect(page.locator('main a[href="/guides/how-to-get-tickets"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/submit-data"]')).toHaveCount(1);
  expect(await page.locator("main").innerText()).toContain(
    "No current recording verifies a complete Farmer's Market order.",
  );

  await page.goto("/guides/seed-feeding-chair");
  await expect(page.getByRole("heading", { name: "Seed-feeding chair request checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seed-feeding chair FAQ" })).toBeVisible();
  await expect(page.locator('main a[href="/seeds"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/submit-data"]')).toHaveCount(1);
  expect(await page.locator("main").innerText()).toContain(
    "No current recording verifies the chair's full request or reward.",
  );
});

test("beginner and pets pages answer first-session and egg follow-up questions", async ({ page }) => {
  await page.goto("/guides/beginner-guide");
  await expect(page.getByRole("heading", { name: "Your first 10 minutes in Greedy Growers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Greedy Growers beginner FAQ" })).toBeVisible();
  await expect(page.locator('main a[href="/guides/farmers-market"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/guides/seed-feeding-chair"]')).toHaveCount(1);

  await page.goto("/pets");
  await expect(page.getByRole("heading", { name: "Greedy Growers egg and hatching questions" })).toBeVisible();
  await expect(page.getByText("Where do eggs come from?")).toBeVisible();
  await expect(page.getByText("How long does an egg take to hatch?")).toBeVisible();
  await expect(page.getByText("What happens when a duplicate pet hatches?")).toBeVisible();
});
