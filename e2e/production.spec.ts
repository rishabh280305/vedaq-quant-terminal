import { expect, test } from "@playwright/test";

test("prices an option through the production interface", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Markets, models and risk—without the black box." })).toBeVisible();
  await page.getByRole("button", { name: "CALCULATE" }).click();
  await expect(page.getByText("10.4506", { exact: true })).toBeVisible();
  await expect(page.getByText("Educational analytics only; not investment advice.")).toBeVisible();
});
