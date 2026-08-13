import api, { API_ROOT_URL } from "../lib/apiClient";

export const getCurrentProfile = async () => {
    return await api.get(`${API_ROOT_URL}/api/v2/me`);
};

export const updateMyProfile = async (data) => {
    try {
        return await api.patch(`${API_ROOT_URL}/api/v2/me`, data);
    } catch {
        throw new Error('Erreur lors de la mise à jour du profil');
    }
};
