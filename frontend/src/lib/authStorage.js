/**
 * Auth stockée en sessionStorage : chaque onglet/fenêtre a sa propre session.
 * Permet de tester client + magasinier en parallèle (2 fenêtres distinctes).
 */
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function getAuthToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(userData, userToken) {
  sessionStorage.setItem(TOKEN_KEY, userToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function readStoredAuth() {
  const token = getAuthToken();
  const user = getAuthUser();
  if (token && user) return { token, user };
  if (!token || !user) clearAuthSession();
  return { token: null, user: null };
}
