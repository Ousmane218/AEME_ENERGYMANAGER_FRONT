import { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { Loader2, MapPin, RefreshCw, MessageSquare, FileText, User, UserPlus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getAllUsersWithLocation, searchGeocode } from '../services/profileService';
import { getAllUsers, getUserAuthProfile } from '../services/adminService';
import { SENEGAL_CENTER, groupByService, REFERENCE_MARKERS } from '../lib/mapUtils';
import { Card } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation } from '../services/chatService';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, X, Building2 as HQIcon } from 'lucide-react';

const MapRecenter = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 15, { animate: true, duration: 1.5 });
        }
    }, [coords, map]);
    return null;
};

const MapPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [rawData, setRawData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [error, setError]     = useState(null);
    const [debugMode, setDebugMode] = useState(false);

    // Address Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [pickedLocation, setPickedLocation] = useState(null);

    const fetchMarkers = useCallback(async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            else setLoading(true);
            
            // 1. Fetch standard locations
            let users = await getAllUsersWithLocation() || [];
            
            // 2. Admin Enrichment: Show users who haven't validated their email (like Daouda)
            if (currentUser?.isAdmin) {
                setEnriching(true);
                try {
                    const allUsers = await getAllUsers();
                    const existingIds = new Set(users.map(u => u.id));
                    
                    // Find users with a service who are NOT in the active locations list
                    const missingUsers = allUsers.filter(u => 
                        !existingIds.has(u.id) && 
                        (u.membershipService && u.membershipService.trim() !== '')
                    );

                    if (missingUsers.length > 0) {
                        // Fetch their detailed Keycloak profiles in parallel (limit to 10 for performance)
                        const enrichmentResults = await Promise.all(
                            missingUsers.slice(0, 10).map(async (u) => {
                                const authProfile = await getUserAuthProfile(u.id);
                                if (authProfile) {
                                    return { ...u, ...authProfile, isPending: true };
                                }
                                return null;
                            })
                        );
                        
                        const enrichedUsers = enrichmentResults.filter(u => {
                            if (!u || !u.serviceLatitude) return false;
                            // Check for empty Keycloak arrays or "null" strings
                            const lat = u.serviceLatitude;
                            if (Array.isArray(lat)) return lat.length > 0 && lat[0] !== '' && lat[0] !== 'null';
                            return String(lat).trim() !== '' && String(lat) !== 'null';
                        });
                        users = [...users, ...enrichedUsers];
                    }
                } catch (adminErr) {
                    console.warn("Failed to enrich map data:", adminErr);
                } finally {
                    setEnriching(false);
                }
            }

            setRawData(users);
            setMarkers(groupByService(users));
            setError(null);
        } catch (err) {
            setError('Impossible de charger les positions.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser]);

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (!val.trim() || val.length < 3) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const results = await searchGeocode(val);
            setSearchResults(results || []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
            setPickedLocation([lat, lon]);
            setSearchQuery(result.display_name.split(',')[0]);
            setSearchResults([]);
        }
    };

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
                        Localisation globale des infrastructures AEME
                    </p>
                </div>
                
                {currentUser?.isAdmin && (
                    <div className="flex items-center gap-3">
                        {enriching && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-lg animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Sychronisation Keycloak...</span>
                            </div>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDebugMode(!debugMode)}
                            className={cn(
                                "h-8 w-8 p-0 rounded-lg text-gray-300 hover:text-primary transition-colors",
                                debugMode && "text-amber-500 bg-amber-50"
                            )}
                            title="Outils de diagnostic"
                        >
                            <FileText size={14} />
                        </Button>
                    </div>
                )}
            </div>

            {/* Diagnostic Panel - Now more compact */}
            {debugMode && (
                <Card className="p-4 border-amber-100 bg-amber-50/10 rounded-2xl animate-in slide-in-from-top-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[9px] font-bold">
                            <thead>
                                <tr className="border-b border-amber-100 text-amber-400 uppercase tracking-tighter">
                                    <th className="text-left py-1">Utilisateur</th>
                                    <th className="text-left py-1">Statut</th>
                                    <th className="text-left py-1">serviceLatitude</th>
                                    <th className="text-left py-1">serviceLongitude</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-50">
                                {rawData.map((u, i) => (
                                    <tr key={i} className="hover:bg-white/50 transition-colors">
                                        <td className="py-1.5 text-gray-900"><span>{u.fullName || u.email}</span></td>
                                        <td className="py-1.5">
                                            {u.isPending ? (
                                                <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded uppercase"><span>Invité</span></span>
                                            ) : (
                                                <span className="text-green-500 bg-green-50 px-1.5 py-0.5 rounded uppercase"><span>Actif</span></span>
                                            )}
                                        </td>
                                        <td className="py-1.5 text-primary"><span>{String(u.serviceLatitude || '—')}</span></td>
                                        <td className="py-1.5 text-primary"><span>{String(u.serviceLongitude || '—')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

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

                {/* Floating Search Bar */}
                <div className="absolute top-4 left-4 z-[20] w-full max-w-[300px] hidden md:block">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-1.5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 rounded-xl border border-gray-100/50">
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Chercher une adresse..."
                                className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-gray-400"
                            />
                            {searching && <Loader2 size={12} className="animate-spin text-primary shrink-0" />}
                            {searchQuery && !searching && (
                                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setPickedLocation(null); }}>
                                    <X size={12} className="text-gray-400 hover:text-red-500 transition-colors" />
                                </button>
                            )}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                                {searchResults.slice(0, 5).map((res, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSelectResult(res)}
                                        className="text-left px-3 py-2 hover:bg-primary/5 rounded-lg transition-colors group"
                                    >
                                        <p className="text-[10px] font-bold text-gray-800 truncate group-hover:text-primary transition-colors">{res.display_name.split(',')[0]}</p>
                                        <p className="text-[8px] text-gray-400 truncate uppercase tracking-tighter">{res.display_name}</p>
                                    </button>
                                ))}
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
                            <p className="text-sm font-bold text-gray-600"><span>Aucun service localisé pour le moment.</span></p>
                            <p className="text-xs text-center px-8 text-gray-400">
                                <span>Les membres peuvent ajouter leur position depuis leur profil.</span>
                            </p>
                        </div>
                    ) : (
                        <MapContainer
                            center={markers.length === 1 ? markers[0].coords : SENEGAL_CENTER}
                            zoom={markers.length === 1 ? 14 : 7}
                            style={{ height: '100%', width: '100%', zIndex: 10 }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapRecenter coords={pickedLocation} />

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
                                <Marker key={i} position={m.coords}>
                                    <Popup>
                                        <div className="text-sm min-w-[220px] p-1">
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <MapPin size={16} />
                                                </div>
                                                <p className="font-black text-gray-900 uppercase tracking-tight text-[11px] truncate">
                                                    {m.service}
                                                </p>
                                            </div>
                                            
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.15em] mb-3">
                                                Membres ({m.members.length})
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
                                                                    try {
                                                                        const conv = await getOrCreateConversation(member.id);
                                                                        navigate('/chat', { state: { conversationId: conv.id } });
                                                                    } catch {
                                                                        alert('Erreur lors de la création du chat');
                                                                    }
                                                                }}
                                                            >
                                                                <MessageSquare size={12} /> <span>Chat</span>
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                className="flex-1 h-7 text-[9px] font-black uppercase tracking-widest gap-2 bg-white text-accent hover:bg-accent/10 hover:text-accent border border-gray-100 shadow-sm"
                                                                onClick={() => {
                                                                    if (currentUser?.isAdmin) {
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
                            {markers.length} service(s) localisé(s)
                        </p>
                        <p className="text-xs text-gray-400">
                            Données © OpenStreetMap
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MapPage;
