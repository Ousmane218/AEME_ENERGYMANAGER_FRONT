import api from "../lib/apiClient";

/**
 * Service for managing energy management structures
 */

export const getAllStructures = async () => {
    try {
        return await api.get('/structures');
    } catch {
        throw new Error('Erreur lors du chargement des structures');
    }
};

export const getStructureById = async (id) => {
    try {
        return await api.get(`/structures/${id}`);
    } catch {
        throw new Error('Structure introuvable');
    }
};

export const createStructure = async (data) => {
    try {
        return await api.post('/structures', data);
    } catch {
        throw new Error('Erreur lors de la création de la structure');
    }
};

export const updateStructure = async (id, data) => {
    try {
        return await api.patch(`/structures/${id}`, data);
    } catch {
        throw new Error('Erreur lors de la mise à jour de la structure');
    }
};

export const deleteStructure = async (id) => {
    try {
        return await api.delete(`/structures/${id}`);
    } catch {
        throw new Error('Erreur lors de la suppression de la structure');
    }
};
