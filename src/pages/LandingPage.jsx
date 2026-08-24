import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import MissionStatement from '../components/landing/MissionStatement';
import LocalisationSection from '../components/landing/LocalisationSection';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    // Scroll to top on mount and handle authenticated redirect
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        } else if (!isLoading) {
            window.scrollTo(0, 0);
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Authentification...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary flex flex-col">
            <LandingHeader />
            <main className="flex-1 flex flex-col">
                <LandingHero />
                <MissionStatement />
                <LocalisationSection />
            </main>
            <ContactSection />
        </div>
    );
};

export default LandingPage;
