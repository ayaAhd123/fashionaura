import api from './api';

export const getBoutiques = async () => {
    const response = await api.get('/boutiques');
    return response.data;
};

export const getBoutique = async (id) => {
    const response = await api.get(`/boutiques/${id}`);
    return response.data;
};
