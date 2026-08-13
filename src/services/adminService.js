import api, { API_ROOT_URL } from "../lib/apiClient";

// USERS MANAGEMENT
export const getAllUsers = async (page = 0, size = 20) => {
    try {
        const data = await api.get(`${API_ROOT_URL}/api/v2/admin/utilisateurs`, { params: { page, size } });
        return data;
    } catch {
        throw new Error('Erreur lors du chargement des utilisateurs');
    }
};

export const getUserById = async (userId) => {
    try {
        const data = await api.get(`${API_ROOT_URL}/api/v2/admin/utilisateurs/${userId}`);
        return data;
    } catch {
        throw new Error('Erreur lors du chargement de l\'utilisateur');
    }
};

export const createUser = async (payload) => {
    try {
        const data = await api.post(`${API_ROOT_URL}/api/v2/admin/utilisateurs`, payload);
        return data;
    } catch (e) {
        if (e.response && e.response.status === 409) {
            throw new Error('Email déjà utilisé');
        }
        throw e;
    }
};

export const updateUserActivation = async (userId, actif) => {
    await api.patch(`${API_ROOT_URL}/api/v2/admin/utilisateurs/${userId}/activation`, { actif });
};

// REPORTS MANAGEMENT
export const getReportsByUser = async (userId) => {
    try {
        return await api.get(`${API_ROOT_URL}/api/v2/admin/utilisateurs/${userId}/reports`);
    } catch {
        throw new Error('Erreur lors du chargement des rapports de l\'utilisateur');
    }
};

export const approveReport = async (reportId) => {
    try {
        return await api.patch(`/admin/reports/${reportId}/status`, { status: 'APPROVED' });
    } catch {
        throw new Error('Erreur lors de l\'approbation du rapport');
    }
};

export const rejectReport = async (reportId) => {
    try {
        return await api.patch(`/admin/reports/${reportId}/status`, { status: 'REJECTED' });
    } catch {
        throw new Error('Erreur lors du rejet du rapport');
    }
};

export const getStatsByRegion = async () => {
    try {
        return await api.get('/stats/regions');
    } catch (e) {
        console.error('Error fetching regional stats:', e);
        return [];
    }
};
