import { expect, test, type Page } from "@playwright/test";

async function fillRequiredInputs(
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
    .getByLabel("Wait time in seconds")
    .fill(values.wait ?? "30");
  await page
    .getByLabel("Lightning risk for this wait")
    .fill(values.risk ?? "49");
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

test("calculates a WAIT result with advanced assumptions and a transparent decision strip", async ({
  page,
}) => {
  await page.goto("/");
  await fillRequiredInputs(page);

  await page.getByText("Advanced assumptions").click();
  await page.getByLabel("Residual value after lightning").fill("20");
  await page.getByLabel("Cost of waiting").fill("5");
  await page.getByRole("button", { name: "Calculate" }).click();

  const result = page.getByRole("region", { name: "Harvest decision" });
  await expect(result.getByText("WAIT", { exact: true })).toBeVisible();
  await expect(result.getByTestId("harvest-ev")).toHaveText("100");
  await expect(result.getByTestId("wait-ev")).toHaveText("106.8");
  await expect(result.getByTestId("wait-advantage")).toHaveText("+6.8");
  await expect(result.getByTestId("break-even-risk")).toHaveText("52.78%");
  await expect(result).toContainText("30 seconds");
  await expect(result).toContainText(
    "Wait EV = (1 - p) x future value + p x residual value - wait cost",
  );
  await expect(
    result.getByRole("img", {
      name: /Break-even lightning risk is 52\.78%/,
    }),
  ).toBeVisible();
  await expect(result).toContainText("Your inputs are estimates");
  await expect(result).toHaveAttribute("aria-live", "polite");
});

test("recommends HARVEST NOW above break-even and on equality", async ({
  page,
}) => {
  await page.goto("/");
  await fillRequiredInputs(page, { risk: "51" });
  await page.getByRole("button", { name: "Calculate" }).click();

  const result = page.getByRole("region", { name: "Harvest decision" });
  await expect(
    result.getByText("HARVEST NOW", { exact: true }),
  ).toBeVisible();
  await expect(result.getByTestId("wait-ev")).toHaveText("98");

  await page.getByLabel("Lightning risk for this wait").fill("50");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(
    result.getByText("HARVEST NOW", { exact: true }),
  ).toBeVisible();
  await expect(result.getByTestId("wait-advantage")).toHaveText("0");
  await expect(result).toContainText(
    "Waiting offers no expected-value advantage.",
  );
});

test("shows NOT ENOUGH INPUT, focuses the field error, and supports keyboard submission", async ({
  page,
}) => {
  await page.goto("/");
  await fillRequiredInputs(page);
  await page.getByLabel("Current harvest value").fill("");
  await page.getByLabel("Lightning risk for this wait").press("Enter");

  const result = page.getByRole("region", { name: "Harvest decision" });
  await expect(
    result.getByText("NOT ENOUGH INPUT", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#currentValue-error")).toHaveText(
    "Enter a non-negative current value.",
  );
  await expect(page.getByLabel("Current harvest value")).toBeFocused();
  await expect(page.getByLabel("Current harvest value")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await page.getByLabel("Current harvest value").fill("100");
  await page.getByLabel("Lightning risk for this wait").press("Enter");
  await expect(result.getByText("WAIT", { exact: true })).toBeVisible();
});

test("keeps the calculator within a 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await fillRequiredInputs(page);
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.getByText("WAIT", { exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));

  expect(widths.scroll).toBe(widths.client);
  await expect(page.getByRole("button", { name: "Calculate" })).toHaveCSS(
    "min-height",
    "44px",
  );
});

test("keeps analytics denied by default and emits deduplicated value-free events only after consent", async ({
  page,
}) => {
  await installGtagRecorder(page);
  await page.goto("/");
  await fillRequiredInputs(page);
  await page.getByRole("button", { name: "Calculate" }).click();

  let calls = await readGtagCalls(page);
  expect(calls).toContainEqual([
    "consent",
    "default",
    expect.objectContaining({ analytics_storage: "denied" }),
  ]);
  expect(calls.filter(([command]) => command === "event")).toEqual([]);

  await page.getByRole("button", { name: "Allow analytics" }).click();
  await page.getByLabel("Lightning risk for this wait").fill("48");
  await page.getByRole("button", { name: "Calculate" }).click();

  calls = await readGtagCalls(page);
  expect(calls).toContainEqual([
    "consent",
    "update",
    expect.objectContaining({ analytics_storage: "granted" }),
  ]);

  const eventCalls = calls.filter(([command]) => command === "event");
  expect(eventCalls).toEqual([
    ["event", "calculator_started"],
    ["event", "calculator_completed"],
    ["event", "recommendation_wait"],
  ]);

  const serializedEvents = JSON.stringify(eventCalls);
  expect(serializedEvents).not.toMatch(
    /100|200|48|30|https?:|receipt|evidence|@/i,
  );
});
