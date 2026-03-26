import keycloak from "../Keycloak";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${keycloak.token}`,
});

export const createMeeting = async (data) => {
    const response = await fetch(`${API_URL}/meetings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la création du meeting');
    return response.json();
};

export const getMyMeetings = async () => {
    const response = await fetch(`${API_URL}/meetings`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des meetings');
    return response.json();
};

export const getMeetingById = async (id) => {
    const response = await fetch(`${API_URL}/meetings/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Meeting introuvable');
    return response.json();
};

export const updateMeetingStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/meetings/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return response.json();
};

export const deleteMeeting = async (id) => {
    const response = await fetch(`${API_URL}/meetings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Erreur lors de la suppression');
    }
    return response.json();
};