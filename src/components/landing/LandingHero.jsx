import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
                        Plateforme Nationale des Gestionnaires de l’Énergie
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 font-sans leading-relaxed mb-12 max-w-xl">
                        La plateforme nationale dédiée au suivi, à la coordination et à l’amélioration des consommations énergétiques des structures de l’État.
                    </p>

                    <button
                        onClick={handleAction}
                        className="group flex items-center gap-4 text-primary font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    >
                        <span className="border-b-2 border-primary group-hover:border-accent transition-colors pb-1">
                            ACCÉDER À ENERGY MANAGER
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Right Visual (45%) */}
            <div className="w-full md:w-[45%] min-h-[400px] md:min-h-full relative bg-white hidden md:block">
                {/* Placeholder Image: Solar installation in Africa / Admin building */}
                <div
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-[1.03]"
                    style={{ backgroundImage: "url('/laanding1.jpeg')" }}
                />

                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/40 mix-blend-multiply" />


            </div>
        </section>
    );
};

export default LandingHero;
