import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, FileText, Search, Loader2, Plus, X } from 'lucide-react';
import { getAllUsers, deleteUser, inviteUser } from '../../services/adminService';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        membershipService: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setCreateLoading(true);
            await inviteUser(newUserData);
            setShowCreateModal(false);
            setNewUserData({
                email: '',
                firstName: '',
                lastName: '',
                role: 'user',
                membershipService: 'SENELEC'
            });
            fetchUsers();
        } catch (err) {
            alert(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-primary">Gestion des Utilisateurs</h1>
                
                <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Créer un utilisateur
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rôle</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User size={20} />
                                            </div>
                                            <span className="font-medium text-gray-900">{user.fullName || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                                                title="Voir les détails"
                                            >
                                                <User size={18} />
                                                Détails
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Nouvel Utilisateur</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={newUserData.email}
                                    onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                                    placeholder="exemple@energie.sn"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={newUserData.firstName}
                                        onChange={e => setNewUserData({...newUserData, firstName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={newUserData.lastName}
                                        onChange={e => setNewUserData({...newUserData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={newUserData.role}
                                    onChange={e => setNewUserData({...newUserData, role: e.target.value})}
                                >
                                    <option value="user">Utilisateur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service affilié</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={newUserData.membershipService}
                                    onChange={e => setNewUserData({...newUserData, membershipService: e.target.value})}
                                    placeholder="ex: SENELEC, ASER..."
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
                                >
                                    {createLoading ? 'Invitation...' : 'Inviter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
