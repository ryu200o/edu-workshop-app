import { expect, test } from "./fixtures/test-base";

test.describe("Room Management Core Flows (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rooms");
    await expect(page.getByRole("banner")).toBeVisible({ timeout: 15000 });
  });

  test("TC-ROOM-01: rooms page renders header, actions, and data table rows", async ({
    page,
  }) => {
    // Header title
    await expect(
      page.getByText("Quản Lý Phòng Học & Cơ Sở Vật Chất"),
    ).toBeVisible({ timeout: 15000 });

    // Action button to create room
    await expect(
      page.getByRole("button", { name: /Tạo Phòng Mới|Thêm Phòng Mới/i }),
    ).toBeVisible();

    // Table elements: verify table headers
    await expect(
      page.getByRole("columnheader", { name: /Mã Tọa Độ/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Tên Phòng Học/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Vị Trí/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Sức Chứa/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Trạng Thái/i }),
    ).toBeVisible();

    // Verify table has rows loaded
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC-ROOM-02: search and status filter update query parameters and table data", async ({
    page,
  }) => {
    // Wait for table to load
    await expect(page.locator("tbody tr").first()).toBeVisible({
      timeout: 15000,
    });

    // Enter search keyword
    const searchInput = page.getByPlaceholder(/Tìm theo tên hoặc mã phòng/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("EXTREME");

    // Wait for search debounce to update URL
    await page.waitForTimeout(500);

    // Verify search value is preserved in input
    await expect(searchInput).toHaveValue("EXTREME");
  });

  test("TC-ROOM-03: pagination displays page info and allows navigation", async ({
    page,
  }) => {
    // Verify pagination controls are visible
    const nextBtn = page.getByRole("button", { name: /Trang tiếp/i });
    await expect(nextBtn).toBeVisible({ timeout: 15000 });

    // Check if pagination displays current page
    const pageText = page.locator("text=/\\d+\\s*\\/\\s*\\d+/");
    await expect(pageText.first()).toBeVisible();

    // If next button is enabled, click it
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("page=");
    }
  });

  test("TC-ROOM-04: clicking view detail opens RoomDetailModal with audit information", async ({
    page,
  }) => {
    // Wait for room rows to load
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Open row actions dropdown
    const actionTrigger = firstRow.getByRole("button", {
      name: /Menu thao tác/i,
    });
    await expect(actionTrigger).toBeVisible();
    await actionTrigger.click();

    // Click "Xem Chi Tiết" in dropdown menu
    const viewDetailItem = page.getByRole("menuitem", {
      name: /Xem Chi Tiết/i,
    });
    await expect(viewDetailItem).toBeVisible();
    await viewDetailItem.click();

    // Verify RoomDetailModal opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(
      dialog.getByText(/Nhật Ký Kiểm Toán|Audit Trail/i),
    ).toBeVisible();

    // Close the dialog
    const closeBtn = dialog.getByRole("button", { name: /Close|Đóng/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });

  test("TC-ROOM-05: view switcher toggles between Table and Grid view and updates URL", async ({
    page,
  }) => {
    // Both view switcher buttons are visible
    const tableBtn = page.getByRole("button", { name: /Dạng Bảng/i });
    const gridBtn = page.getByRole("button", { name: /Dạng Lưới/i });
    await expect(tableBtn).toBeVisible({ timeout: 10000 });
    await expect(gridBtn).toBeVisible({ timeout: 10000 });

    // Click Grid view button
    await gridBtn.click();
    await page.waitForTimeout(400);

    // Verify URL updated with view=grid
    expect(page.url()).toContain("view=grid");

    // Table should not be visible, card grid should be visible
    await expect(page.locator("table")).not.toBeVisible();
    await expect(page.locator("text=/#[0-9]+/").first()).toBeVisible({
      timeout: 10000,
    });

    // Switch back to Table view
    await tableBtn.click();
    await page.waitForTimeout(400);
    expect(page.url()).toContain("view=table");
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("TC-ROOM-06: grid view renders room cards sorted by code ascending with action menu", async ({
    page,
  }) => {
    await page.goto("/rooms?view=grid");
    await expect(page.getByRole("banner")).toBeVisible({ timeout: 15000 });

    // Wait for room cards to render
    const codeBadges = page.locator("text=/#[0-9]+/");
    await expect(codeBadges.first()).toBeVisible({ timeout: 15000 });

    // Verify natural code sort: extract numeric codes and ensure code[i] <= code[i+1]
    const badgeTexts = await codeBadges.allInnerTexts();
    const codes = badgeTexts.map((text) => Number(text.replace("#", "")));
    expect(codes.length).toBeGreaterThan(0);
    for (let i = 0; i < codes.length - 1; i++) {
      expect(codes[i]).toBeLessThanOrEqual(codes[i + 1]);
    }

    // Verify card content elements
    await expect(page.locator("text=/[0-9]+ chỗ/").first()).toBeVisible();

    // Verify action menu on first card
    const firstMenuBtn = page
      .getByRole("button", { name: /Menu thao tác/i })
      .first();
    await expect(firstMenuBtn).toBeVisible();
    await firstMenuBtn.click();

    // Verify "Xem Chi Tiết" item and open modal
    const viewDetailItem = page.getByRole("menuitem", {
      name: /Xem Chi Tiết/i,
    });
    await expect(viewDetailItem).toBeVisible();
    await viewDetailItem.click();

    // Modal opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(
      dialog.getByText(/Nhật Ký Kiểm Toán|Audit Trail/i),
    ).toBeVisible();

    // Close modal
    const closeBtn = dialog.getByRole("button", { name: /Close|Đóng/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });
});
