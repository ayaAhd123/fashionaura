import api from './axios';

// Récupérer toutes les boutiques
export const getBoutiques = async () => {
    const response = await api.get('/boutiques');
    return response.data;
};

// Récupérer une boutique avec ses produits
export const getBoutique = async (id) => {
    const response = await api.get(`/boutiques/${id}`);
    return response.data;
};

// Récupérer les boutiques d'une ville
export const getBoutiquesByCity = async (cityId) => {
    const response = await api.get(`/cities/${cityId}/boutiques`);
    return response.data;
};