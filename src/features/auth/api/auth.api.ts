import { apiClient, refreshClient } from "@/shared/api/client";
import type {
  AuthTokenResponse,
  LoginRequest,
  MeView,
  TokenRequest,
} from "../types";

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthTokenResponse> {
    const { data } = await apiClient.post<AuthTokenResponse>(
      "/v1/iam/auth/login",
      payload,
    );
    return data;
  },

  async refresh(payload: TokenRequest): Promise<AuthTokenResponse> {
    const { data } = await refreshClient.post<AuthTokenResponse>(
      "/v1/iam/auth/refresh",
      payload,
    );
    return data;
  },

  async logout(payload: TokenRequest): Promise<void> {
    await apiClient.post("/v1/iam/auth/logout", payload);
  },

  async getMe(): Promise<MeView> {
    const { data } = await apiClient.get<MeView>("/v1/iam/me");
    return data;
  },
};
