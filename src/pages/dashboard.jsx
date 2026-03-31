import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, MessageSquare, ChevronRight, AlertCircle, TrendingUp, Building2 } from 'lucide-react';
import { getUserProfile } from '../services/profileService';
import { getMyReports, getAllReports } from '../services/reportService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myReports, setMyReports] = useState([]);
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getUserProfile(), getMyReports(), getAllReports()])
            .then(([profileData, myReportsData, allReportsData]) => {
                setProfile(profileData);
                setMyReports(myReportsData);
                setAllReports(allReportsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const approved = myReports.filter(r => r.reportStatus === 'APPROVED').length;
    const rejected = myReports.filter(r => r.reportStatus === 'REJECTED').length;

    const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const statusStyle = (status) => {
        if (status === 'APPROVED') return { badge: 'bg-green-50 text-green-700', label: 'Approuvé' };
        if (status === 'REJECTED') return { badge: 'bg-red-50 text-red-700',     label: 'Rejeté' };
        return { badge: 'bg-blue-50 text-blue-700', label: 'En attente' };
    };

    const quickLinks = [
        { label: 'Nouveau rapport',       icon: FileText,      path: '/reports/new',  color: '#185FA5', bg: '#E6F1FB' },
        { label: 'Planifier une réunion', icon: Calendar,      path: '/meetings/new', color: '#0F6E56', bg: '#E1F5EE' },
        { label: 'Messagerie',            icon: MessageSquare, path: '/chat',         color: '#854F0B', bg: '#FAEEDA' },
    ];

    const score      = profile?.score ?? 0;
    const scoreColor = score >= 0 ? 'text-green-700' : 'text-red-700';
    const scoreBg    = score >= 0 ? '#EAF3DE' : '#FCEBEB';
    const scoreIcon  = score >= 0 ? '#3B6D11' : '#A32D2D';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60)   return "À l'instant";
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        {loading ? 'Tableau de bord' : `Bonjour, ${profile?.firstName || 'Utilisateur'} !`}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Agence pour l'Économie et la Maîtrise de l'Énergie — Espace gestionnaire
                    </p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 hidden md:block">
                    {today}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Rapports soumis', value: myReports.length, sub: 'Total',              color: 'text-gray-800' },
                    { label: 'Approuvés',        value: approved,         sub: "Validés par l'AEME", color: 'text-green-700' },
                    { label: 'Rejetés',          value: rejected,         sub: 'À corriger',         color: 'text-red-700' },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Rappel mensuel + Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
                    style={{ borderLeft: '3px solid #1D9E75' }}
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-green-700 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">Rappel mensuel</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Soumettez votre rapport d'activités avant le 05 du mois suivant.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/reports/new')}
                        className="text-xs font-medium text-white px-4 py-2 rounded-lg flex-shrink-0 transition-colors hover:opacity-90"
                        style={{ background: '#1D9E75' }}
                    >
                        Soumettre
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: scoreBg }}
                    >
                        <TrendingUp size={20} style={{ color: scoreIcon }} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Score actuel</p>
                        <p className={`text-2xl font-bold ${scoreColor}`}>
                            {loading ? '—' : `${score >= 0 ? '+' : ''}${score} pts`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {score >= 0 ? 'Bonne progression' : 'À améliorer'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Layout principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

                {/* Feed — tous les reports — 2/3 */}
                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Activité récente
                        </p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {allReports.length} rapports
                        </span>
                    </div>

                    {loading ? (
                        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-400">
                            Chargement...
                        </div>
                    ) : allReports.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
                            <FileText size={32} className="mx-auto mb-3 opacity-20" />
                            Aucun rapport soumis pour le moment.
                        </div>
                    ) : (
                        allReports
                            .slice()
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map(report => {
                                const { badge, label } = statusStyle(report.reportStatus);
                                return (
                                    <div
                                        key={report.id}
                                        onClick={() => navigate(`/reports/${report.id}`)}
                                        className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all"
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                                                    {report.nomGestionnaire?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {report.nomGestionnaire || 'Sans nom'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {formatDate(report.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md flex-shrink-0 ${badge}`}>
                                                {label}
                                            </span>
                                        </div>

                                        {/* Infos */}
                                        <div className="flex items-center gap-4 mb-3 pl-12">
                                            {report.serviceAppartenance && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Building2 size={12} />
                                                    {report.serviceAppartenance}
                                                </span>
                                            )}
                                            {report.reportDate && (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar size={12} />
                                                    {new Date(report.reportDate).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Contraintes */}
                                        {report.contraintes && (
                                            <p className="text-sm text-gray-600 pl-12 line-clamp-2">
                                                {report.contraintes}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                    )}
                </div>

                {/* Colonne droite — 1/3 */}
                <div className="flex flex-col gap-4">

                    {/* Accès rapide */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Accès rapide
                            </p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {quickLinks.map((link, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(link.path)}
                                    className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: link.bg }}
                                        >
                                            <link.icon size={14} style={{ color: link.color }} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-800">{link.label}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prochaines réunions */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Prochaines réunions
                            </p>
                        </div>
                        <div className="px-5 py-8 text-center text-sm text-gray-400">
                            Aucune réunion planifiée.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;