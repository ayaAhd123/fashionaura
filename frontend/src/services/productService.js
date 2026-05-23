import API from '../api/axios';

export const productService = {
  getProducts: async (filters = {}) => {
    const response = await API.get('/products', { params: filters });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await API.get(`/products/${slug}`);
    return response.data;
  },

  getProductReviews: async (id) => {
    const response = await API.get(`/products-reviews/${id}`);
    return response.data;
  },

  getSimilarProducts: async (id) => {
    const response = await API.get(`/products-similar/${id}`);
    return response.data;
  },

  addFavorite: async (productId) => {
    const response = await API.post(`/products/${productId}/favorite`);
    return response.data;
  },

  removeFavorite: async (productId) => {
    const response = await API.delete(`/products/${productId}/unfavorite`);
    return response.data;
  },

  isFavorite: async (productId) => {
    const response = await API.get(`/products/${productId}/is-favorite`);
    return response.data;
  },

  getByBoutique: async (boutiqueId, pagination = {}) => {
    const response = await API.get(`/boutiques/${boutiqueId}/products`, { params: pagination });
    return response.data;
  },
};
