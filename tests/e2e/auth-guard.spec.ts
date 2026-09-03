import { expect, test } from "./fixtures/test-base";

test.describe("Auth & Route Guarding (Anonymous)", () => {
  test("TC-AUTH-01: unauthenticated user accessing root '/' redirects to '/login?redirect=%2F'", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForURL((url) => url.pathname === "/login", {
      timeout: 10000,
    });
    expect(page.url()).toContain("redirect=%2F");
    await expect(page.locator("h1")).toContainText("Đăng Nhập");
  });

  test("TC-AUTH-02: unauthenticated user accessing deep link '/rooms' redirects to '/login?redirect=%2Frooms'", async ({
    page,
  }) => {
    await page.goto("/rooms");
    await page.waitForURL((url) => url.pathname === "/login", {
      timeout: 10000,
    });
    expect(page.url()).toContain("redirect=%2Frooms");
    await expect(page.locator("h1")).toContainText("Đăng Nhập");
  });

  test("TC-AUTH-03: invalid credentials display RFC 7807 problem error message", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Đăng Nhập");

    await page.locator('input[type="email"]').fill("wrong@user.local");
    await page.locator('input[type="password"]').fill("WrongPassword123!");
    await page.click('button[type="submit"]');

    // Verify error banner is rendered with problem details
    const errorBanner = page.locator(
      "text=/Invalid email or password|Email hoặc mật khẩu không chính xác|Đăng nhập thất bại/i",
    );
    await expect(errorBanner.first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-AUTH-04: login with redirect parameter lands on preserved destination", async ({
    page,
  }) => {
    await page.goto("/login?redirect=%2Frooms");
    await expect(page.locator("h1")).toContainText("Đăng Nhập");

    await page.locator('input[type="email"]').fill("admin@eduworkshop.local");
    await page.locator('input[type="password"]').fill("AdminPassw0rd!");
    await page.click('button[type="submit"]');

    // Wait for redirect to /rooms
    await page.waitForURL((url) => url.pathname === "/rooms", {
      timeout: 15000,
    });
    expect(page.url()).toContain("/rooms");
    await expect(
      page.getByText("Quản Lý Phòng Học & Cơ Sở Vật Chất"),
    ).toBeVisible();
  });

  test("TC-AUTH-05: logout clears session and redirects to '/login'", async ({
    page,
  }) => {
    // Perform login first
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Đăng Nhập");
    await page.locator('input[type="email"]').fill("admin@eduworkshop.local");
    await page.locator('input[type="password"]').fill("AdminPassw0rd!");
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => url.pathname === "/", { timeout: 15000 });

    // Click logout button on header
    const logoutBtn = page.getByRole("button", { name: /Đăng Xuất/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify redirect back to /login
    await page.waitForURL((url) => url.pathname === "/login", {
      timeout: 10000,
    });
    await expect(page.locator("h1")).toContainText("Đăng Nhập");
  });
});
