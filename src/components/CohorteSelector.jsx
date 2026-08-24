import { useState, useEffect, useRef } from 'react';
import { Search, Users, MapPin, Loader2, X } from 'lucide-react';
import { getAllCohortes } from '../services/referenceService';
import { cn } from "@/lib/utils";

/**
 * A searchable select component for choosing a Cohorte
 */
export const CohorteSelector = ({ onSelect, selectedId = null, className = "" }) => {
    const [cohortes, setCohortes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCohorte, setSelectedCohorte] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchCohortes = async () => {
            try {
                setLoading(true);
                const data = await getAllCohortes();
                setCohortes((data || []).filter(c => c.actif !== false));
            } catch (err) {
                console.error("Failed to fetch cohortes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCohortes();
    }, []);

    useEffect(() => {
        if (selectedId && cohortes.length > 0) {
            const found = cohortes.find(s => String(s.id) === String(selectedId));
            if (found) setSelectedCohorte(found);
        }
    }, [selectedId, cohortes]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = cohortes.filter(s =>
        s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (cohorte) => {
        setSelectedCohorte(cohorte);
        setSearchTerm('');
        setIsOpen(false);
        onSelect(cohorte);
    };

    return (
        <div className={cn("relative w-full", className)} ref={wrapperRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-3 px-4 h-11 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-primary/30 transition-all shadow-sm",
                    isOpen && "border-primary ring-2 ring-primary/10"
                )}
            >
                <Users size={18} className={cn("shrink-0 transition-colors", selectedCohorte ? "text-primary" : "text-gray-400")} />
                <div className="flex-1 min-w-0">
                    {selectedCohorte ? (
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-gray-900 truncate leading-tight uppercase tracking-tight">
                                {selectedCohorte.nom}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{selectedCohorte.code}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">Rechercher une cohorte...</span>
                    )}
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-300" /> : <Search size={16} className="text-gray-300" />}
            </div>

            {isOpen && (
                <div className="absolute z-[200] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                autoFocus
                                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Filtrer par nom ou code..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-xs font-bold">Aucune cohorte trouvée</p>
                            </div>
                        ) : (
                            filtered.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => handleSelect(s)}
                                    className="p-3 hover:bg-primary/5 cursor-pointer transition-colors border-b last:border-0 border-gray-50 flex items-start gap-3 group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <Users size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-gray-900 group-hover:text-primary transition-colors truncate uppercase">
                                            {s.nom}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.code}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
