import api from "../lib/apiClient";

export const getUserProfile = async () => {
    try {
        const data = await api.get('/me/profile');
        return data;
    } catch (error) {
        throw new Error('Erreur lors du chargement du profil');
    }
};

export const getBasicInfo = async () => {
    try {
        const data = await api.get('/me');
        return data;
    } catch (error) {
        throw new Error('Erreur lors du chargement des infos basiques');
    }
};

export const updateMyLocation = async (latitude, longitude) => {
    try {
        const data = await api.patch('/me/location', {
            latitude: String(latitude),
            longitude: String(longitude)
        });
        return data;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour de la position');
    }
};

export const getAllUsersWithLocation = async () => {
    try {
        // Add timestamp to bypass potential API caching
        const data = await api.get(`/users/locations?t=${Date.now()}`);
        return data;
    } catch (error) {
        throw new Error('Erreur lors du chargement des positions');
    }
};

export const searchGeocode = async (query) => {
    if (!query || query.trim().length < 3) return [];
    try {
        // Safe GET request -> will trigger safe retries on network failures
        const data = await api.get(`/geocode/search?q=${encodeURIComponent(query)}`);
        return data;
    } catch (error) {
        console.error("Geocode search failed. Fallback to empty array.");
        return []; // Graceful degradation
    }
};

export const updateMyProfile = async (data) => {
    try {
        const response = await api.patch('/me/profile', data);
        return response;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour du profil');
    }
};
