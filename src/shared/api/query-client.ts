import { QueryClient } from "@tanstack/react-query";
import type { ApiErrorResponse } from "./client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status =
          (error as unknown as ApiErrorResponse)?.status ??
          (error as unknown as { response?: { status?: number } })?.response
            ?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
