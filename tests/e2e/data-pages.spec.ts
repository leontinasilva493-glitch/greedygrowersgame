import { expect, test } from "@playwright/test";

test("empty production data remains transparent", async ({ page }) => {
  await page.goto("/seeds");
  await expect(page.getByText(/no verified seed records|no seed records|evidence/i).first()).toBeVisible();

  await page.goto("/lightning");
  await expect(page.getByText(/unverified|not enough|no eligible/i).first()).toBeVisible();
  await expect(page.getByText(/official lightning chance/i)).toHaveCount(0);

  await page.goto("/data-status");
  await expect(page.getByText(/unverified/i).first()).toBeVisible();
});

test("unknown seed details do not generate thin pages", async ({ request }) => {
  const response = await request.get("/seeds/not-a-real-seed");
  expect(response.status()).toBe(404);
});
