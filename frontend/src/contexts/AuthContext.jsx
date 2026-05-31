import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, logoutUser } from '../services/api';
import { readStoredAuth, setAuthSession, clearAuthSession } from '../lib/authStorage';
import { disconnectEcho } from '../lib/echo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredAuth().token);
  const [user, setUser] = useState(() => readStoredAuth().user);
  const isLoading = false;

  const login = useCallback(async (email, password) => {
    const response = await loginUser(email, password);
    const { user: userData, token: userToken } = response.data;

    setAuthSession(userData, userToken);
    setToken(userToken);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Silencieux si l'endpoint n'existe pas
    } finally {
      disconnectEcho();
      clearAuthSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const setSession = useCallback((userData, userToken) => {
    setAuthSession(userData, userToken);
    setToken(userToken);
    setUser(userData);
  }, []);

  const isAdmin = () => user?.role === 'admin';
  const isBoutiqueOwner = () => user?.role === 'boutique_owner';

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    setSession,
    isAdmin,
    isBoutiqueOwner,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}

export default AuthContext;
