import { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SENEGAL_CENTER } from '@/lib/mapUtils';
import L from 'leaflet';
import { getAllMinisteres } from '../../services/referenceService';

// Component to handle map clicks for coordinate selection
const LocationPicker = ({ position, setPosition, setFormData }) => {
    useMapEvents({
        click(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            setPosition([lat, lng]);
            setFormData(prev => ({
                ...prev,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6)
            }));
        },
    });

    return position ? <Marker position={position} /> : null;
};

export const StructureModal = ({ isOpen, onClose, onSave, structure = null }) => {
    const [loading, setLoading] = useState(false);
    const [ministeres, setMinisteres] = useState([]);
    const [loadingMinisteres, setLoadingMinisteres] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ministere: '',
        ministereId: '',
        region: '',
        zone: '',
        latitude: '',
        longitude: ''
    });
    const [mapPosition, setMapPosition] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchMinisteres = async () => {
                setLoadingMinisteres(true);
                try {
                    const data = await getAllMinisteres();
                    setMinisteres(data || []);
                } catch (err) {
                    console.error("Impossible de charger les ministères", err);
                } finally {
                    setLoadingMinisteres(false);
                }
            };
            fetchMinisteres();
        }
    }, [isOpen]);

    useEffect(() => {
        if (structure) {
            setFormData({
                name: structure.name || '',
                ministere: structure.ministere || '',
                ministereId: structure.ministereV2?.id || structure.ministereId || '',
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
                ministereId: '',
                region: '',
                zone: '',
                latitude: '',
                longitude: ''
            });
            setMapPosition(null);
        }
    }, [structure, isOpen]);


    const normalizeCoordinate = (val) => {
        if (!val) return "";
        return String(val).trim().replace(',', '.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let latNorm = normalizeCoordinate(formData.latitude);
        let lngNorm = normalizeCoordinate(formData.longitude);

        if (latNorm || lngNorm) {
            const latNum = parseFloat(latNorm);
            const lngNum = parseFloat(lngNorm);

            if (isNaN(latNum) || latNum < -90 || latNum > 90) {
                alert("La latitude doit être un nombre entre -90 et 90");
                return;
            }
            if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
                alert("La longitude doit être un nombre entre -180 et 180");
                return;
            }
        }

        const payload = {
            ...formData,
            latitude: latNorm,
            longitude: lngNorm
        };

        try {
            setLoading(true);
            await onSave(payload);
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
                                {loadingMinisteres ? (
                                    <div className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm opacity-50 items-center">
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Chargement des ministères...
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.ministereId}
                                        onChange={e => {
                                            const minId = e.target.value;
                                            const minObj = ministeres.find(m => String(m.id) === String(minId));
                                            setFormData({
                                                ...formData,
                                                ministereId: minId,
                                                ministere: minObj ? minObj.nom : ''
                                            });
                                        }}
                                    >
                                        <option value="" disabled>-- Sélectionner un ministère --</option>
                                        {ministeres.map((m) => (
                                            <option key={m.id} value={m.id}>{m.nom}</option>
                                        ))}
                                    </select>
                                )}
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
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.latitude}
                                        onChange={e => setFormData({...formData, latitude: e.target.value})}
                                        onBlur={(e) => {
                                            const latNorm = normalizeCoordinate(e.target.value);
                                            const lngNorm = normalizeCoordinate(formData.longitude);
                                            if (latNorm && lngNorm) {
                                                const latNum = parseFloat(latNorm);
                                                const lngNum = parseFloat(lngNorm);
                                                if (!isNaN(latNum) && latNum >= -90 && latNum <= 90 && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
                                                    setMapPosition([latNum, lngNum]);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={formData.longitude}
                                        onChange={e => setFormData({...formData, longitude: e.target.value})}
                                        onBlur={(e) => {
                                            const latNorm = normalizeCoordinate(formData.latitude);
                                            const lngNorm = normalizeCoordinate(e.target.value);
                                            if (latNorm && lngNorm) {
                                                const latNum = parseFloat(latNorm);
                                                const lngNum = parseFloat(lngNorm);
                                                if (!isNaN(latNum) && latNum >= -90 && latNum <= 90 && !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
                                                    setMapPosition([latNum, lngNum]);
                                                }
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
                                    <LocationPicker position={mapPosition} setPosition={setMapPosition} setFormData={setFormData} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || loadingMinisteres || !formData.ministereId} className="gap-2 min-w-[120px]">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
