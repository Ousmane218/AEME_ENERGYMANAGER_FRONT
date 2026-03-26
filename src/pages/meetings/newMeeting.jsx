import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video } from 'lucide-react';
import { createMeeting } from '../../services/meetingService';

const NewMeeting = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scheduledAt, setScheduledAt] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const meeting = await createMeeting({
                scheduledAt: scheduledAt + ':00',
                participantIds: [],
            });
            navigate(`/meetings/${meeting.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-[#003366]">New Meeting</h1>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date et heure
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700">
                        Un lien Jitsi unique sera généré automatiquement. Copiez-le et partagez-le avec vos participants.
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#003366] text-white px-8 py-2 rounded-md hover:bg-[#002244] transition-colors disabled:opacity-50"
                        >
                            <Video size={18} />
                            {loading ? 'Création...' : 'Créer le meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMeeting;