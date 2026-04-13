import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { X } from 'lucide-react';
import { inviteUser } from '../../services/adminService';

export const CreateUserModal = ({ show, onClose, onCreated }) => {
    const [createLoading, setCreateLoading] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        membershipService: 'SENELEC'
    });

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
                membershipService: 'SENELEC'
            });
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
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Service Affilié</label>
                            <Input
                                type="text"
                                required
                                className="h-10 text-sm border-gray-200 focus:ring-primary shadow-sm"
                                value={newUserData.membershipService}
                                onChange={e => setNewUserData({...newUserData, membershipService: e.target.value})}
                                placeholder="ex: SENELEC, ASER, Cabinet..."
                            />
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
