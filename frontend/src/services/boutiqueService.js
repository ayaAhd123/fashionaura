import API from '../api/axios';

export const boutiqueService = {
  getBoutiques: async (filters = {}) => {
    const response = await API.get('/boutiques', { params: filters });
    return response.data;
  },

  getBoutiqueBySlug: async (slug) => {
    const response = await API.get(`/boutiques/${slug}`);
    return response.data;
  },

  getBoutiqueReviews: async (id) => {
    const response = await API.get(`/boutiques-reviews/${id}`);
    return response.data;
  },

  followBoutique: async (boutiqueId) => {
    const response = await API.post(`/boutiques/${boutiqueId}/follow`);
    return response.data;
  },

  unfollowBoutique: async (boutiqueId) => {
    const response = await API.delete(`/boutiques/${boutiqueId}/unfollow`);
    return response.data;
  },

  isFollowing: async (boutiqueId) => {
    const response = await API.get(`/boutiques/${boutiqueId}/is-following`);
    return response.data;
  },
};
