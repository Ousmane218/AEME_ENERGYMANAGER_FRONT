import { useState, useRef, useEffect } from 'react';
import { X, Search, Loader2, Check } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import { updateMyLocation, searchGeocode } from '../../services/profileService';
import { SENEGAL_CENTER } from '../../lib/mapUtils';

const LocationPicker = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const MapRecenter = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.flyTo(coords, 16);
    }, [coords]);
    return null;
};

export const LocationPickerModal = ({ 
    initialCoords, 
    displayService,
    onClose,
    onSaved 
}) => {
    const [pickedCoords, setPickedCoords] = useState(initialCoords);
    const [locationSaved, setLocationSaved] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    const handlePickLocation = async (lat, lng) => {
        setPickedCoords([lat, lng]);
        try {
            await updateMyLocation(lat, lng);
            setLocationSaved(true);
            setTimeout(() => setLocationSaved(false), 2000);
            if (onSaved) onSaved(lat, lng);
        } catch {
            alert('Erreur lors de la sauvegarde de la position');
        }
    };

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(async () => {
            if (!val.trim() || val.length < 3) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            const results = await searchGeocode(val);
            setSearchResults(results);
            setSearching(false);
        }, 500);
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
            if (onSaved) onSaved(lat, lng);
        } catch {
            alert('Erreur lors de la sauvegarde de la position');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-primary">
                            Localiser mon service
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                            Recherchez ou cliquez sur la carte pour {displayService}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search bar */}
                <div className="px-4 py-3 border-b border-gray-100 relative">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-sm border border-gray-200 rounded-lg focus-within:border-primary/50 transition-colors">
                        <Search size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Rechercher un lieu au Sénégal... (min. 3 caractères)"
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
                        />
                        {searching && (
                            <Loader2 size={14} className="animate-spin text-primary flex-shrink-0" />
                        )}
                        {searchQuery && !searching && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                            >
                                <X size={14} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Résultats */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] overflow-hidden max-h-60 overflow-y-auto">
                            {searchResults.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <p className="text-sm font-bold text-gray-800 truncate">
                                        {result.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground truncate opacity-60 mt-0.5">
                                        {result.display_name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Aucun résultat */}
                    {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                                Aucun résultat — cliquez directement sur la carte
                            </p>
                        </div>
                    )}
                </div>

                {/* Map */}
                <div style={{ height: '360px' }}>
                    <MapContainer
                        center={pickedCoords || SENEGAL_CENTER}
                        zoom={pickedCoords ? 14 : 7}
                        style={{ height: '100%', width: '100%', zIndex: 10 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationPicker onPick={handlePickLocation} />
                        <MapRecenter coords={pickedCoords} />
                        {pickedCoords && (
                            <Marker position={pickedCoords} />
                        )}
                    </MapContainer>
                </div>

                {/* Footer modal */}
                <div className="px-6 py-4 border-t border-gray-100 text-center bg-gray-50/30">
                    {locationSaved ? (
                        <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                            <Check size={14} />
                            Position sauvegardée avec succès !
                        </p>
                    ) : (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                            Recherchez un lieu ou cliquez directement sur la carte pour définir la position
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
