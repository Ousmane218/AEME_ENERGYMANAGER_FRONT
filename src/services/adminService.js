import api from "../lib/apiClient";

// USERS MANAGEMENT
export const getAllUsers = async () => {
    try {
        return await api.get('/admin/users');
    } catch (error) {
        throw new Error('Erreur lors du chargement des utilisateurs');
    }
};

export const deleteUser = async (userId) => {
    try {
        return await api.delete(`/admin/users/${userId}`);
    } catch (error) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
};

export const inviteUser = async ({ email, firstName, lastName, role, membershipService }) => {
    try {
        return await api.post('/admin/users', { email, firstName, lastName, role, membershipService });
    } catch (error) {
        if (error.response && error.response.status === 409) {
            throw new Error('Email déjà utilisé');
        }
        throw new Error("Erreur lors de l'invitation");
    }
};

export const updateUserMembership = async (userId, membershipService) => {
    try {
        return await api.patch(`/admin/users/${userId}/membership`, { membershipService });
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour du membership');
    }
};

// REPORTS MANAGEMENT
export const getReportsByUser = async (userId) => {
    try {
        return await api.get(`/admin/users/${userId}/reports`);
    } catch (error) {
        throw new Error('Erreur lors du chargement des rapports de l\'utilisateur');
    }
};

export const approveReport = async (reportId) => {
    try {
        return await api.patch(`/admin/reports/${reportId}/status`, { status: 'APPROVED' });
    } catch (error) {
        throw new Error('Erreur lors de l\'approbation du rapport');
    }
};

export const rejectReport = async (reportId) => {
    try {
        return await api.patch(`/admin/reports/${reportId}/status`, { status: 'REJECTED' });
    } catch (error) {
        throw new Error('Erreur lors du rejet du rapport');
    }
};
