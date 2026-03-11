import api from './axios';

// Récupérer toutes les villes
export const getCities = async () => {
    const response = await api.get('/cities');
    return response.data;
};

// Récupérer une ville avec ses boutiques
export const getCity = async (id) => {
    const response = await api.get(`/cities/${id}`);
    return response.data;
};