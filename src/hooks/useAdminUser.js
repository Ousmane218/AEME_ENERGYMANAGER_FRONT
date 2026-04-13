import { useState, useEffect } from 'react';
import { getReportsByUser, getAllUsers, deleteUser, approveReport, rejectReport } from '../services/adminService';
import { getOrCreateConversation } from '../services/chatService';

export const useAdminUser = (userId, navigate) => {
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [allUsers, reportsData] = await Promise.all([
                    getAllUsers(),
                    getReportsByUser(userId)
                ]);
                const userData = allUsers.find(u => u.id === userId);
                setUser(userData);
                setReports(reportsData || []);
                const approved = (reportsData || []).filter(r => r.reportStatus === 'APPROVED').length;
                const rejected = (reportsData || []).filter(r => r.reportStatus === 'REJECTED').length;
                setScore(approved * 4 - rejected * 5);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleChat = async () => {
        try {
            const conv = await getOrCreateConversation(userId);
            navigate('/chat', { state: { conversationId: conv.id } });
        } catch (err) {
            alert('Erreur lors de la création de la conversation');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
        try {
            await deleteUser(userId);
            navigate('/admin/users');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleApprove = async (reportId) => {
        try {
            await approveReport(reportId);
            const updated = reports.map(r => r.id === reportId ? { ...r, reportStatus: 'APPROVED' } : r);
            setReports(updated);
            const approved = updated.filter(r => r.reportStatus === 'APPROVED').length;
            const rejected = updated.filter(r => r.reportStatus === 'REJECTED').length;
            setScore(approved * 4 - rejected * 5);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (reportId) => {
        try {
            await rejectReport(reportId);
            const updated = reports.map(r => r.id === reportId ? { ...r, reportStatus: 'REJECTED' } : r);
            setReports(updated);
            const approved = updated.filter(r => r.reportStatus === 'APPROVED').length;
            const rejected = updated.filter(r => r.reportStatus === 'REJECTED').length;
            setScore(approved * 4 - rejected * 5);
        } catch (err) {
            alert(err.message);
        }
    };

    return {
        user,
        reports,
        score,
        loading,
        error,
        handleChat,
        handleDeleteUser,
        handleApprove,
        handleReject
    };
};
