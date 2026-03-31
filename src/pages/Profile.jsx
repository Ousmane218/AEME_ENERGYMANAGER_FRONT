import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Mail, User, Building2, Shield, 
    Star, LogOut, Loader2, Hash, Copy, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/profileService';

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getUserProfile()
            .then(setProfile)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const getInitial = () => {
        if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
        if (profile?.username)  return profile.username.charAt(0).toUpperCase();
        return '?';
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(profile?.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
        return (u?.membershipService && u.membershipService.trim() !== "")
            ? u.membershipService
            : "Aucun service assigné";
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return <div className="p-4 text-red-600 font-medium">{error}</div>;

    const displayService = getDisplayService(profile);
    const displayName = profile?.fullName
        || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
        || 'Utilisateur';

    return (
        <div className="max-w-lg mx-auto space-y-6">

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

            {/* Infos détaillées */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                    Infos détaillées
                </h3>

                {/* Mon ID */}
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                        <Hash size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Mon ID</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{profile?.id || '—'}</p>
                    </div>
                    <button
                        onClick={handleCopyId}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                        title="Copier l'ID"
                    >
                        {copied
                            ? <Check size={15} className="text-green-500" />
                            : <Copy size={15} className="text-gray-400 hover:text-primary" />
                        }
                    </button>
                </div>

                {/* Autres infos */}
                {[
                    { label: 'Username', value: profile?.username,  icon: User },
                    { label: 'Email',    value: profile?.email,     icon: Mail },
                    { label: 'Prénom',   value: profile?.firstName, icon: User },
                    { label: 'Nom',      value: profile?.lastName,  icon: User },
                    { label: 'Service',  value: displayService,     icon: Building2 },
                    { label: 'Score',    value: `${profile?.score ?? 0} points`, icon: Star },
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

            {/* Logout */}
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
    );
};

export default Profile;