import api from "../lib/apiClient";

/**
 * Service to manage Structures (Bureaus/Departments)
 * Interacts with the backend /structures endpoints
 */

/**
 * Fetches all available structures.
 * Returns an empty array if the response is malformed to prevent UI crashes.
 */
export const getAllStructures = async () => {
    try {
        const data = await api.get('/structures');
        // Defensive check: ensure the UI always receives an array
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching structures:", error);
        throw new Error('Erreur lors du chargement des structures');
    }
};

/**
 * Fetches a specific structure by its unique ID.
 */
export const getStructureById = async (id) => {
    try {
        if (!id) throw new Error('ID de structure manquant');
        return await api.get(`/structures/${id}`);
    } catch (error) {
        console.error(`Error fetching structure ${id}:`, error);
        throw new Error('Structure introuvable');
    }
};
