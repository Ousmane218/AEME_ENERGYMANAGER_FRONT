import keycloak from "../Keycloak";

const API_URL = 'http://localhost:8081/api/v1'; //Will use .env

const getAuthHeaders = () => ({
    Authorization: `Bearer ${keycloak.token}`,
});

export const createReport = async (formData) => {
    const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });
    if (!response.ok) throw new Error('Erreur lors de la création du rapport');
    return response.json();
};

export const getMyReports = async (reportType = '') => {
    const url = reportType
        ? `${API_URL}/reports?reportType=${reportType}`
        : `${API_URL}/reports`;
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des rapports');
    return response.json();
};

export const deleteReport = async (id) => {
    const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return response.json();
};

export const getReportById = async (id) => {
    const response = await fetch(`${API_URL}/reports/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Erreur lors du chargement du rapport');

    return response.json();
};

export const downloadReport = async (id, fileName) => {
    const response = await fetch(`${API_URL}/reports/${id}/download`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du téléchargement');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};