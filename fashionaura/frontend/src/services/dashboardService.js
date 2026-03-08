import api from './api';

export const getOwnerStats = async () => {
    const response = await api.get('/dashboard/owner/stats');
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/dashboard/admin/stats');
    return response.data;
};
