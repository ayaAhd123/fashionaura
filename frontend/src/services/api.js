import axios from 'axios';
// ❌ Supprimez cette ligne : import { registerUser } from '../services/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status     = error.response?.status;
    const requestUrl = error.config?.url || '';
    const hasToken   = !!localStorage.getItem('token');

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

    if (status === 401 && hasToken && !isSilent) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const loginUser    = (email, password) => api.post('/login', { email, password });
export const logoutUser   = () => api.post('/logout');
export const registerUser = (data) => api.post('/register', data);  // ✅ Ajouté

export default api;