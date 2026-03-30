import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile } from '../services/profileService';
import { LayoutDashboard, FileText, Award, ArrowRight, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getUserProfile()
            .then(setProfile)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            title: 'Reports submitted',
            value: 'Archive',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/reports'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Bonjour, {profile?.firstName || 'Utilisateur'} !</h1>
                    <p className="text-sm text-gray-500">Bienvenue sur votre plateforme de gestion énergétique.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score Actuel</p>
                        <p className="text-xl font-bold text-primary">{profile?.score || 0} pts</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card, i) => (
                    <Link 
                        key={i} 
                        to={card.link}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Stats / Info */}
            <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                <div className="relative max-w-xl space-y-4">
                    <h2 className="text-2xl font-bold">Système de Points AEME</h2>
                    <p className="text-primary-light text-sm leading-relaxed opacity-90">
                        Votre score reflète la qualité et la régularité de vos contributions. 
                        Gagnez <span className="font-bold text-accent">+4 points</span> pour chaque rapport approuvé et évitez les rejets (<span className="font-bold">-5 points</span>).
                    </p>
                    <button 
                        onClick={() => navigate('/reports/new')}
                        className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Soumettre un nouveau rapport
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;