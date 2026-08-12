import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Calendar, Clock, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { createMeeting, createGlobalMeeting, createMinistereMeeting, createStructureMeeting, createCohortMeeting } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';
import { MinistereSelector } from '../../components/MinistereSelector';
import { StructureSelector } from '../../components/StructureSelector';
import { CohorteSelector } from '../../components/CohorteSelector';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const NewMeeting = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scheduledAt, setScheduledAt] = useState('');
    const [meetingType, setMeetingType] = useState('DIRECT');
    const [targetId, setTargetId] = useState('');

    const handleTypeChange = (e) => {
        setMeetingType(e.target.value);
        setTargetId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            let meeting;

            const scheduleFormatted = scheduledAt + ':00';

            if (meetingType === 'DIRECT') {
                meeting = await createMeeting({
                    scheduledAt: scheduleFormatted,
                    participantIds: [],
                });
            } else if (meetingType === 'GLOBAL') {
                meeting = await createGlobalMeeting({ scheduledAt: scheduleFormatted, targetId: null });
            } else if (meetingType === 'MINISTERE') {
                meeting = await createMinistereMeeting({ scheduledAt: scheduleFormatted, targetId: Number(targetId) });
            } else if (meetingType === 'STRUCTURE') {
                meeting = await createStructureMeeting({ scheduledAt: scheduleFormatted, targetId: Number(targetId) });
            } else if (meetingType === 'COHORT') {
                meeting = await createCohortMeeting({ scheduledAt: scheduleFormatted, targetId: Number(targetId) });
            }

            navigate(`/meetings/${meeting.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Nouvelle Réunion</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Organiser une nouvelle réunion</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="border-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Erreur de planification</AlertTitle>
                    <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
            )}

            <Card className="border-none shadow-2xl shadow-black/5 bg-white overflow-hidden">
                <CardHeader className="bg-primary/5 pb-8">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Calendar size={18} /> Paramètres de la Session
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase opacity-60">Définissez l'horaire de votre visioconférence sécurisée</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {user?.role === 'ADMIN' && (
                            <div className="space-y-3">
                                <Label htmlFor="meetingType" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                    Type de Réunion
                                </Label>
                                <select
                                    id="meetingType"
                                    value={meetingType}
                                    onChange={handleTypeChange}
                                    className="w-full h-14 px-4 bg-gray-50/50 border-2 border-gray-100 focus:border-primary/30 outline-none transition-all text-sm font-bold rounded-2xl"
                                >
                                    <option value="DIRECT">Directe</option>
                                    <option value="GLOBAL">Globale (Tous)</option>
                                    <option value="MINISTERE">Ministère</option>
                                    <option value="STRUCTURE">Structure</option>
                                    <option value="COHORT">Cohorte</option>
                                </select>
                            </div>
                        )}

                        {meetingType === 'MINISTERE' && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sélectionner un Ministère</Label>
                                <MinistereSelector selectedId={targetId} onSelect={(val) => setTargetId(val?.id || val)} required />
                            </div>
                        )}
                        {meetingType === 'STRUCTURE' && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sélectionner une Structure</Label>
                                <StructureSelector selectedId={targetId} onSelect={(val) => setTargetId(val?.id || val)} required />
                            </div>
                        )}
                        {meetingType === 'COHORT' && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sélectionner une Cohorte</Label>
                                <CohorteSelector selectedId={targetId} onSelect={(val) => setTargetId(val?.id || val)} required />
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label htmlFor="scheduledAt" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Date et Heure de Début
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="scheduledAt"
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    required
                                    className="h-14 pl-12 bg-gray-50/50 border-gray-100 focus:border-primary/30 focus:ring-primary/20 transition-all text-sm font-bold rounded-2xl"
                                />
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" size={20} />
                            </div>
                        </div>

                        <Alert className="bg-blue-50/50 border-blue-100 border-2 rounded-2xl py-6">
                            <Info className="h-5 w-5 text-blue-600" />
                            <AlertTitle className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-1">Génération Automatique</AlertTitle>
                            <AlertDescription className="text-xs font-medium text-blue-700/80 leading-relaxed">
                                Un lien <strong>Jitsi MEET</strong> hautement sécurisé sera généré à la création. Vous pourrez le partager avec les membres de votre service dès la validation.
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest opacity-60">
                                <ShieldCheck size={14} /> Chiffrement de bout en bout actif
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-2xl group transition-all"
                            >
                                {loading ? (
                                    <>Configuration...</>
                                ) : (
                                    <>
                                        Créer la Réunion
                                        <Video size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

        </div>
    );
};

export default NewMeeting;