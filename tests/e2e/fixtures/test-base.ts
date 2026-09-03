import { test as base } from "@playwright/test";
import { setupMockApi } from "./mock-api";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Automatically attach network mock interceptors when running on CI
    if (process.env.CI) {
      await setupMockApi(page);
    }
    await use(page);
  },
});

export { expect } from "@playwright/test";
