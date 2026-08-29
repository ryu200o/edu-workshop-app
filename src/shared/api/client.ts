import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenManager } from "./token-manager";

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
  properties?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  problem: ProblemDetail;
  status: number;
}

export function normalizeProblemDetail(
  error: AxiosError<ProblemDetail> | unknown,
): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data as ProblemDetail | undefined;

    if (
      data &&
      typeof data === "object" &&
      ("title" in data || "detail" in data || "errors" in data)
    ) {
      return {
        problem: {
          title: data.title || "Lỗi yêu cầu",
          detail:
            data.detail || error.message || "Đã xảy ra lỗi khi xử lý yêu cầu.",
          status: data.status || status,
          type: data.type,
          instance: data.instance,
          errors: data.errors,
          properties: data.properties,
        },
        status,
      };
    }

    let defaultTitle = "Lỗi hệ thống";
    if (status === 401) defaultTitle = "Chưa xác thực";
    if (status === 403) defaultTitle = "Không có quyền truy cập";
    if (status === 404) defaultTitle = "Không tìm thấy tài nguyên";

    return {
      problem: {
        title: defaultTitle,
        detail: error.message || "Đã xảy ra lỗi không xác định.",
        status,
      },
      status,
    };
  }

  return {
    problem: {
      title: "Lỗi không xác định",
      detail: (error as Error)?.message || "Đã xảy ra lỗi ngoài dự kiến.",
      status: 500,
    },
    status: 500,
  };
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dedicated isolated client for token refresh to avoid interceptor recursion
export const refreshClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach in-memory accessToken
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeProblemDetail(error)),
);

// Response Interceptor: 401 Replay Queue & RTR
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: ApiErrorResponse) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

function processQueue(
  error: ApiErrorResponse | null,
  token: string | null = null,
) {
  for (const promise of failedQueue) {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  }
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetail>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If not a 401 error or no config available, normalize and reject
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(normalizeProblemDetail(error));
    }

    // Skip retry if already retried
    if (originalRequest._retry) {
      return Promise.reject(normalizeProblemDetail(error));
    }

    // If refresh is already in progress, enqueue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      tokenManager.clearTokens();
      tokenManager.notifySessionExpired();
      const normalized = normalizeProblemDetail(error);
      processQueue(normalized, null);
      return Promise.reject(normalized);
    }

    try {
      interface RefreshTokenResponse {
        accessToken?: string;
        refreshToken?: string;
        expiresInSeconds?: number;
        mustChangePassword?: boolean;
      }
      const { data } = await refreshClient.post<RefreshTokenResponse>(
        "/api/v1/iam/auth/refresh",
        { refreshToken },
      );

      if (!data.accessToken || !data.refreshToken) {
        throw new Error("Invalid token response received during refresh");
      }

      tokenManager.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshErr) {
      const normalizedErr = normalizeProblemDetail(refreshErr);
      processQueue(normalizedErr, null);
      tokenManager.clearTokens();
      tokenManager.notifySessionExpired();
      return Promise.reject(normalizedErr);
    } finally {
      isRefreshing = false;
    }
  },
);
