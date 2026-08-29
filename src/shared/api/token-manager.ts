const REFRESH_TOKEN_KEY = "edu_refresh_token";

let inMemoryAccessToken: string | null = null;

type SessionExpiredListener = () => void;
const sessionExpiredListeners: Set<SessionExpiredListener> = new Set();

export const tokenManager = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignore localStorage access errors in restricted environments
    }
  },

  setTokens(tokens: { accessToken?: string; refreshToken?: string }): void {
    if (tokens.accessToken !== undefined) {
      this.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken !== undefined) {
      this.setRefreshToken(tokens.refreshToken);
    }
  },

  clearTokens(): void {
    inMemoryAccessToken = null;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Ignore
    }
  },

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  },

  onSessionExpired(listener: SessionExpiredListener): () => void {
    sessionExpiredListeners.add(listener);
    return () => {
      sessionExpiredListeners.delete(listener);
    };
  },

  notifySessionExpired(): void {
    for (const listener of sessionExpiredListeners) {
      try {
        listener();
      } catch (err) {
        console.error("Error in session expired listener:", err);
      }
    }
  },
};
