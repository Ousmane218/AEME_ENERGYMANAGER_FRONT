import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Trash2, FileText, Search, Loader2, Plus, X, Shield, Filter, MoreHorizontal, Mail, ExternalLink } from 'lucide-react';
import { getAllUsers, deleteUser } from '../../services/adminService';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            alert('Erreur lors de la suppression: ' + err.message);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowerSearch = searchTerm.toLowerCase();
        return users.filter(user => 
            user.fullName?.toLowerCase().includes(lowerSearch) ||
            user.email?.toLowerCase().includes(lowerSearch)
        );
    }, [users, searchTerm]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestion des Utilisateurs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Administrez les comptes, gérez les permissions et invitez de nouveaux membres.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 font-semibold shadow-sm"
                        onClick={fetchUsers}
                    >
                        Rafraîchir
                    </Button>
                    <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="gap-2 shadow-md font-bold bg-primary hover:bg-primary/90"
                    >
                        <Plus size={18} /> Nouvel utilisateur
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Rechercher par nom, email ou service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 text-sm bg-white shadow-sm border-gray-200"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-6 px-3 text-[10px] font-bold uppercase tracking-wider bg-white border-gray-200 shadow-sm">
                                {filteredUsers.length} Utilisateurs trouvés
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-destructive flex flex-col items-center gap-2">
                            <X size={32} className="opacity-20" />
                            <p className="font-medium">{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchUsers}>Réessayer</Button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-20 text-center text-muted-foreground">
                            <User size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                            <p className="text-sm">Ajustez vos critères de recherche.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-gray-900">Utilisateur</TableHead>
                                    <TableHead className="font-bold text-gray-900">Email & Service</TableHead>
                                    <TableHead className="font-bold text-gray-900">Rôle & Statut</TableHead>
                                    <TableHead className="text-right font-bold text-gray-900">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow 
                                        key={user.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border shadow-sm scale-90 group-hover:scale-100 transition-transform">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                                                        {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-gray-900 leading-tight">{user.fullName || '—'}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">ID: {user.id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                                                    <Mail size={12} className="text-muted-foreground" />
                                                    {user.email}
                                                </div>
                                                <div className="text-[10px] text-primary/70 font-black uppercase tracking-tight flex items-center gap-1">
                                                    <Shield size={10} />
                                                    {user.membershipService || 'AUCUN SERVICE'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    className={cn(
                                                        "text-[10px] font-black uppercase tracking-tighter px-2 h-5 rounded-md",
                                                        user.role === 'admin' 
                                                            ? "bg-primary text-white hover:bg-primary/90 shadow-md border-none" 
                                                            : "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30"
                                                    )}
                                                >
                                                    {user.role === 'admin' ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                                                </Badge>
                                                {user.isActive !== false && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="font-bold text-primary group-hover:bg-primary/10 transition-colors"
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                >
                                                    Gérer <ExternalLink size={14} className="ml-2 opacity-50" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateUserModal 
                show={showCreateModal} 
                onClose={() => setShowCreateModal(false)}
                onCreated={fetchUsers}
            />
        </div>
    );
};

export default Users;
