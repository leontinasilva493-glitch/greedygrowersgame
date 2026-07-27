import { expect, test } from "@playwright/test";

test("shows a disabled moderation form when webhook or retention settings are missing", async ({
  page,
}) => {
  await page.goto("/submit-data");

  await expect(
    page.getByRole("heading", { level: 1, name: "Submit gameplay evidence" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The moderation inbox is disabled until webhook delivery and retention settings are configured.",
    ),
  ).toBeVisible();
  await expect(
    page.getByLabel("Submission type"),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Submit for review" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Every accepted submission is manually reviewed before it can enter the public dataset."),
  ).toBeVisible();
});

test("submits the canonical payload and shows the receipt in local preview mode", async ({
  page,
}) => {
  let requestBody: unknown;

  await page.route("**/api/submissions", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        receipt: "11111111-2222-3333-4444-555555555555",
      }),
    });
  });

  await page.goto("/submit-data?preview=enabled");

  await page.getByLabel("Submission type").selectOption("observation");
  await page.getByLabel("Seed ID").fill("eligible-seed-1");
  await page.getByLabel("Tree instance ID").fill("tree-local-1");
  await page.getByLabel("Server session ID").fill("session-local-1");
  await page
    .getByLabel("Observation protocol")
    .selectOption("precommitted_window");
  await page.getByLabel("Tree age at start (seconds)").fill("0");
  await page.getByLabel("Tree age at end (seconds)").fill("30");
  await page.getByLabel("Planned stop (seconds)").fill("30");
  await page.getByLabel("Outcome").selectOption("censored");
  await page.getByLabel("Censor reason").selectOption("planned_stop");
  await page.getByLabel("Observed at").fill("2026-07-26T12:00");
  await page.getByLabel("Exposure (seconds)").fill("30");
  await page.getByLabel("Current game version").fill("unverified");
  await page
    .getByLabel("Evidence URL")
    .fill("https://example.org/evidence/video");
  await page.getByLabel("Current value").fill("100");
  await page.getByLabel("End value").fill("120");
  await page.getByLabel("Currency or unit").fill("coins");
  await page.getByLabel("Event time precision").selectOption("exact_second");
  await page.getByLabel("Evidence consent").check();
  await page.getByLabel("Reviewer notes").fill("Local preview submission");

  await page.getByRole("button", { name: "Submit for review" }).click();

  await expect(
    page.getByText("Receipt: 11111111-2222-3333-4444-555555555555"),
  ).toBeVisible();

  expect(requestBody).toMatchObject({
    submissionType: "observation",
    seedId: "eligible-seed-1",
    treeInstanceId: "tree-local-1",
    serverSessionId: "session-local-1",
    observationProtocol: "precommitted_window",
    treeAgeAtStartSeconds: 0,
    treeAgeAtEndSeconds: 30,
    plannedStopSeconds: 30,
    event: "censored",
    censorReason: "planned_stop",
    exposureSeconds: 30,
    gameVersion: "unverified",
    evidenceUrl: "https://example.org/evidence/video",
    evidenceConsent: true,
    currentValue: 100,
    endValue: 120,
    currency: "coins",
    eventTimePrecision: "exact_second",
    notes: "Local preview submission",
    website: "",
  });
  expect(
    String((requestBody as { observedAt: string }).observedAt),
  ).toMatch(/^2026-07-26T/);
});
