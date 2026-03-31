import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Mail, User, Building2, Shield, 
    Star, LogOut, FileText, ExternalLink, Calendar, 
    MapPin, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/profileService';
import { getMyReports } from '../services/reportService';

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const [profileData, reportsData] = await Promise.all([
                getUserProfile(),
                getMyReports()
            ]);
            setProfile(profileData);
            setReports(reportsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitial = () => {
        if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
        if (profile?.username) return profile.username.charAt(0).toUpperCase();
        return '?';
    };

    const ScoreBadge = ({ score }) => {
        const color = score >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${color}`}>
                {score >= 0 ? '+' : ''}{score} pts
            </span>
        );
    };

    const RoleBadge = ({ role }) => {
        if (role === 'admin') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Shield size={14} />
                    Admin
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <User size={14} />
                Utilisateur
            </span>
        );
    };

    const getDisplayService = (u) => {
        return (u?.membershipService && u.membershipService.trim() !== "") ? u.membershipService : "Aucun service assigné";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error) return <div className="p-4 text-red-600 font-medium">{error}</div>;

    const displayService = getDisplayService(profile);
    const displayName = profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Utilisateur';

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-primary">Mon profil</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Identification Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-24 bg-primary" />
                        <div className="px-6 pb-8 text-center">
                            <div className="flex justify-center -mt-10 mb-4">
                                <div className="h-24 w-24 rounded-full bg-accent border-4 border-white flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-4xl">
                                        {getInitial()}
                                    </span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                            <p className="text-sm text-gray-500 mb-6">{displayService}</p>
                            
                            <div className="flex items-center justify-center gap-2">
                                <ScoreBadge score={profile?.score ?? 0} />
                                <RoleBadge role={profile?.role} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Infos détaillées</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Username', value: profile?.username, icon: User },
                                { label: 'Email', value: profile?.email, icon: Mail },
                                { label: 'Prénom', value: profile?.firstName, icon: User },
                                { label: 'Nom', value: profile?.lastName, icon: User },
                                { label: 'Service', value: displayService, icon: Building2 },
                                { label: 'Score', value: `${profile?.score ?? 0} points`, icon: Star }
                            ].map((info, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                                        <info.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{info.label}</p>
                                        <p className="text-sm font-medium text-gray-800 truncate">{info.value || '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-6 py-4 bg-white text-red-500 hover:bg-red-50 transition-colors rounded-3xl shadow-sm border border-gray-100 group"
                    >
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 group-hover:scale-110 transition-transform">
                            <LogOut size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold">Déconnexion</p>
                            <p className="text-[10px] text-gray-400">Fermer la session actuelle</p>
                        </div>
                    </button>
                </div>

                {/* Reports History */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} className="text-primary" />
                            Mes rapports récents
                        </h2>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                            {reports.length} rapports
                        </span>
                    </div>

                    <div className="space-y-3">
                        {reports.length > 0 ? reports.map(report => (
                            <div 
                                key={report.id} 
                                onClick={() => navigate(`/reports/${report.id}`)}
                                className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">
                                            {report.nomGestionnaire || 'Sans nom'}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <Calendar size={12} />
                                                {report.reportDate
                                                    ? new Date(report.reportDate).toLocaleDateString('fr-FR')
                                                    : '—'}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <Building2 size={12} />
                                                {report.serviceAppartenance || '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                        report.reportStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        report.reportStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                        {report.reportStatus}
                                    </span>
                                    <ExternalLink size={14} className="text-gray-200 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        )) : (
                            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                <FileText size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium">Aucun rapport soumis pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
