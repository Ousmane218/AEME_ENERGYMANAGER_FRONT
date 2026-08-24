import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Loader2, Check, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMeetingById, updateMeetingStatus, updateManagedMeetingStatus, isManagedMeeting } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const MeetingRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showLocalLeaveDialog, setShowLocalLeaveDialog] = useState(false);
    const [showGlobalEndDialog, setShowGlobalEndDialog] = useState(false);

    const leaveHandledRef = useRef(false);
    const endMeetingInProgressRef = useRef(false);

    useEffect(() => {
        fetchMeeting();
        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleStatusUpdate = async (meetingData, status) => {
        const isDirectCreator = meetingData.type === 'DIRECT' && meetingData.createdByUserId === user?.keycloakId;
        const isManagedAdmin = isManagedMeeting(meetingData) && user?.role === 'ADMIN';

        if (isDirectCreator) {
            await updateMeetingStatus(id, status);
        } else if (isManagedAdmin) {
            await updateManagedMeetingStatus(id, status);
        }
    };

    const handleLocalLeave = () => {
        if (leaveHandledRef.current) return;
        leaveHandledRef.current = true;

        if (jitsiApiRef.current) {
            try {
                jitsiApiRef.current.dispose();
            } catch {
                // Ignore safe disposal errors
            }
            jitsiApiRef.current = null;
        }
        navigate('/meetings');
    };

    const confirmGlobalEnd = async () => {
        if (endMeetingInProgressRef.current) return;

        endMeetingInProgressRef.current = true;
        try {
            await handleStatusUpdate(meeting, 'ENDED');
            toast.success("Réunion terminée avec succès.");
            setShowGlobalEndDialog(false);
            handleLocalLeave();
        } catch {
            toast.error("Impossible de terminer la réunion. Veuillez réessayer.");
            endMeetingInProgressRef.current = false;
        }
    };

    const fetchMeeting = async () => {
        try {
            const data = await getMeetingById(id);
            setMeeting(data);
            if (data.status === 'SCHEDULED') {
                await handleStatusUpdate(data, 'IN_PROGRESS');
            }
            loadJitsiScript(data);
        } catch {
            toast.error("Impossible de charger la réunion.");
            navigate('/meetings');
        } finally {
            setLoading(false);
        }
    };

    const loadJitsiScript = (meetingData) => {
        if (document.getElementById('jitsi-script')) {
            initJitsi(meetingData);
            return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi(meetingData);
        document.head.appendChild(script);
    };

    const initJitsi = (meetingData) => {
        if (!jitsiContainerRef.current || jitsiApiRef.current) return;

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: meetingData.roomId,
            parentNode: jitsiContainerRef.current,
            width: '100%',
            height: '100%',
            userInfo: {
                displayName: user?.fullName || 'Utilisateur',
                email: user?.email || '',
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
            },
        });

        api.addEventListener('videoConferenceLeft', () => {
            handleLocalLeave();
        });

        api.addEventListener('readyToClose', () => {
            handleLocalLeave();
        });

        api.addEventListener('videoConferenceJoined', () => setLoading(false));

        jitsiApiRef.current = api;
    };

    const handleCopyUrl = () => {
        if (!meeting) return;
        navigator.clipboard.writeText(meeting.jitsiUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isAuthorizedToEnd = meeting && (
        (meeting.type === 'DIRECT' && meeting.createdByUserId === user?.keycloakId) ||
        (isManagedMeeting(meeting) && user?.role === 'ADMIN')
    );

    return (
        <div className="fixed inset-0 bg-neutral-900 z-50 flex flex-col animate-in fade-in duration-500">
            {/* Minimal Header */}
            <header className="h-16 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-6 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowLocalLeaveDialog(true)}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Video size={18} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white uppercase tracking-tight">Réunion AEME</h1>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">ID: {id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAuthorizedToEnd && (
                        <Button
                            variant="destructive"
                            className="h-8 text-[10px] uppercase font-black tracking-widest px-4"
                            onClick={() => setShowGlobalEndDialog(true)}
                        >
                            Terminer la réunion
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="h-8 text-[10px] uppercase font-black tracking-widest bg-transparent text-white border-white/20 hover:bg-white/10"
                        onClick={handleCopyUrl}
                    >
                        {copied ? <><Check size={14} className="mr-2 text-green-500" /> Copié</> : <><Copy size={14} className="mr-2" /> Lien URL</>}
                    </Button>
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 text-[10px] font-black uppercase tracking-widest py-1">
                        {loading ? 'Connexion...' : 'En ligne'}
                    </Badge>
                </div>
            </header>

            {/* Jitsi Container */}
            <main className="flex-1 relative bg-black">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-20 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Initialisation sécurisée...</p>
                    </div>
                )}
                <div ref={jitsiContainerRef} id="jitsi-container" className="h-full w-full" />
            </main>

            <ConfirmDialog
                open={showLocalLeaveDialog}
                onOpenChange={setShowLocalLeaveDialog}
                title="Quitter la réunion ?"
                description="Vous pourrez rejoindre à nouveau cette réunion tant qu’elle n’a pas été terminée."
                confirmLabel="Quitter"
                cancelLabel="Rester"
                onConfirm={() => {
                    setShowLocalLeaveDialog(false);
                    handleLocalLeave();
                }}
            />

            <ConfirmDialog
                open={showGlobalEndDialog}
                onOpenChange={setShowGlobalEndDialog}
                title="Terminer la réunion ?"
                description="Cette action terminera la réunion pour tous les participants et la déplacera dans l’historique."
                confirmLabel="Terminer la réunion"
                cancelLabel="Annuler"
                destructive={true}
                loading={endMeetingInProgressRef.current}
                onConfirm={confirmGlobalEnd}
            />
        </div>
    );
};

export default MeetingRoom;
