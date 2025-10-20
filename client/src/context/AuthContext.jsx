import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "budgetmate_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const persistAuth = (payload) => {
    if (payload?.token) {
      localStorage.setItem(TOKEN_KEY, payload.token);
    }
    if (payload?.user) {
      setUser(payload.user);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setDashboard(null);
    setGoals([]);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    persistAuth(data);
    await loadProfile();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistAuth(data);
    await loadProfile();
    return data.user;
  };

  const logout = () => {
    clearAuth();
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      setUser(null);
      setDashboard(null);
      setGoals([]);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setDashboard(data.dashboard ?? null);
      setGoals(data.goals ?? []);
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      dashboard,
      goals,
      loading,
      login,
      register,
      logout,
      refreshProfile: loadProfile
    }),
    [user, dashboard, goals, loading, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
