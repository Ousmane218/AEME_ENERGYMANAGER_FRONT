import api, { API_ROOT_URL } from "../lib/apiClient";

export const createMeeting = async (data) => {
    try {
        return await api.post('/meetings', data);
    } catch {
        throw new Error('Erreur lors de la création du meeting');
    }
};

export const getMyMeetings = async () => {
    try {
        return await api.get('/meetings');
    } catch {
        throw new Error('Erreur lors du chargement des meetings');
    }
};

export const getMeetingById = async (id) => {
    try {
        return await api.get(`/meetings/${id}`);
    } catch {
        throw new Error('Meeting introuvable');
    }
};

export const updateMeetingStatus = async (id, status) => {
    try {
        return await api.patch(`/meetings/${id}/status`, { status });
    } catch {
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
export const createGlobalMeeting = async (data) => {
    try {
        return await api.post(`${API_ROOT_URL}/api/v2/admin/meetings/global`, data);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du meeting global');
    }
};

export const createMinistereMeeting = async (data) => {
    try {
        return await api.post(`${API_ROOT_URL}/api/v2/admin/meetings/ministere`, data);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du meeting ministère');
    }
};

export const createStructureMeeting = async (data) => {
    try {
        return await api.post(`${API_ROOT_URL}/api/v2/admin/meetings/structure`, data);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du meeting structure');
    }
};

export const createCohortMeeting = async (data) => {
    try {
        return await api.post(`${API_ROOT_URL}/api/v2/admin/meetings/cohort`, data);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du meeting cohorte');
    }
};

export const updateManagedMeetingStatus = async (id, status) => {
    try {
        return await api.patch(`${API_ROOT_URL}/api/v2/admin/meetings/${id}/status`, { status });
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour (manage)');
    }
};

export const deleteManagedMeeting = async (id) => {
    try {
        return await api.delete(`${API_ROOT_URL}/api/v2/admin/meetings/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression (manage)');
    }
};

export const isManagedMeeting = (meeting) => {
    return ['GLOBAL', 'MINISTERE', 'STRUCTURE', 'COHORT'].includes(meeting?.type);
};
