import api from './axios';

// Récupérer tous les produits
export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

// Récupérer un seul produit
export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// Récupérer les produits d'une boutique
export const getProductsByBoutique = async (boutiqueId) => {
    const response = await api.get(`/boutiques/${boutiqueId}/products`);
    return response.data;
};