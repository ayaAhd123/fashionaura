import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, logoutUser } from '../services/api';

const AuthContext = createContext(null);

// ── Lecture synchrone du localStorage ────────────────────────────────────────
// CRITIQUE : on lit le localStorage de façon synchrone via l'initializer de useState
// et non dans un useEffect. Avec useEffect, le 1er render voit token=null →
// isAuthenticated=false → ProtectedRoute redirige vers /login → le dashboard
// disparaît pendant 1-2 secondes puis revient. L'initializer évite ce flash.
function readStoredAuth() {
  try {
    const token = localStorage.getItem('token');
    const raw   = localStorage.getItem('user');
    if (token && raw) return { token, user: JSON.parse(raw) };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  // Les initializer functions sont appelées une seule fois, de manière synchrone,
  // avant le premier render → pas de flash, pas de redirect parasite.
  const [token, setToken] = useState(() => readStoredAuth().token);
  const [user,  setUser]  = useState(() => readStoredAuth().user);

  // Plus besoin de isLoading — on le garde à false pour compatibilité
  const isLoading = false;

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await loginUser(email, password);
    const { user: userData, token: userToken } = response.data;

    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(userToken);
    setUser(userData);

    return userData;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Silencieux si l'endpoint n'existe pas
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // ── Helpers de rôle ────────────────────────────────────────────────────────
  const isAdmin         = () => user?.role === 'admin';
  const isBoutiqueOwner = () => user?.role === 'boutique_owner';

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
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