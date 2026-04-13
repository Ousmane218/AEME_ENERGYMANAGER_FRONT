import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Mail, User, Building2, Shield, Star, LogOut,
    Loader2, Hash, Copy, Check, MapPin, X, Search,
    Edit2, Phone, Briefcase, Calendar, Users, FileText, CheckCircle, GraduationCap, Map
} from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateMyLocation, updateMyProfile } from '../services/profileService';
import keycloak from '../Keycloak';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SENEGAL_CENTER = [14.4974, -14.4524];
const API_URL = import.meta.env.VITE_API_URL;

const LocationPicker = ({ onPick }) => {
    useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
    return null;
};

const MapRecenter = ({ coords }) => {
    const map = useMap();
    useEffect(() => { if (coords) map.flyTo(coords, 16); }, [coords]);
    return null;
};

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile]               = useState(null);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState(null);
    const [copied, setCopied]                 = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showEditModal, setShowEditModal]   = useState(false);
    const [locationSaved, setLocationSaved]   = useState(false);
    const [editSaving, setEditSaving]         = useState(false);
    const [editSaved, setEditSaved]           = useState(false);
    const [pickedCoords, setPickedCoords]     = useState(null);
    const [searchQuery, setSearchQuery]       = useState('');
    const [searchResults, setSearchResults]   = useState([]);
    const [searching, setSearching]           = useState(false);
    const searchTimeoutRef                    = useRef(null);

    const [editForm, setEditForm] = useState({
        genre: '', dateNaissance: '', contact1: '', contact2: '', emailSecondaire: '',
        departement: '', posteOccupe: '', dateNomination: '',
        cohorte1: '', cohorte2: '', dateInstallation: '', dateFormation: '',
        derniereMiseANiveau: '', nombreSitesGeres: '', typeBatiment: ''
    });

    useEffect(() => {
        let mounted = true;
        getUserProfile()
            .then(data => {
                if (!mounted) return;
                setProfile(data);
                setEditForm({
                    genre:               data.genre               || '',
                    dateNaissance:       data.dateNaissance       || '',
                    contact1:            data.contact1            || '',
                    contact2:            data.contact2            || '',
                    emailSecondaire:     data.emailSecondaire     || '',
                    departement:         data.departement         || '',
                    posteOccupe:         data.posteOccupe         || '',
                    dateNomination:      data.dateNomination      || '',
                    cohorte1:            data.cohorte1            || '',
                    cohorte2:            data.cohorte2            || '',
                    dateInstallation:    data.dateInstallation    || '',
                    dateFormation:       data.dateFormation       || '',
                    derniereMiseANiveau: data.derniereMiseANiveau || '',
                    nombreSitesGeres:    data.nombreSitesGeres    || '',
                    typeBatiment:        data.typeBatiment        || '',
                });
                if (data.serviceLatitude && data.serviceLongitude) {
                    setPickedCoords([parseFloat(data.serviceLatitude), parseFloat(data.serviceLongitude)]);
                }
            })
            .catch(err => { if (mounted) setError(err.message); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
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

    const handlePickLocation = async (lat, lng) => {
        setPickedCoords([lat, lng]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
        } catch { alert('Erreur lors de la sauvegarde de la position'); }
    };

    const handleSearch = async (query) => {
        if (!query.trim() || query.length < 3) { setSearchResults([]); return; }
        try {
            setSearching(true);
            const res = await fetch(
                `${API_URL}/geocode/search?q=${encodeURIComponent(query)}`,
                { headers: { Authorization: `Bearer ${keycloak.token}` } }
            );
            const data = await res.json();
            setSearchResults(data);
        } catch { setSearchResults([]); }
        finally { setSearching(false); }
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => handleSearch(val), 500);
    };

    const handleSelectResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPickedCoords([lat, lng]);
        setSearchQuery(result.display_name.split(',')[0]);
        setSearchResults([]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
        } catch { alert('Erreur lors de la sauvegarde de la position'); }
    };

    const handleCloseModal = () => {
        setShowLocationModal(false);
        setSearchQuery('');
        setSearchResults([]);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };

    const handleSaveEdit = async () => {
        try {
            setEditSaving(true);
            await updateMyProfile(editForm);
            setProfile(prev => ({ ...prev, ...editForm }));
            setEditSaved(true);
            setTimeout(() => {
                setEditSaved(false);
                setShowEditModal(false);
            }, 1500);
        } catch { alert('Erreur lors de la sauvegarde'); }
        finally { setEditSaving(false); }
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
        if (role === 'admin') return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                <Shield size={14} /> Admin
            </span>
        );
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <User size={14} /> Utilisateur
            </span>
        );
    };

    const getDisplayService = (u) =>
        (u?.membershipService && u.membershipService.trim() !== "")
            ? u.membershipService : "Aucun service assigné";

    const profileComplete = profile?.genre && profile?.contact1 && profile?.posteOccupe;

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
    const hasLocation = profile?.serviceLatitude && profile?.serviceLongitude;

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 bg-white border border-gray-100 shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Mon profil</h1>
                    </div>
                    <button onClick={() => setShowEditModal(true)} className="hidden md:flex items-center gap-2 bg-primary text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px]">
                        <Edit2 size={16} /> Éditer la Fiche
                    </button>
                </div>

                {/* Bannière profil incomplet */}
                {!profileComplete && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-800 uppercase tracking-widest">Fiche d'identification incomplète</p>
                                <p className="text-xs text-amber-600 font-medium mt-0.5">Veuillez renseigner toutes vos informations professionnelles obligatoires.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-[10px] font-black text-white bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20"
                        >
                            Compléter
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column - Identification Card & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden relative group">
                            <div className="h-32 bg-primary/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl"></div>
                            </div>
                            <div className="px-6 pb-8 text-center relative z-10">
                                <div className="flex justify-center -mt-16 mb-6">
                                    <div className="h-32 w-32 rounded-3xl bg-accent border-[6px] border-white flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
                                        <span className="text-white font-black text-5xl">{getInitial()}</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{displayName}</h2>
                                <p className="text-xs font-bold text-primary mb-6 uppercase tracking-widest">{displayService}</p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score d'engagement</span>
                                        <ScoreBadge score={profile?.score ?? 0} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type d'accès</span>
                                        <RoleBadge role={profile?.role} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl group/copy cursor-pointer" onClick={handleCopyId}>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Unique</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-900 truncate max-w-[100px]">{profile?.id || '—'}</span>
                                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400 group-hover/copy:text-primary transition-colors" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-red-500 hover:bg-red-50 transition-colors rounded-2xl shadow-sm border border-red-100 group"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Déconnexion</span>
                        </button>
                    </div>

                    {/* Right Column - Fiche d'identification détaillée */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* SECTION 1: Informations Identitaires et Contact */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">1. Identitaires & Contact</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Prénom & Nom',      value: displayName,             icon: User },
                                        { label: 'Genre',             value: profile?.genre,          icon: Users },
                                        { label: 'Date de naissance', value: profile?.dateNaissance,  icon: Calendar },
                                        { label: 'Contact N°1',       value: profile?.contact1,       icon: Phone },
                                        { label: 'Contact N°2',       value: profile?.contact2,       icon: Phone },
                                        { label: 'Email Institutionnel',value: profile?.email,        icon: Mail },
                                        { label: 'Email Secondaire',  value: profile?.emailSecondaire,icon: Mail },
                                    ].map((info, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <info.icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{info.label}</p>
                                                <p className={`text-xs font-bold truncate ${info.value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                                    {info.value || 'Non renseigné'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 2: Profil Professionnel et Institutionnel */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Briefcase size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">2. Professionnel</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Direction / Département', value: profile?.departement,      icon: Building2 },
                                        { label: 'Poste occupé',         value: profile?.posteOccupe,      icon: Briefcase },
                                        { label: 'Date de nomination',   value: profile?.dateNomination,   icon: Calendar },
                                    ].map((info, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <info.icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{info.label}</p>
                                                <p className={`text-xs font-bold truncate ${info.value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                                    {info.value || 'Non renseigné'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 3: Parcours de Formation */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <GraduationCap size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">3. Formation (AEME)</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Cohorte 1',               value: profile?.cohorte1,            icon: GraduationCap },
                                        { label: 'Cohorte 2',               value: profile?.cohorte2,            icon: GraduationCap },
                                        { label: 'Date d\'installation',    value: profile?.dateInstallation,    icon: Calendar },
                                        { label: 'Date de formation',       value: profile?.dateFormation,       icon: Calendar },
                                        { label: 'Dernière mise à niveau',  value: profile?.derniereMiseANiveau, icon: Calendar },
                                    ].map((info, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <info.icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{info.label}</p>
                                                <p className={`text-xs font-bold truncate ${info.value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                                    {info.value || 'Non renseigné'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 4: Périmètre de Gestion */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5 flex flex-col">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Map size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">4. Périmètre & Carto</h3>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {[
                                        { label: 'Nombre de sites gérés', value: profile?.nombreSitesGeres, icon: Map },
                                        { label: 'Type de bâtiment',      value: profile?.typeBatiment,     icon: Building2 },
                                    ].map((info, i) => (
                                        <div key={i} className="flex items-center gap-3 group">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <info.icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">{info.label}</p>
                                                <p className={`text-xs font-bold truncate ${info.value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                                    {info.value || 'Non renseigné'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-gray-50 mt-auto">
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <MapPin size={14} />
                                        {hasLocation ? 'Mettre à jour la cartographie' : 'Définir la cartographie'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Éditer Trigger */}
                        <div className="mt-8 md:hidden">
                            <button onClick={() => setShowEditModal(true)} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black px-5 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px]">
                                <Edit2 size={16} /> Mettre à jour la fiche
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edition */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto pt-10 pb-10">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden mb-10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-bold text-primary">Fiche d'identification du gestionnaire</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                            
                            {/* Section 1 */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-primary border-b pb-2">1. Informations Identitaires et Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Genre</label>
                                        <select value={editForm.genre} onChange={e => setEditForm({ ...editForm, genre: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary/30">
                                            <option value="">Sélectionner</option><option value="Homme">Homme</option><option value="Femme">Femme</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date de naissance</label>
                                        <input type="date" value={editForm.dateNaissance} onChange={e => setEditForm({ ...editForm, dateNaissance: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact N°1</label>
                                        <input type="tel" value={editForm.contact1} onChange={e => setEditForm({ ...editForm, contact1: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact N°2</label>
                                        <input type="tel" value={editForm.contact2} onChange={e => setEditForm({ ...editForm, contact2: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Email Secondaire (Personnel)</label>
                                        <input type="email" value={editForm.emailSecondaire} onChange={e => setEditForm({ ...editForm, emailSecondaire: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-primary border-b pb-2">2. Profil Professionnel et Institutionnel</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Direction / Département</label>
                                        <input type="text" value={editForm.departement} onChange={e => setEditForm({ ...editForm, departement: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Poste occupé</label>
                                        <input type="text" value={editForm.posteOccupe} onChange={e => setEditForm({ ...editForm, posteOccupe: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date de nomination</label>
                                        <input type="date" value={editForm.dateNomination} onChange={e => setEditForm({ ...editForm, dateNomination: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-primary border-b pb-2">3. Parcours de Formation (Spécifique AEME)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Cohorte 1</label>
                                        <input type="text" value={editForm.cohorte1} onChange={e => setEditForm({ ...editForm, cohorte1: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Cohorte 2</label>
                                        <input type="text" value={editForm.cohorte2} onChange={e => setEditForm({ ...editForm, cohorte2: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date d'installation</label>
                                        <input type="date" value={editForm.dateInstallation} onChange={e => setEditForm({ ...editForm, dateInstallation: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date de formation</label>
                                        <input type="text" placeholder="ex: du XX au XX /année" value={editForm.dateFormation} onChange={e => setEditForm({ ...editForm, dateFormation: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Dernière mise à niveau</label>
                                        <input type="date" value={editForm.derniereMiseANiveau} onChange={e => setEditForm({ ...editForm, derniereMiseANiveau: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-primary border-b pb-2">4. Périmètre de Gestion (Données Techniques)</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nombre de sites gérés</label>
                                        <input type="number" min="0" placeholder="Nb bâtiments/infrastructures" value={editForm.nombreSitesGeres} onChange={e => setEditForm({ ...editForm, nombreSitesGeres: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Type de bâtiment</label>
                                        <input type="text" placeholder="Bureaux, Hôpitaux, Écoles..." value={editForm.typeBatiment} onChange={e => setEditForm({ ...editForm, typeBatiment: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
                            {editSaved ? (
                                <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2 w-full">
                                    <Check size={16} /> Fiche mise à jour !
                                </p>
                            ) : (
                                <>
                                    <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50">Annuler</button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={editSaving}
                                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {editSaving && <Loader2 size={16} className="animate-spin" />}
                                        {editSaving ? 'Sauvegarde...' : 'Enregistrer la fiche'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Localisation */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-primary">Localiser mon service</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Recherchez ou cliquez sur la carte pour {displayService}
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-4 py-3 border-b border-gray-100 relative">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <Search size={15} className="text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un lieu au Sénégal..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    className="flex-1 bg-transparent text-sm outline-none"
                                />
                                {searching && <Loader2 size={14} className="animate-spin text-gray-400" />}
                                {searchQuery && !searching && (
                                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                                        <X size={14} className="text-gray-400" />
                                    </button>
                                )}
                            </div>
                            {searchResults.length > 0 && (
                                <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                    {searchResults.map((result, i) => (
                                        <button key={i} onClick={() => handleSelectResult(result)} className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b">
                                            <p className="text-sm text-gray-800 truncate">{result.display_name.split(',')[0]}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ height: '360px' }}>
                            <MapContainer center={pickedCoords || SENEGAL_CENTER} zoom={pickedCoords ? 14 : 7} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker onPick={handlePickLocation} />
                                <MapRecenter coords={pickedCoords} />
                                {pickedCoords && <Marker position={pickedCoords} />}
                            </MapContainer>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 text-center">
                            {locationSaved ? (
                                <p className="text-sm text-green-600 font-medium"><Check size={16} className="inline mr-1" /> Position sauvegardée !</p>
                            ) : (
                                <p className="text-xs text-gray-400">Recherchez ou cliquez sur la carte</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;