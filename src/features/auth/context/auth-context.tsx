import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { queryClient } from "@/shared/api/query-client";
import { tokenManager } from "@/shared/api/token-manager";
import { authApi } from "../api/auth.api";
import type {
  AuthContextType,
  AuthTokenResponse,
  AuthUser,
  LoginRequest,
} from "../types";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // App Bootstrap: Restore session using cached accessToken or silent refresh
  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      // 1. Try restoring session directly if valid accessToken is available in storage
      const cachedAccessToken = tokenManager.getAccessToken();
      if (cachedAccessToken) {
        try {
          const profile = await authApi.getMe();
          if (isMounted) {
            setUser(profile);
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        } catch {
          // Cached access token might be invalid or expired; proceed to refresh
        }
      }

      // 2. Otherwise fall back to silent refresh using refreshToken
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const tokenResponse = await authApi.refresh({ refreshToken });
        if (tokenResponse.accessToken && tokenResponse.refreshToken) {
          tokenManager.setTokens({
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
          });

          const profile = await authApi.getMe();
          if (isMounted) {
            setUser(profile);
            setIsAuthenticated(true);
          }
        } else {
          throw new Error(
            "Invalid token payload received on bootstrap refresh",
          );
        }
      } catch {
        tokenManager.clearTokens();
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    // Subscribe to session expiration events triggered by Axios 401 interceptor
    const unsubscribe = tokenManager.onSessionExpired(() => {
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        queryClient.clear();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (payload: LoginRequest): Promise<AuthTokenResponse> => {
      try {
        const tokenResponse = await authApi.login(payload);
        if (tokenResponse.accessToken && tokenResponse.refreshToken) {
          tokenManager.setTokens({
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
          });

          const profile = await authApi.getMe();
          setUser(profile);
          setIsAuthenticated(true);
          return tokenResponse;
        }
        throw new Error("Login failed: missing access or refresh token.");
      } catch (err) {
        tokenManager.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const refreshToken = tokenManager.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    return isAuthenticated;
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
