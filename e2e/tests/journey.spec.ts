import { expect, test, type Page } from "@playwright/test";

// A fresh account for every run, so the test never touches real data.
const stamp = Date.now();
const email = `e2e.${stamp}@example.com`;
const otherEmail = `e2e.other.${stamp}@example.com`;
const password = "E2eTest!2026-pass";

async function register(page: Page, address: string) {
  await page.goto("/register");
  await page.getByLabel("Email").fill(address);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(`Account created for ${address}`)).toBeVisible();
}

async function login(page: Page, address: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(address);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await expect(page.getByRole("link", { name: address })).toBeVisible();
}

function field(page: Page, label: string) {
  return page.locator(".field", { hasText: label }).first();
}

test("register, log in, save a role and see it listed", async ({ page }) => {
  await register(page, email);
  await login(page, email);

  await page.goto("/applications/new");
  await field(page, "Company").locator("input").fill("E2E Kiwi Tech");
  await field(page, "Role title").locator("input").fill("Junior Developer");
  await field(page, "Job description")
    .locator("textarea")
    .fill("Junior developer. Build React features with TypeScript.");
  await page.getByRole("button", { name: /save|add|create/i }).last().click();

  await page.goto("/applications");
  await expect(page.getByText("E2E Kiwi Tech").first()).toBeVisible();
});

test("one account cannot see another account's roles", async ({ page }) => {
  await register(page, otherEmail);
  await login(page, otherEmail);

  await page.goto("/applications");
  await expect(page.getByText("E2E Kiwi Tech")).toHaveCount(0);
});

test("protected pages send a signed out visitor to log in", async ({ page }) => {
  await page.goto("/applications");
  await expect(page).toHaveURL(/\/login/);
});
