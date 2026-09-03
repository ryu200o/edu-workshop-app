import { expect, test } from "./fixtures/test-base";

test.describe("App Shell & Navigation (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for auth bootstrap / splash loader to resolve
    await expect(page.getByRole("banner")).toBeVisible({ timeout: 15000 });
  });

  test("TC-NAV-01: navbar displays brand, user email, ADMIN badge, and controls", async ({
    page,
  }) => {
    const banner = page.getByRole("banner");

    // Verify Brand Logo in Navbar
    await expect(banner.getByText("Edu Workshop")).toBeVisible();

    // Verify User Email & Role Badge in Navbar
    await expect(banner.getByText("admin@eduworkshop.local")).toBeVisible();
    await expect(banner.getByText("ADMIN", { exact: true })).toBeVisible();

    // Verify Logout button & Theme Toggle in Navbar
    await expect(
      banner.getByRole("button", { name: /Đăng Xuất/i }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: /Toggle theme/i }),
    ).toBeVisible();
  });

  test("TC-NAV-02: switching between Dashboard and Rooms updates active link styles", async ({
    page,
  }) => {
    const banner = page.getByRole("banner");
    const dashboardLink = banner.getByRole("link", { name: "Dashboard" });
    const roomsLink = banner.getByRole("link", { name: "Quản Lý Phòng Học" });

    await expect(dashboardLink).toBeVisible();
    await expect(roomsLink).toBeVisible();

    // Navigate to Rooms by clicking link in navbar
    await roomsLink.click();
    await page.waitForURL((url) => url.pathname === "/rooms", {
      timeout: 10000,
    });
    expect(page.url()).toContain("/rooms");

    // Navigate back to Dashboard
    await dashboardLink.click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    expect(page.url()).not.toContain("/rooms");
  });

  test("TC-NAV-03: unknown route renders 404 safety net with return home button", async ({
    page,
  }) => {
    await page.goto("/duong-dan-khong-ton-tai-xyz-123");

    // Expect 404 Not Found component
    await expect(page.getByText("404")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Không Tìm Thấy Trang")).toBeVisible();

    // Click "Về Trang Chủ"
    const homeBtn = page.getByRole("link", { name: /Về Trang Chủ/i });
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();

    // Wait for return to root
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    expect(page.url()).not.toContain("/duong-dan-khong-ton-tai");
  });
});
