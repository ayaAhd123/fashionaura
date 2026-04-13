import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Intercepteur Request ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Intercepteur Response ────────────────────────────────────────────────────
// RÈGLE : on ne redirige vers /login sur 401 QUE si le token lui-même est invalide.
// On ne redirige PAS si c'est un endpoint API qui n'existe pas encore côté backend
// ou qui retourne 401 pour une autre raison (ex: notifications, stats...).
// Pour cela on vérifie que la requête portait bien un token ET on laisse les
// composants gérer leurs propres erreurs via leur propre catch/error state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status     = error.response?.status;
    const requestUrl = error.config?.url || '';
    const hasToken   = !!localStorage.getItem('token');

    // Routes à ne JAMAIS auto-rediriger (erreur gérée localement)
    const silentRoutes = [
      '/login',
      '/boutique/notifications',
      '/boutique/dashboard/stats',
      '/boutique/dashboard/charts',
      '/boutique/ai-advisor/recommendations',
      '/admin/dashboard/stats',
      '/admin/dashboard/analytics',
      '/admin/boutiques/pending',
      '/admin/cities',
    ];

    const isSilent = silentRoutes.some(r => requestUrl.includes(r));

    // On redirige uniquement si : 401 + token présent + pas une route silencieuse
    // Cela correspond à un vrai token expiré/invalide sur une action critique
    if (status === 401 && hasToken && !isSilent) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const loginUser  = (email, password) => api.post('/login', { email, password });
export const logoutUser = () => api.post('/logout');

export default api;