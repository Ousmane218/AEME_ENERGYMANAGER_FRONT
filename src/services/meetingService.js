import api from "../lib/apiClient";

export const createMeeting = async (data) => {
    try {
        return await api.post('/meetings', data);
    } catch (error) {
        throw new Error('Erreur lors de la création du meeting');
    }
};

export const getMyMeetings = async () => {
    try {
        return await api.get('/meetings');
    } catch (error) {
        throw new Error('Erreur lors du chargement des meetings');
    }
};

export const getMeetingById = async (id) => {
    try {
        return await api.get(`/meetings/${id}`);
    } catch (error) {
        throw new Error('Meeting introuvable');
    }
};

export const updateMeetingStatus = async (id, status) => {
    try {
        return await api.patch(`/meetings/${id}/status`, { status });
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour');
    }
};

export const deleteMeeting = async (id) => {
    try {
        return await api.delete(`/meetings/${id}`);
    } catch (error) {
        const errMessage = error.response?.data?.message || 'Erreur lors de la suppression';
        throw new Error(errMessage);
    }
};