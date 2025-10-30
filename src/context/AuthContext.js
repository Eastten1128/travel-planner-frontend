import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const STORAGE_KEY = "travel_planner_auth";

const loadStoredTokens = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored auth tokens", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const AuthContext = createContext({
  tokens: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  setTokens: () => {},
  setUser: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [tokens, setTokensState] = useState(() => loadStoredTokens());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistTokens = useCallback((nextTokens) => {
    setTokensState(nextTokens);
    if (typeof window !== "undefined") {
      if (nextTokens) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTokens));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const clearSession = useCallback(() => {
    persistTokens(null);
    setUser(null);
  }, [persistTokens]);

  const refreshProfile = useCallback(async () => {
    if (!tokens?.accessToken) {
      return null;
    }

    try {
      const profile = await authService.getMe(tokens.accessToken);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      clearSession();
      throw error;
    }
  }, [tokens, clearSession]);

  useEffect(() => {
    let isMounted = true;

    const initialise = async () => {
      if (!tokens?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialise();

    return () => {
      isMounted = false;
    };
  }, [tokens, refreshProfile]);

  const login = useCallback(
    async (nextTokens, profile) => {
      persistTokens(nextTokens);
      if (profile) {
        setUser(profile);
        return profile;
      }
      return refreshProfile();
    },
    [persistTokens, refreshProfile]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const contextValue = useMemo(
    () => ({
      tokens,
      user,
      isAuthenticated: Boolean(tokens?.accessToken),
      isLoading,
      login,
      logout,
      setTokens: persistTokens,
      setUser,
      refreshProfile,
    }),
    [tokens, user, isLoading, login, logout, persistTokens, refreshProfile]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
