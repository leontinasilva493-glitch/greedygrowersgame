import { expect, test, type Page } from "@playwright/test";

async function fillHarvestInputs(
  page: Page,
  values: {
    current?: string;
    future?: string;
    wait?: string;
    risk?: string;
  } = {},
) {
  await page
    .getByLabel("Current harvest value")
    .fill(values.current ?? "100");
  await page
    .getByLabel("Value after waiting")
    .fill(values.future ?? "200");
  await page
    .getByLabel("Wait interval in seconds")
    .fill(values.wait ?? "30");
  if (values.risk !== undefined) {
    await page.getByLabel("Optional lightning risk").fill(values.risk);
  }
}

async function installGtagRecorder(page: Page) {
  await page.addInitScript(() => {
    const analyticsWindow = window as typeof window & {
      __gtagCalls: unknown[][];
      gtag: (...args: unknown[]) => void;
    };

    analyticsWindow.__gtagCalls = [];
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.__gtagCalls.push(args);
    };
  });
}

async function readGtagCalls(page: Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as typeof window & {
      __gtagCalls?: unknown[][];
    };

    return analyticsWindow.__gtagCalls ?? [];
  });
}

test("starts blank and reveals the break-even threshold live", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByLabel("Current harvest value")).toHaveValue("");
  await expect(page.getByLabel("Value after waiting")).toHaveValue("");
  await expect(page.getByLabel("Optional lightning risk")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Calculate" })).toHaveCount(0);

  const result = page.getByRole("region", { name: "Harvest timing result" });
  await expect(result).toContainText("Add your values");

  await fillHarvestInputs(page);

  await expect(result.getByTestId("break-even-risk")).toHaveText("50%");
  await expect(result).toContainText("maximum tolerable lightning risk");
  await expect(result).toContainText("30-second wait");
  await expect(result).toContainText("Add your risk estimate for a direct call");
});

test("updates the decision immediately when risk or assumptions change", async ({
  page,
}) => {
  await page.goto("/");
  await fillHarvestInputs(page, { risk: "49" });

  const result = page.getByRole("region", { name: "Harvest timing result" });
  await expect(result.getByText("WAIT", { exact: true })).toBeVisible();
  await expect(result.getByTestId("wait-ev")).toHaveText("102");

  await page.getByLabel("Optional lightning risk").fill("51");
  await expect(
    result.getByText("HARVEST NOW", { exact: true }),
  ).toBeVisible();
  await expect(result.getByTestId("wait-ev")).toHaveText("98");

  await page.getByText("Advanced assumptions").click();
  await page.getByLabel("Residual value after lightning").fill("20");
  await page.getByLabel("Cost of waiting").fill("5");
  await expect(result.getByTestId("break-even-risk")).toHaveText("52.78%");
  await expect(result).toHaveAttribute("aria-live", "polite");
});

