import api from "../lib/apiClient";

export const getAllMinisteres = async () => {
    try {
        const response = await api.get('/ministeres');
        return response; // assuming it returns an array
    } catch {
        throw new Error('Erreur lors du chargement des ministères');
    }
};

export const createMinistere = async (data) => {
    try {
        const response = await api.post('/ministeres', data);
        return response;
    } catch {
        throw new Error('Erreur lors de la création du ministère');
    }
};

export const updateMinistere = async (id, data) => {
    try {
        const response = await api.patch(`/ministeres/${id}`, data);
        return response;
    } catch {
        throw new Error('Erreur lors de la mise à jour du ministère');
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

export const createCohorte = async (data) => {
    try {
        const response = await api.post('/cohortes', data);
        return response;
    } catch {
        throw new Error('Erreur lors de la création de la cohorte');
    }
};

export const updateCohorte = async (id, data) => {
    try {
        const response = await api.patch(`/cohortes/${id}`, data);
        return response;
    } catch {
        throw new Error('Erreur lors de la mise à jour de la cohorte');
    }
};
