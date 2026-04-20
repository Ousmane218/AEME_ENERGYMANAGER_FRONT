import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { X, MapPin, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { inviteUser } from '../../services/adminService';
import { searchGeocode } from '../../services/profileService';
import { cn } from "@/lib/utils";

export const CreateUserModal = ({ show, onClose, onCreated }) => {
    const [createLoading, setCreateLoading] = useState(false);
    const [localizing, setLocalizing] = useState(false);
    const [localizationStatus, setLocalizationStatus] = useState('idle'); // idle, loading, success, error
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);
    
    const [newUserData, setNewUserData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        membershipService: '',
        serviceLatitude: null,
        serviceLongitude: null
    });

    // Handle debounced search for suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (newUserData.membershipService && newUserData.membershipService.length >= 3 && localizationStatus !== 'success') {
                try {
                    const results = await searchGeocode(`${newUserData.membershipService}, Senegal`);
                    setSuggestions(results || []);
                    setShowSuggestions(true);
                } catch (err) {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(timer);
    }, [newUserData.membershipService]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (suggestion) => {
        setNewUserData({
            ...newUserData,
            membershipService: suggestion.display_name.split(',')[0], // Take only the name part
            serviceLatitude: suggestion.lat,
            serviceLongitude: suggestion.lon
        });
        setLocalizationStatus('success');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleAutoLocalize = async () => {
        if (!newUserData.membershipService || newUserData.membershipService.length < 3) return;
        
        try {
            setLocalizing(true);
            setLocalizationStatus('loading');
            
            const query = `${newUserData.membershipService}, Senegal`;
            const results = await searchGeocode(query);
            
            if (results && results.length > 0) {
                const bestMatch = results[0];
                handleSelectSuggestion(bestMatch);
            } else {
                setLocalizationStatus('error');
            }
        } catch (err) {
            setLocalizationStatus('error');
        } finally {
            setLocalizing(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setCreateLoading(true);
            await inviteUser(newUserData);
            setNewUserData({
                email: '',
                firstName: '',
                lastName: '',
                role: 'user',
                membershipService: '',
                serviceLatitude: null,
                serviceLongitude: null
            });
            setLocalizationStatus('idle');
            onClose();
            if (onCreated) onCreated();
        } catch (err) {
            alert(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
                <CardHeader className="bg-gray-50 border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Nouvel Utilisateur</CardTitle>
                            <CardDescription>Invitez un nouveau membre sur la plateforme.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X size={18} />
                        </Button>
                    </div>
                </CardHeader>
                <form onSubmit={handleCreateUser}>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Professionnel</label>
                            <Input
                                type="email"
                                required
                                className="h-10 text-sm border-gray-200 focus:ring-primary shadow-sm"
                                value={newUserData.email}
                                onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                                placeholder="exemple@energie.sn"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Prénom</label>
                                <Input
                                    type="text"
                                    required
                                    className="h-10 text-sm border-gray-200 focus:ring-primary shadow-sm"
                                    value={newUserData.firstName}
                                    onChange={e => setNewUserData({...newUserData, firstName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom</label>
                                <Input
                                    type="text"
                                    required
                                    className="h-10 text-sm border-gray-200 focus:ring-primary shadow-sm"
                                    value={newUserData.lastName}
                                    onChange={e => setNewUserData({...newUserData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Niveau d'Accès</label>
                            <select
                                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm shadow-sm"
                                value={newUserData.role}
                                onChange={e => setNewUserData({...newUserData, role: e.target.value})}
                            >
                                <option value="user">Utilisateur Standard</option>
                                <option value="admin">Administrateur Système</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                Service Affilié
                                {localizationStatus === 'success' && (
                                    <span className="text-[9px] text-green-600 flex items-center gap-1 normal-case font-bold animate-in fade-in slide-in-from-right-2">
                                        <CheckCircle size={10} /> Localisé sur la carte
                                    </span>
                                )}
                            </label>
                            <div className="relative" ref={suggestionRef}>
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        required
                                        className={cn(
                                            "h-10 text-sm border-gray-200 focus:ring-primary shadow-sm pr-24",
                                            localizationStatus === 'success' && "border-green-200 bg-green-50/20"
                                        )}
                                        value={newUserData.membershipService}
                                        onChange={e => {
                                            setNewUserData({...newUserData, membershipService: e.target.value, serviceLatitude: null, serviceLongitude: null});
                                            setLocalizationStatus('idle');
                                        }}
                                        placeholder="ex: SENELEC, ASER, Cabinet..."
                                    />
                                    <div className="absolute right-1 top-1 bottom-1 flex items-center">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={localizationStatus === 'success' ? 'ghost' : 'secondary'}
                                            disabled={localizing || !newUserData.membershipService || newUserData.membershipService.length < 3}
                                            onClick={handleAutoLocalize}
                                            className={cn(
                                                "h-full px-3 text-[9px] font-black uppercase tracking-tighter gap-1.5 rounded-md transition-all",
                                                localizationStatus === 'success' && "text-green-600 hover:bg-green-100",
                                                localizationStatus === 'error' && "text-red-500"
                                            )}
                                        >
                                            {localizing ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : localizationStatus === 'success' ? (
                                                <MapPin size={12} className="fill-green-600" />
                                            ) : localizationStatus === 'error' ? (
                                                <AlertCircle size={12} />
                                            ) : (
                                                <MapPin size={12} />
                                            )}
                                            {localizing ? '...' : localizationStatus === 'success' ? 'Épinglé' : localizationStatus === 'error' ? 'Échec' : 'Localiser'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Autocomplete Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b last:border-0 border-gray-50 group flex items-start gap-3"
                                            >
                                                <Search size={14} className="mt-0.5 text-gray-300 group-hover:text-primary transition-colors" />
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                                                        {suggestion.display_name.split(',')[0]}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400 truncate">
                                                        {suggestion.display_name.split(',').slice(1).join(',').trim()}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {localizationStatus === 'error' && (
                                <p className="text-[9px] text-red-500 font-bold mt-1 animate-in fade-in">
                                    Impossible de trouver ce lieu. Veuillez préciser (ex: SENELEC Dakar).
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <div className="p-6 bg-gray-50 border-t flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 font-bold"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={createLoading}
                            className="flex-1 font-bold bg-primary hover:bg-primary/90"
                        >
                            {createLoading ? 'Invitation...' : 'Envoyer L\'invitation'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
