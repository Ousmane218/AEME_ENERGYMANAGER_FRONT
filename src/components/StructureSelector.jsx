import { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Loader2, X } from 'lucide-react';
import { getAllStructures } from '../services/structureService';
import { cn } from "@/lib/utils";

/**
 * A searchable select component for choosing a Structure
 */
export const StructureSelector = ({ onSelect, selectedId = null, className = "" }) => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const fetchStructures = async () => {
            try {
                setLoading(true);
                const data = await getAllStructures();
                setStructures(data || []);
            } catch (err) {
                console.error("Failed to fetch structures", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStructures();
    }, []);

    useEffect(() => {
        if (selectedId && structures.length > 0) {
            const found = structures.find(s => String(s.id) === String(selectedId));
            if (found) setSelectedStructure(found);
        }
    }, [selectedId, structures]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = structures.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ministere?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (structure) => {
        setSelectedStructure(structure);
        setSearchTerm('');
        setIsOpen(false);
        onSelect(structure);
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
                <Building2 size={18} className={cn("shrink-0 transition-colors", selectedStructure ? "text-primary" : "text-gray-400")} />
                <div className="flex-1 min-w-0">
                    {selectedStructure ? (
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-gray-900 truncate leading-tight uppercase tracking-tight">
                                {selectedStructure.name}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">
                                {selectedStructure.region} • {selectedStructure.ministere}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">Rechercher une structure...</span>
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
                                placeholder="Filtrer par nom, région, ministère..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-xs font-bold">Aucune structure trouvée</p>
                            </div>
                        ) : (
                            filtered.map((s) => (
                                <div 
                                    key={s.id}
                                    onClick={() => handleSelect(s)}
                                    className="p-3 hover:bg-primary/5 cursor-pointer transition-colors border-b last:border-0 border-gray-50 flex items-start gap-3 group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <Building2 size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-gray-900 group-hover:text-primary transition-colors truncate uppercase">
                                            {s.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.region}</span>
                                            <span className="h-1 w-1 rounded-full bg-gray-200" />
                                            <span className="text-[9px] text-gray-400 truncate">{s.ministere}</span>
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
