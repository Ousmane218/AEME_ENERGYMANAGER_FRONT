import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { X, CheckCircle } from 'lucide-react';
import { createUser } from '../../services/adminService';
import { StructureSelector } from '../StructureSelector';
import { MinistereSelector } from '../MinistereSelector';
import { CohorteSelector } from '../CohorteSelector';

export const CreateUserModal = ({ show, onClose, onCreated }) => {
    const [createLoading, setCreateLoading] = useState(false);

    const [newUserData, setNewUserData] = useState({
        email: '',
        prenom: '',
        nom: '',
        role: 'GESTIONNAIRE',
        ministereId: null,
        structureId: null,
        cohorteId: null
    });



    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setCreateLoading(true);
            await createUser(newUserData);
            setNewUserData({
                email: '',
                prenom: '',
                nom: '',
                role: 'GESTIONNAIRE',
        ministereId: null,
        structureId: null,
        cohorteId: null
            });

            onClose();
            if (onCreated) onCreated();
        } catch (err) {
            alert(err.message || 'Erreur lors de la création');
        } finally {
            setCreateLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-visible animate-in zoom-in-95 duration-200">
                <CardHeader className="bg-gray-50 border-b pb-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Nouvel Utilisateur</CardTitle>
                            <CardDescription>Invitez un nouveau membre sur la plateforme.</CardDescription>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full">
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
                                    value={newUserData.prenom}
                                    onChange={e => setNewUserData({...newUserData, prenom: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom</label>
                                <Input
                                    type="text"
                                    required
                                    className="h-10 text-sm border-gray-200 focus:ring-primary shadow-sm"
                                    value={newUserData.nom}
                                    onChange={e => setNewUserData({...newUserData, nom: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Niveau d'Accès</label>
                            <select
                                className="w-full h-10 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm shadow-sm"
                                value={newUserData.role}
                                onChange={e => {
                                    const newRole = e.target.value;
                                    setNewUserData({
                                        ...newUserData,
                                        role: newRole,
                                        ministereId: null,
                                        structureId: null,
                                        cohorteId: null
                                    });
                                }}
                            >
                                <option value="GESTIONNAIRE">Gestionnaire</option>
                                <option value="DAGE">DAGE</option>
                                <option value="ADMIN">Administrateur Système</option>
                            </select>
                        </div>

                        {newUserData.role === 'DAGE' && (
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    Ministère
                                </label>
                                <MinistereSelector
                                    onSelect={(s) => setNewUserData({...newUserData, ministereId: s.id})}
                                />
                                {!newUserData.ministereId && (
                                    <p className="text-[9px] text-amber-600 font-bold mt-1">
                                        Veuillez sélectionner un ministère.
                                    </p>
                                )}
                            </div>
                        )}
                        {newUserData.role === 'GESTIONNAIRE' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                        Structure de Rattachemen
                                    </label>
                                    <StructureSelector
                                        onSelect={(s) => setNewUserData({...newUserData, structureId: s.id})}
                                    />
                                    {!newUserData.structureId && (
                                        <p className="text-[9px] text-amber-600 font-bold mt-1">
                                            Veuillez sélectionner une structure.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                        Cohorte
                                    </label>
                                    <CohorteSelector
                                        onSelect={(c) => setNewUserData({...newUserData, cohorteId: c.id})}
                                    />
                                    {!newUserData.cohorteId && (
                                        <p className="text-[9px] text-amber-600 font-bold mt-1">
                                            Veuillez sélectionner une cohorte.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <div className="p-6 bg-gray-50 border-t flex gap-3 rounded-b-xl">
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
