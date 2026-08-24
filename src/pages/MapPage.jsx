import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { Loader2, MapPin, RefreshCw, MessageSquare, FileText, User, Building2, Building2 as HQIcon, Search, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { getAllUsers, getStatsByRegion } from '../services/adminService';
import { getAllStructures } from '../services/structureService';
import { SENEGAL_CENTER, SENEGAL_BOUNDS, REFERENCE_MARKERS } from '../lib/mapUtils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation, searchChatUsers } from '../services/chatService';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MapController = ({ selectedCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedCoords) {
            map.flyTo(selectedCoords, 14, { duration: 1.5 });
        }
    }, [selectedCoords, map]);
    return null;
};

const MapPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]     = useState(null);
    const [regionalStats, setRegionalStats] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoords, setSelectedCoords] = useState(null);
    const markerRefs = useRef({});

    const filteredMarkers = searchQuery.trim().length > 0
        ? markers.filter(m => {
            const q = searchQuery.toLowerCase().trim();
            if (m.name?.toLowerCase().includes(q)) return true;
            if (m.ministere?.toLowerCase().includes(q)) return true;
            if (m.region?.toLowerCase().includes(q)) return true;
            if (m.members?.some(mem =>
                mem.name?.toLowerCase().includes(q) ||
                mem.email?.toLowerCase().includes(q)
            )) return true;
            return false;
        }).slice(0, 8)
        : [];

    const handleSelectResult = (m) => {
        setSelectedCoords(m.coords);
        setSearchQuery('');

        // Wait for flyTo to complete roughly before opening popup
        setTimeout(() => {
            if (markerRefs.current[m.id]) {
                markerRefs.current[m.id].openPopup();
            }
        }, 1500);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const stats = await getStatsByRegion();
                setRegionalStats(stats || []);
            } catch (err) {
                console.error("Failed to fetch regional stats", err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const fetchMarkers = useCallback(async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            else setLoading(true);

            const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.isAdmin;

            const structuresPromise = getAllStructures().catch(() => []);

            const fetchAllAdminUsers = async () => {
                let collectedUsers = [];
                let page = 0;
                let hasMore = true;
                while (hasMore && page < 20) {
                    try {
                        const res = await getAllUsers(page, 100);
                        const content = res?.content || res?.users || [];
                        collectedUsers = [...collectedUsers, ...content];
                        if (content.length < 100) hasMore = false;
                        page++;
                    } catch (err) {
                        console.error("Failed to fetch users page", page, err);
                        break;
                    }
                }
                return collectedUsers;
            };

            const [structures, fetchedUsers] = await Promise.all([
                structuresPromise,
                isAdmin ? fetchAllAdminUsers() : Promise.resolve([])
            ]);

            const allStructures = structures || [];
            const allUsers = fetchedUsers || [];

            const structureMarkers = allStructures
                .filter(s => s.latitude && s.longitude)
                .map(s => {
                    const lat = parseFloat(s.latitude);
                    const lng = parseFloat(s.longitude);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    const members = isAdmin ? allUsers.filter(u => u.structure?.id === s.id).map(u => ({
                        id: u.id,
                        keycloakId: u.keycloakId,
                        email: u.email,
                        name: `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email,
                        role: u.role
                    })) : [];

                    return {
                        id: s.id,
                        name: s.name || s.nom,
                        ministere: s.ministere?.nom || '',
                        region: s.region || '',
                        coords: [lat, lng],
                        type: 'STRUCTURE',
                        members
                    };
                })
                .filter(Boolean);

            setMarkers(structureMarkers);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMarkers();
    }, [fetchMarkers]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <MapPin className="text-primary" size={32} />
                        Carte des Services
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                        Cartographie des structures (V2)
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-3xl overflow-hidden flex flex-col relative">
                {/* Fixed Top-Right Tools */}
                <div className="absolute top-4 right-4 z-[20] flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="white"
                        onClick={() => fetchMarkers(true)}
                        disabled={refreshing || loading}
                        className={cn(
                            "h-12 w-12 rounded-2xl shadow-2xl bg-white/90 backdrop-blur-md border-white/50 hover:bg-white transition-all group",
                            refreshing && "opacity-70"
                        )}
                        title="Actualiser la carte"
                    >
                        <RefreshCw
                            size={20}
                            className={cn(
                                "text-primary group-hover:rotate-180 transition-transform duration-500",
                                refreshing && "animate-spin"
                            )}
                        />
                    </Button>
                </div>

                {/* Search Overlay */}
                <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-80px)] max-w-sm">
                    <div className="relative">
                        <div className="flex items-center gap-2 px-3 py-3 bg-white shadow-xl border border-gray-100 rounded-2xl focus-within:border-primary/50 focus-within:ring-4 ring-primary/10 transition-all">
                            <Search size={18} className="text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Rechercher une structure ou un gestionnaire..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 font-medium w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X size={14} className="text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.trim().length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[1000] overflow-hidden max-h-[300px] overflow-y-auto">
                                {filteredMarkers.length === 0 ? (
                                    <div className="p-4 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aucun résultat</p>
                                    </div>
                                ) : (
                                    filteredMarkers.map((m, idx) => {
                                        const q = searchQuery.toLowerCase().trim();
                                        const matchedMember = m.members?.find(mem =>
                                            mem.name?.toLowerCase().includes(q) || mem.email?.toLowerCase().includes(q)
                                        );

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelectResult(m)}
                                                className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                        <Building2 size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-900 truncate">
                                                            {m.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{m.region || 'Sénégal'}</span>
                                                        </div>
                                                        {matchedMember && (
                                                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                                                <User size={12} className="text-primary/60" />
                                                                <span className="text-gray-600 font-medium truncate">{matchedMember.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="relative w-full h-[600px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50/50">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground"><span>Chargement des positions...</span></p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm font-bold bg-red-50">
                            {error}
                        </div>
                    ) : markers.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50">
                            <MapPin size={48} className="text-gray-300 mb-2" />
                            <p className="text-sm font-bold text-gray-600"><span>Aucune structure localisée.</span></p>
                        </div>
                    ) : (
                        <MapContainer
                            center={SENEGAL_CENTER}
                            zoom={7}
                            minZoom={7}
                            maxBounds={SENEGAL_BOUNDS}
                            maxBoundsViscosity={1.0}
                            className="h-[450px] md:h-[650px] w-full"
                            style={{ zIndex: 10 }}
                            zoomControl={false}
                        >
                            <ZoomControl position="bottomright" />
                            <MapController selectedCoords={selectedCoords} />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Reference HQ Markers (Always Visible) */}
                            {REFERENCE_MARKERS.map((ref) => (
                                <Marker
                                    key={ref.id}
                                    position={ref.coords}
                                    icon={L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div class="h-8 w-8 bg-amber-500 rounded-2xl shadow-xl border-2 border-white flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1 2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg></div>`,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32]
                                    })}
                                >
                                    <Popup>
                                        <div className="p-2 sm:p-3 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                                <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg">
                                                    <HQIcon size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-900 uppercase tracking-tight text-[10px] leading-tight">
                                                        {ref.name}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Siège Administratif</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 italic leading-relaxed">
                                                {ref.address}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {markers.map((m, i) => (
                                <Marker
                                    key={i}
                                    position={m.coords}
                                    ref={(r) => { if (r) markerRefs.current[m.id] = r; }}
                                >
                                    <Popup>
                                        <div className="text-sm min-w-[220px] p-1">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Building2 size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-900 uppercase tracking-tight text-[11px] truncate">
                                                        {m.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{m.region}</span>
                                                        <span className="h-0.5 w-0.5 rounded-full bg-gray-200" />
                                                        <span className="text-[8px] text-gray-500 font-medium truncate">{m.ministere}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {currentUser?.isAdmin || currentUser?.role === 'ADMIN' ? (
                                                <>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.15em] mb-3">
                                                        Gestionnaires ({m.members.length})
                                                    </p>

                                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 customize-scrollbar">
                                                        {m.members.map((member, j) => (
                                                            <div key={j} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50 space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-6 w-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-bold text-primary">
                                                                        {member.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-gray-700 truncate">
                                                                        {member.name}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="flex-1 h-7 text-[9px] font-black uppercase tracking-widest gap-2 bg-white text-primary hover:bg-primary/10 hover:text-primary border border-gray-100 shadow-sm"
                                                                        onClick={async () => {
                                                                            if (!member.email) {
                                                                                alert('Aucun email disponible pour cet utilisateur.');
                                                                                return;
                                                                            }
                                                                            try {
                                                                                const results = await searchChatUsers(member.email);
                                                                                const targetUser = results?.find(u => u.email === member.email) || (results?.length > 0 ? results[0] : null);
                                                                                if (!targetUser?.userId) {
                                                                                    alert('Utilisateur introuvable dans le module Chat.');
                                                                                    return;
                                                                                }
                                                                                const conv = await getOrCreateConversation(targetUser.userId);
                                                                                navigate('/chat', { state: { conversationId: conv.id } });
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                                alert('Erreur lors de la création du chat');
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MessageSquare size={12} /> <span>Messagerie</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="flex-1 h-7 text-[9px] font-black uppercase tracking-widest gap-2 bg-white text-accent hover:bg-accent/10 hover:text-accent border border-gray-100 shadow-sm"
                                                                        onClick={() => {
                                                                            if (currentUser?.isAdmin || currentUser?.role === 'ADMIN') {
                                                                                navigate(`/admin/users/${member.id}`);
                                                                            } else if (member.id === currentUser?.id) {
                                                                                navigate('/profile');
                                                                            } else {
                                                                                navigate(`/reports?userId=${member.id}`);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <FileText size={12} /> <span>Rapports</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {/* Footer Component info */}
                {!loading && !error && markers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {markers.length} structure(s) localisée(s)
                        </p>
                        <p className="text-xs text-gray-400">
                            Données © OpenStreetMap
                        </p>
                    </div>
                )}
            </Card>

            {/* Regional Stats Section */}
            <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                            Répartition Régionale
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                            Couverture nationale des experts et infrastructures
                        </p>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-gray-100 via-gray-100 to-transparent hidden md:block mx-8 mb-2" />
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold py-1 px-4 self-start md:self-auto">
                        {regionalStats.length} RÉGIONS ACTIVES
                    </Badge>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="h-32 bg-gray-50/50 border-none animate-pulse" />
                        ))}
                    </div>
                ) : regionalStats.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucune donnée statistique disponible</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {regionalStats.map((stat, idx) => (
                            <Card key={idx} className="group overflow-hidden border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white p-6">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover:text-primary transition-colors">
                                        {stat.region}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gestionnaires</p>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-primary/40" />
                                                <span className="text-xl font-black text-gray-900">{stat.gestionnaires}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Structures</p>
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-accent/40" />
                                                <span className="text-xl font-black text-gray-900">{stat.structures}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;
