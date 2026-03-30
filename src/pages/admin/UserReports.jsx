import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, XCircle, Download, Loader2, Calendar } from 'lucide-react';
import { getReportsByUser, approveReport, rejectReport } from '../../services/adminService';
import { downloadReport } from '../../services/reportService';

const UserReports = () => {
    const { userId } = useParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, [userId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getReportsByUser(userId);
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (reportId) => {
        try {
            setActionLoading(reportId);
            await approveReport(reportId);
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'APPROVED' } : r));
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (reportId) => {
        try {
            setActionLoading(reportId);
            await rejectReport(reportId);
            setReports(reports.map(r => r.id === reportId ? { ...r, reportStatus: 'REJECTED' } : r));
        } catch (err) {
            alert('Erreur: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = (report) => {
        downloadReport(report.id, report.fileName || `rapport-${report.id}.pdf`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-100"
                >
                    <ArrowLeft size={20} className="text-primary" />
                </button>
                <h1 className="text-2xl font-bold text-primary">Rapports de l'utilisateur</h1>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                {reports.length > 0 ? reports.map((report) => (
                    <div key={report.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 h-fit">
                                <FileText size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-gray-900">{report.title || 'Sans titre'}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {report.date || new Date(report.createdAt).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span className={`font-medium ${
                                        report.reportStatus === 'APPROVED' ? 'text-green-600' : 
                                        report.reportStatus === 'REJECTED' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                        {report.reportStatus || 'EN ATTENTE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleDownload(report)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
                            >
                                <Download size={18} />
                                Télécharger
                            </button>
                            
                            {(!report.reportStatus || report.reportStatus === 'PENDING' || report.reportStatus === 'EN ATTENTE' || report.reportStatus === 'SUBMITTED') && (
                                <>
                                    <button
                                        onClick={() => handleApprove(report.id)}
                                        disabled={actionLoading === report.id}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {actionLoading === report.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        Approuver
                                    </button>
                                    
                                    <button
                                        onClick={() => handleReject(report.id)}
                                        disabled={actionLoading === report.id}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {actionLoading === report.id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                                        Rejeter
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                        Aucun rapport trouvé pour cet utilisateur.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReports;
