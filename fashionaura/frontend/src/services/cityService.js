import api from './api';

export const getCities = async () => {
    const response = await api.get('/cities');
    return response.data;
};

export const getCity = async (id) => {
    const response = await api.get(`/cities/${id}`);
    return response.data;
};
