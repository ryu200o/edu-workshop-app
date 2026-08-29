import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { components } from "./schema";

export type ProblemDetail = components["schemas"]["ProblemDetail"];

export interface ApiErrorResponse {
  problem: ProblemDetail;
  status: number;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor placeholder (e.g. Auth Token Injection)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth token injection will be implemented in Auth Module (Slice/Task)
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor placeholder (e.g. RFC 7807 Error Normalization & 401 Replay Queue)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetail>) => {
    const status = error.response?.status ?? 500;
    const problem = error.response?.data ?? {
      title: "Unknown Error",
      detail: error.message || "An unexpected error occurred.",
      status,
    };

    const normalizedError: ApiErrorResponse = {
      problem,
      status,
    };

    return Promise.reject(normalizedError);
  },
);
