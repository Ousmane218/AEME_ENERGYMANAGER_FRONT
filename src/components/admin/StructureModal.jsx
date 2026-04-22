import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SENEGAL_CENTER } from '@/lib/mapUtils';
import L from 'leaflet';

// Component to handle map clicks for coordinate selection
const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

export const StructureModal = ({ isOpen, onClose, onSave, structure = null }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ministere: '',
        region: '',
        zone: '',
        latitude: '',
        longitude: ''
    });
    const [mapPosition, setMapPosition] = useState(null);

    useEffect(() => {
        if (structure) {
            setFormData({
                name: structure.name || '',
                ministere: structure.ministere || '',
                region: structure.region || '',
                zone: structure.zone || '',
                latitude: structure.latitude || '',
                longitude: structure.longitude || ''
            });
            if (structure.latitude && structure.longitude) {
                setMapPosition([parseFloat(structure.latitude), parseFloat(structure.longitude)]);
            }
        } else {
            setFormData({
                name: '',
                ministere: '',
                region: '',
                zone: '',
                latitude: '',
                longitude: ''
            });
            setMapPosition(null);
        }
    }, [structure, isOpen]);

    // Update form when map position changes
    useEffect(() => {
        if (mapPosition) {
            setFormData(prev => ({
                ...prev,
                latitude: mapPosition[0].toFixed(6),
                longitude: mapPosition[1].toFixed(6)
            }));
        }
    }, [mapPosition]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {structure ? 'Modifier la Structure' : 'Nouvelle Structure'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Définissez les informations et la position géographique.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Info Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nom de la structure</Label>
                                <Input 
                                    required
                                    placeholder="ex: Direction de l'Énergie"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ministère de tutelle</Label>
                                <Input 
                                    placeholder="ex: Ministère de l'Énergie"
                                    value={formData.ministere}
                                    onChange={e => setFormData({...formData, ministere: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Région</Label>
                                    <Input 
                                        placeholder="ex: Dakar"
                                        value={formData.region}
                                        onChange={e => setFormData({...formData, region: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zone</Label>
                                    <Input 
                                        placeholder="ex: Centre-Ville"
                                        value={formData.zone}
                                        onChange={e => setFormData({...formData, zone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input 
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={e => {
                                            setFormData({...formData, latitude: e.target.value});
                                            if (e.target.value && formData.longitude) {
                                                setMapPosition([parseFloat(e.target.value), parseFloat(formData.longitude)]);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input 
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={e => {
                                            setFormData({...formData, longitude: e.target.value});
                                            if (formData.latitude && e.target.value) {
                                                setMapPosition([parseFloat(formData.latitude), parseFloat(e.target.value)]);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Map Picker */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin size={14} className="text-primary" />
                                Position sur la carte (Cliquez pour définir)
                            </Label>
                            <div className="h-[300px] md:h-full min-h-[300px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
                                <MapContainer 
                                    center={mapPosition || SENEGAL_CENTER} 
                                    zoom={mapPosition ? 15 : 7} 
                                    className="h-full w-full"
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2 min-w-[120px]">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
