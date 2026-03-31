import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Trash2 } from 'lucide-react';
import { getMyReports, deleteReport } from '../../services/reportService';

const Badge = ({ status }) => {
    const styles = {
        SUBMITTED: 'bg-blue-100 text-blue-800',
        APPROVED:  'bg-green-100 text-green-800',
        REJECTED:  'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const ReportsList = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getMyReports();
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Supprimer ce rapport ?')) return;
        try {
            await deleteReport(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchFilter =
            filter === 'All' ||
            (filter === 'Submitted' && report.reportStatus === 'SUBMITTED') ||
            (filter === 'Approved'  && report.reportStatus === 'APPROVED')  ||
            (filter === 'Rejected'  && report.reportStatus === 'REJECTED');
        const matchSearch =
            report.nomGestionnaire?.toLowerCase().includes(search.toLowerCase()) ||
            report.serviceAppartenance?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Mes rapports</h1>
                    <p className="text-sm text-gray-500">Suivez et gérez vos rapports d'activités.</p>
                </div>
                <button
                    onClick={() => navigate('/reports/new')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                    <Plus size={18} /> Nouveau rapport
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-md">
                    {['All', 'Submitted', 'Approved', 'Rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                filter === status
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Chargement...</div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500">{error}</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestionnaire</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <tr
                                    key={report.id}
                                    onClick={() => navigate(`/reports/${report.id}`)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center text-primary">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {report.nomGestionnaire || '—'}
                                                </div>
                                                <div className="text-xs text-gray-400">#{report.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {report.serviceAppartenance || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(report.reportDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge status={report.reportStatus} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => handleDelete(e, report.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && !error && filteredReports.length === 0 && (
                    <div className="p-12 text-center text-gray-500">Aucun rapport trouvé.</div>
                )}
            </div>
        </div>
    );
};

export default ReportsList;