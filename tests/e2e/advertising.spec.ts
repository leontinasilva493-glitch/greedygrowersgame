import { expect, test } from "@playwright/test";

const adScriptUrl =
  "https://pl31199201.profitableratecpmnetwork.com/2322cb92ec86eb448481967a11b7d7d6/invoke.js";

test("loads both ad formats automatically inside eligible pages", async ({
  page,
}) => {
  let scriptRequests = 0;
  let popunderRequests = 0;
  await page.route("**/5a57ca988bdaec73c17f829159e9fab5.js", async route => {
    popunderRequests += 1;
    await route.fulfill({ contentType: "application/javascript", body: "/* controlled Popunder fixture */" });
  });
  await page.addInitScript(() => localStorage.setItem("greedy-growers-analytics-consent", "denied"));
  await page.route(adScriptUrl, async (route) => {
    scriptRequests += 1;
    await route.fulfill({
      contentType: "application/javascript",
      body: `document.getElementById("container-2322cb92ec86eb448481967a11b7d7d6")?.append(Object.assign(document.createElement("p"), { textContent: "Stub native ad" }));`,
    });
  });

  await page.goto("/guides");
  await expect(
    page.getByRole("heading", { name: "Optional analytics & ads" }),
  ).toHaveCount(0);
  const ad = page.getByRole("complementary", { name: "Advertisement" });
  await expect(ad).toBeVisible();
  await expect(ad.getByText("Stub native ad")).toBeVisible();
  expect(scriptRequests).toBe(1);
  await expect.poll(() => popunderRequests).toBe(1);
  await expect(page.locator("head #adsterra-popunder-script")).toHaveCount(1);

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
    await expect(page.locator("script[src*=profitableratecpmnetwork]")).toHaveCount(0);
  }
});
