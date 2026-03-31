import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, ArrowLeft, Trash2, MessageSquare, 
    FileText, Download, CheckCircle, XCircle, Loader2 
} from 'lucide-react';
import { getReportsByUser, deleteUser, approveReport, rejectReport, getAllUsers } from '../../services/adminService';
import { downloadReport } from '../../services/reportService';

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allUsers, reportsData] = await Promise.all([
                getAllUsers(),
                getReportsByUser(userId)
            ]);
            const userData = allUsers.find(u => u.id === userId);
            setUser(userData);
            setReports(reportsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'APPROVED' } : r));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (reportId) => {
        try {
            await rejectReport(reportId);
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'REJECTED' } : r));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-primary">Détails de l'utilisateur</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <User size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.fullName || '—'}</h2>
                            <p className="text-gray-500 text-sm mb-6">{user?.email || '—'}</p>
                            
                            <div className="w-full space-y-3 mb-6">
                                <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium text-gray-900">
                                        {user?.membershipService && user.membershipService.trim() !== ""
                                            ? user.membershipService
                                            : 'Aucun service assigné'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                                    <span className="text-gray-500">Rôle</span>
                                    <span className="font-medium text-gray-900 capitalize">
                                        {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                    </span>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="flex items-center justify-center gap-2 p-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                                >
                                    <MessageSquare size={18} />
                                    Chat
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                >
                                    <Trash2 size={18} />
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 italic text-gray-500 text-sm">
                            Rapports soumis par l'utilisateur
                        </div>
                        <div className="space-y-2 p-2">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report.id} className="p-6 hover:bg-gray-50/50 transition-colors border border-gray-100 rounded-xl m-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    {report.nomGestionnaire || 'Sans nom'}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {report.reportDate
                                                        ? new Date(report.reportDate).toLocaleDateString('fr-FR')
                                                        : '—'} · {report.serviceAppartenance || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            report.reportStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            report.reportStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {report.reportStatus}
                                        </span>
                                    </div>

                                    {/* Contraintes */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {report.contraintes || "Aucune contrainte fournie."}
                                    </p>

                                    {/* Fichiers */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-3">
                                            {report.illustrationsName && (
                                                <button
                                                    onClick={() => downloadReport(report.id, 'illustrations', report.illustrationsName)}
                                                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                                                >
                                                    <Download size={16} />
                                                    {report.illustrationsName}
                                                </button>
                                            )}
                                            {report.autresDocumentsName && (
                                                <button
                                                    onClick={() => downloadReport(report.id, 'autresDocuments', report.autresDocumentsName)}
                                                    className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                                                >
                                                    <Download size={16} />
                                                    {report.autresDocumentsName}
                                                </button>
                                            )}
                                            {!report.illustrationsName && !report.autresDocumentsName && (
                                                <span className="text-xs text-gray-400">Aucun fichier joint</span>
                                            )}
                                        </div>

                                        {report.reportStatus === 'SUBMITTED' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(report.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-semibold"
                                                >
                                                    <CheckCircle size={14} />
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleReject(report.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-semibold"
                                                >
                                                    <XCircle size={14} />
                                                    Rejeter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-gray-400">
                                    Cet utilisateur n'a soumis aucun rapport.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;