import api from "../lib/apiClient";

export const createReport = async (formData) => {
    try {
        // Axios va gérer le multipart form-data automatiquement s'il voit un FormData
        // ou vous pouvez définir le header Content-Type spécifiquement, mais Axios le fait.
        const data = await api.post('/reports', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        throw new Error('Erreur lors de la création du rapport');
    }
};

export const getMyReports = async () => {
    try {
        return await api.get('/reports');
    } catch (error) {
        throw new Error('Erreur lors du chargement des rapports');
    }
};

export const getReportById = async (id) => {
    try {
        return await api.get(`/reports/${id}`);
    } catch (error) {
        throw new Error('Erreur lors du chargement du rapport');
    }
};

export const deleteReport = async (id) => {
    try {
        return await api.delete(`/reports/${id}`);
    } catch (error) {
        throw new Error('Erreur lors de la suppression');
    }
};

export const downloadReport = async (id, fileType = 'illustrations', fileName) => {
    try {
        const blob = await api.get(`/reports/${id}/download/${fileType}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw new Error('Erreur lors du téléchargement');
    }
};

export const getAllReports = async () => {
    try {
        return await api.get('/reports/all');
    } catch (error) {
        throw new Error('Erreur lors du chargement des rapports');
    }
};