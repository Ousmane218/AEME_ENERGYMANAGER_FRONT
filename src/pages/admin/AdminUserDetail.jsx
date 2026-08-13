import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, ArrowLeft, MessageSquare, Shield,
    FileText, CheckCircle, XCircle, Loader2, TrendingUp,
    Phone, Briefcase, Calendar, Users, Building2, Mail, GraduationCap, Map, MapPin
} from 'lucide-react';
import { getReportsByUser, approveReport, rejectReport, getUserById, updateUserActivation } from '../../services/adminService';
import { getOrCreateConversation } from '../../services/chatService';
import { cn } from "@/lib/utils";

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [userData, reportsData] = await Promise.all([
                getUserById(userId),
                getReportsByUser(userId)
            ]);

            setUser(userData);
            setReports(reportsData);

            const approved = reportsData.filter(r => r.reportStatus === 'APPROVED').length;
            const rejected = reportsData.filter(r => r.reportStatus === 'REJECTED').length;
            setScore(approved * 4 - rejected * 5);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const handleChat = async () => {
        if (!user?.keycloakId) {
            alert('Impossible de démarrer le chat : identité Keycloak manquante.');
            return;
        }
        try {
            const conv = await getOrCreateConversation(user.keycloakId);
            navigate('/chat', { state: { conversationId: conv.id } });
        } catch {
            alert('Erreur lors de la création de la conversation');
        }
    };

    const handleToggleActivation = async () => {
        const action = user?.actif ? 'désactiver' : 'réactiver';
        if (!window.confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
        try {
            await updateUserActivation(userId, !user?.actif);
            fetchData();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Erreur lors de la modification';
            alert(message);
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
        } catch (e) {
            alert(e.message);
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
        } catch (e) {
            alert(e.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return <div className="p-4 text-red-600">{error}</div>;

    const scoreColor = score >= 0 ? 'text-green-700' : 'text-red-700';
    const locationName = user?.structure?.name || user?.ministere?.nom || 'Sans Service';
    const hasCoordinates = user?.structure && (user.structure.latitudeV2 || user.structure.latitude);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Minimal Navigation Header */}
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Retour
                </button>
                <div className="h-0.5 flex-1 mx-8 bg-gradient-to-r from-gray-100/50 via-gray-100 to-gray-100/50 rounded-full" />
            </div>

            {/* Premium Hero Banner */}
            <div className="relative group overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white/70 backdrop-blur-3xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-black/5">
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* Avatar Area */}
                        <div className="relative shrink-0">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-accent flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-accent/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                {user?.prenom ? user.prenom.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-50 text-primary">
                                <Shield size={18} />
                            </div>
                        </div>

                        {/* Essential Info */}
                        <div className="flex-1 text-center lg:text-left space-y-2">
                            <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase leading-none">
                                {user?.prenom} {user?.nom}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                    <Mail size={16} className="text-primary/40" />
                                    {user?.email || '—'}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block" />
                                <div
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-lg cursor-default"
                                >
                                    <Building2 size={14} />
                                    <span>{locationName}</span>
                                    <MapPin size={12} className={cn("ml-1", hasCoordinates ? "text-green-500 fill-green-500" : "text-gray-300")} />
                                </div>
                            </div>
                        </div>

                        {/* Status & Actions Area */}
                        <div className="flex flex-col items-center lg:items-end gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-12 w-full lg:w-auto">
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                <div className="text-center sm:text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact Score</p>
                                    <div className="flex items-center gap-2 justify-center sm:justify-end">
                                        <TrendingUp size={16} className={scoreColor} />
                                        <span className={`text-2xl font-black ${scoreColor}`}>
                                            {score !== null ? `${score >= 0 ? '+' : ''}${score}` : '0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden sm:block h-10 w-px bg-gray-100" />
                                <div className="text-center sm:text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Accès</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                {user?.keycloakId && (
                                    <button
                                        onClick={handleChat}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        <MessageSquare size={16} /> <span>Chat Direct</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleToggleActivation}
                                    className={cn("w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl hover:text-white transition-all group font-black text-[10px] uppercase tracking-widest border", user?.actif ? "bg-red-50 text-red-500 hover:bg-red-500 border-red-100/50" : "bg-green-50 text-green-500 hover:bg-green-500 border-green-100/50")}
                                >
                                    {user?.actif ? <XCircle size={16} /> : <CheckCircle size={16} />} <span className="sm:hidden">{user?.actif ? 'Désactiver' : 'Réactiver'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[
                    { title: "1. Identité & Contact", icon: User, fields: [
                        { label: 'Genre',             value: user?.genre,          icon: Users },
                        { label: 'Date de naissance', value: user?.dateNaissance,  icon: Calendar },
                        { label: 'Contact Principal', value: user?.telephonePrincipal,       icon: Phone },
                        { label: 'Contact Secondaire',value: user?.telephoneSecondaire,       icon: Phone },
                        { label: 'Email Alternatif',  value: user?.emailSecondaire,icon: Mail },
                    ]},
                    { title: "2. Profil Professionnel", icon: Briefcase, fields: [
                        { label: 'Département',       value: user?.departementAdministratif,    icon: Building2 },
                        { label: 'Poste occupé',      value: user?.posteOccupe,    icon: Briefcase },
                        { label: 'Date de nomination',value: user?.dateNomination, icon: Calendar },
                    ]},
                    { title: "3. Formation & Expertise", icon: GraduationCap, fields: [
                        { label: 'Cohorte',           value: user?.cohorte?.name || user?.cohorte?.nom,        icon: GraduationCap },
                        { label: 'Mise à niveau',     value: user?.derniereMiseANiveau, icon: TrendingUp },
                        { label: "Date d'installation",value: user?.dateInstallation,icon: Calendar },
                        { label: 'Date de formation', value: user?.dateFormation,  icon: Calendar },
                    ]},
                    { title: "4. Périmètre de Gestion", icon: Map, fields: [
                        { label: 'Sites gérés',       value: user?.nombreSitesGeres, icon: Map },
                        { label: 'Type de bâtiment',  value: user?.typeBatiment,     icon: Building2 },
                    ]}
                ].map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
                        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
                                    <section.icon size={16} />
                                </div>
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{section.title}</h3>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                            {section.fields.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                                        <item.icon size={12} />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{item.label}</p>
                                        <p className={`text-[12px] font-bold truncate ${item.value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                                            {item.value || 'Non renseigné'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Reports Section with Internal Scrolling */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                        Archive des Rapports
                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] rounded-lg text-gray-400">{reports.length}</span>
                    </h3>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto px-4 py-8 customize-scrollbar">
                        {reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <div
                                        key={report.id}
                                        onClick={() => navigate(`/reports/${report.id}`)}
                                        className="p-6 border border-gray-100 rounded-[1.5rem] hover:border-primary/20 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer bg-gray-50/30 hover:bg-white group"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                                <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-[13px] group-hover:text-primary transition-colors truncate">
                                                        Rapport du {report.reportDate ? new Date(report.reportDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                                    </h4>
                                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mt-1">
                                                        {report.serviceAppartenance || 'Service non défini'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                    report.reportStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    report.reportStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                                }`}>
                                                    {report.reportStatus === 'APPROVED' ? 'Approuvé' :
                                                     report.reportStatus === 'REJECTED' ? 'Rejeté' : 'Soumis'}
                                                </span>

                                                {report.reportStatus === 'SUBMITTED' && (
                                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleApprove(report.id); }}
                                                            className="h-9 w-9 bg-green-500 text-white rounded-xl flex items-center justify-center hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all font-black text-[10px] uppercase tracking-widest px-8 min-w-[120px]"
                                                        >
                                                            <CheckCircle size={14} className="mr-2" /> Approuver
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleReject(report.id); }}
                                                            className="h-9 w-9 bg-red-50 text-red-700 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all font-black text-[10px] uppercase tracking-widest px-8 min-w-[100px]"
                                                        >
                                                            Rejeter
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="h-10 w-10 flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 transition-all">
                                                    <ArrowLeft className="rotate-180" size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
                                    <FileText size={40} />
                                </div>
                                <p className="text-sm font-black text-gray-300 uppercase tracking-[0.2em]">Aucun rapport soumis par cet utilisateur</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;