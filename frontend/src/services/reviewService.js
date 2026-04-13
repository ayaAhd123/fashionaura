import API from '../api/axios';

export const reviewService = {
  createReview: async (data) => {
    const response = await API.post('/reviews', data);
    return response.data;
  },

  getProductReviews: async (productId) => {
    const response = await API.get(`/products/${productId}/reviews`);
    return response.data;
  },

  getBoutiqueReviews: async (boutiqueId) => {
    const response = await API.get(`/boutiques/${boutiqueId}/reviews`);
    return response.data;
  },
};
