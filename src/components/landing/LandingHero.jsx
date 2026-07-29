import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const LandingHero = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    const handleAction = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            login();
        }
    };

    return (
        <section className="relative w-full min-h-[80vh] flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Left Content (55%) */}
            <div className="w-full md:w-[55%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 z-10 bg-white">
                <div className="max-w-2xl animate-in slide-in-from-bottom-8 duration-1000 fade-in">
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-[4rem] leading-[1.1] tracking-tight text-gray-900 mb-8">
                        Piloter la performance énergétique des bâtiments publics
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 font-sans leading-relaxed mb-12 max-w-xl">
                        La plateforme nationale dédiée au suivi, à la coordination et à l’amélioration des consommations énergétiques des structures de l’État.
                    </p>
                    
                    <button 
                        onClick={handleAction}
                        className="group flex items-center gap-4 text-primary font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    >
                        <span className="border-b-2 border-primary group-hover:border-accent transition-colors pb-1">
                            Accéder à l’espace gestionnaire
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Right Visual (45%) */}
            <div className="w-full md:w-[45%] min-h-[400px] md:min-h-full relative bg-gray-100 hidden md:block">
                {/* Placeholder Image: Solar installation in Africa / Admin building */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-[1.03]"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2000&auto=format&fit=crop')" }} 
                />
                
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/40 mix-blend-multiply" />
                
                {/* Decorative Annotation */}
                <div className="absolute bottom-12 left-8 bg-white/90 backdrop-blur px-4 py-2 flex flex-col shadow-sm border border-white/50 animate-in fade-in zoom-in duration-1000 delay-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Structure Publique</span>
                    <span className="text-sm font-serif text-gray-800">Données Consolidées</span>
                </div>
            </div>
        </section>
    );
};

export default LandingHero;
