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
import { SENEGAL_CENTER, DAKAR_CENTER, SENEGAL_BOUNDS, AEME_HQ } from '../lib/mapUtils';
import { StructureSelector } from '../components/StructureSelector';
import keycloak from '../Keycloak';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
        cohorte: '', dateInstallation: '', dateFormation: '',
        derniereMiseANiveau: '', nombreSitesGeres: '', typeBatiment: ''
    });

    const isGeocoded = (val) => {
        if (val === null || val === undefined) return false;
        let finalVal = val;
        if (Array.isArray(val)) {
            if (val.length === 0) return false;
            finalVal = val[0];
        }
        if (typeof finalVal === 'string') {
            const trimmed = finalVal.trim();
            if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
            finalVal = trimmed;
        }
        return !isNaN(parseFloat(finalVal));
    };

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
                    cohorte:             data.cohorte             || '',
                    dateInstallation:    data.dateInstallation    || '',
                    dateFormation:       data.dateFormation       || '',
                    derniereMiseANiveau: data.derniereMiseANiveau || '',
                    nombreSitesGeres:    data.nombreSitesGeres    || '',
                    typeBatiment:        data.typeBatiment        || '',
                });
                
                if (isGeocoded(data.serviceLatitude) && isGeocoded(data.serviceLongitude)) {
                    const lat = parseFloat(Array.isArray(data.serviceLatitude) ? data.serviceLatitude[0] : data.serviceLatitude);
                    const lng = parseFloat(Array.isArray(data.serviceLongitude) ? data.serviceLongitude[0] : data.serviceLongitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        setPickedCoords([lat, lng]);
                    }
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
        if (isNaN(lat) || isNaN(lng)) return;
        setPickedCoords([lat, lng]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
        } catch { alert('Erreur lors de la sauvegarde de la position'); }
    };

    const handleCloseModal = () => {
        setShowLocationModal(false);
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
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
                {/* Simplified Header */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour</span>
                        </button>
                        <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase"><span>Mon Dossier</span></h1>
                    </div>
                    <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[10px]">
                        <Edit2 size={16} /> <span>Éditer la Fiche</span>
                    </button>
                </div>

                {/* Status Banner */}
                {!profileComplete && (
                    <div className="relative group mx-2 overflow-hidden">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative bg-amber-50/50 backdrop-blur-3xl border border-amber-200/50 rounded-[1.5rem] p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-inner">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest"><span>Action Requise</span></p>
                                    <p className="text-xs text-amber-600 font-bold mt-0.5 opacity-80"><span>Votre fiche d'identification est incomplète.</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="text-[9px] font-black text-white bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20 whitespace-nowrap"
                            >
                                <span>Compléter maintenant</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Premium Profile Hero */}
                <div className="relative group overflow-hidden">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-white/70 backdrop-blur-3xl border border-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-black/5">
                        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                            {/* Avatar Area */}
                            <div className="relative shrink-0">
                                <div className="h-36 w-36 rounded-[2.5rem] bg-accent flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-accent/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    {getInitial()}
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-50 text-primary">
                                    <Shield size={18} />
                                </div>
                            </div>

                            {/* Essential Info */}
                            <div className="flex-1 text-center lg:text-left space-y-3 md:space-y-4">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 uppercase leading-[0.9]">
                                    {displayName}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <Mail size={16} className="text-primary/40" />
                                        <span>{profile?.email || '—'}</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-gray-300 hidden sm:block" />
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-lg">
                                        <Building2 size={14} />
                                        <span>{displayService}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats & Metadata Area */}
                            <div className="flex flex-col items-center lg:items-end gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-12 w-full lg:w-auto">
                                <div className="flex items-center gap-10">
                                    <div className="text-center lg:text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><span>Score Global</span></p>
                                        <div className="flex items-center gap-2 justify-center lg:justify-end">
                                            <Star size={18} className="text-amber-500 fill-amber-500" />
                                            <span className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                                                {profile?.score ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-gray-100" />
                                    <div className="text-center lg:text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"><span>Accès</span></p>
                                        <RoleBadge role={profile?.role} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full lg:w-48 px-4 py-3 bg-gray-50/50 rounded-2xl group/copy cursor-pointer hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10" onClick={handleCopyId}>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Unique</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-900 truncate max-w-[80px] opacity-70">{profile?.id || '—'}</span>
                                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={12} className="text-gray-400 group-hover/copy:text-primary transition-colors" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High Density Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                    {[
                        { title: "1. Identitaires & Contact", icon: User, fields: [
                            { label: 'Prénom & Nom',      value: displayName,             icon: User },
                            { label: 'Genre',             value: profile?.genre,          icon: Users },
                            { label: 'Date de naissance', value: profile?.dateNaissance,  icon: Calendar },
                            { label: 'Contact N°1',       value: profile?.contact1,       icon: Phone },
                            { label: 'Contact N°2',       value: profile?.contact2,       icon: Phone },
                            { label: 'Email Secondaire',  value: profile?.emailSecondaire,icon: Mail },
                        ]},
                        { title: "2. Profil Professionnel", icon: Briefcase, fields: [
                            { label: 'Direction / Département', value: profile?.departement,      icon: Building2 },
                            { label: 'Poste occupé',         value: profile?.posteOccupe,      icon: Briefcase },
                            { label: 'Date de nomination',   value: profile?.dateNomination,   icon: Calendar },
                        ]},
                        { title: "3. Expertise & Formations", icon: GraduationCap, fields: [
                            { label: 'Cohorte',                 value: profile?.cohorte,             icon: GraduationCap },
                            { label: 'Date d\'installation',    value: profile?.dateInstallation,    icon: Calendar },
                            { label: 'Date de formation',       value: profile?.dateFormation,       icon: Calendar },
                            { label: 'Dernière mise à niveau',  value: profile?.derniereMiseANiveau, icon: Calendar },
                        ]},
                        { title: "4. Périmètre & Carto", icon: Map, fields: [
                            { label: 'Sites gérés', value: profile?.nombreSitesGeres, icon: Map },
                            { label: 'Bâtiment',   value: profile?.typeBatiment,     icon: Building2 },
                        ], hasAction: true, actionLabel: hasLocation ? 'Mettre à jour position' : 'Définir position', onAction: () => setShowLocationModal(true) }
                    ].map((section, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
                            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-gray-100">
                                        <section.icon size={16} />
                                    </div>
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]"><span>{section.title}</span></h3>
                                </div>
                                {section.hasAction && (
                                    <span className={`h-2 w-2 rounded-full ${hasLocation ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                                )}
                            </div>
                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                                {section.fields.map((info, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <info.icon size={12} />
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{info.label}</p>
                                            <p className={`text-[12px] font-bold truncate ${info.value ? 'text-gray-900' : 'text-gray-300 italic'}`}>
                                                {info.value || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {section.hasAction && (
                                <div className="px-8 pb-8 pt-2">
                                    <button
                                        onClick={section.onAction}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                                    >
                                        <MapPin size={14} />
                                        <span>{section.actionLabel}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="px-2 pt-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white text-red-500 hover:bg-red-50 transition-all rounded-[2rem] shadow-sm border border-red-50 group border-dashed"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Déconnexion du portail</span>
                    </button>
                </div>

                {/* Mobile Éditer Trigger */}
                <div className="mt-8 md:hidden px-2">
                    <button onClick={() => setShowEditModal(true)} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black px-5 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px]">
                        <Edit2 size={16} /> Mettre à jour la fiche
                    </button>
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
                                <h4 className="text-sm font-bold text-primary border-b pb-2">3. Parcours & Certifications</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Cohorte (Formation)</label>
                                        <input type="text" placeholder="Ex: Cohorte 2024, Session Spéciale..." value={editForm.cohorte} onChange={e => setEditForm({ ...editForm, cohorte: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2" />
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

            {/* Modal Localisation (Updated to Structure Selection) */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
                            <div>
                                <h2 className="text-xl font-black text-primary uppercase tracking-tight">Rattachement à une Structure</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    Sélectionnez votre structure officielle pour la géolocalisation.
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                    Choisir dans le référentiel
                                </label>
                                <StructureSelector 
                                    onSelect={async (s) => {
                                        try {
                                            setSearching(true);
                                            // We update BOTH the name and the coordinates
                                            // The backend updateMyLocation might need to be enhanced to also update the name
                                            // For now we use the lat/lng and we'll assume the name is updated via updateMyProfile if needed
                                            await updateMyLocation(parseFloat(s.latitude), parseFloat(s.longitude));
                                            
                                            // Update the name too via updateMyProfile to keep consistency
                                            await updateMyProfile({ membershipService: s.name });
                                            
                                            setProfile(prev => ({ 
                                                ...prev, 
                                                membershipService: s.name,
                                                serviceLatitude: s.latitude,
                                                serviceLongitude: s.longitude
                                            }));
                                            setPickedCoords([parseFloat(s.latitude), parseFloat(s.longitude)]);
                                            
                                            setLocationSaved(true);
                                            setTimeout(() => {
                                                setLocationSaved(false);
                                                handleCloseModal();
                                            }, 1500);
                                        } catch (err) {
                                            alert("Erreur lors du rattachement : " + err.message);
                                        } finally {
                                            setSearching(false);
                                        }
                                    }}
                                />
                            </div>

                            {locationSaved ? (
                                <div className="flex items-center justify-center gap-3 py-4 bg-green-50 rounded-2xl border border-green-100 animate-in slide-in-from-bottom-4">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span className="text-sm font-bold text-green-700">Rattachement réussi !</span>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4 border border-dashed border-gray-200">
                                    <MapPin size={20} className="text-primary/40 shrink-0 mt-1" />
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                        En choisissant une structure, votre position sur la carte nationale sera automatiquement synchronisée avec les coordonnées officielles de l'établissement.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/50 flex justify-end">
                            <Button variant="ghost" onClick={handleCloseModal} className="font-bold text-xs uppercase tracking-widest text-gray-400">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;