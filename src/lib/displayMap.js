export const getReportStatusLabel = (status) => {
    switch (status) {
        case 'SUBMITTED': return 'Soumis';
        case 'APPROVED': return 'Approuvé';
        case 'REJECTED': return 'Rejeté';
        case 'DRAFT': return 'Brouillon';
        case 'PENDING':
        case 'EN_ATTENTE': return 'En attente';
        default: return status || 'En attente';
    }
};

export const getAccountStatusLabel = (status) => {
    switch (status) {
        case 'ACTIVE': return 'Actif';
        case 'INACTIVE': return 'Inactif';
        default: return status;
    }
};

export const getRoleLabel = (role) => {
    switch (role) {
        case 'ADMIN': return 'Administrateur';
        case 'GESTIONNAIRE': return 'Gestionnaire';
        case 'DAGE': return 'DAGE';
        default: return role || 'Gestionnaire';
    }
};

export const getScopeLabel = (scope) => {
    switch (scope) {
        case 'GLOBAL': return 'Global';
        case 'COHORT': return 'Cohorte';
        case 'STRUCTURE': return 'Structure';
        case 'MINISTERE': return 'Ministère';
        default: return scope;
    }
};
