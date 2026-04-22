import { useState, useEffect } from 'react';
import { 
    Building2, Search, Loader2, Plus, Trash2, MapPin, 
    Filter, MoreHorizontal, Map as MapIcon, Shield
} from 'lucide-react';
import { getAllStructures, createStructure, updateStructure, deleteStructure } from '../../services/structureService';
import { StructureModal } from '@/components/admin/StructureModal';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Structures = () => {
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedStructure, setSelectedStructure] = useState(null);

    useEffect(() => {
        fetchStructures();
    }, []);

    const fetchStructures = async () => {
        try {
            setLoading(true);
            const data = await getAllStructures();
            setStructures(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedStructure) {
                await updateStructure(selectedStructure.id, formData);
            } else {
                await createStructure(formData);
            }
            fetchStructures();
        } catch (err) {
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette structure définitivement ?')) return;
        try {
            await deleteStructure(id);
            fetchStructures();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredStructures = structures.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ministere?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Référentiel des Structures</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez les ministères, directions et agences géolocalisées sur la carte.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => { setSelectedStructure(null); setShowModal(true); }}
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        <span>Nouvelle Structure</span>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                            <Building2 size={16} /> Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-primary">{structures.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-accent/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                            <MapPin size={16} /> Régions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-accent">
                            {new Set(structures.map(s => s.region)).size}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-amber-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-amber-600 flex items-center gap-2 uppercase tracking-widest">
                            <Shield size={16} /> Zones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-amber-600">
                            {new Set(structures.map(s => s.zone)).size}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-none shadow-xl shadow-black/5 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input 
                                placeholder="Rechercher une structure, une région..." 
                                className="pl-10 h-11 bg-white border-gray-100 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2 h-11 border-gray-100 rounded-xl">
                            <Filter size={18} />
                            Filtrer
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Structure</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Localisation</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Coordonnées</TableHead>
                                    <TableHead className="text-right py-4 font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-12 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-10 w-10 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredStructures.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Building2 size={48} className="mb-4 opacity-20" />
                                                <p className="font-bold">Aucune structure trouvée</p>
                                                <p className="text-sm">Essayez de modifier vos critères de recherche.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStructures.map((structure) => (
                                        <TableRow key={structure.id} className="group hover:bg-gray-50/80 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-none">{structure.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{structure.ministere || 'Aucun ministère'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-accent/5 text-accent border-accent/10 font-bold uppercase text-[9px]">
                                                        {structure.region || '—'}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400 font-medium">{structure.zone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                                                        <span className="text-gray-400">LAT:</span> {structure.latitude || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                                                        <span className="text-gray-400">LON:</span> {structure.longitude || '—'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => { setSelectedStructure(structure); setShowModal(true); }}
                                                        className="h-9 w-9 p-0 hover:bg-primary/5 hover:text-primary rounded-lg"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(structure.id)}
                                                        className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-500 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <StructureModal 
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                structure={selectedStructure}
            />
        </div>
    );
};

export default Structures;
