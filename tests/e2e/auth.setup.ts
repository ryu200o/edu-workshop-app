import { expect, test } from "./fixtures/test-base";

const authFile = "playwright/.auth/user.json";

test("authenticate as admin and save session storage", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  // Verify login page elements
  await expect(page.locator("h1")).toContainText("Đăng Nhập");

  // Fill credentials
  await page.locator('input[type="email"]').fill("admin@eduworkshop.local");
  await page.locator('input[type="password"]').fill("AdminPassw0rd!");

  // Submit login form
  await page.click('button[type="submit"]');

  // Expect successful navigation away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });

  // Verify dashboard or rooms page is loaded
  await expect(page.locator("body")).toContainText("Edu Workshop");

  // Save session storage (localStorage + cookies)
  await page.context().storageState({ path: authFile });
});
