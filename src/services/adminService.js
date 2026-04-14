import api from "../lib/apiClient";

// USERS MANAGEMENT
export const getAllUsers = async () => {
    try {
        return await api.get('/admin/users');
    } catch (error) {
        throw new Error('Erreur lors du chargement des utilisateurs');
    }
};

export const getUserAuthProfile = async (userId) => {
    try {
        // Direct access to the auth profile (Keycloak attributes)
        return await api.get(`/auth/users/${userId}`);
    } catch (error) {
        console.warn(`Could not fetch auth profile for user ${userId}`);
        return null;
    }
};

export const deleteUser = async (userId) => {
    try {
        return await api.delete(`/admin/users/${userId}`);
    } catch (error) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
};

export const inviteUser = async ({ email, firstName, lastName, role, membershipService, serviceLatitude, serviceLongitude }) => {
    try {
        const payload = { 
            email, 
            firstName, 
            lastName, 
            role, 
            membershipService,
            // Shotgun approach: send under multiple names to ensure backend/Keycloak mapping
            serviceLatitude: serviceLatitude ? String(serviceLatitude) : null,
            serviceLongitude: serviceLongitude ? String(serviceLongitude) : null,
            latitude: serviceLatitude ? String(serviceLatitude) : null,
            longitude: serviceLongitude ? String(serviceLongitude) : null
        };

        return await api.post('/admin/users', payload);
    } catch (error) {
        if (error.response && error.response.status === 409) {
            throw new Error('Email déjà utilisé');
        }
        throw new Error("Erreur lors de l'invitation");
    }
};

export const updateUserMembership = async (userId, { membershipService, serviceLatitude, serviceLongitude }) => {
    try {
        const payload = { 
            membershipService,
            serviceLatitude: serviceLatitude ? String(serviceLatitude) : null,
            serviceLongitude: serviceLongitude ? String(serviceLongitude) : null,
            latitude: serviceLatitude ? String(serviceLatitude) : null,
            longitude: serviceLongitude ? String(serviceLongitude) : null
        };

        return await api.patch(`/admin/users/${userId}/membership`, payload);
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
