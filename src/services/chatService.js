import api from "../lib/apiClient";

export const getOrCreateConversation = async (otherUserId) => {
    try {
        return await api.post('/chat/conversations', { otherUserId });
    } catch {
        throw new Error('Erreur lors de la création de la conversation');
    }
};

export const getMyConversations = async () => {
    try {
        return await api.get('/chat/conversations');
    } catch {
        throw new Error('Erreur lors du chargement des conversations');
    }
};

export const getMessages = async (conversationId) => {
    try {
        return await api.get(`/chat/conversations/${conversationId}/messages`);
    } catch {
        throw new Error('Erreur lors du chargement des messages');
    }
};

export const deleteConversation = async (id) => {
    try {
        return await api.delete(`/chat/conversations/${id}`);
    } catch {
        throw new Error('Erreur lors de la suppression');
    }
};


export const getConversationCounterpart = async (conversationId) => {
    if (!conversationId) {
        return { fullName: 'Utilisateur' };
    }
    try {
        const response = await api.get(`/chat/conversations/${conversationId}/counterpart`);
        return response; // Assuming interceptor returns data directly or we return the whole object
    } catch {
        return { fullName: 'Utilisateur' };
    }
};

export const getAdminGroups = async () => {
    try {
        const response = await api.get('/admin/chat/groups');
        return response.data || response;
    } catch {
        throw new Error('Erreur lors du chargement des groupes gérés');
    }
};

export const createGlobalGroup = async (name) => {
    try {
        const response = await api.post('/admin/chat/groups/global', { name });
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la création du groupe Global');
    }
};

export const createCohortGroup = async (referenceId, name) => {
    try {
        const response = await api.post('/admin/chat/groups/cohort', { referenceId, name });
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la création du groupe Cohorte');
    }
};

export const createStructureGroup = async (referenceId, name) => {
    try {
        const response = await api.post('/admin/chat/groups/structure', { referenceId, name });
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la création du groupe Structure');
    }
};


export const createMinistereGroup = async (referenceId, name) => {
    try {
        const response = await api.post('/admin/chat/groups/ministere', { referenceId, name });
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la création du groupe Ministère');
    }
};

export const syncGroupMembers = async (id) => {
    try {
        const response = await api.post(`/admin/chat/groups/${id}/sync-members`);
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la synchronisation des membres');
    }
};

export const archiveGroup = async (id) => {
    try {
        const response = await api.patch(`/admin/chat/groups/${id}/archive`);
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de l\'archivage du groupe');
    }
};

export const reactivateGroup = async (id) => {
    try {
        const response = await api.patch(`/admin/chat/groups/${id}/reactivate`);
        return response.data || response;
    } catch {
        throw new Error('Erreur lors de la réactivation du groupe');
    }
};

export const searchChatUsers = async (query) => {
    try {
        return await api.get(`/chat/users/search?q=${encodeURIComponent(query)}`);
    } catch {
        throw new Error('Erreur lors de la recherche utilisateur');
    }
};
