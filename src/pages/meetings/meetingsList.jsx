import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Copy, Check, Trash2, Calendar, Clock, Play, CheckCircle } from 'lucide-react';
import { getMyMeetings, deleteMeeting } from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';

const StatusBadge = ({ status }) => {
    const styles = {
        SCHEDULED:   'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-green-100 text-green-800',
        ENDED:       'bg-gray-100 text-gray-600',
    };
    const labels = {
        SCHEDULED:   'Scheduled',
        IN_PROGRESS: 'In Progress',
        ENDED:       'Ended',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const MeetingCard = ({ meeting, onJoin, onCopy, onDelete, copiedId, userId }) => {
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-[#FFCC00] p-5">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-800">Meeting #{meeting.id}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Calendar size={14} /> {formatDate(meeting.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatTime(meeting.scheduledAt)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={meeting.status} />
                    {meeting.createdByUserId === userId &&
                     meeting.status !== 'IN_PROGRESS' && (
                        <button
                            onClick={() => onDelete(meeting.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <button
                    onClick={() => onJoin(meeting.id)}
                    className="w-full bg-[#003366] text-white py-2 rounded-md text-sm font-medium hover:bg-[#002244] transition-colors"
                >
                    Join Meeting
                </button>
                <button
                    onClick={() => onCopy(meeting.jitsiUrl, meeting.id)}
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    {copiedId === meeting.id
                        ? <><Check size={14} className="text-green-500" /> Lien copié !</>
                        : <><Copy size={14} /> Copier le lien</>
                    }
                </button>
            </div>
        </div>
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

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    const upcomingMeetings = meetings.filter(m =>
        m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'
    );
    const pastMeetings = meetings.filter(m => m.status === 'ENDED');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#003366]">Meetings</h1>
                    <p className="text-sm text-gray-500">
                        Schedule and join your energy coordination meetings.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/meetings/new')}
                    className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-md hover:bg-[#002244] transition-colors"
                >
                    <Plus size={18} /> Schedule Meeting
                </button>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-400">Chargement...</div>
            ) : error ? (
                <div className="p-12 text-center text-red-500">{error}</div>
            ) : (
                <>
                    {/* Upcoming Meetings */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#003366] mb-4">
                            Upcoming Meetings
                        </h2>
                        {upcomingMeetings.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-400">
                                No upcoming meetings.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    {/* Past Meetings */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#003366] mb-4">
                            Past Meetings
                        </h2>
                        {pastMeetings.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-100 p-8 text-center text-gray-400">
                                No past meetings yet.
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {pastMeetings.map((meeting) => (
                                        <div
                                            key={meeting.id}
                                            className="p-4 flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                    <CheckCircle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        Meeting #{meeting.id}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(meeting.scheduledAt)} · {formatTime(meeting.scheduledAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {meeting.createdByUserId === user?.id && (
                                                    <button
                                                        onClick={() => handleDelete(meeting.id)}
                                                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MeetingsList;