import { useState, useEffect } from 'react';
import {
    GraduationCap, Search, Loader2, Plus, Edit2, CheckCircle, XCircle
} from 'lucide-react';
import { getAllCohortes, createCohorte, updateCohorte } from '../../services/referenceService';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CohorteModal } from '@/components/admin/CohorteModal';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

const Cohortes = () => {
    const [cohortes, setCohortes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCohorte, setSelectedCohorte] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [cohorteToDeactivate, setCohorteToDeactivate] = useState(null);

    useEffect(() => {
        fetchCohortes();
    }, []);

    const fetchCohortes = async () => {
        try {
            setLoading(true);
            const data = await getAllCohortes();
            setCohortes(data?.data || data || []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedCohorte) {
                await updateCohorte(selectedCohorte.id, formData);
                toast.success("Cohorte mise à jour avec succès");
            } else {
                await createCohorte(formData);
                toast.success("Cohorte créée avec succès");
            }
            fetchCohortes();
        } catch (error) {
            toast.error(error.message || "Une erreur s'est produite.");
            throw error;
        }
    };

    const handleToggleStatus = async (cohorte) => {
        if (cohorte.actif !== false) {
            setCohorteToDeactivate(cohorte);
            setShowConfirmDialog(true);
        } else {
            try {
                await updateCohorte(cohorte.id, { actif: true });
                toast.success(`Cohorte activée avec succès`);
                fetchCohortes();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const confirmDeactivation = async () => {
        if (!cohorteToDeactivate) return;
        try {
            await updateCohorte(cohorteToDeactivate.id, { actif: false });
            toast.success(`Cohorte désactivée avec succès`);
            fetchCohortes();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setShowConfirmDialog(false);
            setCohorteToDeactivate(null);
        }
    };

    const filteredCohortes = cohortes.filter(c =>
        c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cohortes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez la liste des cohortes (V2).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => { setSelectedCohorte(null); setShowModal(true); }}
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        <span>Nouvelle Cohorte</span>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                            <GraduationCap size={16} /> Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-primary">{cohortes.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-green-600 flex items-center gap-2 uppercase tracking-widest">
                            <CheckCircle size={16} /> Actifs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-green-600">
                            {cohortes.filter(c => c.actif !== false).length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-red-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-red-600 flex items-center gap-2 uppercase tracking-widest">
                            <XCircle size={16} /> Inactifs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-red-600">
                            {cohortes.filter(c => c.actif === false).length}
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
                                placeholder="Rechercher par nom ou code..."
                                className="pl-10 h-11 bg-white border-gray-100 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Cohorte</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Code</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest py-4">Statut</TableHead>
                                    <TableHead className="text-right py-4 font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-12 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredCohortes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <GraduationCap size={48} className="mb-4 opacity-20" />
                                                <p className="font-bold">Aucune cohorte trouvée</p>
                                                <p className="text-sm">Essayez de modifier vos critères de recherche.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCohortes.map((cohorte) => (
                                        <TableRow key={cohorte.id} className="group hover:bg-gray-50/80 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-none">{cohorte.nom}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-accent/5 text-accent border-accent/10 font-bold uppercase text-[9px]">
                                                    {cohorte.code || '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cohorte.actif !== false ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"}>
                                                    {cohorte.actif !== false ? "Actif" : "Inactif"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => { setSelectedCohorte(cohorte); setShowModal(true); }}
                                                        className="h-9 p-2 hover:bg-primary/5 hover:text-primary rounded-lg font-semibold text-xs text-gray-500"
                                                    >
                                                        <Edit2 size={16} className="mr-1.5" /> Éditer
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(cohorte)}
                                                        className={`h-9 p-2 rounded-lg font-semibold text-xs ${cohorte.actif !== false ? 'hover:bg-red-50 hover:text-red-500 text-gray-500' : 'hover:bg-green-50 hover:text-green-600 text-gray-500'}`}
                                                    >
                                                        {cohorte.actif !== false ? (
                                                            <><XCircle size={16} className="mr-1.5" /> Désactiver</>
                                                        ) : (
                                                            <><CheckCircle size={16} className="mr-1.5" /> Activer</>
                                                        )}
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

            <CohorteModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                cohorte={selectedCohorte}
            />

            <ConfirmDialog
                open={showConfirmDialog}
                onOpenChange={(open) => {
                    setShowConfirmDialog(open);
                    if (!open) setCohorteToDeactivate(null);
                }}
                title="Voulez-vous vraiment désactiver cette cohorte ?"
                cancelLabel="Annuler"
                confirmLabel="Désactiver"
                destructive={true}
                onConfirm={confirmDeactivation}
            />
        </div>
    );
};

export default Cohortes;
