import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, ArrowLeft, Trash2, MessageSquare, 
    FileText, Download, CheckCircle, XCircle, Loader2, TrendingUp,
    Phone, Briefcase, Calendar, Users, Building2, Mail, GraduationCap, Map
} from 'lucide-react';
import { getReportsByUser, deleteUser, approveReport, rejectReport, getAllUsers } from '../../services/adminService';
import { downloadReport } from '../../services/reportService';
import { getOrCreateConversation } from '../../services/chatService';
import keycloak from '../../Keycloak';

const API_URL = import.meta.env.VITE_API_URL;

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [reports, setReports] = useState([]);
    const [score, setScore] = useState(null);
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

            // Récupère le profil complet avec les nouveaux attributs
            const profileRes = await fetch(`${API_URL}/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${keycloak.token}` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setUserProfile(profileData);
            }

            const approved = reportsData.filter(r => r.reportStatus === 'APPROVED').length;
            const rejected = reportsData.filter(r => r.reportStatus === 'REJECTED').length;
            setScore(approved * 4 - rejected * 5);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return <div className="p-4 text-red-600">{error}</div>;

    const scoreColor = score >= 0 ? 'text-green-700' : 'text-red-700';
    const scoreBg    = score >= 0 ? 'bg-green-50'    : 'bg-red-50';

    const InfoRow = ({ label, value }) => (
        <div className="flex justify-between text-sm py-2 border-b border-gray-50">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium text-right max-w-[180px] truncate ${value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                {value || 'Non renseigné'}
            </span>
        </div>
    );

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="h-28 w-28 rounded-full bg-accent border-4 border-white flex items-center justify-center shadow-lg shadow-primary/10 text-white font-bold text-5xl mb-6">
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{user?.fullName || '—'}</h2>
                        <p className="text-sm text-gray-500 mb-6 font-medium">{user?.email || '—'}</p>

                        <div className="w-full space-y-3 mb-8">
                            <InfoRow label="Service" value={user?.membershipService && user.membershipService.trim() !== "" ? user.membershipService : null} />
                            <InfoRow label="Rôle" value={user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'} />
                            <div className="flex justify-between items-center text-sm py-3 border-b border-gray-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score d'engagement</span>
                                <div className="flex items-center gap-2">
                                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${scoreBg}`}>
                                        <TrendingUp size={14} className={scoreColor} />
                                    </div>
                                    <span className={`font-black ${scoreColor}`}>
                                        {score !== null ? `${score >= 0 ? '+' : ''}${score} pts` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">
                            <button onClick={handleChat} className="flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all text-xs font-black uppercase tracking-widest">
                                <MessageSquare size={16} /> Chat
                            </button>
                            <button onClick={handleDeleteUser} className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-xs font-black uppercase tracking-widest">
                                <Trash2 size={16} /> Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Fiche & Reports */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Fiche d'identification au format grilles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: "1. Identité & Contact", icon: User, fields: [
                                { label: 'Genre',             value: userProfile?.genre,          icon: Users },
                                { label: 'Date de naissance', value: userProfile?.dateNaissance,  icon: Calendar },
                                { label: 'Contact N°1',       value: userProfile?.contact1,       icon: Phone },
                                { label: 'Contact N°2',       value: userProfile?.contact2,       icon: Phone },
                                { label: 'Email Secondaire',  value: userProfile?.emailSecondaire,icon: Mail },
                            ]},
                            { title: "2. Professionnel", icon: Briefcase, fields: [
                                { label: 'Département',       value: userProfile?.departement,    icon: Building2 },
                                { label: 'Poste occupé',      value: userProfile?.posteOccupe,    icon: Briefcase },
                                { label: 'Date de nomination',value: userProfile?.dateNomination, icon: Calendar },
                            ]},
                            { title: "3. Formation", icon: GraduationCap, fields: [
                                { label: 'Cohorte 1',         value: userProfile?.cohorte1,       icon: GraduationCap },
                                { label: 'Cohorte 2',         value: userProfile?.cohorte2,       icon: GraduationCap },
                                { label: "Date d'installation",value: userProfile?.dateInstallation,icon: Calendar },
                                { label: 'Date de formation', value: userProfile?.dateFormation,  icon: Calendar },
                                { label: 'Dernière MàJ',      value: userProfile?.derniereMiseANiveau, icon: Calendar },
                            ]},
                            { title: "4. Gestion & Carto", icon: Map, fields: [
                                { label: 'Sites gérés',       value: userProfile?.nombreSitesGeres, icon: Map },
                                { label: 'Type de bâtiment',  value: userProfile?.typeBatiment,     icon: Building2 },
                            ]}
                        ].map((section, idx) => (
                            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <section.icon size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{section.title}</h3>
                                </div>
                                <div className="space-y-4">
                                    {section.fields.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <item.icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{item.label}</p>
                                                <p className={`text-xs font-bold truncate ${item.value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                                    {item.value || 'Non renseigné'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reports List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Rapports Soumis</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report.id} onClick={() => navigate(`/reports/${report.id}`)} className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition-all cursor-pointer bg-gray-50/50 hover:bg-white group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">
                                                    {report.nomGestionnaire || 'Sans nom'}
                                                </h4>
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1">
                                                    {report.reportDate ? new Date(report.reportDate).toLocaleDateString('fr-FR') : '—'} · {report.serviceAppartenance || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            report.reportStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            report.reportStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {report.reportStatus}
                                        </span>
                                    </div>

                                    <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-2 pl-14">
                                        {report.contraintes || "Aucune contrainte fournie."}
                                    </p>

                                    <div className="flex items-center justify-between pl-14">
                                        <div className="flex gap-3">
                                            {report.illustrationsName && (
                                                <button onClick={(e) => { e.stopPropagation(); downloadReport(report.id, 'illustrations', report.illustrationsName); }} className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                                    <Download size={12} /> {report.illustrationsName}
                                                </button>
                                            )}
                                            {report.autresDocumentsName && (
                                                <button onClick={(e) => { e.stopPropagation(); downloadReport(report.id, 'autresDocuments', report.autresDocumentsName); }} className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                                    <Download size={12} /> {report.autresDocumentsName}
                                                </button>
                                            )}
                                        </div>

                                        {report.reportStatus === 'SUBMITTED' && (
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleApprove(report.id); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                                                    <CheckCircle size={14} /> Approuver
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleReject(report.id); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-[10px] font-black uppercase tracking-widest">
                                                    <XCircle size={14} /> Rejeter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-sm font-bold text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-2xl">
                                    Cet utilisateur n'a soumis aucun rapport
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