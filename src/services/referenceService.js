import api from "../lib/apiClient";

export const getAllMinisteres = async () => {
    try {
        const response = await api.get('/ministeres');
        return response; // assuming it returns an array
    } catch {
        throw new Error('Erreur lors du chargement des ministères');
    }
};

export const getAllCohortes = async () => {
    try {
        const response = await api.get('/cohortes');
        return response; // assuming it returns an array
    } catch {
        throw new Error('Erreur lors du chargement des cohortes');
    }
};
