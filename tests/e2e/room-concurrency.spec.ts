import { resetSimulatedRoomState, setupMockApi } from "./fixtures/mock-api";
import { expect, test } from "./fixtures/test-base";

test.describe("Room Optimistic Concurrency Control (OCC) & In-Place Reconciliation", () => {
  test.beforeEach(async ({ page }) => {
    resetSimulatedRoomState();
    await setupMockApi(page);
  });

  test("TC-OCC-01: Multi-tab concurrent editing triggers HTTP 412, displays ConflictBanner with non-colliding drift, and allows Force Overwrite", async ({
    page: page1,
    context,
  }) => {
    const page2 = await context.newPage();
    await setupMockApi(page2);

    // Both tabs navigate to /rooms
    await page1.goto("/rooms");
    await page2.goto("/rooms");

    await expect(page1.getByRole("banner")).toBeVisible({ timeout: 15000 });
    await expect(page2.getByRole("banner")).toBeVisible({ timeout: 15000 });

    // Open EditRoomDialog on Tab 1
    const row1 = page1.locator("tbody tr").first();
    await expect(row1).toBeVisible({ timeout: 10000 });
    await row1.getByRole("button", { name: /Menu thao tác/i }).click();
    await page1.getByRole("menuitem", { name: /Sửa Thông Tin/i }).click();
    await expect(
      page1.getByRole("heading", { name: /Chỉnh Sửa Thông Tin Phòng Học/i }),
    ).toBeVisible();

    // Open EditRoomDialog on Tab 2
    const row2 = page2.locator("tbody tr").first();
    await expect(row2).toBeVisible({ timeout: 10000 });
    await row2.getByRole("button", { name: /Menu thao tác/i }).click();
    await page2.getByRole("menuitem", { name: /Sửa Thông Tin/i }).click();
    await expect(
      page2.getByRole("heading", { name: /Chỉnh Sửa Thông Tin Phòng Học/i }),
    ).toBeVisible();

    // Tab 1: Updates capacity from 50 to 75 and saves successfully (Version advances: 0 -> 1)
    const capacityInput1 = page1.locator("#edit-capacity");
    await capacityInput1.fill("75");
    await page1.getByRole("button", { name: /Lưu Thay Đổi/i }).click();
    await expect(
      page1.getByText(/Đã cập nhật thông tin phòng học thành công/i),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page1.getByRole("heading", { name: /Chỉnh Sửa Thông Tin Phòng Học/i }),
    ).not.toBeVisible();

    // Tab 2: Edits room name while holding stale version 0
    const nameInput2 = page2.locator("#edit-name");
    await nameInput2.fill("Phòng Lab STEM Đột Phá");

    // Tab 2 submits -> Server returns HTTP 412 Precondition Failed
    await page2.getByRole("button", { name: /Lưu Thay Đổi/i }).click();

    // Verify Tab 2 behavior on HTTP 412:
    // 1. Form inputs are strictly preserved (name input is NOT wiped)
    await expect(nameInput2).toHaveValue("Phòng Lab STEM Đột Phá");

    // 2. Amber ConflictBanner appears
    const banner2 = page2.getByTestId("conflict-banner");
    await expect(banner2).toBeVisible({ timeout: 10000 });
    await expect(
      page2.getByText(/Phát Hiện Xung Đột Phiên Bản Dữ Liệu \(HTTP 412\)/i),
    ).toBeVisible();

    // 3. Non-colliding drift from Tab 1 (Capacity = 75) is highlighted
    await expect(
      page2.getByTestId("non-colliding-drift-capacity"),
    ).toBeVisible();
    await expect(page2.getByText(/"75"/)).toBeVisible();

    // Tab 2 chooses "Ghi đè bằng dữ liệu của tôi"
    const forceOverwriteBtn = page2.getByTestId("force-overwrite-button");
    await expect(forceOverwriteBtn).toBeVisible();
    await forceOverwriteBtn.click();

    // Tab 2 save succeeds with If-Match: "1" -> 204 No Content
    await expect(
      page2.getByText(/Đã ghi đè dữ liệu phòng học thành công/i),
    ).toBeVisible({ timeout: 10000 });
    await expect(banner2).not.toBeVisible();

    await page2.close();
  });

  test("TC-OCC-02: Direct collision on same field shows diff strike-through and Discard & Sync resets form cleanly", async ({
    page: page1,
    context,
  }) => {
    const page2 = await context.newPage();
    await setupMockApi(page2);

    await page1.goto("/rooms");
    await page2.goto("/rooms");

    // Open Edit dialog on both tabs
    await page1
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Menu thao tác/i })
      .click();
    await page1.getByRole("menuitem", { name: /Sửa Thông Tin/i }).click();

    await page2
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Menu thao tác/i })
      .click();
    await page2.getByRole("menuitem", { name: /Sửa Thông Tin/i }).click();

    // Tab 1 changes capacity to 80 and saves
    await page1.locator("#edit-capacity").fill("80");
    await page1.getByRole("button", { name: /Lưu Thay Đổi/i }).click();
    await expect(
      page1.getByText(/Đã cập nhật thông tin phòng học thành công/i),
    ).toBeVisible();

    // Tab 2 also changes capacity to 90 (Direct Collision on capacity field)
    await page2.locator("#edit-capacity").fill("90");
    await page2.getByRole("button", { name: /Lưu Thay Đổi/i }).click();

    // Tab 2 gets 412 and displays direct collision diff
    const banner = page2.getByTestId("conflict-banner");
    await expect(banner).toBeVisible({ timeout: 10000 });
    await expect(page2.getByTestId("direct-collision-capacity")).toBeVisible();
    await expect(page2.getByText("80 (Máy chủ)")).toBeVisible();
    await expect(page2.getByText("Bạn đang nhập: 90")).toBeVisible();

    // Tab 2 clicks "Hủy & Đồng bộ"
    const discardBtn = page2.getByTestId("discard-sync-button");
    await discardBtn.click();

    // Verify form resets to server value 80 and banner is dismissed
    await expect(banner).not.toBeVisible();
    await expect(page2.locator("#edit-capacity")).toHaveValue("80");
    await expect(
      page2.getByText(/Đã đồng bộ biểu mẫu với dữ liệu mới nhất từ máy chủ/i),
    ).toBeVisible();

    await page2.close();
  });

  test("TC-OCC-03: Business uniqueness violation (HTTP 409) maps to inline field validation error and does NOT show ConflictBanner", async ({
    page,
  }) => {
    await page.goto("/rooms");

    // Open edit dialog
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Menu thao tác/i })
      .click();
    await page.getByRole("menuitem", { name: /Sửa Thông Tin/i }).click();

    // Fill duplicate room name
    await page.locator("#edit-name").fill("DUPLICATE_NAME");
    await page.getByRole("button", { name: /Lưu Thay Đổi/i }).click();

    // Verify field validation error is mapped inside dialog under name field
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText(/Tên phòng học này đã tồn tại trong cơ sở dữ liệu/i),
    ).toBeVisible({ timeout: 10000 });

    // ConflictBanner must NOT be displayed on 409!
    await expect(page.getByTestId("conflict-banner")).not.toBeVisible();
  });
});
