import api from './axios';

// Récupérer toutes les villes
export const getCities = async () => {
    const response = await api.get('/cities');
    return response.data;
};

// Récupérer une ville par slug
export const getCity = async (slug) => {
    const response = await api.get(`/cities/${slug}`);
    return response.data;
};

export const getTopBoutiquesByCity = async () => {
    const response = await api.get('/cities/top-boutiques');
    return response.data;
};