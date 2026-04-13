import API from '../api/axios';

export const cityService = {
  getCities: async () => {
    const response = await API.get('/cities');
    return response.data;
  },

  getCityBySlug: async (slug) => {
    const response = await API.get(`/cities/${slug}`);
    return response.data;
  },
};
