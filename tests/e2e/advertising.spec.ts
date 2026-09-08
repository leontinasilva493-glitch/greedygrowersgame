import { expect, test } from "@playwright/test";

const adScriptUrl =
  "https://pl31052446.profitableratecpmnetwork.com/ad7a012e1693b7d27de84829a3838a5c/invoke.js";

test("loads one consent-gated native ad inside the content flow", async ({
  page,
}) => {
  let scriptRequests = 0;
  await page.route(adScriptUrl, async (route) => {
    scriptRequests += 1;
    await route.fulfill({
      contentType: "application/javascript",
      body: `document.getElementById("container-ad7a012e1693b7d27de84829a3838a5c")?.append(Object.assign(document.createElement("p"), { textContent: "Stub native ad" }));`,
    });
  });

  await page.goto("/guides");
  await expect(
    page.getByRole("heading", { name: "Optional analytics & ads" }),
  ).toBeVisible();
  expect(scriptRequests).toBe(0);

  await page.getByRole("button", { name: "Allow analytics & ads" }).click();
  const ad = page.getByRole("complementary", { name: "Advertisement" });
  await expect(ad).toBeVisible();
  await expect(ad.getByText("Stub native ad")).toBeVisible();
  expect(scriptRequests).toBe(1);

  const [headingBox, adBox, firstSectionBox] = await Promise.all([
    page.getByRole("heading", { level: 1 }).boundingBox(),
    ad.boundingBox(),
    page.getByRole("heading", { name: "Browse by player task" }).boundingBox(),
  ]);
  expect(headingBox && adBox && headingBox.y < adBox.y).toBeTruthy();
  expect(adBox && firstSectionBox && adBox.y < firstSectionBox.y).toBeTruthy();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("keeps ads off legal and submission pages", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("greedy-growers-analytics-consent", "granted");
  });

  for (const route of ["/privacy", "/terms", "/contact", "/submit-data", "/data-status"]) {
    await page.goto(route);
    await expect(
      page.getByRole("complementary", { name: "Advertisement" }),
    ).toHaveCount(0);
  }
});
