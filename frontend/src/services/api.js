import axios from 'axios';
import { getAuthToken, clearAuthSession } from '../lib/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Intercepteur Request ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
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
    const hasToken = !!getAuthToken();

    const silentRoutes = [
      '/login',
      '/boutique/notifications',
      '/boutique/notifications/check-stock',
      '/boutique/dashboard/stats',
      '/boutique/dashboard/charts',
      '/boutique/ai-advisor/recommendations',
      '/boutique/ai-advisor/analysis',
      '/boutique/copilot/chat',
      '/admin/dashboard/stats',
      '/admin/dashboard/analytics',
      '/admin/boutiques/pending',
      '/admin/cities',
    ];

    const isSilent = silentRoutes.some(r => requestUrl.includes(r));

    if (status === 401 && hasToken && !isSilent) {
      clearAuthSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const loginUser    = (email, password) => api.post('/login', { email, password });
export const logoutUser   = () => api.post('/logout');
export const registerUser = (data) => api.post('/register', data);  // ✅ Ajouté

// ─── Compte client ────────────────────────────────────────────────────────────
export const updateProfile  = (data) => api.put('/account/profile', data);
export const updatePassword = (data) => api.put('/account/password', data);

// ─── Commandes ──────────────────────────────────────────────────────────────
export const getMyOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const getOrderConversation = (orderId) => api.get(`/orders/${orderId}/conversation`);
export const getConversationMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`);
export const sendConversationMessage = (conversationId, body) =>
  api.post(`/conversations/${conversationId}/messages`, { body });
export const getConversations = () => api.get('/conversations');
export const getBoutiqueConversation = (boutiqueId) => api.get(`/boutiques/${boutiqueId}/conversation`);

// ─── Commentaires publications ────────────────────────────────────────────────
export const getPostComments = (boutiqueId, postId) =>
  api.get(`/boutiques/${boutiqueId}/posts/${postId}/comments`);
export const addPostComment = (boutiqueId, postId, body) =>
  api.post(`/boutiques/${boutiqueId}/posts/${postId}/comments`, { body });

// ─── Commandes boutique ───────────────────────────────────────────────────────
export const updateBoutiqueOrderStatus = (orderId, status) =>
  api.put(`/boutique/orders/${orderId}/status`, { status });

// ─── Favoris ──────────────────────────────────────────────────────────────────
export const getFavorites     = () => api.get('/favorites');
export const favoriteProduct  = (productId) => api.post(`/products/${productId}/favorite`);
export const removeFavorite   = (productId) => api.delete(`/products/${productId}/unfavorite`);

// ─── Boutiques suivies ────────────────────────────────────────────────────────
export const getMyFollowing  = () => api.get('/my/following');
export const unfollowBoutique = (boutiqueId) => api.delete(`/boutiques/${boutiqueId}/unfollow`);

// ─── Contact / Aide ───────────────────────────────────────────────────────────
export const sendContactMessage = (data) => api.post('/contact', data);

// ─── Notifications (utilisateur connecté) ─────────────────────────────────────
export const getMyNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ─── Publications boutique (feed type réseau social) ──────────────────────────
export const getBoutiqueFeed = (boutiqueId) => api.get(`/boutiques/${boutiqueId}/posts`);
export const getMyPosts = () => api.get('/boutique/posts');
export const createPost = (formData) =>
  api.post('/boutique/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePost = (id, formData) => {
  // Spoofing de méthode : PUT avec fichiers passe par POST + _method=PUT
  formData.append('_method', 'PUT');
  return api.post(`/boutique/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deletePost = (id) => api.delete(`/boutique/posts/${id}`);

export default api;