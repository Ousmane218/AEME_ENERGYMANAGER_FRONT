import api from "../lib/apiClient";

export const getOrCreateConversation = async (otherUserId) => {
    try {
        return await api.post('/chat/conversations', { otherUserId });
    } catch (error) {
        throw new Error('Erreur lors de la création de la conversation');
    }
};

export const getMyConversations = async () => {
    try {
        return await api.get('/chat/conversations');
    } catch (error) {
        throw new Error('Erreur lors du chargement des conversations');
    }
};

export const getMessages = async (conversationId) => {
    try {
        return await api.get(`/chat/conversations/${conversationId}/messages`);
    } catch (error) {
        throw new Error('Erreur lors du chargement des messages');
    }
};

export const deleteConversation = async (id) => {
    try {
        return await api.delete(`/chat/conversations/${id}`);
    } catch (error) {
        throw new Error('Erreur lors de la suppression');
    }
};

export const getUserById = async (userId) => {
    if (!userId || userId === '_' || userId === 'undefined') {
        return { fullName: 'Utilisateur inconnu' };
    }
    try {
        return await api.get(`/auth/users/${userId}`);
    } catch (error) {
        return { fullName: 'Utilisateur' };
    }
};