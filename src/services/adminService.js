import keycloak from "../Keycloak";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${keycloak.token}`,
    'Content-Type': 'application/json',
});

// USERS MANAGEMENT
export const getAllUsers = async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return response.json();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'utilisateur');
    return response.json();
};

export const inviteUser = async ({ email, firstName, lastName, role, membershipService }) => {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, firstName, lastName, role, membershipService }),
    });
    if (!response.ok) {
        if (response.status === 409) throw new Error('Email déjà utilisé');
        throw new Error("Erreur lors de l'invitation");
    }
    return response.json();
};

export const updateUserMembership = async (userId, membershipService) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/membership`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ membershipService }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du membership');
    return response.json();
};

// REPORTS MANAGEMENT
export const getReportsByUser = async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/reports`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des rapports de l\'utilisateur');
    return response.json();
};

export const approveReport = async (reportId) => {
    const response = await fetch(`${API_URL}/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'APPROVED' }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'approbation du rapport');
    return response.json();
};

export const rejectReport = async (reportId) => {
    const response = await fetch(`${API_URL}/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'REJECTED' }),
    });
    if (!response.ok) throw new Error('Erreur lors du rejet du rapport');
    return response.json();
};
