import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Video, Plus, Copy, Check, Trash2, Calendar, 
    Clock, Play, CheckCircle, Search, Info,
    VideoIcon, CalendarDays, MoreVertical, Activity
} from 'lucide-react';
import { getMyMeetings, deleteMeeting } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const MeetingStatusBadge = ({ status }) => {
    const variants = {
        SCHEDULED:   'bg-blue-50 text-blue-700 border-blue-200',
        IN_PROGRESS: 'bg-green-50 text-green-700 border-green-200 animate-pulse',
        ENDED:       'bg-gray-100 text-gray-500 border-gray-200',
    };
    const labels = {
        SCHEDULED:   'PROGRAMMÉ',
        IN_PROGRESS: 'EN COURS',
        ENDED:       'TERMINÉ',
    };
    return (
        <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-2.5", variants[status])}>
            {labels[status] || status}
        </Badge>
    );
};

const MeetingCard = ({ meeting, onJoin, onCopy, onDelete, copiedId, userId }) => {
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    const isCreator = meeting.createdByUserId === userId;

    return (
        <Card className="group border-none shadow-xl shadow-black/5 bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
            <div className="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <VideoIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Réunion Technique #{meeting.id}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">ID Session: {meeting.id}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <Badge variant="outline" className="bg-gray-50/50 border-gray-100 text-[10px] font-black gap-1.5 px-2">
                                <CalendarDays size={12} className="text-primary" /> {formatDate(meeting.scheduledAt, { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Badge>
                            <Badge variant="outline" className="bg-gray-50/50 border-gray-100 text-[10px] font-black gap-1.5 px-2">
                                <Clock size={12} className="text-primary" /> {formatTime(meeting.scheduledAt)}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <MeetingStatusBadge status={meeting.status} />
                        {isCreator && meeting.status !== 'IN_PROGRESS' && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onDelete(meeting.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => onJoin(meeting.id)}
                        className="font-black uppercase tracking-widest text-[10px] h-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        Rejoindre <Play size={12} className="ml-2 fill-current" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onCopy(meeting.jitsiUrl, meeting.id)}
                        className="font-black uppercase tracking-widest text-[10px] h-10 border-2"
                    >
                        {copiedId === meeting.id
                            ? <><Check size={14} className="mr-2 text-green-600" /> Copié</>
                            : <><Copy size={14} className="mr-2" /> Lien</>
                        }
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const MeetingsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => { fetchMeetings(); }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const data = await getMyMeetings();
            data.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
            setMeetings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (jitsiUrl, id) => {
        navigator.clipboard.writeText(jitsiUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce meeting ?')) return;
        try {
            await deleteMeeting(id);
            setMeetings(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    const upcomingMeetings = meetings.filter(m =>
        m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'
    );
    const pastMeetings = meetings.filter(m => m.status === 'ENDED');

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Coordination & Meetings</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-primary border-primary/20 font-bold uppercase tracking-tighter bg-primary/5">Visioconférence</Badge>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plateforme de visioconférence sécurisée</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/meetings/new')}
                    className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-12 px-6 shadow-lg shadow-primary/20"
                >
                    <Plus size={18} className="mr-2" /> Planifier une Réunion
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Card key={i} className="h-48 border-none bg-gray-50/50 shadow-sm animate-pulse" />)}
                </div>
            ) : error ? (
                <Card className="border-none bg-red-50 p-12 text-center rounded-3xl">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <p className="text-sm font-black text-red-700 uppercase">{error}</p>
                </Card>
            ) : (
                <div className="space-y-12">
                    {/* Upcoming Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={18} /> Réunions À Venir
                            </h2>
                            <Separator className="flex-1 opacity-50" />
                        </div>

                        {upcomingMeetings.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-100 bg-gray-50/30 p-12 text-center rounded-3xl">
                                <VideoIcon size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aucune réunion programmée</p>
                                <Button variant="link" onClick={() => navigate('/meetings/new')} className="mt-2 text-primary font-bold uppercase text-[10px]">Planifier maintenant</Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {upcomingMeetings.map((meeting) => (
                                    <MeetingCard
                                        key={meeting.id}
                                        meeting={meeting}
                                        onJoin={(id) => navigate(`/meetings/${id}`)}
                                        onCopy={handleCopy}
                                        onDelete={handleDelete}
                                        copiedId={copiedId}
                                        userId={user?.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-50">
                                <Clock size={18} /> Historique des Échanges
                            </h2>
                            <Separator className="flex-1 opacity-30" />
                        </div>

                        {pastMeetings.length === 0 ? (
                            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-8">Aucun historique disponible</p>
                        ) : (
                            <Card className="border-none shadow-xl shadow-black/5 bg-white overflow-hidden rounded-3xl">
                                <div className="divide-y divide-gray-100">
                                    {pastMeetings.map((meeting) => (
                                        <div
                                            key={meeting.id}
                                            className="p-5 flex items-center justify-between hover:bg-gray-50/80 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-100/50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                    <CheckCircle size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-tight">Réunion Archvée #{meeting.id}</h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground">
                                                        {formatDate(meeting.scheduledAt)} · {formatTime(meeting.scheduledAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {meeting.createdByUserId === user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(meeting.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                )}

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingsList;