import { expect, test } from "@playwright/test";

test("prediction potion guide answers the query without inventing a prediction mechanic", async ({
  page,
}) => {
  const response = await page.goto("/guides/prediction-potion");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Prediction Potion: Effect & How to Get It | Greedy Growers Calculator",
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
});

test("pets hub exposes a complete verification structure without a fabricated pet list", async ({
  page,
}) => {
  const response = await page.goto("/pets");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "Greedy Growers Pets: All Pets, Eggs & Passives (2026) | Greedy Growers Calculator",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers pets: eggs, passives, and evidence",
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
});

test("tickets guide maps the earning loop while keeping payouts unverified", async ({
  page,
}) => {
  const response = await page.goto("/guides/how-to-get-tickets");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "How to Get Tickets in Greedy Growers Fast (All Methods) | Greedy Growers Calculator",
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

test("money guide publishes a player-input method instead of fixed game values", async ({
  page,
  request,
}) => {
  const response = await page.goto("/guides/how-to-make-money");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "How to Make Money Fast in Greedy Growers (Safe Routes) | Greedy Growers Calculator",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "How to make money fast in Greedy Growers",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/i,
  );

  const mainText = await page.locator("main").innerText();
  expect(mainText).toContain("Observed net result = money after the cycle − money before the cycle");
  expect(mainText).toContain("Safe route");
  expect(mainText).toContain("Balanced route");
  expect(mainText).toContain("Test route");
  expect(mainText).toContain("No seed is ranked as universally best");
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
    "Greedy Growers Rebirth Guide: Costs, Rewards & Reset Rules | Greedy Growers Calculator",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Greedy Growers Rebirth guide",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, follow/i,
  );
  for (const heading of ["Rebirth step", "Cost", "Reset", "Reward", "Evidence"]) {
    await expect(page.getByRole("columnheader", { name: heading })).toBeVisible();
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

test("guide hub promotes the indexable money guide without promoting closed system pages", async ({
  page,
}) => {
  await page.goto("/guides");

  await expect(page.locator('main a[href="/guides/how-to-make-money"]')).toHaveCount(2);
  for (const closedRoute of [
    "/guides/prediction-potion",
    "/pets",
    "/guides/how-to-get-tickets",
    "/guides/rebirth",
  ]) {
    await expect(page.locator(`main a[href="${closedRoute}"]`)).toHaveCount(0);
  }
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
