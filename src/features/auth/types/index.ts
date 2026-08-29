import type { components } from "@/shared/api/schema";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type AuthTokenResponse = components["schemas"]["AuthTokenResponse"];
export type TokenRequest = components["schemas"]["TokenRequest"];
export type MeView = components["schemas"]["MeView"];
export type ProblemDetail = components["schemas"]["ProblemDetail"];

export type AuthUser = MeView;

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<AuthTokenResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}
