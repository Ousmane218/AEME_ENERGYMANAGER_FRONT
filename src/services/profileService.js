import keycloak from "../Keycloak";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${keycloak.token}`,
});

export const getUserProfile = async () => {
    const response = await fetch(`${API_URL}/me/profile`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement du profil');
    return response.json();
};

export const getBasicInfo = async () => {
    const response = await fetch(`${API_URL}/me`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des infos basiques');
    return response.json();
};
