import { useState, useEffect } from 'react';
import { X, Loader2, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const CohorteModal = ({ isOpen, onClose, onSave, cohorte = null }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        nom: '',
    });

    useEffect(() => {
        if (cohorte) {
            setFormData({
                code: cohorte.code || '',
                nom: cohorte.nom || '',
            });
        } else {
            setFormData({
                code: '',
                nom: '',
            });
        }
    }, [cohorte, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {cohorte ? 'Modifier la Cohorte' : 'Nouvelle Cohorte'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Renseignez les informations de la cohorte.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                required
                                placeholder="ex: COH_2026"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nom Complet</Label>
                            <Input
                                required
                                placeholder="ex: Cohorte 2026"
                                value={formData.nom}
                                onChange={e => setFormData({...formData, nom: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2 min-w-[120px]">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <GraduationCap size={16} />}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
