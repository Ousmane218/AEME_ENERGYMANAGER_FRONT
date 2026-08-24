import api from '../lib/apiClient';

export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data || response;
    } catch {
        throw new Error('Impossible de charger les notifications.');
    }
};

export const getUnreadNotificationCount = async () => {
    try {
        const response = await api.get('/notifications/unread-count');
        return response.data || response;
    } catch {
        throw new Error('Impossible de charger les notifications.');
    }
};

export const markNotificationAsRead = async (id) => {
    try {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data || response;
    } catch {
        throw new Error('Impossible de mettre à jour la notification.');
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.patch('/notifications/read-all');
        return response.data || response;
    } catch {
        throw new Error('Impossible de mettre à jour la notification.');
    }
};