test("shows inline errors for impossible live inputs", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Current harvest value").fill("-1");
  await page.getByLabel("Value after waiting").fill("200");
  await page.getByLabel("Wait interval in seconds").fill("0");

  await expect(page.locator("#currentValue-error")).toHaveText(
    "Enter a non-negative current value.",
  );
  await expect(page.locator("#waitSeconds-error")).toHaveText(
    "Enter a wait interval greater than zero.",
  );
  await expect(page.getByLabel("Current harvest value")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("calculates an observed run with failures and saves it for comparison", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Run profit" }).click();

  await page.getByLabel("Attempt cost").fill("100");
  await page.getByLabel("Successful harvest value").fill("600");
  await page.getByLabel("Failed attempts before success").fill("2");
  await page.getByLabel("Total elapsed minutes").fill("10");

  const result = page.getByRole("region", { name: "Observed run result" });
  await expect(result.getByText("PROFITABLE", { exact: true })).toBeVisible();
  await expect(result.getByTestId("run-net-profit")).toHaveText("+300");
  await expect(result.getByTestId("run-profit-per-minute")).toHaveText("+30");
  await expect(result.getByTestId("run-break-even")).toHaveText("300");

  await page.getByLabel("Scenario name").fill("Two lightning losses");
  await page.getByRole("button", { name: "Save scenario" }).click();
  const history = page.getByRole("region", { name: "Saved scenarios" });
  await expect(history).toContainText("Two lightning losses");
  await expect(history).toContainText("+30 / min");
});

test("restores a shared profit calculator URL", async ({ page }) => {
  await page.goto(
    "/?tool=profit&attemptCost=100&harvestValue=600&failedAttempts=2&elapsedMinutes=10",
  );

  await expect(page.getByRole("tab", { name: "Run profit" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByLabel("Attempt cost")).toHaveValue("100");
  await expect(page.getByLabel("Successful harvest value")).toHaveValue("600");
  await expect(
    page
      .getByRole("region", { name: "Observed run result" })
      .getByText("PROFITABLE", { exact: true }),
  ).toBeVisible();
});

test("copies a restorable link and a transparent result summary", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await fillHarvestInputs(page);

  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByText("Share link copied.")).toBeVisible();
  const shareLink = await page.evaluate(() => navigator.clipboard.readText());
  expect(shareLink).toContain("tool=harvest");
  expect(shareLink).toContain("currentValue=100");
  expect(shareLink).toContain("lightningRiskPercent=");

  await page.getByRole("button", { name: "Copy result" }).click();
  await expect(page.getByText("Result copied.")).toBeVisible();
  const resultSummary = await page.evaluate(() => navigator.clipboard.readText());
  expect(resultSummary).toContain("Maximum tolerable lightning risk: 50%");
  expect(resultSummary).toContain("Player inputs only");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Current harvest value")).toHaveValue("");
});

test("keeps the live result directly after the form on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await fillHarvestInputs(page, { risk: "49" });

  const form = page.getByRole("form", { name: "Harvest timing inputs" });
  const result = page.getByRole("region", { name: "Harvest timing result" });
  const context = page.getByRole("complementary", {
    name: "Calculator evidence reminders",
  });
  const analytics = page.getByRole("complementary", {
    name: "Optional analytics",
  });

  const positions = await Promise.all([
    form.evaluate((element) => element.getBoundingClientRect().top),
    result.evaluate((element) => element.getBoundingClientRect().top),
    context.evaluate((element) => element.getBoundingClientRect().top),
    analytics.evaluate((element) => element.getBoundingClientRect().top),
  ]);

  expect(positions[0]).toBeLessThan(positions[1]);
  expect(positions[1]).toBeLessThan(positions[2]);
  expect(positions[1]).toBeLessThan(positions[3]);

  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(widths.scroll).toBe(widths.client);
});

test("shows a visible evidence status without presenting game presets", async ({
  page,
}) => {
  await page.goto("/");

  const status = page.getByRole("region", { name: "Calculator data status" });
  await expect(status).toContainText("Player-input only");
  await expect(status).toContainText("Version unverified");
  await expect(status).toContainText("Checked Aug 4, 2026");
  await expect(status).toContainText("No official lightning probability");
});

test("keeps calculator navigation usable on desktop and mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const formHeading = page.getByRole("heading", {
    level: 2,
    name: "Run the Greedy Growers Calculator",
  });
  const box = await formHeading.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.y).toBeLessThan(720);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Calculator" })
    .click();
  await expect(page).toHaveURL(/\/#calculator$/);
  await expect(page.locator("#calculator")).toBeInViewport();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator("header summary").click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Calculator" })
    .click();
  await expect(page.locator("header details")).not.toHaveAttribute("open", "");
});

test("keeps analytics denied by default and emits value-free events after consent", async ({
  page,
}) => {
  await installGtagRecorder(page);
  await page.goto("/");
  await fillHarvestInputs(page, { risk: "49" });

  let calls = await readGtagCalls(page);
  expect(calls).toContainEqual([
    "consent",
    "default",
    expect.objectContaining({ analytics_storage: "denied" }),
  ]);
  expect(calls.filter(([command]) => command === "event")).toEqual([]);

  await page.getByRole("button", { name: "Allow analytics" }).click();
  await page.getByRole("tab", { name: "Run profit" }).click();
  await page.getByLabel("Attempt cost").fill("100");
  await page.getByLabel("Successful harvest value").fill("600");
  await page.getByLabel("Failed attempts before success").fill("2");
  await page.getByLabel("Total elapsed minutes").fill("10");

  calls = await readGtagCalls(page);
  const eventCalls = calls.filter(([command]) => command === "event");
  expect(eventCalls.length).toBeGreaterThan(0);
  expect(JSON.stringify(eventCalls)).not.toMatch(
    /100|600|2|10|https?:|receipt|evidence|@/i,
  );
});
