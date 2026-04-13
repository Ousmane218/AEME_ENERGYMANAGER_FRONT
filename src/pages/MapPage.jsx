import { useState, useEffect } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getAllUsersWithLocation } from '../services/profileService';
import { SENEGAL_CENTER, groupByService } from '../lib/mapUtils';
import { Card } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation } from '../services/chatService';
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, User } from 'lucide-react';

const MapPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        getAllUsersWithLocation()
            .then(users => setMarkers(groupByService(users)))
            .catch(() => setError('Impossible de charger les positions.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                    <MapPin className="text-primary" size={32} />
                    Carte des Services
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                    Localisation globale des infrastructures AEME
                </p>
            </div>

            <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-3xl overflow-hidden flex flex-col relative">
                {/* Map */}
                <div className="relative w-full h-[600px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50/50">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Chargement des positions...</p>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm font-bold bg-red-50">
                            {error}
                        </div>
                    ) : markers.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50">
                            <MapPin size={48} className="text-gray-300 mb-2" />
                            <p className="text-sm font-bold text-gray-600">Aucun service localisé pour le moment.</p>
                            <p className="text-xs text-center px-8 text-gray-400">
                                Les membres peuvent ajouter leur position depuis leur profil.
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
                                                                <MessageSquare size={12} /> Chat
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
                                                                <FileText size={12} /> Rapports
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
