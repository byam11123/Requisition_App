import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    registerOrganization: (data: any) => api.post('/auth/register-organization', data),
    refreshToken: () => api.post('/auth/refresh'),
};

export const dashboardAPI = {
    getStats: (typeId: number) => api.get(`/dashboard/stats/${typeId}`),
    getRequisitionsByType: (typeId: number) => api.get(`/dashboard/requisitions/${typeId}`),
    getRequisitionDetail: (id: number) => api.get(`/dashboard/requisitions/${id}/detail`),
    createRequisition: (data: any) => api.post('/dashboard/requisitions/create', data),
    submitRequisition: (id: number) => api.post(`/dashboard/requisitions/${id}/submit`),
    dispatchRequisition: (id: number) => api.post(`/dashboard/requisitions/${id}/dispatch`),
};

// Backward compatibility (optional, or redirect to dashboardAPI)
export const requisitionAPI = {
    getAll: () => api.get('/requisitions'),
    getById: (id: number) => api.get(`/requisitions/${id}`),
    create: (data: any) => api.post('/requisitions', data),
    update: (id: number, data: any) => api.put(`/requisitions/${id}`, data),
    delete: (id: number) => api.delete(`/requisitions/${id}`),
    bulkDelete: (ids: number[]) => api.delete('/requisitions/bulk', { data: ids }),
    submit: (id: number) => api.post(`/requisitions/${id}/submit`),

    // Approval Workflow
    approve: (id: number, data: { approvalStatus: string; notes: string }) =>
        api.post(`/requisitions/${id}/approve`, data),

    updatePayment: (id: number, data: any) =>
        api.post(`/requisitions/${id}/payment`, data),

    confirmMaterialReceipt: (id: number, data: { materialReceived: boolean; receiptNotes: string }) =>
        api.post(`/requisitions/${id}/material-receipt`, data),

    uploadFile: (id: number, file: File, type: 'payment' | 'material' | 'bill' | 'vendor_payment') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        return api.post(`/requisitions/${id}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    dispatch: (id: number) => api.post(`/dashboard/requisitions/${id}/dispatch`),

    exportRequisitions: () => api.get('/requisitions/export', { responseType: 'blob' }),
    exportSelectedRequisitions: (ids: number[]) => api.post('/requisitions/export/selected', ids, { responseType: 'blob' }),
};

export const userManagementAPI = {
    createUser: (data: any) => api.post('/users/create', data),
    getAllUsers: () => api.get('/users'),
    updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
    deactivateUser: (id: number) => api.post(`/users/${id}/deactivate`),
    activateUser: (id: number) => api.post(`/users/${id}/activate`),
    deleteUser: (id: number) => api.delete(`/users/${id}`),
    changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/users/change-password', data),
    uploadProfilePhoto: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/users/profile-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const organizationAPI = {
    getOrganization: () => api.get('/organization'),
    updateOrganization: (data: any) => api.put('/organization', data),
    uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/organization/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export default api;
