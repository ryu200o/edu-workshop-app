import type { Page, Route } from "@playwright/test";

let simulatedRoomState = {
  id: "room-01",
  name: "Phòng Lab A2-401",
  building: "TOA-A",
  floor: 4,
  code: 401,
  capacity: 50,
  state: "ACTIVE" as const,
  version: 0,
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
  maintenanceSchedules: [],
};

export function resetSimulatedRoomState() {
  simulatedRoomState = {
    id: "room-01",
    name: "Phòng Lab A2-401",
    building: "TOA-A",
    floor: 4,
    code: 401,
    capacity: 50,
    state: "ACTIVE",
    version: 0,
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
    maintenanceSchedules: [],
  };
}

export function getSimulatedRoomState() {
  return simulatedRoomState;
}

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
        id: simulatedRoomState.id,
        name: simulatedRoomState.name,
        building: simulatedRoomState.building,
        floor: simulatedRoomState.floor,
        code: simulatedRoomState.code,
        capacity: simulatedRoomState.capacity,
        state: simulatedRoomState.state,
        version: simulatedRoomState.version,
        currentMaintenanceSchedule: null,
        createdAt: simulatedRoomState.createdAt,
      },
      {
        id: "room-02",
        name: "Hội trường B1-01",
        building: "TOA-S",
        floor: 1,
        code: 101,
        capacity: 120,
        state: "ACTIVE",
        version: 0,
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
        version: 0,
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
        version: 0,
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

  // Mock PUT /api/v1/rooms/:id (Atomic Composite Update with If-Match)
  await page.route(
    /.*\/api\/v1\/rooms\/[a-zA-Z0-9_-]+$/,
    async (route: Route) => {
      const request = route.request();
      if (request.method() === "PUT") {
        const ifMatch = await request.headerValue("if-match");

        // Missing If-Match -> 428 Precondition Required
        if (!ifMatch) {
          await route.fulfill({
            status: 428,
            contentType: "application/problem+json",
            body: JSON.stringify({
              type: "https://errors.eduworkshop.local/precondition-required",
              title: "Precondition Required",
              status: 428,
              code: "PRECONDITION_REQUIRED",
              detail: "If-Match header is required for conditional update.",
            }),
          });
          return;
        }

        const cleanVersion = ifMatch.replace(/["']/g, "").trim();

        // OCC Mismatch -> 412 Precondition Failed
        if (cleanVersion !== String(simulatedRoomState.version)) {
          await route.fulfill({
            status: 412,
            contentType: "application/problem+json",
            body: JSON.stringify({
              type: "https://errors.eduworkshop.local/optimistic-lock-failed",
              title: "Precondition Failed",
              status: 412,
              code: "OPTIMISTIC_LOCK_FAILED",
              detail:
                "Phòng học đã được cập nhật bởi một phiên làm việc khác. Dữ liệu của bạn không còn đồng bộ.",
            }),
          });
          return;
        }

        const body = request.postDataJSON();

        // 409 Business Uniqueness Conflict Simulation
        if (body?.name === "DUPLICATE_NAME") {
          await route.fulfill({
            status: 409,
            contentType: "application/problem+json",
            body: JSON.stringify({
              type: "https://errors.eduworkshop.local/duplicate-name",
              title: "Conflict",
              status: 409,
              code: "DUPLICATE_ROOM_NAME",
              detail: "Tên phòng học này đã tồn tại trong cơ sở dữ liệu.",
            }),
          });
          return;
        }

        if (body?.code === 9999) {
          await route.fulfill({
            status: 409,
            contentType: "application/problem+json",
            body: JSON.stringify({
              type: "https://errors.eduworkshop.local/duplicate-code",
              title: "Conflict",
              status: 409,
              code: "DUPLICATE_ROOM_CODE",
              detail: "Mã phòng học đã được sử dụng tại tầng này.",
            }),
          });
          return;
        }

        // Successful update -> mutate state, increment version, return 204 No Content
        simulatedRoomState = {
          ...simulatedRoomState,
          name: body.name,
          building: body.building,
          floor: body.floor,
          code: body.code,
          capacity: body.capacity,
          version: simulatedRoomState.version + 1,
          updatedBy: {
            userId: "00000000-0000-0000-0000-000000000001",
            identifier: "admin@eduworkshop.local",
            roles: ["ADMIN"],
          },
          updatedAt: new Date().toISOString(),
        };

        await route.fulfill({
          status: 204,
        });
        return;
      }

      // Avoid matching sub-endpoints
      if (request.url().endsWith("/buildings")) {
        return route.continue();
      }

      // Mock GET /api/v1/rooms/:id (Detail / Refetch)
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(simulatedRoomState),
      });
    },
  );
}
