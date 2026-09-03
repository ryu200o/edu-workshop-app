import type { Page, Route } from "@playwright/test";

export async function setupMockApi(page: Page) {
  // Mock POST /api/v1/iam/auth/login
  await page.route("**/api/v1/iam/auth/login", async (route: Route) => {
    const postData = route.request().postDataJSON();
    if (
      postData?.email === "admin@eduworkshop.local" &&
      postData?.password === "AdminPassw0rd!"
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken:
            "mock-jwt-admin-token.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGVkdXdvcmtzaG9wLmxvY2FsIiwicm9sZXMiOlsiQURNSU4iLCJVU0VSIl19.mocksignature",
          refreshToken: "mock-refresh-token-valid-60d",
          expiresInSeconds: 7200,
          mustChangePassword: false,
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/problem+json",
        body: JSON.stringify({
          type: "https://errors.eduworkshop.local/authentication-failed",
          title: "Unauthorized",
          status: 401,
          detail: "Invalid email or password.",
          code: "INVALID_CREDENTIALS",
        }),
      });
    }
  });

  // Mock POST /api/v1/iam/auth/refresh
  await page.route("**/api/v1/iam/auth/refresh", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken:
          "mock-jwt-refreshed-token.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGVkdXdvcmtzaG9wLmxvY2FsIiwicm9sZXMiOlsiQURNSU4iLCJVU0VSIl19.mocksignature",
        refreshToken: "mock-refresh-token-valid-60d",
        expiresInSeconds: 7200,
        mustChangePassword: false,
      }),
    });
  });

  // Mock GET /api/v1/iam/me
  await page.route("**/api/v1/iam/me", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0000-000000000001",
        email: "admin@eduworkshop.local",
        fullName: "System Administrator",
        phoneNumber: "0901234567",
        studentCode: "ADMIN-01",
        avatarUrl: null,
        status: "ACTIVE",
        roles: ["ADMIN", "USER"],
        mustChangePassword: false,
        createdAt: "2026-08-23T10:01:50Z",
      }),
    });
  });

  // Mock POST /api/v1/iam/auth/logout
  await page.route("**/api/v1/iam/auth/logout", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock GET /api/v1/rooms/buildings
  await page.route("**/api/v1/rooms/buildings", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { building: "XTREME", floors: [1], totalRooms: 23 },
        { building: "TOA-S", floors: [7], totalRooms: 15 },
        { building: "TOA-Q", floors: [9], totalRooms: 6 },
        { building: "TOA-A", floors: [3], totalRooms: 4 },
        { building: "S", floors: [1], totalRooms: 1 },
      ]),
    });
  });

  // Mock GET /api/v1/rooms (List & Pagination)
  await page.route("**/api/v1/rooms?*", async (route: Route) => {
    const url = new URL(route.request().url());
    const pageIndex = Number(url.searchParams.get("page") || "0");
    const pageSize = Number(url.searchParams.get("size") || "10");
    const search = url.searchParams.get("search")?.toLowerCase();
    const status = url.searchParams.get("status");

    const allRooms = [
      {
        id: "room-01",
        name: "Phòng Lab A2-401",
        building: "TOA-A",
        floor: 4,
        code: 401,
        capacity: 50,
        state: "ACTIVE",
        currentMaintenanceSchedule: null,
        createdAt: "2026-08-20T08:00:00Z",
      },
      {
        id: "room-02",
        name: "Hội trường B1-01",
        building: "TOA-S",
        floor: 1,
        code: 101,
        capacity: 120,
        state: "ACTIVE",
        currentMaintenanceSchedule: null,
        createdAt: "2026-08-21T08:00:00Z",
      },
      {
        id: "room-03",
        name: "Phòng Hội Thảo C3-205",
        building: "XTREME",
        floor: 2,
        code: 205,
        capacity: 35,
        state: "MAINTENANCE",
        currentMaintenanceSchedule: {
          id: "maint-1",
          startTime: "2026-09-01T08:00:00Z",
          endTime: "2026-09-10T17:00:00Z",
          reason: "Bảo trì nâng cấp hệ thống âm thanh máy chiếu",
        },
        createdAt: "2026-08-22T08:00:00Z",
      },
      {
        id: "room-04",
        name: "Phòng Đào Tạo Q-901",
        building: "TOA-Q",
        floor: 9,
        code: 901,
        capacity: 40,
        state: "ACTIVE",
        currentMaintenanceSchedule: null,
        createdAt: "2026-08-23T08:00:00Z",
      },
    ];

    let filtered = allRooms;
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.code.toString().includes(search),
      );
    }
    if (status) {
      filtered = filtered.filter((r) => r.state === status);
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        content: filtered,
        page: pageIndex,
        size: pageSize,
        totalElements: 49,
        totalPages: 5,
        first: pageIndex === 0,
        last: pageIndex >= 4,
      }),
    });
  });

  // Mock GET /api/v1/rooms/:id (Detail Modal)
  await page.route(
    /.*\/api\/v1\/rooms\/[a-zA-Z0-9_-]+$/,
    async (route: Route) => {
      // Avoid matching sub-endpoints
      if (route.request().url().endsWith("/buildings")) {
        return route.continue();
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "room-01",
          name: "Phòng Lab A2-401",
          building: "TOA-A",
          floor: 4,
          code: 401,
          capacity: 50,
          state: "ACTIVE",
          currentMaintenanceSchedule: null,
          createdBy: {
            userId: "00000000-0000-0000-0000-000000000001",
            identifier: "admin@eduworkshop.local",
            roles: ["ADMIN"],
          },
          updatedBy: {
            userId: "00000000-0000-0000-0000-000000000001",
            identifier: "admin@eduworkshop.local",
            roles: ["ADMIN"],
          },
          createdAt: "2026-08-20T08:00:00Z",
          updatedAt: "2026-08-25T14:30:00Z",
          maintenanceHistory: [],
        }),
      });
    },
  );
}
