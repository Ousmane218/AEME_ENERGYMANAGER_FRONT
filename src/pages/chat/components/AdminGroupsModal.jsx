import { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Archive, Plus, Users, AlertCircle, Check } from 'lucide-react';
import { MinistereSelector } from '../../../components/MinistereSelector';
import { StructureSelector } from '../../../components/StructureSelector';
import { CohorteSelector } from '../../../components/CohorteSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getAdminGroups,
    createGlobalGroup,
    createMinistereGroup,
    createCohortGroup,
    createStructureGroup,
    syncGroupMembers,
    archiveGroup,
    reactivateGroup
} from '../../../services/chatService';

export const AdminGroupsModal = ({ onClose }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    const [newType, setNewType] = useState('GLOBAL');
    const [newName, setNewName] = useState('');
    const [newRefId, setNewRefId] = useState('');

    const showMessage = useCallback((msg, type = 'success') => {
        setMessage({ text: msg, type });
        setTimeout(() => setMessage(null), 5000);
    }, []);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminGroups();
            setGroups(data || []);
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleSync = async (id) => {
        try {
            setActionLoading(`sync-${id}`);
            const res = await syncGroupMembers(id);
            const added = Number.isFinite(res?.addedMembers) ? res.addedMembers : 0;
            const deactivated = Number.isFinite(res?.deactivatedMembers) ? res.deactivatedMembers : 0;
            const unchanged = Number.isFinite(res?.unchangedMembers) ? res.unchangedMembers : 0;
            const activeAfter = Number.isFinite(res?.activeMembersAfter) ? res.activeMembersAfter : 0;
            showMessage(`Synchronisation terminée : ${added} ajouté(s), ${deactivated} désactivé(s), ${unchanged} inchangé(s). ${activeAfter} membre(s) actif(s).`, 'success');
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleArchiveToggle = async (group) => {
        try {
            if (group.active) {
                const groupName = group.name ? `« ${group.name} »` : "ce groupe";
                if (!window.confirm(`Voulez-vous vraiment archiver ${groupName} ?`)) {
                    return;
                }
            }

            setActionLoading(`archive-${group.id}`);
            if (group.active) {
                await archiveGroup(group.id);
                showMessage('Groupe archivé', 'success');
            } else {
                await reactivateGroup(group.id);
                showMessage('Groupe réactivé', 'success');
            }
            await fetchGroups();
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading('create');
            if (newType === 'GLOBAL') {
                await createGlobalGroup(newName);
            } else if (newType === 'MINISTERE') {
                await createMinistereGroup(newRefId, newName);
            } else if (newType === 'COHORT') {
                await createCohortGroup(newRefId, newName);
            } else if (newType === 'STRUCTURE') {
                await createStructureGroup(newRefId, newName);
            }
            setNewName('');
            setNewRefId('');
            setNewType('GLOBAL');
            showMessage('Groupe créé avec succès', 'success');
            await fetchGroups();
        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'GLOBAL': return 'bg-blue-100 text-blue-700';
            case 'COHORT': return 'bg-purple-100 text-purple-700';
            case 'STRUCTURE': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Administration des groupes</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X size={20} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                            {message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                            {message.text}
                        </div>
                    )}

                    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus size={16} className="text-primary" /> Nouveau groupe
                        </h4>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                    <select
                                        value={newType}
                                                                                onChange={(e) => {
                                            setNewType(e.target.value);
                                            setNewRefId('');
                                        }}
                                        className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
                                    >
                                        <option value="GLOBAL">Global</option>
                                        <option value="MINISTERE">Ministère</option>
                                        <option value="COHORT">Cohorte</option>
                                        <option value="STRUCTURE">Structure</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nom du groupe</label>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Nom"
                                        required
                                        className="h-10"
                                    />
                                </div>
                                {newType !== 'GLOBAL' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            {newType === 'MINISTERE' ? 'Ministère cible' : newType === 'COHORT' ? 'Cohorte cible' : 'Structure cible'}
                                        </label>
                                        {newType === 'MINISTERE' && (
                                            <MinistereSelector
                                                selectedId={newRefId}
                                                onSelect={(val) => setNewRefId(val?.id ? String(val.id) : '')}
                                                className="w-full"
                                            />
                                        )}
                                        {newType === 'STRUCTURE' && (
                                            <StructureSelector
                                                selectedId={newRefId}
                                                onSelect={(val) => setNewRefId(val?.id ? String(val.id) : '')}
                                                className="w-full"
                                            />
                                        )}
                                        {newType === 'COHORT' && (
                                            <CohorteSelector
                                                selectedId={newRefId}
                                                onSelect={(val) => setNewRefId(val?.id ? String(val.id) : '')}
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={actionLoading === 'create'} className="rounded-lg h-10 px-6 font-bold bg-primary hover:bg-primary/90">
                                    {actionLoading === 'create' ? <RefreshCw className="animate-spin h-4 w-4" /> : <><Users size={16} className="mr-2"/> Créer</>}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center">
                            <RefreshCw className="animate-spin text-primary/40 mx-auto mb-4 h-8 w-8" />
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {groups.map(group => (
                                <div key={group.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-gray-900 truncate">{group.name || 'Sans nom'}</h4>
                                            <Badge className={getTypeColor(group.type)}>{group.type === 'GLOBAL' ? 'Globale' : group.type === 'MINISTERE' ? 'Ministère' : group.type === 'STRUCTURE' ? 'Structure' : group.type === 'COHORT' ? 'Cohorte' : group.type}</Badge>
                                            {group.active ? (
                                                <Badge className="bg-green-100 text-green-700">Actif</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-500">Archivé</Badge>
                                            )}
                                        </div>
                                        {group.referenceId && <p className="text-xs text-gray-500 truncate">Ref: {group.referenceId}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {group.active && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSync(group.id)}
                                                disabled={actionLoading === `sync-${group.id}`}
                                                className="rounded-lg border-gray-200"
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading === `sync-${group.id}` ? 'animate-spin' : ''}`} />
                                                Sync
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleArchiveToggle(group)}
                                            disabled={actionLoading === `archive-${group.id}`}
                                            className="rounded-lg border-gray-200"
                                        >
                                            {actionLoading === `archive-${group.id}` ? (
                                                <RefreshCw className="animate-spin h-4 w-4" />
                                            ) : group.active ? (
                                                <><Archive className="h-4 w-4 mr-2" /> Archiver</>
                                            ) : (
                                                <><Check className="h-4 w-4 mr-2" /> Réactiver</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
